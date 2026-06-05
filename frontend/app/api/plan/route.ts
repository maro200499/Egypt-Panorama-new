import { NextResponse } from "next/server";
import { buildBackendUrl, parseBackendResponse } from "@/lib/backendApi";

type SlotKey = "morning" | "afternoon" | "evening";

type ActivityRow = {
  id?: number | string;
  name?: string;
  type?: string;
  category?: string;
  tourism_type?: string;
  destination_id?: number | string;
  destination_name?: string;
  rating?: number | string;
  price?: number | string | null;
  image_url?: string | null;
  description?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  is_hidden?: number | string;
};

type DestinationRow = {
  id?: number | string;
  name?: string;
};

type CompanyRow = {
  id?: number | string;
  company_id?: number | string;
  name?: string;
  comp_name?: string;
};

type PriceStatsRow = {
  min_price?: number | string | null;
  max_price?: number | string | null;
  avg_price?: number | string | null;
};

type SmartActivity = {
  id: number;
  name: string;
  type: string;
  category: string;
  tourism_type: string;
  destination_id: number;
  destination_name: string;
  price: number;
  rating: number;
  image_url: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
};

type SmartDay = {
  day: number;
  title: string;
  morning: SmartActivity | null;
  afternoon: SmartActivity | null;
  evening: SmartActivity | null;
};

const TYPE_TO_SLOT: Record<string, SlotKey> = {
  Hiking: "morning",
  Diving: "morning",
  Waterfall: "morning",
  Oasis: "morning",
  Park: "morning",
  "Fossil Site": "morning",

  Museum: "afternoon",
  Gallery: "afternoon",
  Market: "afternoon",
  Cemetery: "afternoon",
  Temple: "afternoon",
  Mosque: "afternoon",
  Necropolis: "afternoon",

  Beach: "evening",
  Lake: "evening",
  Desert: "evening",
  Cafe: "evening",
  "Cultural Center": "evening",
};

type BudgetRange = { min: number; max: number };
type BudgetMap = Record<"budget" | "standard" | "premium", BudgetRange>;

const STYLE_TO_TOURISM: Record<string, string[] | null> = {
  cultural: ["Islamic", "Coptic", "Pharaonic", "Untold"],
  adventure: ["Nature & Adventure", "Coastal & Diving"],
  beach: ["Coastal & Diving"],
  spiritual: ["Islamic", "Coptic"],
  history: ["Pharaonic", "Islamic", "Untold"],
  mixed: null,
  relaxation: null,
};

const DESTINATION_SEASONS: Record<string, string> = {
  Cairo: "October - April",
  Luxor: "October - March",
  Aswan: "October - March",
  Alexandria: "May - September",
  Sinai: "March - May, September - November",
  "Sharm El Sheikh": "Year-round",
  "Siwa Oasis": "October - April",
  Siwa: "October - April",
  Fayoum: "October - April",
  Hurghada: "Year-round",
  Dahab: "March - May, September - November",
};

