"use client"

import type { ReactNode, InputHTMLAttributes } from "react"
import { useId } from "react"

type AuthFieldProps = {
  label: string
  error?: string
  helperText?: string
  children?: ReactNode
  className?: string
  labelClassName?: string
  inputClassName?: string
  endAdornment?: ReactNode
} & Omit<InputHTMLAttributes<HTMLInputElement>, "className">

export default function AuthField({
  label,
  error,
  helperText,
  children,
  className = "",
  labelClassName = "",
  inputClassName = "",
  endAdornment,
  id,
  ...inputProps
}: AuthFieldProps) {
  const fallbackId = useId()
  const fieldId = id ?? fallbackId
  const helperId = `${fieldId}-helper`
  const errorId = `${fieldId}-error`
  const hasFeedback = Boolean(helperText || error)

  return (
    <label htmlFor={children ? undefined : fieldId} className={`block space-y-2 ${className}`}>
      <span className={`text-sm font-semibold text-slate-700 dark:text-amber-100 ${labelClassName}`}>{label}</span>

      {children ? (
        children
      ) : (
        <div className="relative">
          <input
            id={fieldId}
            aria-invalid={Boolean(error)}
            aria-describedby={hasFeedback ? `${helperText ? helperId : ""}${helperText && error ? " " : ""}${error ? errorId : ""}` : undefined}
            className={`w-full rounded-xl border border-slate-200/80 bg-white/80 px-4 py-3 text-slate-950 placeholder:text-slate-400 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-300/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-amber-50 dark:placeholder:text-amber-100/45 dark:focus:border-amber-300 ${inputClassName}`}
            {...inputProps}
          />

          {endAdornment ? <div className="absolute inset-y-0 right-2 flex items-center">{endAdornment}</div> : null}
        </div>
      )}

      {helperText ? (
        <p id={helperId} className="text-xs text-slate-500 dark:text-amber-100/60">
          {helperText}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} className="text-xs text-red-600 dark:text-red-300" aria-live="polite">
          {error}
        </p>
      ) : null}
    </label>
  )
}