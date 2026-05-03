import { NextResponse } from "next/server";
import { fetchBackend, parseBackendResponse } from "@/lib/backendApi";

type SignupRequestBody = {
  name?: string;
  email?: string;
  password?: string;
  nationality?: string;
};

export async function POST(request: Request) {
  let body: SignupRequestBody;

  try {
    body = (await request.json()) as SignupRequestBody;
  } catch {
    return NextResponse.json({ status: "error", message: "Invalid JSON body" }, { status: 400 });
  }

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";
  const nationality = body.nationality?.trim() ?? "";

  if (!name || !email || !password || !nationality) {
    return NextResponse.json({ status: "error", message: "Missing required fields" }, { status: 422 });
  }

  try {
    const { response: backendResponse } = await fetchBackend("/auth/signup.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
        nationality,
      }),
      cache: "no-store",
    });

    const payload = await parseBackendResponse<Record<string, unknown>>(backendResponse);

    if (!backendResponse.ok || payload.status !== "success") {
      return NextResponse.json({
        status: "error",
        message: payload.message ?? "Signup failed",
      }, { status: backendResponse.status || 502 });
    }

    return NextResponse.json({
      status: "success",
      data: null,
      message: payload.message ?? "Account created successfully",
    });
  } catch (error) {
    const details = error instanceof Error ? error.message : "Unknown connection error";

    return NextResponse.json(
      {
        status: "error",
        message: "Unable to reach backend service",
        details,
      },
      { status: 502 }
    );
  }
}
