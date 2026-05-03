import Image from "next/image"
import Link from "next/link"
import { getLocale } from "next-intl/server"

export default async function HeroSection() {
  const locale = (await getLocale()) === "ar" ? "ar" : "en"
  const copy = {
    badge: locale === "ar" ? "ارض الفراعنة" : "Land Of Pharaohs",
    heading: locale === "ar" ? "اكتشف مصر بشكل مختلف" : "Discover Egypt Like Never Before",
    description:
      locale === "ar"
        ? "استكشف التاريخ العريق والمناظر المذهلة وتنوع التجارب السياحية في كل انحاء مصر."
        : "Explore the rich history, breathtaking landscapes, and diverse tourism experiences across Egypt.",
    exploreTourism: locale === "ar" ? "استكشف السياحة" : "Explore Tourism",
    viewMap: locale === "ar" ? "عرض الخريطة" : "View Map",
    stat1: locale === "ar" ? "5000+ سنة من التاريخ" : "5000+ Years Of History",
    stat2: locale === "ar" ? "من المتوسط حتى البحر الاحمر" : "Mediterranean To Red Sea",
    stat3: locale === "ar" ? "ثقافة وطبيعة وتراث ديني" : "Culture, Nature, Religious Heritage",
  }

  return (
    <section className="relative isolate flex min-h-[72vh] items-center justify-center overflow-hidden text-white sm:min-h-[78vh] lg:min-h-[88vh]">

      <Image
        src="/images/hero/pyramids.jpg"
        alt="Pyramids in Egypt"
        fill
        priority
        sizes="100vw"
        className="absolute z-0 object-cover object-center"
      />

      <div className="absolute inset-0 z-10 bg-[linear-gradient(120deg,rgba(25,14,8,0.75)_0%,rgba(31,23,16,0.58)_46%,rgba(14,47,63,0.45)_100%)]"></div>
      <div className="absolute -left-28 top-10 z-10 h-60 w-60 rounded-full bg-amber-500/20 blur-3xl" />
      <div className="absolute -right-20 bottom-0 z-10 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute inset-x-0 bottom-0 z-10 h-28 bg-linear-to-t from-[#17120d]/90 to-transparent"></div>

      <div className="relative z-20 mx-auto w-full max-w-6xl px-4 text-center sm:px-6 md:text-left">
        {/* Responsive spacing and font scaling keep the hero readable on phones without affecting desktop composition. */}
        <p className="mb-4 inline-flex max-w-full rounded-full border border-amber-200/70 bg-black/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-100 backdrop-blur-sm sm:px-4 sm:text-xs">
          {copy.badge}
        </p>

        <h1 className="mx-auto mb-5 max-w-4xl text-3xl font-extrabold leading-tight tracking-tight text-amber-50 sm:text-4xl md:mx-0 lg:text-6xl">
          {copy.heading}
        </h1>

        <p className="mx-auto mb-7 max-w-2xl text-sm leading-7 text-amber-50/90 sm:text-base md:mx-0 md:text-lg md:leading-8">
          {copy.description}
        </p>

        <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center md:justify-start">
          <Link
            href="/tourism"
            className="inline-flex w-full items-center justify-center rounded-full bg-linear-to-r from-amber-400 to-orange-500 px-6 py-3 text-sm font-bold text-black shadow-[0_14px_35px_-15px_rgba(249,115,22,0.9)] transition hover:-translate-y-0.5 hover:from-amber-300 hover:to-orange-400 sm:w-auto sm:px-7 sm:text-base"
          >
            {copy.exploreTourism}
          </Link>

          <Link
            href="/maps"
            className="inline-flex w-full items-center justify-center rounded-full border border-amber-100/80 bg-white/10 px-6 py-3 text-sm font-semibold text-amber-50 backdrop-blur-sm transition hover:bg-white/20 sm:w-auto sm:px-7 sm:text-base"
          >
            {copy.viewMap}
          </Link>
        </div>

        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center md:justify-start">
          <span className="rounded-full border border-amber-200/50 bg-black/20 px-4 py-2 text-center text-[11px] font-semibold text-amber-100/95 sm:text-xs">{copy.stat1}</span>
          <span className="rounded-full border border-cyan-100/45 bg-black/20 px-4 py-2 text-center text-[11px] font-semibold text-cyan-100/95 sm:text-xs">{copy.stat2}</span>
          <span className="rounded-full border border-orange-200/50 bg-black/20 px-4 py-2 text-center text-[11px] font-semibold text-orange-100/95 sm:text-xs">{copy.stat3}</span>
        </div>
      </div>

    </section>
  )
}