export type DestinationType = "Cultural" | "Eco & Wellness" | "Desert" | "Sea & Diving";
export type BudgetLevel = "Budget" | "Mid-Range" | "Luxury";

export interface Activity {
  id?: number | string;
  name: string;
  description: string;
  duration: string;
  price?: string;
}

export interface Destination {
  id: number;
  name: string;
  city: string;
  region: string;
  type: DestinationType;
  /** Short summary shown on the card */
  description: string;
  /** Full narrative shown on the detail page */
  fullDescription: string;
  rating: number;
  reviews: number;
  badge: string;
  featured: boolean;
  coverImage: string;
  coverPosition?: string;
  /** Gallery images (4 items) */
  images: string[];
  activities: Activity[];
  attractions: string[];
  bestTimeToVisit: string;
  budget: BudgetLevel;
  safetyTips: string[];
}

// ─── English data ──────────────────────────────────────────────────────────────

export const destinationsEn: Destination[] = [
  {
    id: 1,
    name: "Pyramids of Giza",
    city: "Cairo",
    region: "Greater Cairo",
    type: "Cultural",
    description:
      "The last surviving wonder of the ancient world. Three monumental pyramids rising from the desert plateau, guarding secrets of a civilization lost to time.",
    fullDescription:
      "The Pyramids of Giza stand as humanity's most enduring testament to ancient ambition. Built over 4,500 years ago, these three colossal structures — Khufu, Khafre, and Menkaure — rise from the Giza Plateau on the western bank of the Nile. The Great Pyramid of Khufu originally stood 146 metres tall and remained the world's tallest man-made structure for nearly 4,000 years. Alongside them the Great Sphinx gazes eternally eastward, a silent guardian carved from a single limestone block. Exploring the complex reveals not only the pyramids themselves but workers' villages, royal boat pits, and a sprawling necropolis offering a window into the engineering mastery of the Old Kingdom pharaohs.",
    rating: 4.9,
    reviews: 18420,
    badge: "Wonder of the World",
    featured: true,
    coverImage:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Giza-pyramids.JPG",
    coverPosition: "center 58%",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Giza-pyramids.JPG",
      "https://images.unsplash.com/photo-1539768942893-daf53e448371?w=900&q=80",
      "https://upload.wikimedia.org/wikipedia/commons/a/af/All_Gizah_Pyramids.jpg",
      "https://images.unsplash.com/photo-1553913861-c0fdabce4e5e?w=900&q=80",
    ],
    activities: [
      {
        name: "Camel Ride at Giza Plateau",
        description: "A panoramic ride around the pyramids at golden hour.",
        duration: "1.5 hours",
        price: "From $25",
      },
      {
        name: "Solar Boat Museum Visit",
        description: "Explore the reconstructed royal vessel of Pharaoh Khufu.",
        duration: "45 minutes",
      },
      {
        name: "Great Pyramid Interior Tour",
        description: "Descend into the Grand Gallery and King's Chamber.",
        duration: "1 hour",
        price: "From $35",
      },
    ],
    attractions: [
      "Great Pyramid of Khufu",
      "Sphinx of Giza",
      "Pyramid of Khafre",
      "Pyramid of Menkaure",
      "Solar Boat Museum",
    ],
    bestTimeToVisit: "October to April (cooler months). Avoid summer midday heat.",
    budget: "Mid-Range",
    safetyTips: [
      "Book only licensed guides",
      "Bring sunscreen and water",
      "Agree on camel-ride price before mounting",
    ],
  },
  {
    id: 2,
    name: "Luxor Temple",
    city: "Luxor",
    region: "Upper Egypt",
    type: "Cultural",
    description:
      "A grand ancient Egyptian temple complex standing on the east bank of the Nile, illuminated magnificently each evening under the desert sky.",
    fullDescription:
      "Luxor Temple is one of the finest ancient monuments in the world, located on the east bank of the Nile in the heart of modern Luxor (ancient Thebes). Unlike most temples it was not dedicated to a cult god or a dead pharaoh but to the rejuvenation of kingship. Built largely by Amenhotep III and Ramesses II, the complex features colossal statues, a grand colonnade, and towering pylons adorned with battle reliefs. By night the temple is flooded with warm golden light, transforming its sandstone columns into an otherworldly spectacle. A 3-kilometre sphinx-lined avenue once connected Luxor Temple to the vast Karnak complex. The site has been in continuous religious use for over 3,300 years — Christian church and later a mosque were built within its ancient walls.",
    rating: 4.8,
    reviews: 12340,
    badge: "Ancient Temple",
    featured: false,
    coverImage:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Luxor_Temple_at_night,_Luxor,_Egypt.jpg",
    coverPosition: "center 50%",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Luxor_Temple_at_night,_Luxor,_Egypt.jpg",
      "https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=900&q=80",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/LuxorTemple_Columns_Lightson.jpg/1280px-LuxorTemple_Columns_Lightson.jpg",
      "https://images.unsplash.com/photo-1594555249072-ba0bda2bba16?w=900&q=80",
    ],
    activities: [
      {
        name: "Luxor Temple Night Walk",
        description: "Guided evening tour through illuminated temple columns.",
        duration: "1 hour",
        price: "From $18",
      },
      {
        name: "Corniche Felucca Cruise",
        description: "Relaxing sail on the Nile at sunset.",
        duration: "1 hour",
      },
      {
        name: "Hot Air Balloon over West Bank",
        description: "Dawn flight over the Valley of the Kings and Nile.",
        duration: "1.5 hours",
        price: "From $90",
      },
    ],
    attractions: [
      "Grand Colonnade",
      "Ramesses II Pylon",
      "Sphinx Avenue",
      "Abu el-Haggag Mosque",
      "Luxor Museum (nearby)",
    ],
    bestTimeToVisit: "November to February for comfortable temperatures.",
    budget: "Budget",
    safetyTips: [
      "Dress modestly near religious areas",
      "Carry local currency for entry fees",
      "Bargain respectfully at souvenir stalls",
    ],
  },
  {
    id: 3,
    name: "Abu Simbel",
    city: "Aswan",
    region: "Upper Egypt",
    type: "Cultural",
    description:
      "Two massive rock temples carved into a mountainside by Ramesses II. Twice a year, sunlight aligns perfectly to illuminate the inner sanctuary.",
    fullDescription:
      "Abu Simbel is among the most spectacular archaeological sites in the world — a pair of massive rock temples carved directly into a mountainside in the 13th century BC by Pharaoh Ramesses II. The Great Temple features four colossal 20-metre seated figures at its facade, while the smaller temple honours Queen Nefertari. The temples were relocated entirely between 1964 and 1968 to save them from rising waters caused by the Aswan High Dam — one of the greatest engineering feats of the 20th century. Twice each year, on 22 February and 22 October, sunlight penetrates 65 metres into the Great Temple to illuminate the inner sanctuary statues — a celestial alignment deliberately engineered by ancient architects.",
    rating: 4.9,
    reviews: 9870,
    badge: "UNESCO Heritage",
    featured: true,
    coverImage:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Abu_Simbel_Temple_May_30_2007.jpg",
    coverPosition: "center 42%",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Abu_Simbel_Temple_May_30_2007.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Abu_simbel_grande_tempio_05.jpg/1280px-Abu_simbel_grande_tempio_05.jpg",
      "https://images.unsplash.com/photo-1567360425618-1594206637d2?w=900&q=80",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/AbuSimbelByDaylight.JPG/1280px-AbuSimbelByDaylight.JPG",
    ],
    activities: [
      {
        name: "Abu Simbel Sunrise Tour",
        description: "Early visit to enjoy softer light and fewer crowds.",
        duration: "3 hours",
        price: "From $45",
      },
      {
        name: "Sound and Light Experience",
        description: "Narrated evening show with temple projections.",
        duration: "50 minutes",
      },
      {
        name: "Lake Nasser Boat Trip",
        description: "Cruise on the vast reservoir beside the temple site.",
        duration: "2 hours",
        price: "From $60",
      },
    ],
    attractions: [
      "Great Temple of Ramesses II",
      "Temple of Nefertari",
      "Solar Alignment Chamber",
      "Lake Nasser Waterfront",
    ],
    bestTimeToVisit:
      "October to April. Feb 22 & Oct 22 for solar alignment events.",
    budget: "Mid-Range",
    safetyTips: [
      "Book transport from Aswan in advance",
      "Check solar alignment dates",
      "Carry extra water — very remote location",
    ],
  },
  {
    id: 4,
    name: "Siwa Oasis",
    city: "Siwa",
    region: "Western Desert",
    type: "Eco & Wellness",
    description:
      "A remote paradise of fresh springs, ancient mud-brick ruins, and salt lakes nestled deep in the Sahara — a sanctuary of silence and stars.",
    fullDescription:
      "Siwa Oasis is Egypt's most remote and enchanting destination, a lush pocket of date palms, olive trees and freshwater springs lost in the vastness of the Sahara near the Libyan border. Home to the Siwan Berber people who maintain their own distinct language and customs, Siwa offers a completely different side of Egypt. Alexander the Great visited the Oracle of Amun here in 331 BC seeking confirmation of his divine status. Today visitors float effortlessly in mineral-rich salt lakes, trek through the Great Sand Sea by 4x4, and wander the eerie ruins of Shali — a once-mighty mud-brick citadel dissolved by rare desert rains. At night, the absence of light pollution reveals the Saharan stars in their full brilliance.",
    rating: 4.7,
    reviews: 6210,
    badge: "Desert Gem",
    featured: false,
    coverImage:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Siwa_Oasis,_Western_Desert,_Egypt.jpg",
    coverPosition: "center 58%",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Siwa_Oasis,_Western_Desert,_Egypt.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Siwa_oasis_from_above.jpg/1280px-Siwa_oasis_from_above.jpg",
      "https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=900&q=80",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Siwa_Cleopatra_Spring.jpg/1280px-Siwa_Cleopatra_Spring.jpg",
    ],
    activities: [
      {
        name: "Salt Lake Float",
        description: "Natural floating session in mineral-rich waters.",
        duration: "1 hour",
        price: "From $12",
      },
      {
        name: "Shali Fortress Walk",
        description: "Stroll the old mud-brick citadel and viewpoints.",
        duration: "40 minutes",
      },
      {
        name: "Great Sand Sea 4x4 Safari",
        description: "Drive into the Saharan dunes at golden hour.",
        duration: "3 hours",
        price: "From $55",
      },
    ],
    attractions: [
      "Shali Fortress Ruins",
      "Salt Lakes of Siwa",
      "Oracle Temple of Amun",
      "Cleopatra Spring",
      "Great Sand Sea",
    ],
    bestTimeToVisit: "October to April. Summer is extremely hot (40 °C+).",
    budget: "Budget",
    safetyTips: [
      "Bring ample cash — few ATMs",
      "Respect local Siwan dress code",
      "Book 4x4 trips through registered operators only",
    ],
  },
  {
    id: 5,
    name: "Karnak Temple",
    city: "Luxor",
    region: "Upper Egypt",
    type: "Cultural",
    description:
      "The largest ancient religious site in the world — a vast complex of sanctuaries, pylons, and obelisks built over 2,000 years of pharaonic history.",
    fullDescription:
      "Karnak is the largest religious complex ever built by any civilization. Located in Luxor, this vast walled precinct covers over 200 acres and represents the collective work of 30 pharaohs spanning 2,000 years. The Great Hypostyle Hall alone — a forest of 134 massive papyrus-shaped columns, 12 of them reaching 21 metres high — is one of the most awe-inspiring architectural spaces ever created. The avenue of ram-headed sphinxes connecting Karnak to Luxor Temple stretched 3 kilometres and has been progressively excavated and restored. The famous Sound and Light Show runs nightly, narrating the history of the complex as coloured beams illuminate its ancient sandstone.",
    rating: 4.8,
    reviews: 14100,
    badge: "Ancient Wonder",
    featured: false,
    coverImage: "/images/ancient-ruins-of-karnak-temple-in-egypt.jpg",
    coverPosition: "center 40%",
    images: [
      "/images/ancient-ruins-of-karnak-temple-in-egypt.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Karnak_temple_Hypostyle_hall.jpg/1280px-Karnak_temple_Hypostyle_hall.jpg",
      "https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=900&q=80",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Egypt.Karnak.Sphinxes.01.jpg/1280px-Egypt.Karnak.Sphinxes.01.jpg",
    ],
    activities: [
      {
        name: "Hypostyle Hall Discovery",
        description: "See the giant papyrus-style columns up close with a guide.",
        duration: "1.5 hours",
        price: "From $20",
      },
      {
        name: "Sacred Lake Circuit",
        description: "Guided route around the sacred precinct.",
        duration: "35 minutes",
      },
      {
        name: "Sound and Light Show",
        description: "Evening narrated show illuminating the temple's history.",
        duration: "1 hour",
        price: "From $25",
      },
    ],
    attractions: [
      "Great Hypostyle Hall",
      "Obelisk of Tutmosis I",
      "Sacred Lake",
      "Avenue of Sphinxes",
      "Temple of Amun",
    ],
    bestTimeToVisit: "October to April. Avoid midday in summer.",
    budget: "Budget",
    safetyTips: [
      "Purchase tickets at the entrance kiosk",
      "Guided tours add significant value here",
      "Allow at least 3 hours to explore properly",
    ],
  },
  {
    id: 6,
    name: "White Desert",
    city: "Farafra",
    region: "Western Desert",
    type: "Desert",
    description:
      "A surreal moonscape of chalk-white rock formations sculpted by centuries of wind, glowing ethereally under moonlight in the heart of Egypt.",
    fullDescription:
      "Egypt's White Desert (Sahara el-Beyda) is unlike anywhere else on Earth. Located near Farafra, the landscape consists of vast chalk and limestone expanses sculpted by millennia of wind erosion into fantastical shapes — mushrooms, inselbergs, ice-cream cones, and abstract forms that seem to belong to another planet. By day the formations glow brilliant white against a deep blue sky; under a full moon the desert becomes a ghostly silver landscape of eerie, otherworldly beauty. The near-by Black Desert offers a dramatic volcanic contrast. Desert camps are set up between formations, allowing visitors to experience a night under the unpolluted Saharan sky in complete silence.",
    rating: 4.7,
    reviews: 5430,
    badge: "Natural Marvel",
    featured: false,
    coverImage:
      "https://commons.wikimedia.org/wiki/Special:FilePath/White_Desert,_Egypt.jpg",
    coverPosition: "center 60%",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/White_Desert,_Egypt.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/WD4.jpg/1280px-WD4.jpg",
      "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=900&q=80",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/White_desert_chalk_formation.jpg/1280px-White_desert_chalk_formation.jpg",
    ],
    activities: [
      {
        name: "White Desert 4x4 Safari",
        description: "Drive between iconic chalk formations and dunes.",
        duration: "4 hours",
        price: "From $60",
      },
      {
        name: "Desert Camp Stargazing",
        description: "Night sky session in a remote low-light zone.",
        duration: "2 hours",
      },
      {
        name: "Black Desert Detour",
        description: "Visit the contrasting dark volcanic landscape nearby.",
        duration: "1 hour",
        price: "From $20",
      },
    ],
    attractions: [
      "Chalk Rock Formations",
      "Crystal Mountain",
      "Black Desert",
      "Agabat Valley",
      "Ain Khudra Oasis",
    ],
    bestTimeToVisit: "October to March. Full-moon nights for magical illumination.",
    budget: "Budget",
    safetyTips: [
      "Always go with a licensed desert guide",
      "Carry extra fuel and water",
      "Tell someone your itinerary before heading out",
    ],
  },
  {
    id: 7,
    name: "Bibliotheca Alexandrina",
    city: "Alexandria",
    region: "Mediterranean Coast",
    type: "Cultural",
    description:
      "A breathtaking modern homage to the legendary ancient Library of Alexandria — a beacon of knowledge overlooking the Mediterranean Sea.",
    fullDescription:
      "The Bibliotheca Alexandrina is a stunning contemporary landmark on the Mediterranean shore of Alexandria, inaugurated in 2002. It was conceived as a reincarnation of the legendary ancient Library, once the greatest repository of knowledge in the ancient world. Designed by Norwegian firm Snøhetta, the building's most distinctive feature is its massive tilted disc roof covered with granite panels inscribed with characters from 120 scripts. Inside, the main reading room descends in terraced levels flooded with natural light and housing over 8 million books. The complex includes six specialist libraries, four museums, a planetarium and multiple art galleries. Alexandria itself blends Greek, Roman, Islamic, and Cosmopolitan heritage into a relaxed Mediterranean personality entirely different from Cairo.",
    rating: 4.6,
    reviews: 8760,
    badge: "Icon of Knowledge",
    featured: false,
    coverImage:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Alexandrina_Library_in_Alexandria,_Egypt._03.jpg",
    coverPosition: "center 52%",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Alexandrina_Library_in_Alexandria,_Egypt._03.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Bibliotheca_Alexandria.jpg/1280px-Bibliotheca_Alexandria.jpg",
      "https://images.unsplash.com/photo-1589487391730-58f20eb2c308?w=900&q=80",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Bibliotheca_Alexandrina_-_Reading_hall.jpg/1280px-Bibliotheca_Alexandrina_-_Reading_hall.jpg",
    ],
    activities: [
      {
        name: "Main Reading Hall Tour",
        description: "Architectural walk through the iconic sloped library hall.",
        duration: "50 minutes",
        price: "From $10",
      },
      {
        name: "Planetarium Show",
        description: "Immersive science projection experience.",
        duration: "30 minutes",
      },
      {
        name: "Citadel of Qaitbay Visit",
        description:
          "15th-century fort built on the site of the ancient Pharos Lighthouse.",
        duration: "1 hour",
        price: "From $8",
      },
    ],
    attractions: [
      "Main Reading Hall",
      "Planetarium",
      "Antiquities Museum",
      "Citadel of Qaitbay (nearby)",
      "Stanley Beach",
    ],
    bestTimeToVisit:
      "March to May and September to November for mild Mediterranean weather.",
    budget: "Budget",
    safetyTips: [
      "Photography rules strictly enforced inside",
      "Smart-casual dress recommended",
      "Combine with a walk along the Corniche",
    ],
  },
  {
    id: 8,
    name: "Ras Mohamed",
    city: "Sharm El-Sheikh",
    region: "South Sinai",
    type: "Sea & Diving",
    description:
      "Egypt's premier marine national park where the Red Sea reveals an underwater kingdom of vibrant coral walls, sea turtles, and reef sharks.",
    fullDescription:
      "Ras Mohamed National Park occupies the southern tip of the Sinai Peninsula, where the Gulf of Suez meets the Gulf of Aqaba in a convergence that creates one of the richest marine ecosystems in the world. Declared a national park in 1983, the park protects the famous Shark and Jolanda reefs: home to more than 1,000 species of fish, giant groupers, eagle rays, sea turtles, reef sharks, and walls of soft coral descending to dizzying depths. The park also contains mangrove channels, salt flats, and fossilised-coral cliffs harbouring unique bird colonies. Snorkellers and divers from around the world travel here to witness marine biodiversity that rivals the finest sites in the Indo-Pacific.",
    rating: 4.8,
    reviews: 10980,
    badge: "Marine Reserve",
    featured: true,
    coverImage:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Coral_reef_in_Ras_Muhammad_nature_park.JPG",
    coverPosition: "center",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Coral_reef_in_Ras_Muhammad_nature_park.JPG",
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=900&q=80",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Ras_Mohammed_Egypt.jpg/1280px-Ras_Mohammed_Egypt.jpg",
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=900&q=80",
    ],
    activities: [
      {
        name: "Coral Reef Snorkeling",
        description: "Shallow-water reef session with a marine guide.",
        duration: "2 hours",
        price: "From $35",
      },
      {
        name: "Shark Reef Scuba Dive",
        description: "Guided dive on the world-famous Shark Reef wall.",
        duration: "3 hours",
        price: "From $80",
      },
      {
        name: "Mangrove Channel Boat Stop",
        description: "Short eco stop near unique Red Sea mangroves.",
        duration: "35 minutes",
      },
    ],
    attractions: [
      "Shark Reef",
      "Jolanda Reef",
      "Anemone City",
      "Mangrove Channels",
      "Yolanda Shipwreck",
    ],
    bestTimeToVisit:
      "Year-round. September to November for calmest seas and best visibility.",
    budget: "Mid-Range",
    safetyTips: [
      "Never touch or stand on coral",
      "Follow all national park regulations",
      "Book diving with certified PADI/SSI operators only",
    ],
  },
  {
    id: 9,
    name: "Valley of the Kings",
    city: "Luxor",
    region: "Upper Egypt",
    type: "Cultural",
    description:
      "The royal necropolis of ancient Egypt's greatest pharaohs. Sixty-three tombs carved into limestone cliffs, adorned with vivid hieroglyphic murals.",
    fullDescription:
      "The Valley of the Kings is the royal necropolis of the New Kingdom pharaohs, situated on the west bank of the Nile opposite Luxor. For nearly 500 years, from the 16th to the 11th century BC, the valley served as a burial ground for pharaohs and nobles of the 18th, 19th, and 20th dynasties. Sixty-three tombs have been discovered here, including the intact tomb of Tutankhamun found by Howard Carter in 1922 — yielding a treasure that astonished the world. The tombs are decorated floor-to-ceiling with vivid hieroglyphic paintings depicting scenes from the Book of the Dead and the pharaoh's journey through the afterlife. The Valley is also close to the Workers' Village of Deir el-Medina, where the artisans who built the royal tombs lived.",
    rating: 4.9,
    reviews: 16230,
    badge: "Royal Necropolis",
    featured: true,
    coverImage:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Valley_of_the_Kings_panorama.jpg",
    coverPosition: "center 42%",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Valley_of_the_Kings_panorama.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Valley_of_the_Kings%2C_Luxor%2C_Egypt.jpg/1280px-Valley_of_the_Kings%2C_Luxor%2C_Egypt.jpg",
      "https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=900&q=80",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Houghton_Typ_575.72.553_-_Valley_of_the_Kings.jpg/1280px-Houghton_Typ_575.72.553_-_Valley_of_the_Kings.jpg",
    ],
    activities: [
      {
        name: "Royal Tomb Circuit",
        description: "Visit selected pharaonic tombs with painted burial chambers.",
        duration: "2.5 hours",
        price: "From $30",
      },
      {
        name: "Tutankhamun's Tomb Visit",
        description: "See the intact burial chamber of the boy king.",
        duration: "45 minutes",
        price: "From $20 extra",
      },
      {
        name: "Valley Panorama Stop",
        description: "Photo stop at the elevated lookout over the valley.",
        duration: "20 minutes",
      },
    ],
    attractions: [
      "Tomb of Tutankhamun (KV62)",
      "Tomb of Ramesses VI",
      "Tomb of Seti I",
      "Workers' Village of Deir el-Medina",
      "Temple of Hatshepsut (nearby)",
    ],
    bestTimeToVisit: "October to April. Avoid June to August if possible.",
    budget: "Budget",
    safetyTips: [
      "Photography is banned inside most tombs",
      "Purchase group and individual tomb tickets carefully",
      "Book a West Bank full-day tour for best value",
    ],
  },
];

