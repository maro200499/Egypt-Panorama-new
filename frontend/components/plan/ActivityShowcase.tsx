import Link from "next/link";

type ActivityCard = {
  id: string;
  name: string;
  price: string;
};

type ActivityShowcaseProps = {
  popularActivities: ActivityCard[];
  hiddenGemActivities: ActivityCard[];
  popularTitle: string;
  hiddenTitle: string;
  hiddenBadge: string;
  emptyLabel: string;
  priceLabel: string;
  noPriceLabel: string;
};

function ActivityCardView({
  activity,
  hiddenBadge,
  priceLabel,
  noPriceLabel,
}: {
  activity: ActivityCard;
  hiddenBadge?: string;
  priceLabel: string;
  noPriceLabel: string;
}) {
  return (
    <Link href={`/activities/${encodeURIComponent(activity.id)}`} className="block text-inherit no-underline">
      <article className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_16px_40px_-25px_rgba(0,0,0,0.55)] transition duration-300 hover:-translate-y-1 hover:border-amber-300/30 hover:bg-white/7">
        {hiddenBadge && (
          <span className="mb-3 inline-flex rounded-full border border-fuchsia-300/40 bg-fuchsia-400/10 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-fuchsia-200">
            {hiddenBadge}
          </span>
        )}

        <h4 className="text-base font-semibold leading-tight text-[#F7F0E3]">{activity.name}</h4>
        <p className="mt-3 text-sm font-medium text-amber-200">{priceLabel}: {activity.price || noPriceLabel}</p>
      </article>
    </Link>
  );
}

export default function ActivityShowcase({
  popularActivities,
  hiddenGemActivities,
  popularTitle,
  hiddenTitle,
  hiddenBadge,
  emptyLabel,
  priceLabel,
  noPriceLabel,
}: ActivityShowcaseProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-3xl border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.02)_100%)] p-5 shadow-[0_24px_60px_-35px_rgba(0,0,0,0.55)]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-bold tracking-tight text-[#F7F0E3]">{popularTitle}</h3>
          <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-amber-200">
            {popularActivities.length}
          </span>
        </div>

        {popularActivities.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {popularActivities.map((activity) => (
              <ActivityCardView key={activity.id} activity={activity} priceLabel={priceLabel} noPriceLabel={noPriceLabel} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/55">{emptyLabel}</p>
        )}
      </section>

      <section className="rounded-3xl border border-fuchsia-300/20 bg-[linear-gradient(160deg,rgba(124,58,237,0.08)_0%,rgba(236,72,153,0.06)_100%)] p-5 shadow-[0_24px_60px_-35px_rgba(0,0,0,0.55)]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-bold tracking-tight text-[#F7F0E3]">{hiddenTitle}</h3>
          <span className="rounded-full border border-fuchsia-300/30 bg-fuchsia-400/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-fuchsia-200">
            {hiddenGemActivities.length}
          </span>
        </div>

        {hiddenGemActivities.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {hiddenGemActivities.map((activity) => (
              <ActivityCardView
                key={activity.id}
                activity={activity}
                hiddenBadge={hiddenBadge}
                priceLabel={priceLabel}
                noPriceLabel={noPriceLabel}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/55">{emptyLabel}</p>
        )}
      </section>
    </div>
  );
}
