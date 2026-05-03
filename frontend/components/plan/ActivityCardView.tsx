"use client";

import Link from "next/link";

type ActivityCardViewProps = {
  activity: {
    id: string;
    name: string;
    price: string;
  };
  hiddenBadge?: string;
  priceLabel: string;
  noPriceLabel: string;
  showType?: boolean;
  type?: string;
  rating?: number;
};

export default function ActivityCardView({
  activity,
  hiddenBadge,
  priceLabel,
  noPriceLabel,
  showType = false,
  type,
  rating,
}: ActivityCardViewProps) {
  return (
    <Link href={`/activities/${encodeURIComponent(activity.id)}`} className="block text-inherit no-underline">
      <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_16px_40px_-25px_rgba(0,0,0,0.55)] transition duration-300 hover:-translate-y-1 hover:border-amber-300/30 hover:bg-white/7">
        {hiddenBadge && (
          <span className="mb-3 inline-flex rounded-full border border-fuchsia-300/40 bg-fuchsia-400/10 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-fuchsia-200">
            {hiddenBadge}
          </span>
        )}

        {showType && type && (
          <span className="mb-3 inline-flex rounded-full border border-amber-300/40 bg-amber-400/10 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-amber-200">
            {type}
          </span>
        )}

        <h4 className="text-base font-semibold leading-tight text-[#F7F0E3]">
          {activity.name}
        </h4>

        {rating !== undefined && rating > 0 && (
          <div className="mt-2 flex items-center gap-1.5">
            <span className="text-xs font-semibold text-amber-300">★</span>
            <span className="text-xs text-white/70">{rating.toFixed(1)}</span>
          </div>
        )}

        <p className="mt-3 text-sm font-medium text-amber-200">
          {priceLabel}: {activity.price || noPriceLabel}
        </p>
      </article>
    </Link>
  );
}
