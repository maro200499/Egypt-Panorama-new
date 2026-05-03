import { NextResponse } from "next/server";
import { buildBackendUrl, parseBackendResponse } from "@/lib/backendApi";

interface GeneratePlanBody {
  days?: number;
  place?: string;
  destination?: string;
  style?: "Cultural" | "Adventure" | "Relaxation" | "Mixed";
  budget?: "Budget" | "Standard" | "Luxury";
}

interface BackendActivity {
  id: number;
  name: string;
  type: string;
}

interface BackendDay {
  day: number;
  activities: BackendActivity[];
}

interface BackendPlanData {
  destination?: {
    id: number;
    name: string;
  };
  days?: number;
  plan?: BackendDay[];
}

const TYPE_PRICE_MAP: Record<string, number> = {
  historical: 40,
  museum: 30,
  adventure: 75,
  relax: 50,
};

const BUDGET_MULTIPLIER: Record<NonNullable<GeneratePlanBody["budget"]>, number> = {
  Budget: 0.85,
  Standard: 1,
  Luxury: 1.35,
};

function estimatePrice(type: string, budget: NonNullable<GeneratePlanBody["budget"]>): number {
  const base = TYPE_PRICE_MAP[type] ?? 45;
  return Math.round(base * BUDGET_MULTIPLIER[budget]);
}

export async function POST(request: Request) {
  let body: GeneratePlanBody;

  try {
    body = (await request.json()) as GeneratePlanBody;
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid JSON body", status: "error" },
      { status: 400 }
    );
  }

  // Support both 'place' and 'destination' field names
  const place = (body.place || body.destination || "").trim();
  const days = Number(body.days);
  const style = body.style ?? "Mixed";
  const budget = body.budget ?? "Standard";

  // Validation
  if (!Number.isInteger(days) || days <= 0) {
    return NextResponse.json(
      { error: "days must be a positive integer", status: "error" },
      { status: 400 }
    );
  }

  if (!place) {
    return NextResponse.json(
      { error: "place is required", status: "error" },
      { status: 400 }
    );
  }

  try {
    const backendResponse = await fetch(buildBackendUrl("/api/generate_plan.php"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        days,
        destination: place,
      }),
      cache: "no-store",
    });

    const payload = await parseBackendResponse<BackendPlanData>(backendResponse);

    if (!backendResponse.ok || payload.status !== "success" || !payload.data) {
      return NextResponse.json(
        {
          error: payload.message ?? "Failed to generate plan",
          status: "error",
        },
        { status: backendResponse.status || 502 }
      );
    }

    const destinationName = payload.data.destination?.name ?? place;
    const rawPlan = payload.data.plan ?? [];

    const mappedPlan = rawPlan.map((entry, dayIndex) => ({
      day: `Day ${entry.day ?? dayIndex + 1}`,
      activities: (entry.activities ?? []).map((activity) => ({
        id: activity.id,
        name: activity.name,
        location: destinationName,
        type: activity.type,
        lat: 0,
        lng: 0,
        price: estimatePrice(activity.type, budget),
      })),
    }));

    const matchedActivities = mappedPlan.reduce((total, day) => total + day.activities.length, 0);

    // Calculate costs
    const costPerNight = { Budget: 80, Standard: 150, Luxury: 300 }[budget] || 150;
    const totalCost = costPerNight * days;

    return NextResponse.json(
      {
        status: "success",
        data: {
          plan: mappedPlan,
          isPremium: false,
          totalCost,
          perNight: costPerNight,
        },
        meta: {
          place,
          style,
          budget,
          matchedActivities,
          usedLocationFallback: false,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Generate plan error:", err);
    return NextResponse.json(
      {
        error: "Unable to reach backend service",
        status: "error",
        details: err instanceof Error ? err.message : undefined,
      },
      { status: 502 }
    );
  }
}
