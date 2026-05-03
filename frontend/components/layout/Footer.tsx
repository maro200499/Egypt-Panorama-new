import { getLocale } from "next-intl/server";

export default function Footer() {
  const localePromise = getLocale();
  return <LocalizedFooter localePromise={localePromise} />;
}

async function LocalizedFooter({ localePromise }: { localePromise: Promise<string> }) {
  const locale = (await localePromise) === "ar" ? "ar" : "en";
  const copy = {
    description:
      locale === "ar"
        ? "اكتشف مصر عبر القصص والمناظر والتجارب السياحية الغامرة من السواحل حتى المدن التاريخية."
        : "Discover Egypt through stories, landscapes, and immersive tourism experiences from coastlines to ancient cities.",
    line1: locale === "ar" ? "استكشف. عش التجربة. تذكر." : "Explore. Experience. Remember.",
    line2:
      locale === "ar"
        ? "منصة للمسافرين والطلاب ومحبي الاستكشاف."
        : "Built for travelers, students, and curious explorers.",
    rights:
      locale === "ar"
        ? `© ${new Date().getFullYear()} Egypt Panorama. جميع الحقوق محفوظة.`
        : `© ${new Date().getFullYear()} Egypt Panorama. All rights reserved.`,
  };

  return (
    <footer className="mt-20 border-t border-amber-200/60 bg-[linear-gradient(140deg,#261a12_0%,#1f2128_45%,#102632_100%)] text-amber-50 dark:border-slate-700">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 md:grid-cols-2 md:items-end">
        <div>
          <h2 className="text-2xl font-extrabold tracking-wide text-amber-200">
            Egypt Panorama
          </h2>
          <p className="mt-3 max-w-md text-sm leading-7 text-amber-50/85 md:text-base">
            {copy.description}
          </p>
        </div>

        <div className="text-left md:text-right">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/85">{copy.line1}</p>
          <p className="mt-3 text-sm text-amber-100/80">{copy.line2}</p>
          <p className="mt-4 text-xs text-amber-200/70">{copy.rights}</p>
        </div>
      </div>
    </footer>
  );
}