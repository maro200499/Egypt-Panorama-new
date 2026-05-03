import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";

import TourismCategoryPage from "@/components/tourism/TourismCategoryPage";
import {
  getLocalizedTourismCategoryBySlug,
  getTourismCategories,
} from "@/lib/tourismCategories";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getTourismCategories("en").map((category) => ({ slug: category.slug }));
}

export default async function TourismCategoryDynamicPage({ params }: PageProps) {
  const { slug } = await params;
  const locale = (await getLocale()) === "ar" ? "ar" : "en";
  const category = getLocalizedTourismCategoryBySlug(slug, locale);

  if (!category) {
    notFound();
  }

  return (
    <TourismCategoryPage
      slug={category.slug}
      title={category.title}
      subtitle={category.subtitle}
      badge={category.badge}
      places={category.places}
      coverImage={category.coverImage}
      coverImagePosition={category.coverImagePosition}
      placeImages={category.placeImages}
      sectionGradientClass={category.sectionGradientClass}
      cardBorderClass={category.cardBorderClass}
      accentLineClass={category.accentLineClass}
      badgeClass={category.badgeClass}
    />
  );
}
