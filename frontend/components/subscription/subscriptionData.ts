import type { ActiveSubscription, Plan, StoredUser, SubscriptionCopy } from "./types";
import { USER_STORAGE_KEY } from "@/lib/session";

export const PLANS: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    description: "Essential tools to get started with Egypt travel planning.",
    duration: 1,
    price: 129,
    ctaLabel: "Start Now",
    features: [
      { en: "Browse activities", ar: "تصفح الأنشطة" },
      { en: "Basic trip planning", ar: "تخطيط رحلات أساسي" },
      { en: "Limited access", ar: "وصول محدود" },
    ],
  },
  {
    id: "standard",
    name: "Standard",
    description: "Balanced value for frequent travelers who want smarter planning.",
    duration: 3,
    price: 299,
    popular: true,
    badge: "⭐ Most Popular",
    ctaLabel: "Get Started",
    features: [
      { en: "Advanced filters", ar: "فلاتر متقدمة" },
      { en: "Save trips", ar: "حفظ الرحلات" },
      { en: "Better recommendations", ar: "توصيات أفضل" },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    description: "The complete premium experience with personalized AI support.",
    duration: 12,
    price: 499,
    badge: "🔥 Best Value",
    saveLabel: "Save 60%",
    ctaLabel: "Go Premium",
    features: [
      { en: "AI trip planning", ar: "تخطيط رحلات بالذكاء الاصطناعي" },
      { en: "Personalized recommendations", ar: "توصيات مخصصة" },
      { en: "Priority support", ar: "دعم ذو أولوية" },
    ],
  },
];

function normalizePlanKey(value: string): string {
  return value.trim().toLowerCase().replace(/[\s_-]+/g, "");
}

export function findPlanByRawValue(rawValue: string): Plan | null {
  const normalized = normalizePlanKey(rawValue);

  return (
    PLANS.find((plan) => {
      const byId = normalizePlanKey(plan.id) === normalized;
      const byName = normalizePlanKey(plan.name) === normalized;
      return byId || byName;
    }) ?? null
  );
}

export function getLocalizedPlanName(plan: Plan, isAr: boolean): string {
  if (!isAr) {
    return plan.name;
  }

  switch (plan.id) {
    case "basic":
      return "أساسية";
    case "standard":
      return "القياسية";
    case "premium":
      return "المميزة";
    default:
      return plan.name;
  }
}

export function getLocalizedPlanDescription(plan: Plan, isAr: boolean): string {
  if (!isAr) {
    return plan.description;
  }

  switch (plan.id) {
    case "basic":
      return "أدوات أساسية للبدء في تخطيط رحلاتك داخل مصر.";
    case "standard":
      return "أفضل توازن بين السعر والمميزات للمسافرين المتكررين.";
    case "premium":
      return "تجربة متقدمة كاملة مع تخصيص ودعم أعلى.";
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
    eyebrow: isAr ? "العضويات والخطط" : "Membership & Plans",
    title: isAr ? "اختر الباقة المناسبة لرحلتك" : "Choose the right plan for your trip",
    subtitle: isAr
      ? "فعّل اشتراكك للوصول إلى أدوات تخطيط أذكى وتجربة سفر أكثر تخصيصا."
      : "Activate a plan to unlock smarter trip planning and a more personalized travel experience.",
    activeNow: isAr ? "الاشتراك الحالي" : "Current Subscription",
    activeText: isAr ? "لديك اشتراك نشط" : "You currently have an active subscription",
    expiresOn: isAr ? "ينتهي في" : "Ends on",
    choose: isAr ? "اختيار" : "Choose",
    current: isAr ? "الباقة الحالية" : "Current Plan",
    confirmTitle: isAr ? "تأكيد تفعيل الاشتراك" : "Confirm Subscription",
    confirmText: isAr ? "هل تريد تفعيل هذه الباقة الآن؟" : "Do you want to activate this plan now?",
    cancel: isAr ? "إلغاء" : "Cancel",
    confirm: isAr ? "تأكيد" : "Confirm",
    processing: isAr ? "جار التنفيذ..." : "Processing...",
    needLogin: isAr ? "انتهت الجلسة. يرجى تسجيل الدخول مرة أخرى." : "Session expired. Please log in again.",
    subscribeSuccess: isAr ? "تم تفعيل الاشتراك بنجاح." : "Subscription activated successfully.",
    subscribeFail: isAr ? "تعذر تفعيل الاشتراك. حاول مرة أخرى." : "Unable to activate subscription. Please try again.",
    statusFail: isAr ? "تعذر تحميل حالة الاشتراك الحالية." : "Could not load current subscription status.",
    durationMonths: isAr ? "شهر" : "month",
    popular: isAr ? "⭐ الأكثر اختيارا" : "⭐ Most Popular",
    bestValue: isAr ? "🔥 أفضل قيمة" : "🔥 Best Value",
    saveLabel: isAr ? "وفر 60%" : "Save 60%",
    startNow: isAr ? "ابدأ الآن" : "Start Now",
    getStarted: isAr ? "ابدأ" : "Get Started",
    goPremium: isAr ? "إلى الباقة المميزة" : "Go Premium",
    currency: "EGP",
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
