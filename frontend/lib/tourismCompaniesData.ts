export type Lang = "en" | "ar";

export type TourismCompanyTier = "Premium" | "Luxury" | "Boutique" | "Expert";

export interface TourismCompany {
  id: number;
  name: Record<Lang, string>;
  location: Record<Lang, string>;
  address?: string;
  phone?: string;
  email?: string;
  rating: number;
  reviews: number;
  description: Record<Lang, string>;
  image: string;
  logoUrl: string;
  logoAlt: string;
  specialties: Record<Lang, string[]>;
  founded: string;
  tier: TourismCompanyTier;
  tierColor: string;
}

export const tourismCompanies: TourismCompany[] = [
  {
    id: 1,
    name: { en: "Memphis Tours", ar: "ممفيس تورز" },
    location: { en: "Cairo", ar: "القاهرة" },
    rating: 4.9,
    reviews: 14820,
    description: {
      en: "Egypt's leading travel operator with curated journeys through ancient sites and Nile wonders.",
      ar: "شركة رائدة في السياحة تقدم رحلات متكاملة عبر المعالم الأثرية ونهر النيل.",
    },
    image: "/images/memphis%20tours%20background.jpg",
    logoUrl: "/images/companies/logos/memphis-tours.png",
    logoAlt: "Memphis Tours logo",
    specialties: {
      en: ["Nile Cruises", "Cultural Tours", "Desert Safaris"],
      ar: ["رحلات نيلية", "جولات ثقافية", "سفاري الصحراء"],
    },
    founded: "1994",
    tier: "Premium",
    tierColor: "#C9A84C",
  },
  {
    id: 2,
    name: { en: "Travco Group", ar: "مجموعة ترافكو" },
    location: { en: "Cairo", ar: "القاهرة" },
    rating: 4.8,
    reviews: 11340,
    description: {
      en: "A major hospitality and travel group known for premium services across Egypt.",
      ar: "مجموعة كبرى في الضيافة والسفر تقدم خدمات سياحية متميزة في مصر.",
    },
    image: "/images/companies/covers/travco-group.jpg",
    logoUrl: "/images/companies/logos/travco-group.png",
    logoAlt: "Travco Group logo",
    specialties: {
      en: ["Luxury Packages", "MICE Events", "Nile Cruises"],
      ar: ["باقات فاخرة", "فعاليات ومؤتمرات", "رحلات نيلية"],
    },
    founded: "1979",
    tier: "Luxury",
    tierColor: "#E8A000",
  },
  {
    id: 3,
    name: { en: "Abercrombie & Kent Egypt", ar: "أبركرومبي آند كنت مصر" },
    location: { en: "Cairo", ar: "القاهرة" },
    rating: 4.9,
    reviews: 8960,
    description: {
      en: "High-end private travel experiences with exclusive cultural access and luxury planning.",
      ar: "تجارب سفر فاخرة وخاصة مع وصول حصري وخطط رحلات راقية.",
    },
    image: "/images/abercrombie_and_kent_egypt_Background.jpg",
    logoUrl: "/images/companies/logos/abercrombie-kent-egypt.png",
    logoAlt: "Abercrombie and Kent logo",
    specialties: {
      en: ["Private Travel", "Exclusive Access", "Ultra-Luxury"],
      ar: ["سفر خاص", "وصول حصري", "فخامة عالية"],
    },
    founded: "1962",
    tier: "Luxury",
    tierColor: "#E8A000",
  },
  {
    id: 4,
    name: { en: "Egypt Tailor Made", ar: "إيجيبت تيلور ميد" },
    location: { en: "Luxor", ar: "الأقصر" },
    rating: 4.7,
    reviews: 5670,
    description: {
      en: "Bespoke itineraries tailored to archaeology lovers, culture seekers, and adventurers.",
      ar: "برامج مخصصة لعشاق الآثار والثقافة والمغامرات.",
    },
    image: "/images/egypt%20tailor%20made%20background.jpg",
    logoUrl: "/images/companies/logos/egypt-tailor-made.png",
    logoAlt: "Egypt Tailor Made logo",
    specialties: {
      en: ["Custom Itineraries", "Egyptology", "Adventure"],
      ar: ["برامج مخصصة", "علم المصريات", "مغامرات"],
    },
    founded: "2008",
    tier: "Boutique",
    tierColor: "#4A8B5C",
  },
  {
    id: 5,
    name: { en: "Nile Explorers", ar: "نايل إكسبلوررز" },
    location: { en: "Aswan", ar: "أسوان" },
    rating: 4.8,
    reviews: 7210,
    description: {
      en: "Experts in Upper Egypt and Nile routes with authentic local experiences.",
      ar: "متخصصون في صعيد مصر ومسارات النيل بتجارب محلية أصيلة.",
    },
    image: "/images/companies/covers/nile-explorers.jpg",
    logoUrl: "/images/companies/logos/nile-explorers.png",
    logoAlt: "Nile Explorers logo",
    specialties: {
      en: ["Felucca Voyages", "Dahabiya Cruises", "Aswan Tours"],
      ar: ["رحلات فلوكة", "رحلات دهبية", "جولات أسوان"],
    },
    founded: "2001",
    tier: "Expert",
    tierColor: "#2A7B9B",
  },
  {
    id: 6,
    name: { en: "Sinai Safari Adventures", ar: "سيناء سفاري" },
    location: { en: "Sharm El-Sheikh", ar: "شرم الشيخ" },
    rating: 4.7,
    reviews: 4890,
    description: {
      en: "Adventure-focused Sinai experiences from diving to mountain sunrise trips.",
      ar: "رحلات مغامرة في سيناء من الغوص لرحلات الجبال والشروق.",
    },
    image: "/images/companies/covers/sinai-safari-adventures.jpg",
    logoUrl: "/images/companies/logos/sinai-safari-adventures.png",
    logoAlt: "Sinai Safari Adventures logo",
    specialties: {
      en: ["Diving", "Desert Camps", "Sinai Treks"],
      ar: ["غوص", "مخيمات صحراوية", "رحلات سيناء"],
    },
    founded: "2005",
    tier: "Expert",
    tierColor: "#2A7B9B",
  },
  {
    id: 7,
    name: { en: "Oasis Desert Tours", ar: "واحات ديزرت تورز" },
    location: { en: "Siwa", ar: "سيوة" },
    rating: 4.6,
    reviews: 3140,
    description: {
      en: "Western Desert specialists covering Siwa, White Desert, and 4x4 expeditions.",
      ar: "متخصصون في الصحراء الغربية وسيوة ورحلات الدفع الرباعي.",
    },
    image: "/images/companies/covers/oasis-desert-tours.jpg",
    logoUrl: "/images/companies/logos/oasis-desert-tours.png",
    logoAlt: "Oasis Desert Tours logo",
    specialties: {
      en: ["4x4 Expeditions", "Oasis Tours", "Camping"],
      ar: ["دفع رباعي", "جولات الواحات", "تخييم"],
    },
    founded: "2010",
    tier: "Boutique",
    tierColor: "#4A8B5C",
  },
  {
    id: 8,
    name: { en: "Pharaoh's Choice Travel", ar: "فرعونز تشويس" },
    location: { en: "Alexandria", ar: "الإسكندرية" },
    rating: 4.8,
    reviews: 6320,
    description: {
      en: "Culture-rich routes connecting Alexandria, Cairo, and Delta heritage.",
      ar: "رحلات ثقافية تربط الإسكندرية بالقاهرة وتراث الدلتا.",
    },
    image: "/images/pharaoh%27s%20choice%20travel%20background.png",
    logoUrl: "/images/companies/logos/pharaohs-choice-travel.png",
    logoAlt: "Pharaoh's Choice Travel logo",
    specialties: {
      en: ["Alexandria", "Heritage Tours", "Day Trips"],
      ar: ["الإسكندرية", "جولات تراثية", "رحلات يومية"],
    },
    founded: "2003",
    tier: "Premium",
    tierColor: "#C9A84C",
  },
  {
    id: 9,
    name: { en: "Red Sea Diving Safari", ar: "ريد سي دايفنج سفاري" },
    location: { en: "Hurghada", ar: "الغردقة" },
    rating: 4.9,
    reviews: 9870,
    description: {
      en: "Top Red Sea diving operator for reefs, wreck dives, and liveaboard trips.",
      ar: "شركة غوص رائدة في البحر الأحمر للشعاب والحطام ورحلات اللايف أبورد.",
    },
    image: "/images/companies/covers/red-sea-diving-safari.jpg",
    logoUrl: "/images/companies/logos/red-sea-diving-safari.png",
    logoAlt: "Red Sea Diving Safari logo",
    specialties: {
      en: ["Liveaboards", "PADI Diving", "Wreck Diving"],
      ar: ["لايف أبورد", "غوص بادي", "غوص حطام"],
    },
    founded: "1990",
    tier: "Expert",
    tierColor: "#2A7B9B",
  },
];