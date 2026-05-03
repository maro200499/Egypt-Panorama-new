import { NextResponse } from "next/server";
import { buildBackendUrl, parseBackendResponse } from "@/lib/backendApi";
import { AUTH_SESSION_COOKIE, createSignedSessionCookieValue } from "@/lib/authSession";

type LoginRequestBody = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  let body: LoginRequestBody;

  try {
    body = (await request.json()) as LoginRequestBody;
  } catch {
    return NextResponse.json({ status: "error", message: "Invalid JSON body" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json({ status: "error", message: "Email and password are required" }, { status: 422 });
  }

  try {
    const backendResponse = await fetch(buildBackendUrl("/auth/login.php"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });

    const payload = await parseBackendResponse<Record<string, unknown>>(backendResponse);

    if (!backendResponse.ok || payload.status !== "success") {
      return NextResponse.json({
        status: "error",
        message: payload.message ?? "Login failed",
      }, { status: backendResponse.status || 502 });
    }

    const role = payload.data?.user && typeof payload.data.user === "object" && "role" in payload.data.user
      ? String((payload.data.user as Record<string, unknown>).role)
      : "user";
    const emailFromPayload = payload.data?.user && typeof payload.data.user === "object" && "email" in payload.data.user
      ? String((payload.data.user as Record<string, unknown>).email)
      : email;

    const sessionCookie = createSignedSessionCookieValue({
      role: role === "admin" ? "admin" : "user",
      email: emailFromPayload,
    });

    const response = NextResponse.json({
      status: "success",
      data: payload.data ?? null,
      message: payload.message ?? "Login successful",
    });

    response.cookies.set({
      name: AUTH_SESSION_COOKIE,
      value: sessionCookie.value,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: sessionCookie.maxAge,
    });

    return response;
  } catch {
    return NextResponse.json({ status: "error", message: "Unable to reach backend service" }, { status: 502 });
  }
}
