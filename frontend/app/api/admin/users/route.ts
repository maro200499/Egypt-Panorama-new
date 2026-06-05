import { NextResponse } from "next/server";
import { buildBackendUrl, parseBackendResponse } from "@/lib/backendApi";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization") ?? "";

  if (!authHeader) {
    return NextResponse.json({ status: "error", message: "Missing authorization token" }, { status: 401 });
  }

  try {
    const backendResponse = await fetch(buildBackendUrl("/admin/users/get_all.php"), {
      method: "GET",
      headers: {
        Authorization: authHeader,
      },
      cache: "no-store",
    });

    const payload = await parseBackendResponse<Array<Record<string, unknown>>>(backendResponse);

    if (!backendResponse.ok || payload.status !== "success") {
      return NextResponse.json(
        {
          status: "error",
          message: payload.message ?? "Failed to fetch admin users",
        },
        { status: backendResponse.status || 502 }
      );
    }

    return NextResponse.json({
      status: "success",
      data: payload.data ?? [],
      message: payload.message,
    });
  } catch {
    return NextResponse.json({ status: "error", message: "Unable to reach backend service" }, { status: 502 });
  }
}