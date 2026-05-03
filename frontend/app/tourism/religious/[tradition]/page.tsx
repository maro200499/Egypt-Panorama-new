import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";

import TourismCategoryPage from "@/components/tourism/TourismCategoryPage";
import { getLocalizedTourismCategoryBySlug } from "@/lib/tourismCategories";

type PageProps = {
  params: Promise<{ tradition: string }>;
};

const islamicKeywords = ["mosque", "islam", "مسجد", "جامع", "الحسين", "الازهر", "الأزهر", "محمد علي"];
const copticKeywords = [
  "church",
  "coptic",
  "monastery",
  "saint",
  "holy family",
  "sinai",
  "كنيسة",
  "قبط",
  "دير",
  "سانت",
  "العائلة المقدسة",
  "سيناء",
];

function hasKeyword(value: string, keywords: string[]) {
  const normalized = value.toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword));
}

function getTraditionContent(tradition: string, places: string[], placeImages: string[]) {
  if (tradition === "islamic") {
    const filteredPlaces = places.filter((place) => hasKeyword(place, islamicKeywords));
    const filteredImages = filteredPlaces.map((place) => placeImages[places.indexOf(place)]);
    return { filteredPlaces, filteredImages };
  }

  if (tradition === "coptic") {
    const islamicPlaces = places.filter((place) => hasKeyword(place, islamicKeywords));
    const copticPlaces = places.filter((place) => hasKeyword(place, copticKeywords));
    const fallbackPlaces = places.filter((place) => !islamicPlaces.includes(place) && !copticPlaces.includes(place));
    const filteredPlaces = [...copticPlaces, ...fallbackPlaces];
    const filteredImages = filteredPlaces.map((place) => placeImages[places.indexOf(place)]);
    return { filteredPlaces, filteredImages };
  }

  return { filteredPlaces: [], filteredImages: [] };
}

export function generateStaticParams() {
  return [{ tradition: "islamic" }, { tradition: "coptic" }];
}

export default async function ReligiousTraditionPage({ params }: PageProps) {
  const { tradition } = await params;

  if (tradition !== "islamic" && tradition !== "coptic") {
    notFound();
  }

  const locale = (await getLocale()) === "ar" ? "ar" : "en";
  const category = getLocalizedTourismCategoryBySlug("religious", locale);

  if (!category) {
    notFound();
  }

  const { filteredPlaces, filteredImages } = getTraditionContent(
    tradition,
    category.places,
    category.placeImages
  );

  if (filteredPlaces.length === 0) {
    notFound();
  }

  const titleByTradition =
    tradition === "islamic"
      ? locale === "ar"
        ? "السياحة الإسلامية"
        : "Islamic Tourism"
      : locale === "ar"
        ? "السياحة القبطية"
        : "Coptic Tourism";

  const subtitleByTradition =
    tradition === "islamic"
      ? locale === "ar"
        ? "اكتشف معالم مصر الإسلامية من القاهرة التاريخية إلى المساجد ذات الأهمية الروحية والحضارية."
        : "Discover Egypt's Islamic heritage from historic Cairo to landmark mosques of deep cultural and spiritual significance."
      : locale === "ar"
        ? "تتبع مسار التراث القبطي في مصر عبر الكنائس القديمة والأديرة المقدسة ومسار العائلة المقدسة."
        : "Trace Egypt's Coptic heritage through ancient churches, sacred monasteries, and the Holy Family route.";

  return (
    <TourismCategoryPage
      slug={category.slug}
      title={titleByTradition}
      subtitle={subtitleByTradition}
      badge={category.badge}
      places={filteredPlaces}
      coverImage={category.coverImage}
      coverImagePosition={category.coverImagePosition}
      placeImages={filteredImages}
      sectionGradientClass={category.sectionGradientClass}
      cardBorderClass={category.cardBorderClass}
      accentLineClass={category.accentLineClass}
      badgeClass={category.badgeClass}
    />
  );
}
