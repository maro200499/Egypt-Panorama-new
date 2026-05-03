import type { Plan, SubscriptionCopy } from "./types";

type ConfirmationModalProps = {
  plan: Plan;
  copy: SubscriptionCopy;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmationModal({
  plan,
  copy,
  loading,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-amber-200/30 bg-slate-900 p-6 text-amber-50 shadow-2xl">
        <h3 className="text-xl font-bold text-amber-100">{copy.confirmTitle}</h3>
        <p className="mt-2 text-sm text-amber-100/80">{copy.confirmText}</p>
        <div className="mt-4 rounded-xl border border-amber-100/20 bg-slate-800/70 p-4">
          <p className="text-lg font-bold">{plan.name}</p>
          <p className="text-sm text-amber-100/70">
            {plan.price} {copy.currency} • {plan.duration} {copy.durationMonths}
          </p>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-amber-100/30 px-4 py-2 text-sm text-amber-50 transition hover:bg-amber-100/10 disabled:opacity-60"
          >
            {copy.cancel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-lg bg-linear-to-r from-amber-300 to-orange-300 px-4 py-2 text-sm font-bold text-slate-950 transition hover:brightness-105 disabled:opacity-60"
          >
            {loading ? copy.processing : copy.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}
