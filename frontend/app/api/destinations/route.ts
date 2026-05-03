import { NextResponse } from "next/server";
import { buildBackendUrl, parseBackendResponse } from "@/lib/backendApi";

export async function GET() {
  try {
    const backendResponse = await fetch(buildBackendUrl("/api/destinations/get_all.php"), {
      cache: "no-store",
    });

    const payload = await parseBackendResponse<Array<Record<string, unknown>>>(backendResponse);

    if (!backendResponse.ok || payload.status !== "success") {
      return NextResponse.json({
        status: "error",
        message: payload.message ?? "Failed to fetch destinations",
      }, { status: backendResponse.status || 502 });
    }

    return NextResponse.json({
      status: "success",
      data: payload.data ?? [],
    });
  } catch {
    return NextResponse.json({
      status: "error",
      message: "Unable to reach backend service",
    }, { status: 502 });
  }
}
