"use client";

import Link from "next/link";
import Image from "next/image";
import { getNationalityFlag, getNationalityLabel, type UserProfile } from "@/lib/userProfile";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { clearSession, USER_STORAGE_KEY } from "@/lib/session";

function BrandPyramidIcon() {
  return (
    <Image
      src="/images/pyramids.svg.png"
      alt="Pyramids"
      width={32}
      height={32}
      className="h-8 w-8 object-contain"
      priority
    />
  );
}

export default function Navbar() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [locale, setLocale] = useState<"en" | "ar">("en");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = useTranslations("nav");
  const pathname = usePathname();

  const userDisplayName = user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  const userNationalityFlag = getNationalityFlag(user?.nationality);
  const userNationality = getNationalityLabel(user?.nationality, locale);

  // Mount-only initialization: restore user session and locale once.
  useEffect(() => {
    try {
      const rawUser = localStorage.getItem(USER_STORAGE_KEY);
      if (rawUser) {
        setUser(JSON.parse(rawUser) as UserProfile);
      }
    } catch {
      setUser(null);
    } finally {
      setIsReady(true);
    }

    const cookieMatch = document.cookie.match(/(?:^|; )NEXT_LOCALE=([^;]+)/);
    const cookieLocale = cookieMatch?.[1] === "ar" ? "ar" : "en";
    setLocale(cookieLocale);
  }, []);

  // Route-change behavior: close mobile drawer whenever navigation occurs.
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore network errors and always clear local session.
    }

    clearSession();
    setUser(null);
    window.location.href = "/";
  }

  function handleToggleLanguage() {
    const nextLocale = locale === "en" ? "ar" : "en";
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
    setLocale(nextLocale);
    window.location.reload();
  }

  const links = [
    { href: "/", label: t("home") },
    { href: "/admin", label: t("admin"), requiresAdmin: true },
    { href: "/tourism", label: t("tourism") },
    { href: "/destinations", label: t("destinations") },
    { href: "/maps", label: t("maps") },
    { href: "/tourism-companies", label: t("tourism-companies") },
    { href: "/about", label: t("about") },
    { href: "/plan", label: t("planCta"), isCta: true },
  ];

  const visibleLinks = links.filter((link) => !link.requiresAdmin || user?.role === "admin");

  return (
    <nav className="sticky top-0 z-50 border-b border-amber-200/70 bg-[linear-gradient(120deg,rgba(255,250,240,0.95)_0%,rgba(250,242,228,0.92)_55%,rgba(238,249,255,0.9)_100%)] backdrop-blur-md dark:border-slate-700 dark:bg-[linear-gradient(120deg,rgba(25,19,14,0.95)_0%,rgba(24,30,39,0.92)_100%)]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-3 md:flex-nowrap md:gap-4">
        <Link href="/" className="group inline-flex items-center gap-2">
          <BrandPyramidIcon />
          <span className="text-base font-extrabold tracking-wide text-amber-950 transition group-hover:text-amber-800 md:text-lg dark:text-amber-100 dark:group-hover:text-amber-300">
            Egypt Panorama
          </span>
        </Link>

        {/* Mobile-first navigation: collapse links into a drawer on small screens to prevent wrapping and overflow. */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full border border-amber-200/80 bg-white/80 p-2 text-amber-950 transition hover:bg-amber-100 md:hidden dark:border-slate-600 dark:bg-slate-900/70 dark:text-amber-100"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((value) => !value)}
        >
          <span className="sr-only">Toggle menu</span>
          <span className="flex h-4 w-5 flex-col justify-between">
            <span className={`h-0.5 w-full rounded-full bg-current transition ${mobileMenuOpen ? "translate-y-1.75 rotate-45" : ""}`} />
            <span className={`h-0.5 w-full rounded-full bg-current transition ${mobileMenuOpen ? "opacity-0" : ""}`} />
            <span className={`h-0.5 w-full rounded-full bg-current transition ${mobileMenuOpen ? "-translate-y-1.75 -rotate-45" : ""}`} />
          </span>
        </button>

        <ul className="hidden flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-slate-700 md:flex md:flex-nowrap md:text-sm dark:text-slate-200">
          {visibleLinks.map((link) => (
            <li key={link.href} className="flex">
              {(() => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(`${link.href}/`));

                if (link.isCta) {
                  return (
                    <Link
                      href={link.href}
                      className={`inline-flex h-7 items-center justify-center whitespace-nowrap rounded-full border px-2.5 py-1 text-[0.72rem] font-extrabold uppercase leading-none tracking-[0.06em] transition-all duration-300 ${
                        isActive
                          ? "border-amber-300 bg-linear-to-r from-amber-200 to-orange-300 text-amber-950 shadow-[0_10px_28px_-14px_rgba(217,119,6,0.85)]"
                          : "border-amber-400/70 bg-[linear-gradient(135deg,rgba(251,191,36,0.2)_0%,rgba(249,115,22,0.32)_100%)] text-amber-950 hover:-translate-y-0.5 hover:border-amber-300 hover:bg-linear-to-r hover:from-amber-300 hover:to-orange-400 hover:shadow-[0_12px_30px_-14px_rgba(217,119,6,0.9)] dark:border-amber-300/40 dark:text-amber-100 dark:hover:text-amber-950"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                }

                return (
                  <Link
                    href={link.href}
                    className={`relative inline-flex h-7 items-center justify-center whitespace-nowrap rounded-full px-2.5 py-1 text-center leading-none transition ${
                      isActive
                        ? "bg-amber-100 text-amber-900 dark:bg-slate-800 dark:text-amber-300"
                        : "hover:bg-amber-100/80 hover:text-amber-900 dark:hover:bg-slate-800 dark:hover:text-amber-300"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })()}
            </li>
          ))}
        </ul>

        <div className="ml-auto hidden shrink-0 items-center gap-2 md:ml-0 md:flex lg:gap-2.5">
          <button
            type="button"
            onClick={handleToggleLanguage}
            className="inline-flex rounded-full border border-amber-300 bg-white/75 px-3.5 py-1.5 text-xs font-bold text-amber-900 transition hover:bg-amber-100 dark:border-slate-500 dark:bg-slate-900/60 dark:text-amber-100 dark:hover:bg-slate-800"
            aria-label={t("toggleLanguage")}
          >
            {locale === "en" ? "العربية" : "English"}
          </button>

          {isReady && user ? (
            <>
              <div className="hidden items-center gap-1.5 lg:flex">
                <span className="rounded-full border border-amber-200/70 bg-white/65 px-3 py-1 text-xs font-semibold text-amber-900 dark:border-slate-600 dark:bg-slate-900/70 dark:text-amber-100">
                  {userDisplayName ? `${t("hi")}, ${userDisplayName}` : user.email}
                </span>
                {userNationality && (
                  <span className="rounded-full border border-sky-200/60 bg-sky-100/70 px-3 py-1 text-[0.68rem] font-semibold text-sky-900 dark:border-sky-700/70 dark:bg-sky-900/45 dark:text-sky-100">
                    {[userNationalityFlag, userNationality].filter(Boolean).join(" ")}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex rounded-full border border-amber-300 bg-linear-to-r from-amber-300 to-orange-400 px-3 py-1.5 text-xs font-bold text-black transition hover:from-amber-200 hover:to-orange-300"
              >
                {t("logout")}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="inline-flex rounded-full border border-amber-200/70 px-3.5 py-1.5 text-xs font-bold text-amber-900 transition hover:bg-amber-100/80 dark:border-slate-600 dark:text-amber-100 dark:hover:bg-slate-800"
              >
                {t("login")}
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex rounded-full bg-linear-to-r from-amber-400 to-orange-500 px-3.5 py-1.5 text-xs font-bold text-black transition hover:from-amber-300 hover:to-orange-400"
              >
                {t("signup")}
              </Link>
            </>
          )}
        </div>

        {mobileMenuOpen && (
          <div className="w-full rounded-3xl border border-amber-200/70 bg-white/95 p-3 shadow-[0_18px_45px_-28px_rgba(0,0,0,0.55)] md:hidden dark:border-slate-700 dark:bg-slate-950/95">
            <div className="flex flex-col gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
              {visibleLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(`${link.href}/`));

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-2xl px-4 py-3 ${isActive ? "bg-amber-100 text-amber-950 dark:bg-slate-800 dark:text-amber-300" : "bg-transparent hover:bg-amber-50 dark:hover:bg-slate-800/80"}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleToggleLanguage}
                  className="inline-flex w-full items-center justify-center rounded-2xl border border-amber-300 bg-white/80 px-4 py-3 text-sm font-bold text-amber-900 transition hover:bg-amber-100 dark:border-slate-500 dark:bg-slate-900/60 dark:text-amber-100 dark:hover:bg-slate-800"
                  aria-label={t("toggleLanguage")}
                >
                  {locale === "en" ? "العربية" : "English"}
                </button>

                {isReady && user ? (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex w-full items-center justify-center rounded-2xl bg-linear-to-r from-amber-300 to-orange-400 px-4 py-3 text-sm font-bold text-black transition hover:from-amber-200 hover:to-orange-300"
                  >
                    {t("logout")}
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/auth/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="inline-flex items-center justify-center rounded-2xl border border-amber-200/70 px-4 py-3 text-sm font-bold text-amber-900 transition hover:bg-amber-100/80 dark:border-slate-600 dark:text-amber-100 dark:hover:bg-slate-800"
                    >
                      {t("login")}
                    </Link>
                    <Link
                      href="/auth/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="inline-flex items-center justify-center rounded-2xl bg-linear-to-r from-amber-400 to-orange-500 px-4 py-3 text-sm font-bold text-black transition hover:from-amber-300 hover:to-orange-400"
                    >
                      {t("signup")}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}