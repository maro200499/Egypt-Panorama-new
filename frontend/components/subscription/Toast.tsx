import type { ToastState } from "./types";

type ToastProps = {
  toast: ToastState;
};

export default function Toast({ toast }: ToastProps) {
  if (!toast.visible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-60 max-w-sm rounded-xl border border-white/15 bg-slate-900/95 px-4 py-3 text-sm shadow-xl">
      <p
        className={
          toast.type === "success"
            ? "text-emerald-300"
            : toast.type === "error"
            ? "text-red-300"
            : "text-sky-300"
        }
      >
        {toast.message}
      </p>
    </div>
  );
}
