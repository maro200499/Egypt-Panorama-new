"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { findPlanByRawValue, getLocalizedPlanName } from "@/components/subscription/subscriptionData";

export default function MembershipSuccessPage() {
  const searchParams = useSearchParams();
  const locale = useLocale();
  const isAr = locale === "ar";
  const planId = searchParams.get("plan") ?? "";
  const plan = findPlanByRawValue(planId);
  const formatPrice = (value: number) => new Intl.NumberFormat(isAr ? "ar-EG" : "en-US", { maximumFractionDigits: 0 }).format(value);
  const labels = {
    plan: isAr ? "الخطة" : "Plan",
    duration: isAr ? "المدة" : "Duration",
    price: isAr ? "السعر" : "Price",
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_12%_12%,rgba(251,191,36,0.16),transparent_34%),radial-gradient(circle_at_88%_82%,rgba(34,197,94,0.16),transparent_38%),linear-gradient(165deg,#0f172a_0%,#1b2437_55%,#241f18_100%)] px-4 py-12 text-amber-50 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.05)_1px,transparent_1px)] bg-size-[38px_38px]" />
      <div className="relative mx-auto flex min-h-[80vh] w-full max-w-3xl items-center justify-center">
        <div className="w-full rounded-4xl border border-white/10 bg-slate-950/65 p-8 text-center shadow-2xl shadow-slate-950/30 backdrop-blur-xl sm:p-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-emerald-300/30 bg-emerald-400/10 text-4xl text-emerald-300">
            ✓
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200">
            {isAr ? "نجاح" : "Success"}
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">
            {isAr ? "تم تفعيل الباقة بنجاح" : "Trip plan activated successfully"}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-amber-100/80 sm:text-base">
            {plan
              ? `${getLocalizedPlanName(plan, isAr)} ${isAr ? "أصبحت الآن مفعلة" : "is now active"}.`
              : isAr
              ? "أصبحت باقتك مفعلة وجاهزة للاستخدام."
              : "Your trip plan is active and ready to use."}
          </p>

          {plan && (
            <div className="mx-auto mt-8 grid max-w-xl gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 text-left sm:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-amber-100/60">{labels.plan}</p>
                <p className="mt-1 text-lg font-bold text-amber-50">{getLocalizedPlanName(plan, isAr)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-amber-100/60">{labels.duration}</p>
                <p className="mt-1 text-lg font-bold text-amber-50">{plan.duration} {isAr ? "أيام" : "days"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-amber-100/60">{labels.price}</p>
                <p className="mt-1 text-lg font-bold text-amber-50">${formatPrice(plan.price)}</p>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/pricing"
              className="rounded-xl border border-amber-100/20 px-4 py-2 text-sm font-semibold text-amber-50 transition hover:bg-white/10"
            >
              {isAr ? "العودة إلى الأسعار" : "Back to pricing"}
            </Link>
            <Link
              href="/plan"
              className="rounded-xl bg-linear-to-r from-amber-300 to-orange-300 px-4 py-2 text-sm font-extrabold text-slate-950 transition hover:brightness-105"
            >
              {isAr ? "تخطيط رحلة جديدة" : "Build a new trip"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
