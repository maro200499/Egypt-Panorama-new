"use client"

import Link from "next/link"
import { useLocale } from "next-intl"
import { useState } from "react"
import AuthCard from "@/components/auth/AuthCard"
import AuthField from "@/components/auth/AuthField"
import CountrySelect from "@/components/auth/CountrySelect"
import SubmitButton from "@/components/auth/SubmitButton"
import { getNationalityFlag, nationalityOptions, phoneCountryOptions, type Gender } from "@/lib/userProfile"

type SubmitState = "idle" | "loading" | "success" | "error"

export default function SignupPage() {
  const locale = useLocale()
  const isAr = locale === "ar"
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [nationality, setNationality] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phoneCountry, setPhoneCountry] = useState("EG")
  const [phone, setPhone] = useState("")
  const [gender, setGender] = useState<Gender | "">("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitState, setSubmitState] = useState<SubmitState>("idle")
  const [statusMessage, setStatusMessage] = useState("")
  const [error, setError] = useState("")
  const selectedPhoneCountry = phoneCountryOptions.find((option) => option.value === phoneCountry) ?? phoneCountryOptions[0]
  const copy = {
    required: isAr ? "يرجى ملء جميع الحقول المطلوبة." : "Please fill in all required fields.",
    mismatch: isAr ? "كلمتا المرور غير متطابقتين." : "Passwords do not match.",
    passwordMin: isAr ? "يجب أن تكون كلمة المرور 10 أحرف على الأقل." : "Password must be at least 10 characters.",
    passwordCapital: isAr ? "يجب أن تبدأ كلمة المرور بحرف كبير." : "Password must start with a capital letter.",
    passwordSpecial: isAr ? "يجب أن تحتوي كلمة المرور على رمز خاص واحد على الأقل (!@#$%^&*…)." : "Password must contain at least one special character (!@#$%^&*…).",
    join: isAr ? "انضم الى Egypt Panorama" : "Join Egypt Panorama",
    title: isAr ? "انشئ حسابك" : "Create Your Account",
    subtitle: isAr
      ? "ابدأ التخطيط لمغامرتك القادمة في مصر من مكان واحد."
      : "Start planning your next Egyptian adventure in one place.",
    panelTitle: isAr ? "رحلتك تبدأ من هنا" : "Your journey starts here",
    panelBody: isAr
      ? "أنشئ ملفك الشخصي للوصول إلى توصيات مخصصة وخطط رحلات تناسب اهتماماتك."
      : "Create your profile to unlock personalized recommendations and itineraries tailored to your interests.",
    panelBadgeOne: isAr ? "ملف شخصي سريع" : "Quick profile setup",
    panelBadgeTwo: isAr ? "اقتراحات ذكية" : "Smart recommendations",
    panelBadgeThree: isAr ? "أماكن وتجارب متنوعة" : "Diverse places and experiences",
    firstName: isAr ? "الاسم الاول" : "First Name",
    firstNamePlaceholder: isAr ? "اكتب الاسم الاول" : "Enter first name",
    lastName: isAr ? "اسم العائلة" : "Last Name",
    lastNamePlaceholder: isAr ? "اكتب اسم العائلة" : "Enter last name",
    nationality: isAr ? "الجنسية" : "Nationality",
    nationalityPlaceholder: isAr ? "اختر الجنسية" : "Select nationality",
    nationalitySearch: isAr ? "ابحث عن الدولة" : "Search countries",
    nationalityEmpty: isAr ? "لا توجد دول مطابقة" : "No matching countries",
    email: isAr ? "البريد الالكتروني" : "Email",
    password: isAr ? "كلمة المرور" : "Password",
    passwordPlaceholder: isAr ? "انشئ كلمة مرور" : "Create a password",
    showPassword: isAr ? "اظهار" : "Show",
    hidePassword: isAr ? "اخفاء" : "Hide",
    reqTitle: isAr ? "متطلبات كلمة المرور" : "Password requirements",
    reqLength: isAr ? "10 أحرف على الأقل" : "At least 10 characters",
    reqStartUpper: isAr ? "تبدأ بحرف كبير" : "Starts with a capital letter",
    reqSpecial: isAr ? "تحتوي رمزاً خاصاً" : "Contains a special symbol",
    submitting: isAr ? "جار انشاء الحساب..." : "Creating account...",
    success: isAr ? "تم انشاء الحساب بنجاح. يرجى تسجيل الدخول." : "Account created successfully. Please log in.",
    failedStorage: isAr ? "تعذر حفظ الحساب على هذا المتصفح." : "Unable to save account on this browser.",
    signupFailed: isAr ? "تعذر إنشاء الحساب. حاول مرة أخرى." : "Unable to create account. Please try again.",
    backendUnavailable: isAr ? "الخادم غير متاح حاليا. حاول مرة أخرى لاحقا." : "Backend is currently unavailable. Please try again later.",
    phone: isAr ? "رقم الهاتف" : "Phone",
    phoneCode: isAr ? "مفتاح الدولة" : "Country code",
    phoneHint: isAr ? "أدخل رقم الهاتف بدون مفتاح الدولة" : "Enter the phone number without the country code",
    gender: isAr ? "النوع" : "Gender",
    genderPlaceholder: isAr ? "اختر النوع" : "Select gender",
    genderMale: isAr ? "ذكر" : "Male",
    genderFemale: isAr ? "انثى" : "Female",
    genderPreferNot: isAr ? "افضل عدم التحديد" : "Prefer not to say",
    confirmPassword: isAr ? "تأكيد كلمة المرور" : "Confirm Password",
    confirmPlaceholder: isAr ? "اكد كلمة المرور" : "Confirm password",
    submit: isAr ? "انشاء حساب" : "Sign Up",
    hasAccount: isAr ? "لديك حساب بالفعل؟" : "Already have an account?",
    login: isAr ? "تسجيل الدخول" : "Login",
  }

  function getPasswordValidationError(value: string) {
    if (!value) {
      return ""
    }

    if (value.length < 10) {
      return copy.passwordMin
    }

    if (!/^[A-Z]/.test(value)) {
      return copy.passwordCapital
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(value)) {
      return copy.passwordSpecial
    }

    return ""
  }

  const passwordLiveError = getPasswordValidationError(password)
  const passwordChecks = {
    length: password.length >= 10,
    startsUpper: /^[A-Z]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password),
  }

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (submitState === "loading") {
      return
    }

    setStatusMessage("")
    setError("")

    const hasMissingRequired =
      !firstName.trim() ||
      !lastName.trim() ||
      !nationality.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim() ||
      !phoneCountry.trim() ||
      !phone.trim() ||
      !gender

    if (hasMissingRequired) {
      setError(copy.required)
      return
    }

    const passwordError = getPasswordValidationError(password)
    if (passwordError) {
      setError(passwordError)
      return
    }

    if (password !== confirmPassword) {
      setError(copy.mismatch)
      return
    }

    setSubmitState("loading")

    try {
      const signupResponse = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `${firstName.trim()} ${lastName.trim()}`,
          email,
          password,
          nationality,
        }),
      })

      const signupPayload = (await signupResponse.json()) as {
        status?: "success" | "error"
        message?: string
        details?: string
      }

      if (!signupResponse.ok || signupPayload.status !== "success") {
        setSubmitState("error")
        setStatusMessage(
          signupPayload.details
            ? `${signupPayload.message || copy.signupFailed} (${signupPayload.details})`
            : (signupPayload.message || copy.signupFailed)
        )
        return
      }

      setSubmitState("success")
      setStatusMessage(copy.success)
      window.setTimeout(() => {
        window.location.href = "/auth/login"
      }, 900)
    } catch {
      setSubmitState("error")
      setStatusMessage(copy.backendUnavailable)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_15%_5%,rgba(245,158,11,0.14),transparent_38%),radial-gradient(circle_at_87%_95%,rgba(34,197,94,0.12),transparent_40%),linear-gradient(165deg,#faf7ef_0%,#edf5ff_55%,#dfeeff_100%)] px-4 py-8 text-slate-950 dark:bg-[radial-gradient(circle_at_15%_5%,rgba(245,158,11,0.18),transparent_38%),radial-gradient(circle_at_87%_95%,rgba(34,197,94,0.16),transparent_40%),linear-gradient(165deg,#080d1b_0%,#0d1528_55%,#1d2b44_100%)] dark:text-amber-50 sm:px-6 sm:py-10">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-size-[30px_30px] opacity-40 dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] dark:opacity-30" />
      <div className="pointer-events-none absolute -left-24 top-6 h-64 w-64 rounded-full bg-amber-400/20 blur-3xl dark:bg-amber-500/20" />
      <div className="pointer-events-none absolute -right-20 bottom-8 h-72 w-72 rounded-full bg-cyan-400/18 blur-3xl dark:bg-cyan-500/20" />

      <AuthCard
        eyebrow={copy.join}
        title={copy.panelTitle}
        description={copy.panelBody}
        highlights={[copy.panelBadgeOne, copy.panelBadgeTwo, copy.panelBadgeThree]}
        className="max-w-6xl"
      >
        <form onSubmit={handleSignup} className="space-y-6">
          <div className="space-y-2 text-center lg:text-left">
            <p className="inline-flex rounded-full border border-amber-200/40 bg-amber-100/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-200">
              {copy.join}
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-amber-50">{copy.title}</h1>
            <p className="text-sm text-slate-600 dark:text-amber-100/80">{copy.subtitle}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <AuthField
              label={copy.firstName}
              type="text"
              placeholder={copy.firstNamePlaceholder}
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={submitState === "loading"}
              required
              inputClassName="placeholder:text-slate-400 dark:placeholder:text-amber-100/45"
            />

            <AuthField
              label={copy.lastName}
              type="text"
              placeholder={copy.lastNamePlaceholder}
              autoComplete="family-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={submitState === "loading"}
              required
              inputClassName="placeholder:text-slate-400 dark:placeholder:text-amber-100/45"
            />
          </div>

          <div className="space-y-4">
            <AuthField label={copy.nationality}>
              <CountrySelect
                value={nationality}
                onChange={setNationality}
                options={nationalityOptions}
                locale={isAr ? "ar" : "en"}
                placeholder={copy.nationalityPlaceholder}
                searchPlaceholder={copy.nationalitySearch}
                emptyLabel={copy.nationalityEmpty}
              />
            </AuthField>

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

            <div className="grid gap-4 sm:grid-cols-2">
              <AuthField
                label={copy.password}
                type={showPassword ? "text" : "password"}
                placeholder={copy.passwordPlaceholder}
                autoComplete="new-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError("")
                }}
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

              <AuthField
                label={copy.confirmPassword}
                type={showConfirmPassword ? "text" : "password"}
                placeholder={copy.confirmPlaceholder}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  setError("")
                }}
                disabled={submitState === "loading"}
                required
                inputClassName="pr-20 placeholder:text-slate-400 dark:placeholder:text-amber-100/45"
                endAdornment={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    disabled={submitState === "loading"}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-amber-100/90 dark:hover:bg-white/10"
                  >
                    {showConfirmPassword ? copy.hidePassword : copy.showPassword}
                  </button>
                }
              />
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:text-amber-100/70">
                {copy.reqTitle}
              </p>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-amber-100/80">
                <li className={passwordChecks.length ? "text-emerald-600 dark:text-emerald-300" : ""}>
                  {passwordChecks.length ? "✓" : "•"} {copy.reqLength}
                </li>
                <li className={passwordChecks.startsUpper ? "text-emerald-600 dark:text-emerald-300" : ""}>
                  {passwordChecks.startsUpper ? "✓" : "•"} {copy.reqStartUpper}
                </li>
                <li className={passwordChecks.hasSpecial ? "text-emerald-600 dark:text-emerald-300" : ""}>
                  {passwordChecks.hasSpecial ? "✓" : "•"} {copy.reqSpecial}
                </li>
              </ul>
            </div>

            {passwordLiveError && <p className="text-xs text-red-600 dark:text-red-300">{passwordLiveError}</p>}

            <AuthField label={copy.phone} helperText={copy.phoneHint}>
              <div className="grid grid-cols-[7.25rem_minmax(0,1fr)] gap-3 sm:grid-cols-[8.5rem_minmax(0,1fr)]">
                <select
                  className="w-full rounded-xl border border-slate-200/80 bg-white/80 px-3 py-3 text-xs text-slate-950 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-300/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-amber-50 dark:focus:border-amber-300 sm:px-4 sm:text-sm"
                  value={phoneCountry}
                  onChange={(e) => {
                    setPhoneCountry(e.target.value)
                    setError("")
                  }}
                  aria-label={copy.phoneCode}
                  disabled={submitState === "loading"}
                  required
                >
                  {phoneCountryOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-white text-slate-950 dark:bg-slate-900 dark:text-amber-100">
                      {getNationalityFlag(option.value)} {(isAr ? option.ar : option.en)} ({option.dialCode})
                    </option>
                  ))}
                </select>

                <input
                  type="tel"
                  placeholder="e.g. 1234567890"
                  autoComplete="tel-national"
                  className="w-full rounded-xl border border-slate-200/80 bg-white/80 px-3 py-3 text-sm text-slate-950 placeholder:text-slate-400 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-300/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-amber-50 dark:placeholder:text-amber-100/45 dark:focus:border-amber-300 sm:px-4"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value)
                    setError("")
                  }}
                  disabled={submitState === "loading"}
                  required
                />
              </div>
            </AuthField>

            <AuthField label={copy.gender}>
              <select
                className="w-full rounded-xl border border-slate-200/80 bg-white/80 px-4 py-3 text-slate-950 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-300/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-amber-50 dark:focus:border-amber-300"
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender | "")}
                disabled={submitState === "loading"}
                required
              >
                <option value="" disabled className="bg-white text-slate-950 dark:bg-slate-900 dark:text-amber-100">
                  {copy.genderPlaceholder}
                </option>
                <option value="male" className="bg-white text-slate-950 dark:bg-slate-900 dark:text-amber-100">{copy.genderMale}</option>
                <option value="female" className="bg-white text-slate-950 dark:bg-slate-900 dark:text-amber-100">{copy.genderFemale}</option>
                <option value="prefer_not_to_say" className="bg-white text-slate-950 dark:bg-slate-900 dark:text-amber-100">{copy.genderPreferNot}</option>
              </select>
            </AuthField>
          </div>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-300/40 dark:bg-red-900/20 dark:text-red-200">
              {error}
            </p>
          )}

          <SubmitButton
            state={submitState}
            idleLabel={copy.submit}
            loadingLabel={copy.submitting}
            successLabel={copy.success}
            statusMessage={statusMessage}
            disabled={submitState === "loading"}
          />

          <p className="text-center text-sm text-slate-600 dark:text-amber-100/80">
            {copy.hasAccount}{" "}
            <Link href="/auth/login" className="font-semibold text-amber-700 underline decoration-amber-400/70 underline-offset-4 transition hover:text-amber-600 dark:text-amber-200 dark:hover:text-amber-100">
              {copy.login}
            </Link>
          </p>
        </form>
      </AuthCard>
    </div>
  )
}
