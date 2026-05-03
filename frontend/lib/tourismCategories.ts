export type TourismCategory = {
  slug: "cultural" | "sea" | "desert" | "eco" | "medical" | "religious" | "untold";
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

export type SupportedLocale = "en" | "ar";

export const tourismCategories: TourismCategory[] = [
  {
    slug: "cultural",
    title: "Ancient Egyptian Tourism",
    subtitle: "Walk through thousands of years of civilization, monumental architecture, and living heritage.",
    badge: "Heritage Route",
    places: ["Pyramids of Giza", "Luxor Temple", "Karnak Temple", "Abu Simbel", "Saqqara"],
    coverImage: "/images/hero/pyramids.jpg",
    coverImagePosition: "center",
    placeImages: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Giza-pyramids.JPG",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Luxor_Temple_at_night,_Luxor,_Egypt.jpg",
      "/images/ancient-ruins-of-karnak-temple-in-egypt.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Abu_Simbel_Temple_May_30_2007.jpg",
      "/images/saqqara.jpg",
    ],
    sectionGradientClass: "bg-[linear-gradient(130deg,#fff7e8_0%,#f7ecde_55%,#f0f6ff_100%)] dark:bg-[linear-gradient(130deg,#22180f_0%,#1a1f27_100%)]",
    cardBorderClass: "border-amber-200/80",
    accentLineClass: "bg-linear-to-r from-amber-500 to-orange-500",
    badgeClass: "bg-amber-50 text-amber-900 ring-amber-200/80 dark:bg-amber-200/10 dark:text-amber-200 dark:ring-amber-300/30",
  },
  {
    slug: "sea",
    title: "Coastal & Diving Tourism",
    subtitle: "Dive into coral reefs, clear waters, and year-round coastal experiences across Egypt.",
    badge: "Coastal Route",
    places: ["Hurghada", "Sharm El Sheikh", "Dahab", "Marsa Alam", "El Gouna"],
    coverImage: "/images/companies/covers/red-sea-diving-safari.jpg",
    coverImagePosition: "center",
    placeImages: [
      "/images/hurghada.jpg",
      "/images/sharm-el-sheikh.avif",
      "/images/dahab.jpg",
      "/images/Marsa-Alam.jpg",
      "/images/elgouna.webp",
    ],
    sectionGradientClass: "bg-[linear-gradient(130deg,#ecfbff_0%,#e8f5ff_55%,#f3f8ff_100%)] dark:bg-[linear-gradient(130deg,#11212a_0%,#172633_100%)]",
    cardBorderClass: "border-cyan-200/80",
    accentLineClass: "bg-linear-to-r from-cyan-500 to-sky-600",
    badgeClass: "bg-sky-50 text-sky-900 ring-sky-200/80 dark:bg-sky-200/10 dark:text-sky-200 dark:ring-sky-300/30",
  },
  {
    slug: "desert",
    title: "Desert Tourism",
    subtitle: "Experience Egypt's desert magic through dunes, oases, and unforgettable starlit nights.",
    badge: "Adventure Route",
    places: ["White Desert", "Black Desert", "Siwa Oasis", "Bahariya Oasis", "Great Sand Sea"],
    coverImage: "/images/companies/covers/oasis-desert-tours.jpg",
    coverImagePosition: "center",
    placeImages: [
      "/images/white desert.webp",
      "/images/black desert.jpg",
      "/images/siwa oasis.jpg",
      "/images/bahariya oasis.jpg",
      "/images/grand sand sea.jpg",
    ],
    sectionGradientClass: "bg-[linear-gradient(130deg,#fff6ea_0%,#f8e9d7_55%,#f3f7fb_100%)] dark:bg-[linear-gradient(130deg,#24180f_0%,#1d2128_100%)]",
    cardBorderClass: "border-orange-200/80",
    accentLineClass: "bg-linear-to-r from-orange-500 to-amber-600",
    badgeClass: "bg-orange-50 text-orange-900 ring-orange-200/80 dark:bg-orange-200/10 dark:text-orange-200 dark:ring-orange-300/30",
  },
  {
    slug: "eco",
    title: "Nature & Adventure Tourism",
    subtitle: "Explore deserts, oases, reserves, and dramatic landscapes across Egypt's natural wonders.",
    badge: "Nature Route",
    places: ["Ras Mohammed", "Wadi El Rayan", "St. Catherine Reserve", "Wadi El Gemal", "Lake Qarun"],
    coverImage: "/images/companies/covers/sinai-safari-adventures.jpg",
    coverImagePosition: "center",
    placeImages: [
      "/images/ras mohamed.jpg",
      "/images/wadi elrayan.jpg",
      "/images/saint-catherine-reserve.jpg",
      "/images/Wadi-El-Gemal-National-Park.webp",
      "/images/lake quran.jpg",
    ],
    sectionGradientClass: "bg-[linear-gradient(130deg,#f0fff6_0%,#ebf9f3_55%,#f2f8ff_100%)] dark:bg-[linear-gradient(130deg,#12231b_0%,#172730_100%)]",
    cardBorderClass: "border-emerald-200/80",
    accentLineClass: "bg-linear-to-r from-emerald-500 to-teal-600",
    badgeClass: "bg-emerald-50 text-emerald-900 ring-emerald-200/80 dark:bg-emerald-200/10 dark:text-emerald-200 dark:ring-emerald-300/30",
  },
  {
    slug: "medical",
    title: "Medical Tourism",
    subtitle: "Benefit from therapeutic environments and trusted healthcare services across Egypt.",
    badge: "Healthcare Route",
    places: ["Aswan Sand Therapy", "Safaga Healing Sands", "Helwan Springs", "Siwa Mineral Baths"],
    coverImage: "/images/abercrombie_and_kent_egypt_Background.jpg",
    coverImagePosition: "center",
    placeImages: [
      "/images/aswan sand.jpg",
      "/images/safaga.jpg",
      "/images/helwan springs.jpg",
      "/images/siwa baths.jpg",
    ],
    sectionGradientClass: "bg-[linear-gradient(130deg,#fff2f4_0%,#fef0f3_55%,#f3f8ff_100%)] dark:bg-[linear-gradient(130deg,#271821_0%,#1a202d_100%)]",
    cardBorderClass: "border-rose-200/80",
    accentLineClass: "bg-linear-to-r from-rose-500 to-pink-600",
    badgeClass: "bg-rose-50 text-rose-900 ring-rose-200/80 dark:bg-rose-200/10 dark:text-rose-200 dark:ring-rose-300/30",
  },
  {
    slug: "religious",
    title: "Religious Tourism",
    subtitle: "Discover Egypt's sacred Islamic and Christian heritage through living landmarks, timeless faith stories, and deeply spiritual journeys.",
    badge: "Faith Route",
    places: ["Al-Azhar Mosque", "Al-Hussein Mosque", "Mosque of Muhammad Ali", "Coptic Cairo", "The Hanging Church", "Saint Catherine's Monastery", "Mount Sinai", "The Holy Family Trail"],
    coverImage: "/images/Egypt's Rich Religious Tourism Background.png",
    coverImagePosition: "center",
    placeImages: [
      "/images/Elazhar mosque.webp",
      "/images/Al-Hussein Mosque.jpg",
      "/images/Mosque of Muhammad Ali.jpg",
      "/images/Coptic Cairo.jpg",
      "/images/The Hanging Church.jpg",
      "/images/Saint Catherine's Monastery.jpg",
      "/images/Mount Sinai.jpg",
      "/images/The Holy Family Trail.jpg",
    ],
    sectionGradientClass: "bg-[linear-gradient(130deg,#fff3ff_0%,#f8efff_55%,#f2f7ff_100%)] dark:bg-[linear-gradient(130deg,#251a2c_0%,#182331_100%)]",
    cardBorderClass: "border-fuchsia-200/80",
    accentLineClass: "bg-linear-to-r from-violet-500 to-fuchsia-600",
    badgeClass: "bg-fuchsia-50 text-fuchsia-900 ring-fuchsia-200/80 dark:bg-fuchsia-200/10 dark:text-fuchsia-200 dark:ring-fuchsia-300/30",
  },
  {
    slug: "untold",
    title: "Egypt Untold",
    subtitle: "Enter Egypt's hidden layer of forgotten monuments, atmospheric sites, and living cultural spaces beyond the mainstream route.",
    badge: "Signature Segment",
    places: ["Forgotten Monuments", "Hidden Cemeteries", "Abandoned Fortresses", "Living Art Spaces", "Cultural Underground"],
    coverImage: "/images/abercrombie_and_kent_egypt_Background.jpg",
    coverImagePosition: "center",
    placeImages: [
      "https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?w=900&q=85",
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=900&q=85",
      "https://images.unsplash.com/photo-1526779259212-756e5e1f8b7b?w=900&q=85",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&q=85",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900&q=85",
    ],
    sectionGradientClass: "bg-[linear-gradient(130deg,#fff4e9_0%,#f6eadc_55%,#f3f7fb_100%)] dark:bg-[linear-gradient(130deg,#23160d_0%,#181d27_100%)]",
    cardBorderClass: "border-amber-200/80",
    accentLineClass: "bg-linear-to-r from-amber-500 to-orange-500",
    badgeClass: "bg-amber-50 text-amber-900 ring-amber-200/80 dark:bg-amber-200/10 dark:text-amber-200 dark:ring-amber-300/30",
  },
];

