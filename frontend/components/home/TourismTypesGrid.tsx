import Link from "next/link";
import { getLocale } from "next-intl/server";

import { tourismTypes as sharedTourismTypes } from "@/lib/tourismTypes";

type TourismType = {
  name: string;
  description: string;
  link: string;
  tag: string;
  image: string;
  accent: string;
  tagStyle: string;
  featured?: boolean;
};

const sharedTourismImages = Object.fromEntries(
  sharedTourismTypes.map((item) => [item.slug, item.image])
) as Record<string, string>;

function safeImageSrc(src: string) {
  return encodeURI(src);
}

const tourismTypes: TourismType[] = [
  {
    name: "Ancient Egyptian Tourism",
    description: "Explore pyramids, temples, royal tombs, and the monumental legacy of ancient Egypt.",
    link: "/tourism/cultural",
    tag: "Pharaonic Heritage",
    image: sharedTourismImages.cultural,
    accent: "from-amber-500 to-orange-500",
    tagStyle: "bg-amber-50 text-amber-800 ring-amber-200/80",
  },
  {
    name: "Religious Tourism",
    description: "Discover Egypt's sacred heritage across historic churches, monasteries, mosques, and spiritual routes.",
    link: "/tourism/religious",
    tag: "Sacred Heritage",
    image: sharedTourismImages.religious,
    accent: "from-violet-500 to-indigo-600",
    tagStyle: "bg-violet-50 text-violet-800 ring-violet-200/80",
  },
  {
    name: "Egypt Untold",
    description: "Enter Egypt's hidden layer: forgotten monuments, atmospheric sites, and living cultural spaces beyond mainstream routes.",
    link: "/tourism/untold",
    tag: "Signature Segment",
    image: sharedTourismImages.untold,
    accent: "from-orange-500 via-amber-500 to-rose-500",
    tagStyle: "bg-amber-50 text-amber-900 ring-amber-300/80",
    featured: true,
  },
  {
    name: "Coastal & Diving Tourism",
    description: "Dive into Red Sea reefs, island escapes, and Egypt's most iconic coastal experiences.",
    link: "/tourism/sea",
    tag: "Marine & Coastal",
    image: sharedTourismImages.sea,
    accent: "from-cyan-500 to-sky-600",
    tagStyle: "bg-sky-50 text-sky-800 ring-sky-200/80",
  },
  {
    name: "Nature & Adventure Tourism",
    description: "Explore deserts, oases, reserves, and dramatic landscapes across Egypt's natural wonders.",
    link: "/tourism/eco",
    tag: "Natural Wonders",
    image: sharedTourismImages.eco,
    accent: "from-emerald-500 to-teal-600",
    tagStyle: "bg-emerald-50 text-emerald-800 ring-emerald-200/80",
  },
];

const tourismTypesAr: TourismType[] = [
  {
    name: "السياحة المصرية القديمة",
    description: "استكشف الاهرامات والمعابد والمقابر الملكية وارث الحضارة المصرية القديمة.",
    link: "/tourism/cultural",
    tag: "التراث الفرعوني",
    image: sharedTourismImages.cultural,
    accent: "from-amber-500 to-orange-500",
    tagStyle: "bg-amber-50 text-amber-800 ring-amber-200/80",
  },
  {
    name: "السياحة الدينية",
    description: "اكتشف التراث الديني في مصر عبر الكنائس والاديرة والمساجد والمسارات الروحية.",
    link: "/tourism/religious",
    tag: "التراث الديني",
    image: sharedTourismImages.religious,
    accent: "from-violet-500 to-indigo-600",
    tagStyle: "bg-violet-50 text-violet-800 ring-violet-200/80",
  },
  {
    name: "مصر الخفية",
    description: "ادخل إلى مصر غير المعروفة: مواقع منسية، اماكن مدهشة، ومساحات ثقافية حية خارج المسارات السياحية التقليدية.",
    link: "/tourism/untold",
    tag: "قسم مميز",
    image: sharedTourismImages.untold,
    accent: "from-orange-500 via-amber-500 to-rose-500",
    tagStyle: "bg-amber-50 text-amber-900 ring-amber-300/80",
    featured: true,
  },
  {
    name: "السياحة الساحلية والغوص",
    description: "استمتع بالشعاب المرجانية وسواحل البحر الاحمر وتجارب الغوص الاشهر في مصر.",
    link: "/tourism/sea",
    tag: "البحار والسواحل",
    image: sharedTourismImages.sea,
    accent: "from-cyan-500 to-sky-600",
    tagStyle: "bg-sky-50 text-sky-800 ring-sky-200/80",
  },
  {
    name: "السياحة الطبيعية والمغامرات",
    description: "استكشف الصحارى والواحات والمحميات والمناظر الطبيعية الفريدة في مصر.",
    link: "/tourism/eco",
    tag: "العجائب الطبيعية",
    image: sharedTourismImages.eco,
    accent: "from-emerald-500 to-teal-600",
    tagStyle: "bg-emerald-50 text-emerald-800 ring-emerald-200/80",
  },
];

