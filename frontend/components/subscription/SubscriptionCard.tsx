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
  const isBasic = plan.id === "basic";
  const isStandard = plan.id === "standard";
  const isPremium = plan.id === "premium";

  const cardStyle = isBasic
    ? "border-slate-200/80 bg-slate-50 text-slate-900"
    : isStandard
      ? "border-amber-300/70 bg-linear-to-br from-slate-900/95 via-slate-900/92 to-amber-950/70 text-amber-50 shadow-[0_28px_60px_-30px_rgba(245,158,11,0.72)] md:scale-[1.05]"
      : "border-fuchsia-300/35 bg-[linear-gradient(135deg,#0b1220_0%,#16111f_45%,#2b1450_100%)] text-amber-50 shadow-[0_30px_70px_-32px_rgba(168,85,247,0.78)]";

  const buttonStyle = isBasic
    ? "border-slate-300 bg-slate-900 text-white hover:bg-slate-800"
    : isStandard
      ? "border-transparent bg-linear-to-r from-amber-300 to-orange-300 text-slate-950 hover:from-amber-200 hover:to-orange-200"
      : "border-fuchsia-200/45 bg-linear-to-r from-fuchsia-500 to-violet-500 text-white hover:from-fuchsia-400 hover:to-violet-400";

  const suffixLabel = plan.duration === 1 ? "/month" : plan.duration === 12 ? "/year" : "/3 months";

  return (
    <article
      className={`relative flex h-full cursor-pointer flex-col rounded-3xl border p-6 transition duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_30px_65px_-35px_rgba(0,0,0,0.65)] ${cardStyle} ${isActive ? "ring-2 ring-cyan-300/45" : ""}`}
      style={{ animation: `pricingReveal 0.55s ease ${index * 0.09}s both` }}
      onClick={() => onSelect(plan)}
    >
      {(plan.popular || plan.badge) && (
        <span className={`absolute -top-3 left-5 rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.12em] ${isPremium ? "bg-linear-to-r from-violet-300 to-fuchsia-300 text-slate-950" : "bg-linear-to-r from-amber-300 to-orange-300 text-slate-950"}`}>
          {plan.popular ? copy.popular : plan.badge}
        </span>
      )}

      {isPremium && plan.saveLabel && (
        <span className="absolute right-5 top-5 rounded-full border border-fuchsia-200/45 bg-fuchsia-200/12 px-2.5 py-1 text-[11px] font-bold tracking-[0.08em] text-fuchsia-100">
          {copy.saveLabel}
        </span>
      )}

      <h2 className={`text-2xl font-black ${isBasic ? "text-slate-900" : "text-amber-50"}`}>{planName ?? plan.name}</h2>
      <p className={`mt-2 text-sm ${isBasic ? "text-slate-700" : "text-amber-100/75"}`}>{planDescription ?? plan.description}</p>
      <div className="mt-5">
        <p className={`text-4xl font-black tracking-tight ${isBasic ? "text-slate-900" : "text-amber-200"}`}>
          <span key={priceLabel} className="inline-block min-w-[6.8ch] tabular-nums align-baseline animate-[priceSwap_220ms_ease]">
            {priceLabel ?? `${plan.price} ${copy.currency}`}
          </span>
          <span className={`ml-1 text-sm font-semibold ${isBasic ? "text-slate-500" : "text-amber-100/70"}`}>
            {suffixLabel}
          </span>
        </p>
        <p className={`text-xs uppercase tracking-[0.15em] ${isBasic ? "text-slate-500" : "text-amber-100/70"}`}>
          {durationLabel ?? `${plan.duration} ${copy.durationMonths}`}
        </p>
      </div>

      <ul className={`mt-5 space-y-2 text-sm ${isBasic ? "text-slate-700" : "text-amber-100/85"}`}>
        {(featureLabels ?? plan.features.map((feature) => feature.en)).map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <span className={`mt-0.5 ${isBasic ? "text-slate-500" : "text-amber-300"}`}>◈</span>
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