// ─── Arabic translations ────────────────────────────────────────────────────────

type ArTranslation = Partial<
  Pick<
    Destination,
    | "name"
    | "city"
    | "region"
    | "description"
    | "fullDescription"
    | "badge"
    | "attractions"
    | "bestTimeToVisit"
    | "safetyTips"
  >
>;

export const destinationsArById: Record<number, ArTranslation> = {
  1: {
    name: "أهرامات الجيزة",
    city: "القاهرة",
    region: "القاهرة الكبرى",
    description:
      "آخر عجائب العالم القديم الباقية. ثلاث أهرامات عملاقة ترتفع فوق هضبة الجيزة وتحرس أسرار حضارة خالدة.",
    fullDescription:
      "تقف أهرامات الجيزة شاهداً خالداً على عبقرية الإنسان القديم. بُنيت منذ أكثر من 4500 عام، وتضم هرم خوفو العظيم الذي كان أطول مبنى في العالم لقرابة أربعة آلاف سنة، إلى جانب أبو الهول الشامخ القابع بصمت أبدي. استكشاف الموقع يكشف عن قرى العمال وحفر المراكب الملكية ومنطقة دفن واسعة تقدم نافذة على الإنجاز الهندسي لفراعنة الدولة القديمة.",
    badge: "عجيبة عالمية",
    attractions: ["هرم خوفو الأكبر", "أبو الهول", "هرم خفرع", "هرم منقرع", "متحف المركب الشمسية"],
    bestTimeToVisit: "أكتوبر حتى أبريل (طقس معتدل). تجنّب حرارة القيلولة صيفاً.",
    safetyTips: ["استعن بمرشد سياحي مرخّص", "احمل زجاجة ماء وواقياً من الشمس", "اتفق على سعر ركوب الجمل قبل الصعود"],
  },
  2: {
    name: "معبد الأقصر",
    city: "الأقصر",
    region: "صعيد مصر",
    description:
      "مجمع معابد مصري عريق على الضفة الشرقية للنيل يتوهج ليلاً في مشهد مهيب.",
    badge: "معبد أثري",
    attractions: ["البهو الكبير", "صرح رمسيس الثاني", "طريق الكباش", "مسجد أبو الحجاج", "متحف الأقصر (بالقرب)"],
    bestTimeToVisit: "نوفمبر حتى فبراير للطقس المناسب.",
    safetyTips: ["ارتدِ ملابس محتشمة عند المواقع الدينية", "احمل عملة محلية لرسوم الدخول", "تفاوض باحترام مع باعة التحف"],
  },
  3: {
    name: "أبو سمبل",
    city: "أسوان",
    region: "صعيد مصر",
    description:
      "معبدان منحوتان في الجبل شيّدهما رمسيس الثاني، وتتعامد الشمس داخلهما مرتين سنوياً.",
    badge: "تراث عالمي",
    attractions: ["المعبد الكبير لرمسيس الثاني", "معبد نفرتاري", "غرفة التعامد الشمسي", "واجهة بحيرة ناصر"],
    bestTimeToVisit: "أكتوبر حتى أبريل. 22 فبراير و22 أكتوبر لظاهرة التعامد الشمسي.",
    safetyTips: ["احجز وسيلة النقل من أسوان مسبقاً", "تحقق من تواريخ التعامد إن كان هدفك مشاهدتها", "احمل مياهاً إضافية — موقع نائٍ جداً"],
  },
  4: {
    name: "واحة سيوة",
    city: "سيوة",
    region: "الصحراء الغربية",
    description:
      "جنة صحراوية من العيون والبحيرات المالحة والأطلال الطينية القديمة في قلب الصحراء.",
    badge: "جوهرة الصحراء",
    attractions: ["قلعة شالي", "بحيرات سيوة المالحة", "معبد الوحي", "عين كليوباترا", "بحر الرمال الكبير"],
    bestTimeToVisit: "أكتوبر حتى أبريل. الصيف شديد الحرارة (يتجاوز 40 درجة).",
    safetyTips: ["احمل نقوداً كافية — محطات الصراف نادرة", "احترم عادات السيوانيين وكرامتهم", "احجز رحلات الصحراء عبر مشغّلين مرخَّصين"],
  },
  5: {
    name: "معبد الكرنك",
    city: "الأقصر",
    region: "صعيد مصر",
    description:
      "أكبر موقع ديني أثري في العالم يضم صروحاً وأعمدة ومسلات شُيّدت عبر قرون طويلة.",
    badge: "أعجوبة أثرية",
    attractions: ["قاعة الأعمدة الكبرى", "مسلة تحتمس الأول", "البحيرة المقدسة", "طريق الكباش", "معبد آمون"],
    bestTimeToVisit: "أكتوبر حتى أبريل. تجنّب الظهيرة صيفاً.",
    safetyTips: ["اشترِ التذاكر عند بوابة المدخل", "الجولات المصحوبة تُضيف قيمة هائلة هنا", "خصص ثلاث ساعات على الأقل للاستكشاف"],
  },
  6: {
    name: "الصحراء البيضاء",
    city: "الفرافرة",
    region: "الصحراء الغربية",
    description:
      "تشكيلات طباشيرية بيضاء نحتتها الرياح عبر الزمن لتصنع مشهداً قمرياً فريداً في قلب مصر.",
    badge: "أعجوبة طبيعية",
    attractions: ["تكوينات الصخر الطباشيري", "جبل الكريستال", "الصحراء السوداء", "وادي العقبة", "واحة عين خضرة"],
    bestTimeToVisit: "أكتوبر حتى مارس. ليالي البدر للإضاءة الساحرة.",
    safetyTips: ["لا تذهب دون مرشد صحراوي مرخّص", "احمل وقوداً ومياهاً إضافيين", "أخبر شخصاً بخطة رحلتك قبل المغادرة"],
  },
  7: {
    name: "مكتبة الإسكندرية",
    city: "الإسكندرية",
    region: "ساحل المتوسط",
    description:
      "صرح ثقافي حديث يستلهم مكتبة الإسكندرية القديمة ويطل على البحر المتوسط.",
    badge: "منارة المعرفة",
    attractions: ["قاعة القراءة الرئيسية", "قبة الفلك", "متحف آثار المكتبة", "قلعة قايتباي (بالقرب)", "شاطئ ستانلي"],
    bestTimeToVisit: "مارس حتى مايو وسبتمبر حتى نوفمبر لطقس البحر المتوسط المعتدل.",
    safetyTips: ["قواعد التصوير صارمة داخل المبنى", "يُنصح بالمظهر الرسمي المريح", "ادمج زيارتك بجولة على كورنيش الإسكندرية"],
  },
  8: {
    name: "رأس محمد",
    city: "شرم الشيخ",
    region: "جنوب سيناء",
    description:
      "أشهر محمية بحرية في مصر بعالم ساحر من الشعاب المرجانية والسلاحف وأسماك القرش.",
    badge: "محمية بحرية",
    attractions: ["شعاب القرش", "شعب يولاندا", "مدينة الشقائق", "قنوات المانجروف", "حطام السفينة يولاندا"],
    bestTimeToVisit: "طوال العام. سبتمبر حتى نوفمبر لأهدأ البحار وأفضل الرؤية.",
    safetyTips: ["لا تلمس الشعاب المرجانية أبداً", "التزم بلوائح المحمية الوطنية", "احجز الغوص مع مشغّلين معتمدين (PADI/SSI) فقط"],
  },
  9: {
    name: "وادي الملوك",
    city: "الأقصر",
    region: "صعيد مصر",
    description:
      "مقابر ملوك مصر القديمة المنحوتة في الجبال والمزينة بنقوش مذهلة تحكي التاريخ.",
    badge: "جبانة الملوك",
    attractions: ["مقبرة توت عنخ آمون (KV62)", "مقبرة رمسيس السادس", "مقبرة سيتي الأول", "قرية العمال دير المدينة", "معبد حتشبسوت (بالقرب)"],
    bestTimeToVisit: "أكتوبر حتى أبريل. تجنّب يونيو حتى أغسطس إن أمكن.",
    safetyTips: ["التصوير محظور داخل معظم المقابر", "اختر تذاكر المجموعة والمقابر الفردية بعناية", "احجز جولة الضفة الغربية اليومية لأفضل قيمة"],
  },
};

