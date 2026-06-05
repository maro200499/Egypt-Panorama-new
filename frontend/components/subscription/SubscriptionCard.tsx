import type { Plan, SubscriptionCopy } from "./types";

type SubscriptionCardProps = {
  plan: Plan;
  copy: SubscriptionCopy;
  isActive: boolean;
  isLocked: boolean;
  loading: boolean;
  index: number;
  onSelect: (plan: Plan) => void;
  onContinue: (plan: Plan) => void;
  buttonLabel?: string;
  durationLabel?: string;
  featureLabels?: string[];
  planName?: string;
  planDescription?: string;
  priceLabel?: string;
};

export default function SubscriptionCard({
  plan,
  copy,
  isActive,
  isLocked,
  loading,
  index,
  onSelect,
  onContinue,
  buttonLabel,
  durationLabel,
  featureLabels,
  planName,
  planDescription,
  priceLabel,
}: SubscriptionCardProps) {
  const isWeekend = plan.id === "weekend";
  const isShortTrip = plan.id === "short-trip";
  const isClassic = plan.id === "classic";

  const cardStyle = isWeekend
    ? "border-sky-300/20 bg-[linear-gradient(145deg,rgba(8,15,30,0.98)_0%,rgba(15,23,42,0.95)_54%,rgba(7,89,133,0.35)_100%)] text-amber-50 shadow-[0_28px_60px_-34px_rgba(14,165,233,0.45)]"
    : isShortTrip
      ? "border-emerald-300/20 bg-[linear-gradient(145deg,rgba(8,15,30,0.98)_0%,rgba(15,23,42,0.95)_54%,rgba(6,95,70,0.36)_100%)] text-amber-50 shadow-[0_28px_60px_-34px_rgba(16,185,129,0.42)]"
      : isClassic
        ? "border-amber-300/80 bg-[linear-gradient(145deg,rgba(10,15,28,0.98)_0%,rgba(23,28,45,0.97)_46%,rgba(92,53,13,0.58)_100%)] text-amber-50 shadow-[0_32px_72px_-34px_rgba(245,158,11,0.76)] md:-translate-y-2"
        : "border-cyan-300/20 bg-[linear-gradient(145deg,rgba(8,15,30,0.98)_0%,rgba(15,23,42,0.95)_54%,rgba(8,47,73,0.44)_100%)] text-amber-50 shadow-[0_28px_60px_-34px_rgba(34,211,238,0.4)]";

  const buttonStyle = isClassic
    ? "border-transparent bg-linear-to-r from-amber-300 via-orange-300 to-amber-200 text-slate-950 hover:from-amber-200 hover:to-orange-200"
    : isWeekend
      ? "border-sky-200/40 bg-sky-300/10 text-sky-50 hover:bg-sky-300/15"
      : isShortTrip
        ? "border-emerald-200/40 bg-emerald-300/10 text-emerald-50 hover:bg-emerald-300/15"
        : "border-cyan-200/40 bg-cyan-300/10 text-cyan-50 hover:bg-cyan-300/15";

  const featureItems = featureLabels ?? plan.features.map((feature) => feature.en);

  const icon = (() => {
    const common = "h-5 w-5 text-white";

    switch (plan.icon) {
      case "moon":
        return (
          <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
            <path d="M21 13.2A8.6 8.6 0 0 1 10.8 3a9.5 9.5 0 1 0 10.2 10.2Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case "map":
        return (
          <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
            <path d="m9 19-6 2V5l6-2 6 2 6-2v16l-6 2-6-2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M9 3v16M15 5v16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        );
      case "plane":
        return (
          <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
            <path d="M3 12.2 21 4l-4.8 17.5-4.2-7.6-4.5 2.6 1.1-5.4L3 12.2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
            <path d="M12 3a9 9 0 1 0 9 9 9 9 0 0 0-9-9Zm0 0c-2.5 2.3-4 5.1-4 9s1.5 6.7 4 9m0-18c2.5 2.3 4 5.1 4 9s-1.5 6.7-4 9M3 12h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
    }
  })();

  const CheckIcon = () => (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-emerald-300" aria-hidden="true">
      <path d="M16.5 5.5 8.5 13.5 5 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <article
      className={`relative flex h-full cursor-pointer flex-col overflow-hidden rounded-[28px] border p-6 transition duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_30px_65px_-35px_rgba(0,0,0,0.65)] ${cardStyle} ${isActive ? "ring-2 ring-amber-200/45" : ""}`}
      style={{ animation: `pricingReveal 0.55s ease ${index * 0.09}s both` }}
      onClick={() => onSelect(plan)}
    >
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className={`absolute -right-12 -top-14 h-36 w-36 rounded-full blur-3xl ${isClassic ? "bg-amber-300/25" : isWeekend ? "bg-sky-400/18" : isShortTrip ? "bg-emerald-400/18" : "bg-cyan-400/18"}`} />
      </div>

      {(plan.popular || plan.badge) && (
        <span className={`absolute left-5 top-5 rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.12em] ${isClassic ? "bg-linear-to-r from-amber-300 to-orange-300 text-slate-950" : "bg-white/12 text-amber-50 ring-1 ring-white/15 backdrop-blur"}`}>
          {plan.badge ?? copy.popular}
        </span>
      )}

      <div className="relative flex items-start gap-4 pt-8">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border shadow-[0_18px_30px_-20px_rgba(0,0,0,0.65)] ${isClassic ? "border-amber-200/50 bg-amber-300/20" : isWeekend ? "border-sky-200/30 bg-sky-400/18" : isShortTrip ? "border-emerald-200/30 bg-emerald-400/18" : "border-cyan-200/30 bg-cyan-400/18"}`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-black tracking-tight text-amber-50">{planName ?? plan.name}</h2>
          <p className="mt-1 text-sm text-amber-100/72">{planDescription ?? plan.description}</p>
        </div>
      </div>

      <div className="relative mt-6">
        <p className="flex items-end gap-2 text-4xl font-black tracking-tight text-amber-50">
          <span key={priceLabel} className="inline-block min-w-[5.5ch] tabular-nums align-baseline animate-[priceSwap_220ms_ease]">
            {priceLabel ?? `${copy.currency}${plan.price}`}
          </span>
          <span className="pb-1 text-sm font-semibold text-amber-100/72">/ {copy.perTrip}</span>
        </p>
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-100/58">
          {durationLabel ?? `${plan.duration} days`}
        </p>
      </div>

      <div className="relative my-5 h-px bg-linear-to-r from-transparent via-white/15 to-transparent" />

      <ul className="relative space-y-3 text-sm text-amber-50/88">
        {featureItems.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/12">
              <CheckIcon />
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        disabled={isLocked || loading}
        onClick={(event) => {
          event.stopPropagation();
          onContinue(plan);
        }}
        className={`mt-7 inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-bold transition duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-55 ${buttonStyle}`}
      >
        {buttonLabel ?? (isActive ? copy.current : copy.choose)}
      </button>
    </article>
  );
}