function toNumber(value: unknown, fallback = 0): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function toNullableNumber(value: unknown): number | null {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function normalizePrice(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.replace(/[^0-9.\-]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function normalizeActivity(row: ActivityRow): SmartActivity {
  return {
    id: toNumber(row.id, 0),
    name: String(row.name ?? "Unknown Activity"),
    type: String(row.type ?? "Unknown"),
    category: String(row.category ?? "General"),
    tourism_type: String(row.tourism_type ?? ""),
    destination_id: toNumber(row.destination_id, 0),
    destination_name: String(row.destination_name ?? ""),
    price: normalizePrice(row.price),
    rating: Math.max(0, Math.min(5, toNumber(row.rating, 0))),
    image_url: String(row.image_url ?? "").trim(),
    description: String(row.description ?? "").trim(),
    latitude: toNullableNumber(row.latitude),
    longitude: toNullableNumber(row.longitude),
  };
}

function normalizeStyle(input: string): string {
  const value = input.trim().toLowerCase();
  if (value === "relaxation") {
    return "mixed";
  }

  return value || "mixed";
}

function normalizeBudget(input: string): string {
  const value = input.trim().toLowerCase();

  if (value === "luxury") {
    return "premium";
  }

  return value || "standard";
}

function buildBudgetMapFromStats(stats: PriceStatsRow): BudgetMap {
  const minPrice = toNumber(stats.min_price, 0);
  const maxPrice = toNumber(stats.max_price, minPrice);

  if (maxPrice <= minPrice) {
    return {
      budget: { min: minPrice, max: maxPrice },
      standard: { min: minPrice, max: maxPrice },
      premium: { min: minPrice, max: maxPrice },
    };
  }

  const step = (maxPrice - minPrice) / 3;
  const firstCut = minPrice + step;
  const secondCut = minPrice + step * 2;

  return {
    // Cheapest third
    budget: { min: minPrice, max: Number(firstCut.toFixed(2)) },
    // Middle third
    standard: {
      min: Number((firstCut + 0.01).toFixed(2)),
      max: Number(secondCut.toFixed(2)),
    },
    // Most expensive third
    premium: {
      min: Number((secondCut + 0.01).toFixed(2)),
      max: Number(maxPrice.toFixed(2)),
    },
  };
}

function slotForType(type: string): SlotKey {
  return TYPE_TO_SLOT[type] ?? "afternoon";
}

function buildSmartPlan(activities: SmartActivity[], nights: number, travelStyle: string): SmartDay[] {
  const activitiesPerDay = 3;
  const totalNeeded = nights * activitiesPerDay;

  const allowedTypes = STYLE_TO_TOURISM[travelStyle] ?? null;
  let pool = allowedTypes
    ? activities.filter((activity) => allowedTypes.includes(activity.tourism_type))
    : [...activities];

  if (pool.length < totalNeeded) {
    const poolIds = new Set(pool.map((activity) => activity.id));
    const extras = activities.filter((activity) => !poolIds.has(activity.id));
    pool = [...pool, ...extras];
  }

  pool.sort((a, b) => b.rating - a.rating);

  const usedIds = new Set<number>();
  const days: SmartDay[] = [];

  for (let day = 1; day <= nights; day++) {
    const slots: Record<SlotKey, SmartActivity | null> = {
      morning: null,
      afternoon: null,
      evening: null,
    };

    const usedTypesThisDay = new Set<string>();

    for (const activity of pool) {
      if (usedIds.has(activity.id)) {
        continue;
      }

      if (usedTypesThisDay.has(activity.type)) {
        continue;
      }

      const slot = slotForType(activity.type);
      if (!slots[slot]) {
        slots[slot] = activity;
        usedIds.add(activity.id);
        usedTypesThisDay.add(activity.type);
      }

      if (slots.morning && slots.afternoon && slots.evening) {
        break;
      }
    }

    for (const slotKey of ["morning", "afternoon", "evening"] as SlotKey[]) {
      if (!slots[slotKey]) {
        const fallback =
          pool.find((activity) => !usedIds.has(activity.id) && !usedTypesThisDay.has(activity.type)) ??
          pool.find((activity) => !usedIds.has(activity.id));

        if (fallback) {
          slots[slotKey] = fallback;
          usedIds.add(fallback.id);
          usedTypesThisDay.add(fallback.type);
        }
      }
    }

    days.push({
      day,
      title: `Day ${day}`,
      morning: slots.morning,
      afternoon: slots.afternoon,
      evening: slots.evening,
    });
  }

  return days;
}

function calcTotalCost(days: SmartDay[], nights: number) {
  let totalActivities = 0;

  for (const day of days) {
    for (const slot of ["morning", "afternoon", "evening"] as SlotKey[]) {
      totalActivities += day[slot]?.price ?? 0;
    }
  }

  const accommodationPerNight = 800;
  const totalEGP = totalActivities + accommodationPerNight * nights;
  const totalUSD = Math.round(totalEGP / 50);

  return {
    egp: Math.round(totalEGP),
    usd: totalUSD,
    activitiesCost: Math.round(totalActivities),
    accommodationCost: accommodationPerNight * nights,
  };
}

async function fetchBackendRows<T>(path: string): Promise<T[]> {
  const response = await fetch(buildBackendUrl(path), { cache: "no-store" });
  const payload = await parseBackendResponse<T[]>(response);

  if (!response.ok || payload.status !== "success" || !Array.isArray(payload.data)) {
    throw new Error(payload.message ?? `Failed to fetch ${path}`);
  }

  return payload.data;
}

async function fetchBackendObject<T extends Record<string, unknown>>(path: string): Promise<T> {
  const response = await fetch(buildBackendUrl(path), { cache: "no-store" });
  const payload = await parseBackendResponse<T>(response);

  if (!response.ok || payload.status !== "success" || !payload.data || typeof payload.data !== "object" || Array.isArray(payload.data)) {
    throw new Error(payload.message ?? `Failed to fetch ${path}`);
  }

  return payload.data;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const destinationId = Number.parseInt(searchParams.get("destination_id") ?? "", 10);
  const destinationName = (searchParams.get("destination") ?? "").trim();
  const nights = Math.max(1, Math.min(14, Number.parseInt(searchParams.get("nights") ?? "3", 10) || 3));
  const budget = normalizeBudget(searchParams.get("budget") ?? "standard");
  const travelStyle = normalizeStyle(searchParams.get("travel_style") ?? "mixed");
  const currency = (searchParams.get("currency") ?? "USD").toUpperCase();

  if (!destinationId && destinationName.length === 0) {
    return NextResponse.json({ error: "destination_id or destination is required" }, { status: 400 });
  }

  try {
    const [destinations, stats, companiesRows] = await Promise.all([
      fetchBackendRows<DestinationRow>("/api/destinations/get_all.php"),
      fetchBackendObject<PriceStatsRow>("/api/activities/price_stats.php"),
      fetchBackendRows<CompanyRow>("/api/companies/get_all.php"),
    ]);

    const destination = destinationId
      ? destinations.find((row) => toNumber(row.id, 0) === destinationId)
      : destinations.find(
          (row) => String(row.name ?? "").trim().toLowerCase() === destinationName.toLowerCase()
        );

    if (!destination) {
      return NextResponse.json({ error: "Destination not found" }, { status: 404 });
    }

    const resolvedDestinationId = toNumber(destination.id, 0);
    const resolvedDestinationName = String(destination.name ?? destinationName);

    const budgetMap = buildBudgetMapFromStats(stats);
    const budgetTier = budget === "premium" ? "premium" : budget === "budget" ? "budget" : "standard";
    const selectedRange = budgetMap[budgetTier];

    const activitiesQuery = new URLSearchParams({
      destination_id: String(resolvedDestinationId),
      visible_only: "1",
      min_price: String(selectedRange.min),
      max_price: String(selectedRange.max),
    });

    const activitiesRows = await fetchBackendRows<ActivityRow>(`/api/activities/get_all.php?${activitiesQuery.toString()}`);
    const activities = activitiesRows.map(normalizeActivity);

    if (activities.length === 0) {
      return NextResponse.json({ error: "No activities available for this destination and budget" }, { status: 404 });
    }

    const days = buildSmartPlan(activities, nights, travelStyle);
    const cost = calcTotalCost(days, nights);

    const bestSeason = DESTINATION_SEASONS[resolvedDestinationName] ?? "October - April";

    const companyNames = companiesRows
      .map((company) => String(company.name ?? company.comp_name ?? "").trim())
      .filter((name) => name.length > 0)
      .slice(0, 3)
      .join(" • ");

    const totalActivities = days.reduce((acc, day) => {
      return acc + (day.morning ? 1 : 0) + (day.afternoon ? 1 : 0) + (day.evening ? 1 : 0);
    }, 0);

    return NextResponse.json({
      destination: {
        id: resolvedDestinationId,
        name: resolvedDestinationName,
      },
      nights,
      budget,
      budget_tier: budgetTier,
      budget_range: selectedRange,
      travel_style: travelStyle,
      best_season: bestSeason,
      company: companyNames || "Local Expert",
      cost,
      currency,
      days,
      meta: {
        total_activities: totalActivities,
        matchedActivities: activities.length,
        min_price: stats.min_price,
        max_price: stats.max_price,
        avg_price: stats.avg_price,
        usedLocationFallback: false,
        generated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Plan API error:", error);

    return NextResponse.json(
      {
        error: "Server error while generating plan",
      },
      { status: 500 }
    );
  }
}