export default async function TourismTypesGrid() {
  const locale = (await getLocale()) === "ar" ? "ar" : "en";
  const localizedTourismTypes = locale === "ar" ? tourismTypesAr : tourismTypes;
  const copy = {
    sectionTitle: locale === "ar" ? "استكشف انواع السياحة" : "Explore Tourism Types",
    sectionDescription:
      locale === "ar"
        ? "خمسة عوالم سياحية مميزة في مصر: التراث الفرعوني، السواحل والبحار، التراث الديني، الطبيعة والمغامرات، ومصر الخفية."
        : "Five distinct tourism worlds in Egypt: Pharaonic heritage, marine coasts, sacred heritage, natural adventures, and Egypt Untold.",
    discoverMore: locale === "ar" ? "اكتشف المزيد" : "Discover more",
    featured: locale === "ar" ? "مختار" : "Featured",
  };

  return (
    <section className="max-w-7xl mx-auto px-6 pb-20 pt-8">
      <div className="relative overflow-hidden rounded-4xl border border-amber-200/70 bg-[linear-gradient(130deg,#fff8eb_0%,#f6efe6_45%,#edf7fb_100%)] p-7 shadow-[0_30px_80px_-35px_rgba(146,74,27,0.45)] md:p-10 dark:border-slate-700 dark:bg-[linear-gradient(130deg,#1b1410_0%,#1a1f26_100%)]">
        <div className="pointer-events-none absolute -right-16 -top-14 h-52 w-52 rounded-full bg-amber-300/35 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-52 w-52 rounded-full bg-cyan-300/30 blur-3xl" />

        <div className="relative mb-10 text-center">
          <p className="mb-3 inline-flex rounded-full border border-amber-300/70 bg-white/75 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-900 backdrop-blur-sm dark:border-amber-400/40 dark:bg-slate-900/60 dark:text-amber-200">
            Egypt Panorama
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-amber-950 md:text-4xl dark:text-amber-100">
            {copy.sectionTitle}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-amber-900/80 md:text-base dark:text-slate-300">
            {copy.sectionDescription}
          </p>
        </div>

        <div className="tourism-types-grid relative grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {localizedTourismTypes.map((type) => (
            <Link key={type.name} href={type.link} className="group block">
              <article
                className={`relative isolate overflow-hidden rounded-2xl border ring-1 transition duration-300 hover:-translate-y-1.5 ${type.featured ? "border-amber-200/90 shadow-[0_20px_52px_-24px_rgba(234,146,35,0.45)] ring-amber-950/30 hover:shadow-[0_28px_60px_-24px_rgba(234,146,35,0.52)]" : "border-white/70 shadow-[0_16px_40px_-25px_rgba(15,23,42,0.65)] ring-black/15 hover:shadow-[0_24px_50px_-24px_rgba(15,23,42,0.55)]"}`}
                style={{
                  height: "220px",
                  minHeight: "220px",
                  padding: "1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <img
                  src={safeImageSrc(type.image)}
                  alt={type.name}
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div
                  className={`absolute inset-0 ${type.featured ? "bg-linear-to-b from-[#2a1603]/40 via-[#1b1108]/70 to-[#090807]/92" : "bg-linear-to-b from-slate-950/35 via-slate-950/60 to-slate-950/85"}`}
                  aria-hidden="true"
                />
                {type.featured ? (
                  <div className="absolute right-4 top-4 z-10 inline-flex items-center rounded-full border border-amber-200/65 bg-amber-100/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-900 shadow-sm">
                    {copy.featured}
                  </div>
                ) : null}

                <div className="relative z-10 flex h-full flex-col justify-between">
                  <div>
                    <div
                      className={`mb-4 h-1.5 rounded-full ${type.featured ? "w-32" : "w-24"}`}
                      style={{
                        backgroundImage: type.featured
                          ? "linear-gradient(90deg, rgba(212,129,58,1), rgba(232,201,122,1))"
                          : "linear-gradient(90deg, rgba(201,168,76,1), rgba(255,255,255,0.25))",
                      }}
                    />

                    <span
                      className="inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1"
                      style={{
                        backgroundColor: `${type.featured ? "#d4813a" : "#c9a84c"}14`,
                        color: type.featured ? "#f2c08d" : "#d4af37",
                        borderColor: `${type.featured ? "#d4813a" : "#c9a84c"}45`,
                      }}
                    >
                      {type.tag}
                    </span>

                    <h3 className="mt-4 text-xl font-semibold leading-tight text-white">
                      {type.name}
                    </h3>
                  </div>

                  <div>
                    <p
                      className="text-sm leading-6 text-slate-100/95"
                      style={{
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 3,
                        overflow: "hidden",
                      }}
                    >
                      {type.description}
                    </p>

                    <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-amber-200 transition group-hover:text-amber-100">
                      {copy.discoverMore}
                      <span aria-hidden="true" className="transition group-hover:translate-x-1">
                        -&gt;
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
