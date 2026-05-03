import Image from "next/image";
import Link from "next/link";
import { getLocale } from "next-intl/server";
import CulturalActivitiesGrid from "@/components/tourism/CulturalActivitiesGrid";

type TourismCategoryPageProps = {
  slug: string;
  title: string;
  subtitle: string;
  badge: string;
  places: string[];
  coverImage: string;
  coverImagePosition?: string;
  placeImages: string[];
  sectionGradientClass: string;
  cardBorderClass: string;
  accentLineClass: string;
  badgeClass: string;
};

export default function TourismCategoryPage({
  slug,
  title,
  subtitle,
  badge,
  places,
  coverImage,
  coverImagePosition,
  placeImages,
  sectionGradientClass,
  cardBorderClass,
  accentLineClass,
  badgeClass,
}: TourismCategoryPageProps) {
  const localePromise = getLocale();

  return (
    <LocalizedTourismCategoryPage
      localePromise={localePromise}
      slug={slug}
      title={title}
      subtitle={subtitle}
      badge={badge}
      places={places}
      coverImage={coverImage}
      coverImagePosition={coverImagePosition}
      placeImages={placeImages}
      sectionGradientClass={sectionGradientClass}
      cardBorderClass={cardBorderClass}
      accentLineClass={accentLineClass}
      badgeClass={badgeClass}
    />
  );
}

const RELIGIOUS_BACKGROUND_IMAGE = "/images/Egypt%27s%20Rich%20Religious%20Tourism%20Background.png";

async function LocalizedTourismCategoryPage({
  localePromise,
  slug,
  title,
  subtitle,
  badge,
  places,
  coverImage,
  coverImagePosition,
  placeImages,
  sectionGradientClass,
  cardBorderClass,
  accentLineClass,
  badgeClass,
}: TourismCategoryPageProps & { localePromise: Promise<string> }) {
  const locale = (await localePromise) === "ar" ? "ar" : "en";
  const isReligiousTourism =
    title === "Religious Tourism" || title === "السياحة الدينية";
  const tourismTypeBySlug: Record<string, string> = {
    cultural: "Ancient Egyptian",
    sea: "Coastal & Diving",
    desert: "Desert",
    eco: "Nature & Adventure Tourism",
    medical: "Medical",
  };
  const tourismType = tourismTypeBySlug[slug] ?? title.replace(/\s*Tourism.*$/i, "").trim();

  const copy = {
    featuredPlaces: locale === "ar" ? "اماكن مميزة" : "Featured Places",
    islamicSection: locale === "ar" ? "السياحة الإسلامية 🕌" : "Islamic Tourism 🕌",
    copticSection: locale === "ar" ? "السياحة القبطية المسيحية ⛪" : "Coptic Christian Tourism ⛪",
    viewSection: locale === "ar" ? "فتح القسم" : "Open section",
    cardDescription:
      isReligiousTourism
        ? locale === "ar"
          ? "مسار روحي يجمع المعالم الإسلامية والقبطية المسيحية في مصر."
          : "A spiritual route through Egypt's Islamic and Coptic Christian landmarks across Egypt."
        : locale === "ar"
          ? "اكتشف ابرز المزايا ونصائح السفر والمعلومات الاساسية لهذه الوجهة."
          : "Discover highlights, travel tips, and essential context for this destination.",
    exploreDestination:
      locale === "ar" ? "استكشف الوجهة" : "Explore destination",
  };

  return (
    <section className="mx-auto max-w-7xl px-6 py-14 md:py-16">
      <div
        className={`relative overflow-hidden rounded-4xl border border-amber-200/70 p-7 shadow-[0_28px_70px_-35px_rgba(15,23,42,0.6)] md:p-10 ${sectionGradientClass}`}
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-amber-300/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-cyan-300/20 blur-3xl" />

        <header
          className={`relative mb-10 overflow-hidden rounded-3xl border border-white/30 bg-black/10 ${
            isReligiousTourism ? "min-h-64" : ""
          }`}
          style={
            isReligiousTourism
              ? {
                  backgroundImage:
                    `linear-gradient(rgba(0,0,0,0.58), rgba(0,0,0,0.62)), url("${RELIGIOUS_BACKGROUND_IMAGE}")`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }
              : undefined
          }
        >
          {isReligiousTourism ? (
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(0,0,0,0.2)_42%,rgba(0,0,0,0.55)_100%)] backdrop-blur-[1px]" />
          ) : null}
          <div className="relative h-56 w-full md:h-64">
            <Image
              src={coverImage}
              alt={title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: coverImagePosition ?? "center" }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(10,10,12,0.2)_0%,rgba(10,10,12,0.62)_100%)]" />

            <div className="absolute inset-x-5 bottom-5 md:inset-x-7 md:bottom-7">
              <p
                className={`mb-4 inline-flex rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] ring-1 ${badgeClass}`}
              >
                {badge}
              </p>
              <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">{title}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/85 md:text-base">{subtitle}</p>
            </div>
          </div>
        </header>

        <header className="relative mb-6 px-1">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-900/85 dark:text-amber-200/85">
            {copy.featuredPlaces}
          </h2>
        </header>

        {isReligiousTourism ? (
          <div className="relative space-y-10">
            <div>
              <div className="mb-4 flex items-center justify-between gap-4">
                <h3 className="text-base font-bold tracking-wide text-amber-900 dark:text-amber-200">
                  {copy.islamicSection}
                </h3>
              </div>
              <CulturalActivitiesGrid
                coverImage={coverImage}
                cardBorderClass={cardBorderClass}
                accentLineClass={accentLineClass}
                cardDescription={copy.cardDescription}
                exploreDestination={copy.exploreDestination}
                tourismType="islamic"
                emptyLabel="Islamic"
              />
            </div>

            <div>
              <div className="mb-4 flex items-center justify-between gap-4">
                <h3 className="text-base font-bold tracking-wide text-amber-900 dark:text-amber-200">
                  {copy.copticSection}
                </h3>
              </div>
              <CulturalActivitiesGrid
                coverImage={coverImage}
                cardBorderClass={cardBorderClass}
                accentLineClass={accentLineClass}
                cardDescription={copy.cardDescription}
                exploreDestination={copy.exploreDestination}
                tourismType="Coptic Christian"
                emptyLabel="Coptic Christian"
              />
            </div>
          </div>
        ) : (
          <CulturalActivitiesGrid
            coverImage={coverImage}
            cardBorderClass={cardBorderClass}
            accentLineClass={accentLineClass}
            cardDescription={copy.cardDescription}
            exploreDestination={copy.exploreDestination}
            tourismType={tourismType}
            emptyLabel={tourismType}
          />
        )}
      </div>
    </section>
  );
}
