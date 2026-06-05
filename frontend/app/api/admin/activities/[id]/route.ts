import { NextResponse } from "next/server";
import { buildBackendUrl, parseBackendResponse } from "@/lib/backendApi";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const authHeader = request.headers.get("authorization") ?? "";

  if (!authHeader) {
    return NextResponse.json({ status: "error", message: "Missing authorization token" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id } = await context.params;
    const backendResponse = await fetch(buildBackendUrl("/admin/activities/update.php"), {
      method: "PUT",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...body, id: Number(id) }),
      cache: "no-store",
    });

    const payload = await parseBackendResponse<Record<string, unknown>>(backendResponse);

    if (!backendResponse.ok || payload.status !== "success") {
      return NextResponse.json(
        {
          status: "error",
          message: payload.message ?? "Failed to update activity",
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

export async function DELETE(request: Request, context: RouteContext) {
  const authHeader = request.headers.get("authorization") ?? "";

  if (!authHeader) {
    return NextResponse.json({ status: "error", message: "Missing authorization token" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const backendResponse = await fetch(buildBackendUrl(`/admin/activities/delete.php?id=${encodeURIComponent(id)}`), {
      method: "DELETE",
      headers: {
        Authorization: authHeader,
      },
      cache: "no-store",
    });

    const payload = await parseBackendResponse<Record<string, unknown>>(backendResponse);

    if (!backendResponse.ok || payload.status !== "success") {
      return NextResponse.json(
        {
          status: "error",
          message: payload.message ?? "Failed to delete activity",
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