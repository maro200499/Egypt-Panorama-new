import { NextResponse } from "next/server";
import { buildBackendUrl, parseBackendResponse } from "@/lib/backendApi";

export async function GET() {
  try {
    const backendResponse = await fetch(buildBackendUrl("/api/companies/get_all.php"), { cache: "no-store" });
    const payload = await parseBackendResponse<Array<Record<string, unknown>>>(backendResponse);

    if (!backendResponse.ok || payload.status !== "success") {
      return NextResponse.json(
        {
          status: "error",
          message: "Unable to load companies from backend API",
        },
        { status: 502 }
      );
    }

    const data = Array.isArray(payload.data) ? payload.data : [];

    console.log("[tourism-companies] backend rows:", data.length);

    return NextResponse.json({
      status: "success",
      data,
    });
  } catch (error) {
    console.error("[tourism-companies] Failed to load companies:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "Unable to load companies from backend API",
      },
      { status: 502 }
    );
  }
}