"use client"

import Link from "next/link"
import { useLocale } from "next-intl"
import { useState } from "react"
import AuthCard from "@/components/auth/AuthCard"
import AuthField from "@/components/auth/AuthField"
import SubmitButton from "@/components/auth/SubmitButton"
import type { UserProfile } from "@/lib/userProfile"
import { setAuthToken, USER_STORAGE_KEY } from "@/lib/session"

type SubmitState = "idle" | "loading" | "success" | "error"

export default function LoginPage() {
  const locale = useLocale()
  const isAr = locale === "ar"
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [submitState, setSubmitState] = useState<SubmitState>("idle")
  const [statusMessage, setStatusMessage] = useState("")
  const copy = {
    welcome: isAr ? "اهلا بعودتك" : "Welcome Back",
    title: isAr ? "تسجيل الدخول الى Egypt Panorama" : "Login to Egypt Panorama",
    subtitle: isAr
      ? "واصل رحلتك عبر ثقافة مصر وطبيعتها وتاريخها."
      : "Continue your journey through Egypt's culture, nature, and history.",
    panelTitle: isAr ? "منصة سفر الهام" : "Travel inspiration hub",
    panelBody: isAr
      ? "اكتشف خطط رحلات مخصصة، وجهات مصنفة، واقتراحات ذكية في مكان واحد."
      : "Discover personalized trip plans, curated destinations, and smart recommendations in one place.",
    panelOne: isAr ? "خطط يومية ذكية" : "Smart daily itineraries",
    panelTwo: isAr ? "تصنيفات سياحية متنوعة" : "Diverse tourism categories",
    panelThree: isAr ? "تجربة ثنائية اللغة" : "Bilingual experience",
    email: isAr ? "البريد الالكتروني" : "Email",
    password: isAr ? "كلمة المرور" : "Password",
    passwordPlaceholder: isAr ? "ادخل كلمة المرور" : "Enter password",
    showPassword: isAr ? "اظهار" : "Show",
    hidePassword: isAr ? "اخفاء" : "Hide",
    rememberMe: isAr ? "تذكرني" : "Remember me",
    forgotPassword: isAr ? "نسيت كلمة المرور؟" : "Forgot password?",
    forgotNote: isAr ? "استرجاع قريباً" : "Recovery soon",
    submitting: isAr ? "جار تسجيل الدخول..." : "Logging in...",
    success: isAr ? "تم تسجيل الدخول بنجاح!" : "Logged in successfully!",
    failedStorage: isAr ? "تعذر حفظ الجلسة على هذا المتصفح." : "Unable to save session on this browser.",
    invalidCredentials: isAr ? "البريد الإلكتروني أو كلمة المرور غير صحيحة." : "Invalid email or password.",
    backendUnavailable: isAr ? "الخادم غير متاح حاليا. حاول مرة أخرى لاحقا." : "Backend is currently unavailable. Please try again later.",
    submit: isAr ? "تسجيل الدخول" : "Login",
    noAccount: isAr ? "ليس لديك حساب؟" : "Don't have an account?",
    signUp: isAr ? "انشاء حساب" : "Sign Up",
  }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (submitState === "loading") {
      return
    }

    setSubmitState("loading")
    setStatusMessage("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const payload = (await response.json()) as {
        status?: "success" | "error"
        data?: {
          token?: string
          user?: UserProfile
        }
        message?: string
      }

      if (!response.ok || payload.status !== "success" || !payload.data?.token || !payload.data?.user) {
        setSubmitState("error")
        setStatusMessage(payload.message || copy.invalidCredentials)
        return
      }

      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(payload.data.user))
      setAuthToken(payload.data.token)
      setSubmitState("success")
      setStatusMessage(copy.success)
      window.setTimeout(() => {
        window.location.href = "/"
      }, 450)
    } catch {
      setSubmitState("error")
      setStatusMessage(copy.backendUnavailable)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_18%_10%,rgba(251,191,36,0.14),transparent_40%),radial-gradient(circle_at_82%_86%,rgba(6,182,212,0.12),transparent_42%),linear-gradient(165deg,#faf7ef_0%,#edf5ff_55%,#dfeeff_100%)] px-4 py-10 text-slate-950 dark:bg-[radial-gradient(circle_at_18%_10%,rgba(251,191,36,0.18),transparent_40%),radial-gradient(circle_at_82%_86%,rgba(6,182,212,0.16),transparent_42%),linear-gradient(165deg,#080d1b_0%,#0d1528_55%,#1d2b44_100%)] dark:text-amber-50 sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-size-[30px_30px] opacity-40 dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] dark:opacity-30" />
      <div className="pointer-events-none absolute -left-24 top-8 h-64 w-64 rounded-full bg-amber-400/20 blur-3xl dark:bg-amber-500/20" />
      <div className="pointer-events-none absolute -right-24 bottom-8 h-72 w-72 rounded-full bg-cyan-400/18 blur-3xl dark:bg-cyan-500/20" />

      <AuthCard
        eyebrow={copy.welcome}
        title={copy.panelTitle}
        description={copy.panelBody}
        highlights={[copy.panelOne, copy.panelTwo, copy.panelThree]}
        className="max-w-5xl"
      >
        <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2 text-center lg:text-left">
              <p className="inline-flex rounded-full border border-amber-200/40 bg-amber-100/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
                {copy.welcome}
              </p>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-amber-50">{copy.title}</h1>
              <p className="text-sm text-slate-600 dark:text-amber-100/80">{copy.subtitle}</p>
            </div>

            <div className="space-y-4">
              <AuthField
                label={copy.email}
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitState === "loading"}
                required
                inputClassName="placeholder:text-slate-400 dark:placeholder:text-amber-100/45"
              />

              <AuthField
                label={copy.password}
                type={showPassword ? "text" : "password"}
                placeholder={copy.passwordPlaceholder}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitState === "loading"}
                required
                inputClassName="pr-20 placeholder:text-slate-400 dark:placeholder:text-amber-100/45"
                endAdornment={
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    disabled={submitState === "loading"}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-amber-100/90 dark:hover:bg-white/10"
                  >
                    {showPassword ? copy.hidePassword : copy.showPassword}
                  </button>
                }
              />
            </div>

            <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
              <label className="inline-flex cursor-pointer items-center gap-2 text-slate-600 dark:text-amber-100/80">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 bg-white text-amber-500 focus:ring-amber-300/50 dark:border-amber-200/40 dark:bg-black/30 dark:text-amber-400" />
                <span>{copy.rememberMe}</span>
              </label>
              <span className="text-amber-700 dark:text-amber-200/90" title={copy.forgotNote}>{copy.forgotPassword}</span>
            </div>

            <SubmitButton
              state={submitState}
              idleLabel={copy.submit}
              loadingLabel={copy.submitting}
              successLabel={copy.success}
              statusMessage={statusMessage}
              disabled={submitState === "loading"}
            />

            <p className="text-center text-sm text-slate-600 dark:text-amber-100/80">
              {copy.noAccount}{" "}
              <Link href="/auth/signup" className="font-semibold text-amber-700 underline decoration-amber-400/70 underline-offset-4 transition hover:text-amber-600 dark:text-amber-200 dark:hover:text-amber-100">
                {copy.signUp}
              </Link>
            </p>
        </form>
      </AuthCard>
    </div>
  )
}