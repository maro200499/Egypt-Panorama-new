import type { ActiveSubscription, SubscriptionCopy } from "./types";
import { getLocalizedPlanNameFromRaw } from "./subscriptionData";

type ActiveSubscriptionBannerProps = {
  subscription: ActiveSubscription;
  copy: SubscriptionCopy;
  isAr?: boolean;
};

export default function ActiveSubscriptionBanner({ subscription, copy, isAr = false }: ActiveSubscriptionBannerProps) {
  const localizedPlanName = getLocalizedPlanNameFromRaw(subscription.planName, isAr);

  return (
    <section className="mb-8 rounded-2xl border border-emerald-200/30 bg-emerald-400/10 p-4 text-emerald-100 shadow-lg shadow-emerald-900/20 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">{copy.activeNow}</p>
      <p className="mt-1 text-base font-bold sm:text-lg">
        {copy.activeText}: {localizedPlanName}
      </p>
      {subscription.endDate && (
        <p className="mt-1 text-sm text-emerald-100/80">
          {copy.expiresOn}: {new Date(subscription.endDate).toLocaleDateString()}
        </p>
      )}
    </section>
  );
}
