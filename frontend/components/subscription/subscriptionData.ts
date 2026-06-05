import type { ActiveSubscription, Plan, StoredUser, SubscriptionCopy } from "./types";
import { USER_STORAGE_KEY } from "@/lib/session";

export const PLANS: Plan[] = [
  {
    id: "weekend",
    name: "Weekend",
    description: "Best for a quick escape with the essentials covered.",
    duration: 2,
    price: 5,
    icon: "moon",
    ctaLabel: "Choose",
    features: [
      { en: "Full access", ar: "وصول كامل" },
      { en: "Offline maps", ar: "خرائط بدون اتصال" },
    ],
  },
  {
    id: "short-trip",
    name: "Short Trip",
    description: "A compact plan for a few days of easy travel.",
    duration: 3,
    price: 8,
    icon: "map",
    ctaLabel: "Choose",
    features: [
      { en: "Full access", ar: "وصول كامل" },
      { en: "Offline maps", ar: "خرائط بدون اتصال" },
    ],
  },
  {
    id: "classic",
    name: "Classic",
    description: "Our featured pick with trip planning included.",
    duration: 5,
    price: 13,
    icon: "plane",
    popular: true,
    badge: "⭐ Most Popular",
    ctaLabel: "Choose",
    features: [
      { en: "Full access", ar: "وصول كامل" },
      { en: "Offline maps", ar: "خرائط بدون اتصال" },
      { en: "Trip planner", ar: "مخطط الرحلة" },
    ],
  },
  {
    id: "full-journey",
    name: "Full Journey",
    description: "A complete long-stay option with premium support.",
    duration: 7,
    price: 20,
    icon: "globe",
    ctaLabel: "Choose",
    features: [
      { en: "Full access", ar: "وصول كامل" },
      { en: "Offline maps", ar: "خرائط بدون اتصال" },
      { en: "Trip planner", ar: "مخطط الرحلة" },
      { en: "Priority support", ar: "دعم ذو أولوية" },
    ],
  },
];

const LEGACY_PLAN_ALIASES: Record<string, Plan["id"]> = {
  basic: "weekend",
  standard: "classic",
  premium: "full-journey",
};

function normalizePlanKey(value: string): string {
  return value.trim().toLowerCase().replace(/[\s_-]+/g, "");
}

export function findPlanByRawValue(rawValue: string): Plan | null {
  const normalized = normalizePlanKey(rawValue);
  const aliased = LEGACY_PLAN_ALIASES[normalized];

  return (
    PLANS.find((plan) => {
      const byId = normalizePlanKey(plan.id) === normalized;
      const byName = normalizePlanKey(plan.name) === normalized;
      const byAlias = aliased ? normalizePlanKey(plan.id) === normalizePlanKey(aliased) : false;
      return byId || byName || byAlias;
    }) ?? null
  );
}

export function getLocalizedPlanName(plan: Plan, isAr: boolean): string {
  if (!isAr) {
    return plan.name;
  }

  switch (plan.id) {
    case "weekend":
      return "عطلة نهاية الأسبوع";
    case "short-trip":
      return "رحلة قصيرة";
    case "classic":
      return "كلاسيك";
    case "full-journey":
      return "الرحلة الكاملة";
    default:
      return plan.name;
  }
}

export function getLocalizedPlanDescription(plan: Plan, isAr: boolean): string {
  if (!isAr) {
    return plan.description;
  }

  switch (plan.id) {
    case "weekend":
      return "خيار خفيف لإجازة قصيرة مع الأدوات الأساسية.";
    case "short-trip":
      return "مناسب لرحلة سريعة مع خرائط غير متصلة ووصول كامل.";
    case "classic":
      return "الخيار المفضل مع مخطط رحلة وأفضل توازن بين القيمة والمزايا.";
    case "full-journey":
      return "أقوى باقة لرحلة أطول مع دعم أولوية وتجربة كاملة.";
    default:
      return plan.description;
  }
}

export function getLocalizedPlanNameFromRaw(rawValue: string, isAr: boolean): string {
  const plan = findPlanByRawValue(rawValue);

  if (!plan) {
    return rawValue;
  }

  return getLocalizedPlanName(plan, isAr);
}

export function getLocalizedPlanFeatures(plan: Plan, isAr: boolean): string[] {
  return plan.features.map((feature) => (isAr ? feature.ar : feature.en));
}

export function getCopy(isAr: boolean): SubscriptionCopy {
  return {
    eyebrow: isAr ? "باقات الرحلات" : "Trip Plans",
    title: isAr ? "اختر الباقة المناسبة لمدة رحلتك" : "Choose the right trip plan for your journey",
    subtitle: isAr
      ? "اختر باقة محددة بالمدة والرحلة، مع تصميم واضح وتجربة تناسب السفر القصير والطويل."
      : "Pick a trip-length plan with clear pricing and a polished experience for short or long journeys.",
    activeNow: isAr ? "الباقة الحالية" : "Current Plan",
    activeText: isAr ? "لديك باقة رحلات نشطة" : "You currently have an active trip plan",
    expiresOn: isAr ? "ينتهي في" : "Ends on",
    choose: isAr ? "اختيار" : "Choose",
    current: isAr ? "الحالية" : "Current",
    perTrip: isAr ? "لكل رحلة" : "per trip",
    confirmTitle: isAr ? "تأكيد تفعيل الباقة" : "Confirm Trip Plan",
    confirmText: isAr ? "هل تريد تفعيل هذه الباقة الآن؟" : "Do you want to activate this trip plan now?",
    cancel: isAr ? "إلغاء" : "Cancel",
    confirm: isAr ? "تأكيد" : "Confirm",
    processing: isAr ? "جار التنفيذ..." : "Processing...",
    needLogin: isAr ? "انتهت الجلسة. يرجى تسجيل الدخول مرة أخرى." : "Session expired. Please log in again.",
    subscribeSuccess: isAr ? "تم تفعيل باقة الرحلة بنجاح." : "Trip plan activated successfully.",
    subscribeFail: isAr ? "تعذر تفعيل باقة الرحلة. حاول مرة أخرى." : "Unable to activate the trip plan. Please try again.",
    statusFail: isAr ? "تعذر تحميل حالة الباقة الحالية." : "Could not load current trip plan status.",
    durationUnit: isAr ? "أيام" : "days",
    popular: isAr ? "⭐ الأكثر اختيارا" : "⭐ Most Popular",
    bestValue: isAr ? "🔥 أفضل قيمة" : "🔥 Best Value",
    saveLabel: isAr ? "وفر 60%" : "Save 60%",
    startNow: isAr ? "ابدأ الآن" : "Start Now",
    getStarted: isAr ? "ابدأ" : "Get Started",
    goPremium: isAr ? "إلى الباقة المميزة" : "Go Premium",
    currency: "$",
  };
}

function getSafeString(source: Record<string, unknown>, keys: string[], fallback = ""): string {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return fallback;
}

export function mapActiveSubscription(data: Record<string, unknown> | null): ActiveSubscription | null {
  if (!data) {
    return null;
  }

  const status = getSafeString(data, ["status", "subscription_status"]);
  if (!status || status.toLowerCase() !== "active") {
    return null;
  }

  return {
    status,
    planName: getSafeString(data, ["plan", "planName", "plan_name"], "Active Plan"),
    startedAt: getSafeString(data, ["startDate", "start_date", "started_at"]),
    endDate: getSafeString(data, ["endDate", "end_date", "expires_at"]),
  };
}

export function getStoredUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}
