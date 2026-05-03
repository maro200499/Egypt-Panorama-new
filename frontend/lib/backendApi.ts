export type BackendEnvelope<T = unknown> = {
  status: "success" | "error";
  data?: T;
  message?: string;
};

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export function getBackendBaseUrl(): string {
  const fromServer = process.env.BACKEND_BASE_URL;
  const fromPublic = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
  const fallback = "http://localhost/Egypt_panorama/backend";

  return trimTrailingSlash(fromServer ?? fromPublic ?? fallback);
}

export function getBackendBaseCandidates(): string[] {
  const seen = new Set<string>();
  const values = [
    process.env.BACKEND_BASE_URL,
    process.env.NEXT_PUBLIC_BACKEND_BASE_URL,
    "http://localhost/Egypt_panorama/backend",
    "http://127.0.0.1/Egypt_panorama/backend",
    "http://localhost:8000/Egypt_panorama/backend",
    "http://127.0.0.1:8000/Egypt_panorama/backend",
  ];

  for (const value of values) {
    if (!value) {
      continue;
    }

    seen.add(trimTrailingSlash(value));
  }

  return Array.from(seen);
}

export function buildBackendUrl(path: string, baseUrl = getBackendBaseUrl()): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${trimTrailingSlash(baseUrl)}${normalizedPath}`;
}

export async function fetchBackend(path: string, init: RequestInit): Promise<{ response: Response; url: string }> {
  const bases = getBackendBaseCandidates();
  const errors: string[] = [];

  for (const base of bases) {
    const url = buildBackendUrl(path, base);

    try {
      const response = await fetch(url, init);
      return { response, url };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown connection error";
      errors.push(`${url} -> ${message}`);
    }
  }

  throw new Error(`Unable to connect to backend. Tried: ${errors.join(" | ")}`);
}

export async function parseBackendResponse<T>(response: Response): Promise<BackendEnvelope<T>> {
  let json: unknown;

  try {
    json = await response.json();
  } catch {
    return {
      status: "error",
      message: "Backend returned invalid JSON",
    };
  }

  if (!json || typeof json !== "object") {
    return {
      status: "error",
      message: "Backend returned malformed response",
    };
  }

  const payload = json as BackendEnvelope<T>;

  if (payload.status !== "success" && payload.status !== "error") {
    return {
      status: "error",
      message: "Backend response is missing a valid status",
    };
  }

  return payload;
}
