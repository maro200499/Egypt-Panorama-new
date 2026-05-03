import type { ReactNode } from "react"

type AuthCardProps = {
  eyebrow: string
  title: string
  description: string
  highlights?: string[]
  children: ReactNode
  className?: string
}

export default function AuthCard({
  eyebrow,
  title,
  description,
  highlights = [],
  children,
  className = "",
}: AuthCardProps) {
  return (
    <section
      className={`auth-card relative z-10 w-full overflow-hidden rounded-4xl border border-slate-200/80 bg-white/90 text-slate-950 shadow-[0_28px_90px_-40px_rgba(15,23,42,0.45)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70 dark:text-amber-50 ${className}`}
    >
      <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
        <aside className="hidden min-h-full flex-col justify-between border-r border-slate-200/80 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.28),transparent_40%),linear-gradient(160deg,#fffdf7_0%,#f8fbff_55%,#eef8ff_100%)] p-8 dark:border-white/10 dark:bg-[linear-gradient(160deg,rgba(251,146,60,0.18),rgba(15,23,42,0.88))] lg:flex">
          <div className="space-y-5">
            <p className="inline-flex rounded-full border border-amber-200/80 bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-800 dark:border-amber-200/40 dark:bg-amber-100/10 dark:text-amber-200">
              {eyebrow}
            </p>
            <h2 className="text-3xl font-black leading-tight text-slate-950 dark:text-white">{title}</h2>
            <p className="max-w-md text-sm leading-6 text-slate-600 dark:text-amber-100/80">{description}</p>
          </div>

          {highlights.length > 0 && (
            <ul className="auth-stagger space-y-3 text-sm text-slate-700 dark:text-amber-100/90">
              {highlights.map((item) => (
                <li key={item} className="rounded-xl border border-slate-200/80 bg-white/75 px-4 py-3 shadow-sm dark:border-white/10 dark:bg-black/20">
                  {item}
                </li>
              ))}
            </ul>
          )}
        </aside>

        <div className="p-6 sm:p-8">{children}</div>
      </div>
    </section>
  )
}