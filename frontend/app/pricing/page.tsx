"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import SubscriptionCard from "@/components/subscription/SubscriptionCard";
import ActiveSubscriptionBanner from "@/components/subscription/ActiveSubscriptionBanner";
import Toast from "@/components/subscription/Toast";
import {
  getCopy,
  getLocalizedPlanDescription,
  getLocalizedPlanFeatures,
  getLocalizedPlanName,
  mapActiveSubscription,
  PLANS,
} from "@/components/subscription/subscriptionData";
import { getAuthToken } from "@/lib/session";
import type { ActiveSubscription, Plan, ToastState, ToastType } from "@/components/subscription/types";

export default function PricingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const isAr = locale === "ar";
  const selectedPlanId = searchParams.get("plan") ?? "";

  const [activeSubscription, setActiveSubscription] = useState<ActiveSubscription | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>(selectedPlanId || "classic");
  const [toast, setToast] = useState<ToastState>({ visible: false, type: "info", message: "" });
  const copyData = getCopy(isAr);

  const copy = useMemo(
    () => ({
      heroBadge: isAr ? "باقات الرحلات" : "Trip plans",
      heroTitle: isAr ? "اختر الباقة المناسبة لمدة رحلتك" : "Choose the trip plan that fits",
      heroSubtitle: isAr
        ? "واجهة واضحة ومتوازنة تعرض أربعة مسارات سفر حسب مدة الرحلة، من عطلة نهاية الأسبوع حتى الرحلة الكاملة."
        : "A clear, balanced layout with four trip-length options, from a weekend escape to a full journey.",
      heroTag: isAr ? "تجربة حجز شكلية" : "Simulated checkout",
      subscribeNow: isAr ? "احجز الآن" : "Book now",
      loginHint: isAr ? "سجّل الدخول لتفعيل الباقة لاحقا" : "Log in to activate a trip plan later",
      pricingNote: isAr ? "اختر الباقة المناسبة ثم أكمل الدفع التجريبي" : "Pick a plan, then complete the simulated checkout",
      featuresTitle: isAr ? "ماذا تحصل عليه في كل باقة؟" : "What each plan includes",
      features: isAr
        ? ["وصول كامل", "خرائط بدون اتصال", "مخطط رحلة في كلاسيك", "دعم أولوية في الرحلة الكاملة"]
        : ["Full access", "Offline maps", "Trip planner in Classic", "Priority support in Full Journey"],
    }),
    [isAr]
  );

  const showToast = useCallback((type: ToastType, message: string) => {
    setToast({ visible: true, type, message });
  }, []);

  useEffect(() => {
    if (!toast.visible) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setToast((current) => ({ ...current, visible: false }));
    }, 3200);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [toast.visible]);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      return;
    }

    let cancelled = false;

    async function loadStatus() {
      try {
        const response = await fetch("/api/subscription/status.php", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        const payload = (await response.json()) as {
          status?: "success" | "error";
          data?: Record<string, unknown> | null;
          message?: string;
        };

        if (cancelled || !response.ok || payload.status !== "success") {
          return;
        }

        setActiveSubscription(mapActiveSubscription(payload.data ?? null));
      } catch {
        if (!cancelled) {
          showToast("info", copy.loginHint);
        }
      }
    }

    loadStatus();

    return () => {
      cancelled = true;
    };
  }, [copy.loginHint, showToast]);

  const handleSelectPlan = useCallback(
    (planId: string) => {
      setSelectedPlan(planId);
      localStorage.setItem("pending_membership_plan", planId);
      router.push(`/membership?plan=${planId}`);
    },
    [router]
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_12%_8%,rgba(251,191,36,0.16),transparent_34%),radial-gradient(circle_at_88%_82%,rgba(34,197,94,0.13),transparent_36%),linear-gradient(165deg,#0f172a_0%,#1b2437_55%,#241f18_100%)] px-4 py-10 text-amber-50 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.05)_1px,transparent_1px)] bg-size-[38px_38px]" />
      <div className="pointer-events-none absolute -left-24 top-12 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-8 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl" />

      <div className="relative mx-auto w-full max-w-6xl">
        <header className="mx-auto mb-10 max-w-3xl text-center">
          <p className="inline-flex rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-amber-200">
            {copy.heroBadge}
          </p>
          <h1 className="mt-4 text-balance text-3xl font-black tracking-tight text-amber-50 sm:text-5xl">
            {copy.heroTitle}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-amber-100/80 sm:text-base">
            {copy.heroSubtitle}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3 text-xs text-amber-100/70">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{copy.heroTag}</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{copy.pricingNote}</span>
          </div>
        </header>

        {activeSubscription && <ActiveSubscriptionBanner subscription={activeSubscription} copy={copyData} isAr={isAr} />}

        <main className="grid gap-5 md:grid-cols-2 xl:grid-cols-4 md:items-stretch">
          {PLANS.map((plan) => {
            const isActive = activeSubscription?.planName.toLowerCase() === plan.name.toLowerCase();
            const isHighlighted = selectedPlan === plan.id;

            return (
              <SubscriptionCard
                key={plan.id}
                index={PLANS.findIndex((item) => item.id === plan.id)}
                plan={plan}
                copy={copyData}
                isActive={isActive || isHighlighted}
                isLocked={!!activeSubscription}
                loading={false}
                onSelect={(nextPlan) => setSelectedPlan(nextPlan.id)}
                onContinue={(nextPlan) => handleSelectPlan(nextPlan.id)}
                buttonLabel={isActive ? copyData.current : copyData.choose}
                durationLabel={`${plan.duration} ${copyData.durationUnit}`}
                featureLabels={getLocalizedPlanFeatures(plan, isAr)}
                planName={getLocalizedPlanName(plan, isAr)}
                planDescription={getLocalizedPlanDescription(plan, isAr)}
                priceLabel={`$${plan.price}`}
              />
            );
          })}
        </main>

        <section className="mt-8 rounded-3xl border border-white/10 bg-slate-950/55 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
          <h2 className="text-xl font-black text-amber-50">{copy.featuresTitle}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {copy.features.map((feature) => (
              <div key={feature} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-amber-100/85">
                ◈ {feature}
              </div>
            ))}
          </div>
        </section>
      </div>

      <Toast toast={toast} />

      <style>{`
        @keyframes pricingReveal {
          from {
            opacity: 0;
            transform: translateY(18px) scale(0.985);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes priceSwap {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
