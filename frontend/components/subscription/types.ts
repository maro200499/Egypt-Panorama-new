export type PlanId = "weekend" | "short-trip" | "classic" | "full-journey";

export type PlanIcon = "moon" | "map" | "plane" | "globe";

export type Plan = {
  id: PlanId;
  name: string;
  description: string;
  duration: number;
  price: number;
  icon: PlanIcon;
  popular?: boolean;
  badge?: string;
  saveLabel?: string;
  ctaLabel?: string;
  features: Array<{
    en: string;
    ar: string;
  }>;
};

export type ToastType = "success" | "error" | "info";

export type ToastState = {
  visible: boolean;
  type: ToastType;
  message: string;
};

export type ActiveSubscription = {
  status: string;
  planName: string;
  startedAt?: string;
  endDate?: string;
};

export type StoredUser = {
  id?: number;
  email?: string;
  name?: string;
};

export type SubscriptionCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  activeNow: string;
  activeText: string;
  expiresOn: string;
  choose: string;
  current: string;
  perTrip: string;
  confirmTitle: string;
  confirmText: string;
  cancel: string;
  confirm: string;
  processing: string;
  needLogin: string;
  subscribeSuccess: string;
  subscribeFail: string;
  statusFail: string;
  durationUnit: string;
  popular: string;
  bestValue: string;
  saveLabel: string;
  startNow: string;
  getStarted: string;
  goPremium: string;
  currency: string;
};