export const tourismCategoriesAr: TourismCategory[] = [
  {
    slug: "cultural",
    title: "السياحة الثقافية في مصر",
    subtitle: "اكتشف آلاف السنين من الحضارة والعمارة المهيبة والتراث الحي.",
    badge: "مسار التراث",
    places: ["اهرامات الجيزة", "معبد الاقصر", "معبد الكرنك", "ابو سمبل", "سقارة"],
    coverImage: "/images/hero/pyramids.jpg",
    coverImagePosition: "center",
    placeImages: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Giza-pyramids.JPG",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Luxor_Temple_at_night,_Luxor,_Egypt.jpg",
      "/images/ancient-ruins-of-karnak-temple-in-egypt.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Abu_Simbel_Temple_May_30_2007.jpg",
      "/images/saqqara.jpg",
    ],
    sectionGradientClass: "bg-[linear-gradient(130deg,#fff7e8_0%,#f7ecde_55%,#f0f6ff_100%)] dark:bg-[linear-gradient(130deg,#22180f_0%,#1a1f27_100%)]",
    cardBorderClass: "border-amber-200/80",
    accentLineClass: "bg-linear-to-r from-amber-500 to-orange-500",
    badgeClass: "bg-amber-50 text-amber-900 ring-amber-200/80 dark:bg-amber-200/10 dark:text-amber-200 dark:ring-amber-300/30",
  },
  {
    slug: "sea",
    title: "السياحة الشاطئية",
    subtitle: "استمتع بالشعاب المرجانية والمياه الصافية والتجارب الساحلية طوال العام.",
    badge: "مسار الساحل",
    places: ["الغردقة", "شرم الشيخ", "دهب", "مرسى علم", "الجونة"],
    coverImage: "/images/companies/covers/red-sea-diving-safari.jpg",
    coverImagePosition: "center",
    placeImages: [
      "/images/hurghada.jpg",
      "/images/sharm-el-sheikh.avif",
      "/images/dahab.jpg",
      "/images/Marsa-Alam.jpg",
      "/images/elgouna.webp",
    ],
    sectionGradientClass: "bg-[linear-gradient(130deg,#ecfbff_0%,#e8f5ff_55%,#f3f8ff_100%)] dark:bg-[linear-gradient(130deg,#11212a_0%,#172633_100%)]",
    cardBorderClass: "border-cyan-200/80",
    accentLineClass: "bg-linear-to-r from-cyan-500 to-sky-600",
    badgeClass: "bg-sky-50 text-sky-900 ring-sky-200/80 dark:bg-sky-200/10 dark:text-sky-200 dark:ring-sky-300/30",
  },
  {
    slug: "desert",
    title: "السياحة الصحراوية",
    subtitle: "عيش سحر الصحراء المصرية بين الكثبان والواحات وليالي النجوم.",
    badge: "مسار المغامرة",
    places: ["الصحراء البيضاء", "الصحراء السوداء", "واحة سيوة", "واحة البحرية", "بحر الرمال الاعظم"],
    coverImage: "/images/companies/covers/oasis-desert-tours.jpg",
    coverImagePosition: "center",
    placeImages: [
      "/images/white desert.webp",
      "/images/black desert.jpg",
      "/images/siwa oasis.jpg",
      "/images/bahariya oasis.jpg",
      "/images/grand sand sea.jpg",
    ],
    sectionGradientClass: "bg-[linear-gradient(130deg,#fff6ea_0%,#f8e9d7_55%,#f3f7fb_100%)] dark:bg-[linear-gradient(130deg,#24180f_0%,#1d2128_100%)]",
    cardBorderClass: "border-orange-200/80",
    accentLineClass: "bg-linear-to-r from-orange-500 to-amber-600",
    badgeClass: "bg-orange-50 text-orange-900 ring-orange-200/80 dark:bg-orange-200/10 dark:text-orange-200 dark:ring-orange-300/30",
  },
  {
    slug: "eco",
    title: "السياحة الطبيعية والمغامرات",
    subtitle: "استكشف الصحارى والواحات والمحميات والمناظر الطبيعية الفريدة في مصر.",
    badge: "مسار الطبيعة",
    places: ["راس محمد", "وادي الريان", "محمية سانت كاترين", "وادي الجمال", "بحيرة قارون"],
    coverImage: "/images/companies/covers/sinai-safari-adventures.jpg",
    coverImagePosition: "center",
    placeImages: [
      "/images/ras mohamed.jpg",
      "/images/wadi elrayan.jpg",
      "/images/saint-catherine-reserve.jpg",
      "/images/Wadi-El-Gemal-National-Park.webp",
      "/images/lake quran.jpg",
    ],
    sectionGradientClass: "bg-[linear-gradient(130deg,#f0fff6_0%,#ebf9f3_55%,#f2f8ff_100%)] dark:bg-[linear-gradient(130deg,#12231b_0%,#172730_100%)]",
    cardBorderClass: "border-emerald-200/80",
    accentLineClass: "bg-linear-to-r from-emerald-500 to-teal-600",
    badgeClass: "bg-emerald-50 text-emerald-900 ring-emerald-200/80 dark:bg-emerald-200/10 dark:text-emerald-200 dark:ring-emerald-300/30",
  },
  {
    slug: "medical",
    title: "السياحة العلاجية",
    subtitle: "استفد من البيئات العلاجية والخدمات الصحية الموثوقة داخل مصر.",
    badge: "مسار الرعاية الصحية",
    places: ["العلاج بالرمال في اسوان", "رمال سفاجا العلاجية", "عيون حلوان", "حمامات سيوة المعدنية"],
    coverImage: "/images/abercrombie_and_kent_egypt_Background.jpg",
    coverImagePosition: "center",
    placeImages: [
      "/images/aswan sand.jpg",
      "/images/safaga.jpg",
      "/images/helwan springs.jpg",
      "/images/siwa baths.jpg",
    ],
    sectionGradientClass: "bg-[linear-gradient(130deg,#fff2f4_0%,#fef0f3_55%,#f3f8ff_100%)] dark:bg-[linear-gradient(130deg,#271821_0%,#1a202d_100%)]",
    cardBorderClass: "border-rose-200/80",
    accentLineClass: "bg-linear-to-r from-rose-500 to-pink-600",
    badgeClass: "bg-rose-50 text-rose-900 ring-rose-200/80 dark:bg-rose-200/10 dark:text-rose-200 dark:ring-rose-300/30",
  },
  {
    slug: "religious",
    title: "السياحة الدينية",
    subtitle: "اكتشف تراث مصر الإسلامي والمسيحي عبر معالم روحية حية، وقصص إيمانية عريقة، ورحلات لا تنسى.",
    badge: "مسار الإيمان",
    places: ["جامع الأزهر", "جامع الحسين", "مسجد محمد علي", "مصر القبطية", "الكنيسة المعلقة", "دير سانت كاترين", "جبل سيناء", "مسار العائلة المقدسة"],
    coverImage: "/images/Egypt's Rich Religious Tourism Background.png",
    coverImagePosition: "center",
    placeImages: [
      "/images/Elazhar mosque.webp",
      "/images/Al-Hussein Mosque.jpg",
      "/images/Mosque of Muhammad Ali.jpg",
      "/images/Coptic Cairo.jpg",
      "/images/The Hanging Church.jpg",
      "/images/Saint Catherine's Monastery.jpg",
      "/images/Mount Sinai.jpg",
      "/images/The Holy Family Trail.jpg",
    ],
    sectionGradientClass: "bg-[linear-gradient(130deg,#fff3ff_0%,#f8efff_55%,#f2f7ff_100%)] dark:bg-[linear-gradient(130deg,#251a2c_0%,#182331_100%)]",
    cardBorderClass: "border-fuchsia-200/80",
    accentLineClass: "bg-linear-to-r from-violet-500 to-fuchsia-600",
    badgeClass: "bg-fuchsia-50 text-fuchsia-900 ring-fuchsia-200/80 dark:bg-fuchsia-200/10 dark:text-fuchsia-200 dark:ring-fuchsia-300/30",
  },
  {
    slug: "untold",
    title: "مصر الخفية",
    subtitle: "ادخل إلى مصر الخفية عبر المواقع المنسية والمعالم الهادئة والمساحات الثقافية التي لا تظهر في المسارات التقليدية.",
    badge: "قسم مميز",
    places: ["مواقع منسية", "مقابر خفية", "حصون مهجورة", "مساحات فنية حية", "ثقافة غير تقليدية"],
    coverImage: "https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?w=900&q=85",
    coverImagePosition: "center",
    placeImages: [
      "https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?w=900&q=85",
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=900&q=85",
      "https://images.unsplash.com/photo-1526779259212-756e5e1f8b7b?w=900&q=85",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&q=85",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900&q=85",
    ],
    sectionGradientClass: "bg-[linear-gradient(130deg,#fff4e9_0%,#f6eadc_55%,#f3f7fb_100%)] dark:bg-[linear-gradient(130deg,#23160d_0%,#181d27_100%)]",
    cardBorderClass: "border-amber-200/80",
    accentLineClass: "bg-linear-to-r from-amber-500 to-orange-500",
    badgeClass: "bg-amber-50 text-amber-900 ring-amber-200/80 dark:bg-amber-200/10 dark:text-amber-200 dark:ring-amber-300/30",
  },
];

export function getTourismCategories(locale: SupportedLocale = "en") {
  return locale === "ar" ? tourismCategoriesAr : tourismCategories;
}

export function getTourismCategoryBySlug(slug: string) {
  return tourismCategories.find((category) => category.slug === slug);
}

export function getLocalizedTourismCategoryBySlug(
  slug: string,
  locale: SupportedLocale = "en"
) {
  return getTourismCategories(locale).find((category) => category.slug === slug);
}