// ─── Helpers ────────────────────────────────────────────────────────────────────

export function getLocalizedDestination(dest: Destination, isAr: boolean): Destination {
  if (!isAr) return dest;
  const ar = destinationsArById[dest.id];
  if (!ar) return dest;
  return {
    ...dest,
    name: ar.name ?? dest.name,
    city: ar.city ?? dest.city,
    region: ar.region ?? dest.region,
    description: ar.description ?? dest.description,
    fullDescription: ar.fullDescription ?? dest.fullDescription,
    badge: ar.badge ?? dest.badge,
    attractions: ar.attractions ?? dest.attractions,
    bestTimeToVisit: ar.bestTimeToVisit ?? dest.bestTimeToVisit,
    safetyTips: ar.safetyTips ?? dest.safetyTips,
  };
}

export function getDestinationById(id: number): Destination | undefined {
  return destinationsEn.find((d) => d.id === id);
}

export const typeColors: Record<DestinationType, { bg: string; border: string; text: string }> = {
  "Cultural":      { bg: "rgba(201,168,76,0.12)",  border: "rgba(201,168,76,0.35)",  text: "#C9A84C" },
  "Eco & Wellness":{ bg: "rgba(74,139,92,0.12)",   border: "rgba(74,139,92,0.35)",   text: "#4A8B5C" },
  "Desert":        { bg: "rgba(212,129,58,0.12)",  border: "rgba(212,129,58,0.35)",  text: "#D4813A" },
  "Sea & Diving":  { bg: "rgba(42,123,155,0.12)",  border: "rgba(42,123,155,0.35)",  text: "#2A7B9B" },
};

export const typeFallbackImages: Record<DestinationType, string> = {
  "Cultural":      "/images/cultural.jfif",
  "Eco & Wellness":"/images/eco.jfif",
  "Desert":        "/images/texture.jfif",
  "Sea & Diving":  "/images/sharm-el-sheikh.avif",
};

export const typeLabelAr: Record<DestinationType, string> = {
  "Cultural":      "ثقافي",
  "Eco & Wellness":"بيئي واستجمام",
  "Desert":        "صحراوي",
  "Sea & Diving":  "بحري وغوص",
};
