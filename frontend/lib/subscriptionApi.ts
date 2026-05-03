import { NextResponse } from "next/server";
import { buildBackendUrl, parseBackendResponse } from "@/lib/backendApi";

type SubscribeBody = {
  user_id?: number | string;
  plan?: string;
  duration?: number | string;
  price?: number | string;
  status?: "active" | "paused" | "cancelled";
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function handleSubscriptionSubscribe(request: Request) {
  const authHeader = request.headers.get("authorization") ?? "";

  if (!authHeader) {
    return NextResponse.json({ status: "error", message: "Missing authorization token" }, { status: 401 });
  }

  let body: SubscribeBody;

  try {
    body = (await request.json()) as SubscribeBody;
  } catch {
    return NextResponse.json({ status: "error", message: "Invalid JSON body" }, { status: 400 });
  }

  const userId = Number(body.user_id);
  const plan = typeof body.plan === "string" ? body.plan.trim() : "";
  const duration = Number(body.duration);
  const price = Number(body.price);

  await delay(2400);

  const fullPayload = Boolean(userId && plan && duration && price);
  const requestBody = fullPayload
    ? {
        user_id: userId,
        plan,
        duration,
        price,
        status: body.status ?? "active",
      }
    : {
        status: body.status ?? "active",
      };

  try {
    const backendResponse = await fetch(buildBackendUrl("/api/subscription/subscribe.php"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(requestBody),
      cache: "no-store",
    });

    const payload = await parseBackendResponse<Record<string, unknown>>(backendResponse);

    if (!backendResponse.ok || payload.status !== "success") {
      return NextResponse.json(
        {
          status: "error",
          message: payload.message ?? "Subscription update failed",
        },
        { status: backendResponse.status || 502 }
      );
    }

    return NextResponse.json({
      status: "success",
      message: payload.message ?? "Subscription activated successfully 🎉",
      data: payload.data ?? null,
    });
  } catch {
    return NextResponse.json({ status: "error", message: "Unable to reach backend service" }, { status: 502 });
  }
}
