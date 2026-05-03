export type TourismTypeItem = {
  id: number;
  title: string;
  slug: "cultural" | "religious" | "untold" | "sea" | "eco";
  link: string;
  badge: string;
  description: string;
  color: string;
  image: string;
  featured?: boolean;
};

export const tourismTypes: TourismTypeItem[] = [
  {
    id: 1,
    title: "Ancient Egyptian Tourism",
    slug: "cultural",
    link: "/tourism/cultural",
    badge: "Pharaonic Heritage",
    description: "Explore pyramids, temples, royal tombs, and the monumental legacy of ancient Egypt.",
    color: "#c9a84c",
    image: "/images/hero/pyramids.jpg",
  },
  {
    id: 2,
    title: "Religious Tourism",
    slug: "religious",
    link: "/tourism/religious",
    badge: "Sacred Heritage",
    description: "Discover Egypt's sacred heritage across historic churches, monasteries, mosques, and spiritual routes.",
    color: "#8b6ba8",
    image: "/images/Egypt's Rich Religious Tourism Background.png",
  },
  {
    id: 3,
    title: "Egypt Untold",
    slug: "untold",
    link: "/tourism/untold",
    badge: "Signature Segment",
    description: "Enter Egypt's hidden layer: forgotten monuments, atmospheric sites, and living cultural spaces beyond mainstream routes.",
    color: "#d4813a",
    image: "/images/abercrombie_and_kent_egypt_Background.jpg",
    featured: true,
  },
  {
    id: 4,
    title: "Coastal & Diving Tourism",
    slug: "sea",
    link: "/tourism/sea",
    badge: "Marine & Coastal",
    description: "Dive into Red Sea reefs, island escapes, and Egypt's most iconic coastal experiences.",
    color: "#2a7b9b",
    image: "/images/companies/covers/red-sea-diving-safari.jpg",
  },
  {
    id: 5,
    title: "Nature & Adventure Tourism",
    slug: "eco",
    link: "/tourism/eco",
    badge: "Natural Wonders",
    description: "Explore deserts, oases, reserves, and dramatic landscapes across Egypt's natural wonders.",
    color: "#4a8b5c",
    image: "/images/companies/covers/sinai-safari-adventures.jpg",
  },
];

export const tourismTypesAr: TourismTypeItem[] = [
  {
    id: 1,
    title: "السياحة المصرية القديمة",
    slug: "cultural",
    link: "/tourism/cultural",
    badge: "التراث الفرعوني",
    description: "استكشف الاهرامات والمعابد والمقابر الملكية وارث الحضارة المصرية القديمة.",
    color: "#c9a84c",
    image: "/images/hero/pyramids.jpg",
  },
  {
    id: 2,
    title: "السياحة الدينية",
    slug: "religious",
    link: "/tourism/religious",
    badge: "التراث الديني",
    description: "اكتشف التراث الديني في مصر عبر الكنائس والاديرة والمساجد والمسارات الروحية.",
    color: "#8b6ba8",
    image: "/images/Egypt's Rich Religious Tourism Background.png",
  },
  {
    id: 3,
    title: "مصر الخفية",
    slug: "untold",
    link: "/tourism/untold",
    badge: "قسم مميز",
    description: "ادخل إلى مصر الخفية عبر المواقع المنسية والمعالم الهادئة والمساحات الثقافية التي لا تظهر في المسارات التقليدية.",
    color: "#d4813a",
    image: "/images/abercrombie_and_kent_egypt_Background.jpg",
    featured: true,
  },
  {
    id: 4,
    title: "السياحة الساحلية والغوص",
    slug: "sea",
    link: "/tourism/sea",
    badge: "البحار والسواحل",
    description: "استمتع بالشعاب المرجانية وسواحل البحر الاحمر وتجارب الغوص الاشهر في مصر.",
    color: "#2a7b9b",
    image: "/images/companies/covers/red-sea-diving-safari.jpg",
  },
  {
    id: 5,
    title: "السياحة الطبيعية والمغامرات",
    slug: "eco",
    link: "/tourism/eco",
    badge: "العجائب الطبيعية",
    description: "استكشف الصحارى والواحات والمحميات والمناظر الطبيعية الفريدة في مصر.",
    color: "#4a8b5c",
    image: "/images/companies/covers/oasis-desert-tours.jpg",
  },
];