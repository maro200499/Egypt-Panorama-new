type LockedOverlayProps = {
  message: string;
  premiumBadge: string;
  ctaLabel: string;
  onSubscribe: () => void;
};

export default function LockedOverlay({ message, premiumBadge, ctaLabel, onSubscribe }: LockedOverlayProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between rounded-2xl bg-gradient-to-br from-[#0d0a06]/40 via-[#111827]/38 to-[#0f172a]/50 p-4 sm:p-5">
      <div className="flex justify-end">
        <span className="inline-flex items-center rounded-full border border-amber-300/40 bg-amber-300/15 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-amber-200">
          {premiumBadge}
        </span>
      </div>

      <div className="pointer-events-auto mx-auto w-full max-w-xs rounded-xl border border-white/15 bg-[#090b10]/75 p-4 text-center shadow-xl backdrop-blur-sm sm:p-5">
        <p className="mb-3 text-sm font-medium leading-relaxed text-amber-50/90">🔒 {message}</p>
        <button
          type="button"
          onClick={onSubscribe}
          className="w-full rounded-lg bg-gradient-to-r from-amber-300 via-amber-400 to-orange-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#1b1308] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-14px_rgba(245,158,11,0.9)]"
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}
