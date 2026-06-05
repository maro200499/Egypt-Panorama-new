"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { getAuthToken } from "@/lib/session";
import ActiveSubscriptionBanner from "@/components/subscription/ActiveSubscriptionBanner";
import Toast from "@/components/subscription/Toast";
import {
  getCopy,
  getLocalizedPlanDescription,
  getLocalizedPlanFeatures,
  getLocalizedPlanName,
  findPlanByRawValue,
  mapActiveSubscription,
  PLANS,
} from "@/components/subscription/subscriptionData";
import type { ActiveSubscription, Plan, ToastState, ToastType } from "@/components/subscription/types";

function formatPrice(value: number, isAr: boolean): string {
  return new Intl.NumberFormat(isAr ? "ar-EG" : "en-US", { maximumFractionDigits: 0 }).format(value);
}

function formatDuration(isAr: boolean): string {
  if (isAr) {
    return "أيام";
  }

  return "days";
}

export default function MembershipPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const isAr = locale === "ar";
  const selectedPlanId = searchParams.get("plan") ?? "";

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeSubscription, setActiveSubscription] = useState<ActiveSubscription | null>(null);
  const [toast, setToast] = useState<ToastState>({ visible: false, type: "info", message: "" });
  const [paymentStep, setPaymentStep] = useState<"form" | "processing" | "success">("form");
  const [cardholder, setCardholder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  const copy = useMemo(
    () => ({
      eyebrow: isAr ? "إتمام الباقة" : "Complete trip plan",
      title: isAr ? "أدخل بيانات الدفع التجريبية" : "Enter the simulated payment details",
      subtitle: isAr
        ? "هذه تجربة دفع شكلية مخصصة للعرض التقديمي. لا يتم تنفيذ أي عملية حقيقية."
        : "This is a simulated payment experience for demo purposes. No real transaction is processed.",
      planLabel: isAr ? "الخطة المحددة" : "Selected plan",
      durationLabel: isAr ? "المدة" : "Duration",
      priceLabel: isAr ? "السعر" : "Price",
      confirmButton: isAr ? "تأكيد الباقة" : "Confirm plan",
      payNow: isAr ? "معالجة الدفع" : "Process Payment",
      processing: isAr ? "جار معالجة الباقة..." : "Processing trip plan...",
      missingPlan: isAr ? "يرجى اختيار خطة من صفحة الأسعار." : "Please choose a plan from the pricing page.",
      invalidCard: isAr ? "يرجى إدخال بيانات بطاقة تجريبية صحيحة." : "Please enter valid simulated card details.",
      needLogin: isAr ? "انتهت الجلسة. يرجى تسجيل الدخول مرة أخرى." : "Session expired. Please log in again.",
      alreadyActive: isAr ? "لديك باقة نشطة بالفعل." : "You already have an active trip plan.",
      successTitle: isAr ? "تم تفعيل الباقة" : "Trip plan activated",
      successBody: isAr ? "أصبحت باقتك فعالة الآن." : "Your trip plan is now active.",
      close: isAr ? "إغلاق" : "Close",
      checkoutLabel: isAr ? "الدفع" : "Checkout",
      simulatedPaymentTitle: isAr ? "دفع تجريبي" : "Simulated payment",
      simulatedPaymentBody: isAr
        ? "هذا نموذج بطاقة تجريبي يحاكي عملية الدفع الحقيقية، بدون أي خصم فعلي."
        : "This is a demo card form that behaves like a real checkout, but no real charge is made.",
      cardholderLabel: isAr ? "اسم حامل البطاقة" : "Cardholder name",
      cardholderPlaceholder: isAr ? "كما هو مكتوب على البطاقة" : "As shown on card",
      cardNumberLabel: isAr ? "رقم البطاقة" : "Card number",
      expiryFieldLabel: isAr ? "تاريخ الانتهاء" : "Expiry",
      confirmationModalLabel: isAr ? "نافذة التأكيد" : "Confirmation modal",
      checkoutSuffix: isAr ? "الدفع" : "checkout",
      processingHint: isAr ? "يرجى الانتظار ريثما نقوم بتفعيل باقتك." : "Please wait while we activate your trip plan.",
      shortCardholderLabel: isAr ? "الحامل" : "Cardholder",
      shortCardLabel: isAr ? "البطاقة" : "Card",
      current: isAr ? "الحالي" : "Current",
      currency: "$",
      popular: isAr ? "الأكثر اختيارا" : "Most Popular",
    }),
    [isAr]
  );

  const selectedPlan = findPlanByRawValue(selectedPlanId);

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
    setMounted(true);

    if (!selectedPlan) {
      router.replace("/pricing");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
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
          message?: string;
          data?: Record<string, unknown> | null;
        };

        if (cancelled) {
          return;
        }

        if (!response.ok || payload.status !== "success") {
          return;
        }

        setActiveSubscription(mapActiveSubscription(payload.data ?? null));
      } catch {
        if (!cancelled) {
          showToast("info", copy.subtitle);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadStatus();

    return () => {
      cancelled = true;
    };
  }, [copy.subtitle, router, selectedPlan, showToast]);

  const handleConfirmOpen = useCallback(() => {
    if (activeSubscription) {
      showToast("info", copy.alreadyActive);
      return;
    }

    setShowModal(true);
    setPaymentStep("form");
  }, [activeSubscription, copy.alreadyActive, showToast]);

  const handleSubmit = useCallback(async () => {
    if (!selectedPlan) {
      showToast("error", copy.missingPlan);
      return;
    }

    if (!cardholder.trim() || !cardNumber.replace(/\s+/g, "").match(/^\d{16}$/) || !expiry.match(/^\d{2}\/\d{2}$/) || !cvc.match(/^\d{3,4}$/)) {
      showToast("error", copy.invalidCard);
      return;
    }

    const token = getAuthToken();
    if (!token) {
      showToast("error", copy.needLogin);
      router.replace("/login");
      return;
    }

    setSubmitting(true);
    setPaymentStep("processing");

    try {
      const userRaw = localStorage.getItem("user");
      const user = userRaw ? (JSON.parse(userRaw) as { id?: number }) : null;

      const response = await fetch("/api/subscription/subscribe.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: user?.id,
          plan: selectedPlan.id,
          duration: selectedPlan.duration,
          price: selectedPlan.price,
          status: "active",
        }),
      });

      const payload = (await response.json()) as {
        status?: "success" | "error";
        message?: string;
      };

      if (!response.ok || payload.status !== "success") {
        setPaymentStep("form");
        showToast("error", payload.message ?? copy.alreadyActive);
        return;
      }

      setPaymentStep("success");
      showToast("success", payload.message ?? copy.successBody);
      window.setTimeout(() => {
        router.replace(`/membership/success?plan=${selectedPlan.id}`);
      }, 900);
    } catch {
      setPaymentStep("form");
      showToast("error", copy.alreadyActive);
    } finally {
      setSubmitting(false);
    }
  }, [cardNumber, cardholder, copy.alreadyActive, copy.invalidCard, copy.missingPlan, copy.needLogin, copy.successBody, router, selectedPlan, showToast, cvc, expiry]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_10%_0%,rgba(251,191,36,0.14),transparent_35%),radial-gradient(circle_at_95%_90%,rgba(14,165,233,0.13),transparent_40%),linear-gradient(165deg,#0f172a_0%,#1b2437_48%,#241f18_100%)] px-4 py-10 text-amber-50 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.05)_1px,transparent_1px)] bg-size-[38px_38px]" />
      <div className="pointer-events-none absolute -left-24 top-12 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-8 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-4xl border border-white/10 bg-white/8 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl sm:p-8">
          <p className="inline-flex rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-amber-200">
            {copy.eyebrow}
          </p>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-amber-50 sm:text-5xl">{copy.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-amber-100/80 sm:text-base">{copy.subtitle}</p>

          {activeSubscription && <ActiveSubscriptionBanner subscription={activeSubscription} copy={getCopy(isAr)} isAr={isAr} />}

          <div className="mt-7 rounded-4xl border border-white/10 bg-slate-950/40 p-5 shadow-inner shadow-black/20">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/80">{copy.planLabel}</p>
                <h2 className="mt-1 text-2xl font-black text-amber-50">
                  {selectedPlan ? getLocalizedPlanName(selectedPlan, isAr) : copy.missingPlan}
                </h2>
              </div>
              {selectedPlan?.popular && (
                <span className="rounded-full border border-amber-300/35 bg-amber-300/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-200">
                  {copy.popular}
                </span>
              )}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-amber-100/60">{copy.durationLabel}</p>
                <p className="mt-1 text-lg font-bold text-amber-50">
                  {selectedPlan ? `${selectedPlan.duration} ${formatDuration(isAr)}` : "-"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-amber-100/60">{copy.priceLabel}</p>
                <p className="mt-1 text-lg font-bold text-amber-50">{selectedPlan ? `${copy.currency}${formatPrice(selectedPlan.price, isAr)}` : `-${copy.currency}`}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-amber-100/60">{copy.current}</p>
                <p className="mt-1 text-lg font-bold text-amber-50">
                  {selectedPlan ? getLocalizedPlanDescription(selectedPlan, isAr) : "-"}
                </p>
              </div>
            </div>

            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {selectedPlan && getLocalizedPlanFeatures(selectedPlan, isAr).map((feature) => (
                <li key={feature} className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-amber-100/85">
                  ◈ {feature}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <aside className="rounded-4xl border border-white/10 bg-slate-950/55 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200/80">{copy.checkoutLabel}</p>
          <h2 className="mt-2 text-2xl font-black text-amber-50">{copy.simulatedPaymentTitle}</h2>
          <p className="mt-2 text-sm leading-7 text-amber-100/75">
            {copy.simulatedPaymentBody}
          </p>

          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-amber-100/70">{copy.cardholderLabel}</span>
              <input
                value={cardholder}
                onChange={(event) => setCardholder(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-amber-50 outline-none transition placeholder:text-amber-100/35 focus:border-amber-300/70"
                placeholder={copy.cardholderPlaceholder}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-amber-100/70">{copy.cardNumberLabel}</span>
              <input
                value={cardNumber}
                onChange={(event) => setCardNumber(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-amber-50 outline-none transition placeholder:text-amber-100/35 focus:border-amber-300/70"
                placeholder="4242 4242 4242 4242"
                inputMode="numeric"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-amber-100/70">{copy.expiryFieldLabel}</span>
                <input
                  value={expiry}
                  onChange={(event) => setExpiry(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-amber-50 outline-none transition placeholder:text-amber-100/35 focus:border-amber-300/70"
                  placeholder="MM/YY"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-amber-100/70">CVC</span>
                <input
                  value={cvc}
                  onChange={(event) => setCvc(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-amber-50 outline-none transition placeholder:text-amber-100/35 focus:border-amber-300/70"
                  placeholder="123"
                  inputMode="numeric"
                />
              </label>
            </div>
          </div>

          <button
            type="button"
            onClick={handleConfirmOpen}
            disabled={!selectedPlan || !!activeSubscription}
            className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-linear-to-r from-amber-300 to-orange-300 px-4 py-3 text-sm font-extrabold text-slate-950 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-55"
          >
            {copy.confirmButton}
          </button>
        </aside>
      </div>

      {showModal && selectedPlan && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-4xl border border-white/10 bg-slate-950 p-6 text-amber-50 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200/80">{copy.confirmationModalLabel}</p>
                <h3 className="mt-2 text-2xl font-black">{getLocalizedPlanName(selectedPlan, isAr)} {copy.checkoutSuffix}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-amber-100/80 transition hover:bg-white/10"
              >
                ×
              </button>
            </div>

            <div className="mt-5 rounded-3xl border border-amber-100/10 bg-white/6 p-4">
              <p className="text-sm text-amber-100/70">{getLocalizedPlanDescription(selectedPlan, isAr)}</p>
              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                <span className="rounded-full border border-white/10 px-3 py-1">
                  {selectedPlan.duration} {formatDuration(selectedPlan.duration, isAr)}
                </span>
                <span className="rounded-full border border-white/10 px-3 py-1">{copy.currency}{formatPrice(selectedPlan.price, isAr)}</span>
                <span className="rounded-full border border-white/10 px-3 py-1">{copy.popular}</span>
              </div>
            </div>

            {paymentStep === "processing" ? (
              <div className="mt-6 rounded-3xl border border-white/10 bg-slate-900/70 p-6 text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-amber-200/20 border-t-amber-300" />
                <p className="mt-4 text-lg font-bold">{copy.processing}</p>
                <p className="mt-1 text-sm text-amber-100/70">{copy.processingHint}</p>
              </div>
            ) : paymentStep === "success" ? (
              <div className="mt-6 rounded-3xl border border-emerald-300/20 bg-emerald-400/10 p-6 text-emerald-100">
                <p className="text-lg font-bold">{copy.successTitle}</p>
                <p className="mt-1 text-sm text-emerald-100/80">{copy.successBody}</p>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block rounded-2xl border border-white/10 bg-white/5 p-4">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-amber-100/70">{copy.shortCardholderLabel}</span>
                    <input value={cardholder} onChange={(event) => setCardholder(event.target.value)} className="w-full bg-transparent text-sm text-amber-50 outline-none" />
                  </label>
                  <label className="block rounded-2xl border border-white/10 bg-white/5 p-4">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-amber-100/70">{copy.shortCardLabel}</span>
                    <input value={cardNumber} onChange={(event) => setCardNumber(event.target.value)} className="w-full bg-transparent text-sm text-amber-50 outline-none" />
                  </label>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block rounded-2xl border border-white/10 bg-white/5 p-4">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-amber-100/70">{copy.expiryFieldLabel}</span>
                    <input value={expiry} onChange={(event) => setExpiry(event.target.value)} className="w-full bg-transparent text-sm text-amber-50 outline-none" />
                  </label>
                  <label className="block rounded-2xl border border-white/10 bg-white/5 p-4">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-amber-100/70">CVC</span>
                    <input value={cvc} onChange={(event) => setCvc(event.target.value)} className="w-full bg-transparent text-sm text-amber-50 outline-none" />
                  </label>
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-amber-100/80 transition hover:bg-white/10"
              >
                {copy.close}
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || paymentStep === "processing"}
                className="rounded-xl bg-linear-to-r from-amber-300 to-orange-300 px-4 py-2 text-sm font-extrabold text-slate-950 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-55"
              >
                {submitting ? copy.processing : copy.payNow}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast toast={toast} />
    </div>
  );
}
