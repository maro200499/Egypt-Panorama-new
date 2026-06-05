import { NextResponse } from "next/server";
import { buildBackendUrl, parseBackendResponse } from "@/lib/backendApi";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization") ?? "";

  if (!authHeader) {
    return NextResponse.json({ status: "error", message: "Missing authorization token" }, { status: 401 });
  }

  try {
    const backendResponse = await fetch(buildBackendUrl("/admin/activities/get_all.php"), {
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
          message: payload.message ?? "Failed to fetch admin activities",
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

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization") ?? "";

  if (!authHeader) {
    return NextResponse.json({ status: "error", message: "Missing authorization token" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const backendResponse = await fetch(buildBackendUrl("/admin/activities/add.php"), {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const payload = await parseBackendResponse<Record<string, unknown>>(backendResponse);

    if (!backendResponse.ok || payload.status !== "success") {
      return NextResponse.json(
        {
          status: "error",
          message: payload.message ?? "Failed to create activity",
        },
        { status: backendResponse.status || 502 }
      );
    }

    return NextResponse.json({
      status: "success",
      data: payload.data ?? null,
      message: payload.message,
    });
  } catch {
    return NextResponse.json({ status: "error", message: "Unable to reach backend service" }, { status: 502 });
  }
}