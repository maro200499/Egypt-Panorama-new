type SubmitState = "idle" | "loading" | "success" | "error"

type SubmitButtonProps = {
  state?: SubmitState
  idleLabel: string
  loadingLabel: string
  successLabel?: string
  statusMessage?: string
  className?: string
  disabled?: boolean
}

export default function SubmitButton({
  state = "idle",
  idleLabel,
  loadingLabel,
  successLabel,
  statusMessage,
  className = "",
  disabled = false,
}: SubmitButtonProps) {
  const isLoading = state === "loading"
  const isSuccess = state === "success"

  const label = isLoading ? loadingLabel : isSuccess ? successLabel ?? idleLabel : idleLabel

  return (
    <div className="space-y-3">
      <button
        type="submit"
        disabled={disabled || isLoading}
        className={`inline-flex w-full items-center justify-center gap-3 rounded-xl bg-linear-to-r from-amber-400 via-orange-400 to-orange-500 px-4 py-3 font-bold text-black shadow-[0_12px_30px_-15px_rgba(249,115,22,0.95)] transition hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-75 disabled:hover:translate-y-0 ${className}`}
      >
        {isLoading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" aria-hidden="true" />
        ) : null}
        <span>{label}</span>
      </button>

      {statusMessage ? (
        <p
          aria-live="polite"
          className={`text-center text-xs ${
            isSuccess
              ? "text-emerald-600 dark:text-emerald-300"
              : state === "error"
                ? "text-red-600 dark:text-red-300"
                : "text-slate-600 dark:text-amber-100/85"
          }`}
        >
          {statusMessage}
        </p>
      ) : null}
    </div>
  )
}