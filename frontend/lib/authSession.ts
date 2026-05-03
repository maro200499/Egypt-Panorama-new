import { createHmac } from "node:crypto";

export const AUTH_SESSION_COOKIE = "ep_session";

type SessionRole = "user" | "admin";

type SessionPayload = {
  role: SessionRole;
  email: string;
  exp: number;
};

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

function getSessionSecret(): string {
  return process.env.SESSION_SECRET ?? process.env.BACKEND_JWT_SECRET ?? "dev-session-secret-change-me";
}

function toBase64Url(value: string): string {
  return Buffer.from(value, "utf-8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(`${normalized}${padding}`, "base64").toString("utf-8");
}

function sign(value: string): string {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

export function createSignedSessionCookieValue(input: {
  role: SessionRole;
  email: string;
}): { value: string; maxAge: number } {
  const payload: SessionPayload = {
    role: input.role,
    email: input.email,
    exp: Date.now() + SESSION_TTL_SECONDS * 1000,
  };

  const payloadEncoded = toBase64Url(JSON.stringify(payload));
  const signature = sign(payloadEncoded);

  return {
    value: `${payloadEncoded}.${signature}`,
    maxAge: SESSION_TTL_SECONDS,
  };
}

export function verifySignedSessionCookie(value: string | undefined): SessionPayload | null {
  if (!value) {
    return null;
  }

  const [payloadEncoded, signature] = value.split(".");

  if (!payloadEncoded || !signature) {
    return null;
  }

  if (sign(payloadEncoded) !== signature) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64Url(payloadEncoded)) as SessionPayload;

    if (!payload || (payload.role !== "user" && payload.role !== "admin")) {
      return null;
    }

    if (!payload.email || Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
