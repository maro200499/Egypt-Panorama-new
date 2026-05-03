"use client";

import { useLocale } from "next-intl";
import { useState, useEffect, useMemo, useRef } from "react";
import DestinationCard from "@/components/destinations/DestinationCard";
import {
  type Destination,
  type DestinationType,
} from "@/lib/destinationsData";
import { API_ENDPOINTS, apiFetch, type ApiDestination } from "@/lib/api";

type FilterOption = "All" | DestinationType;
type SortOption = "popular" | "rating" | "reviews" | "alpha";

function useInView<T extends HTMLElement>(
  threshold = 0.1
): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setInView(true);
      },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, inView];
}

const DESTINATION_FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1539768942893-daf53e448371?w=1200&q=85",
  "https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=1200&q=85",
  "https://images.unsplash.com/photo-1609951651556-5334e2706168?w=1200&q=85",
  "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=85",
  "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=1200&q=85",
  "https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?w=1200&q=85",
];

const DESTINATION_TYPES: DestinationType[] = [
  "Cultural",
  "Desert",
  "Sea & Diving",
  "Eco & Wellness",
];

function mapDestinationType(value: string | null | undefined): DestinationType {
  const normalized = (value ?? "").trim().toLowerCase();

  if (normalized === "desert") return "Desert";
  if (normalized === "sea" || normalized === "diving" || normalized === "sea & diving") return "Sea & Diving";
  if (normalized === "eco" || normalized === "wellness" || normalized === "eco & wellness") return "Eco & Wellness";
  return "Cultural";
}

function parseGalleryImages(raw: string | null | undefined): string[] {
  const value = (raw ?? "").trim();
  if (!value) return [];

  if (value.startsWith("[")) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
      }
    } catch {
      // Fall through to comma-separated parser.
    }
  }

  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function toDestinationCardModel(item: ApiDestination, index: number): Destination {
  const name = item.name?.trim() || `Destination ${index + 1}`;
  const city = item.city?.trim() || "";
  const type = mapDestinationType(item.type);
  const fallbackImage = DESTINATION_FALLBACK_IMAGES[index % DESTINATION_FALLBACK_IMAGES.length];
  const parsedGallery = parseGalleryImages(item.gallery_images);
  const coverFromDb = (item.cover_image ?? "").trim();
  const image = coverFromDb || parsedGallery[0] || fallbackImage;
  const numericId = Number(item.id);
  const id = Number.isFinite(numericId) ? numericId : index + 1;

  return {
    id,
    name,
    city,
    region: city,
    type,
    description: "",
    fullDescription: `${name} offers a rich travel experience in ${city}, blending history, culture, and unforgettable scenery.`,
    rating: 4.3 + (index % 6) * 0.1,
    reviews: 1200 + index * 137,
    badge: "Egypt Highlight",
    featured: index < 3,
    coverImage: image,
    coverPosition: "center",
    images: parsedGallery.length > 0 ? parsedGallery : [image, image, image, image],
    activities: [],
    attractions: [name],
    bestTimeToVisit: "October to April",
    budget: "Mid-Range",
    safetyTips: ["Use trusted local guides", "Stay hydrated"],
  };
}

function getFreshDestinationsEndpoint(): string {
  const separator = API_ENDPOINTS.destinations.includes("?") ? "&" : "?";
  return `${API_ENDPOINTS.destinations}${separator}_t=${Date.now()}`;
}

export default function DestinationsPage() {
  const locale = useLocale();
  const isAr = locale === "ar";

  const [active, setActive] = useState<FilterOption>("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loadingDestinations, setLoadingDestinations] = useState(true);
  const [destinationsError, setDestinationsError] = useState<string | null>(null);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [sectionRef, sectionInView] = useInView<HTMLElement>(0.05);

  useEffect(() => {
    setTimeout(() => setHeroLoaded(true), 100);
  }, []);

  const loadDestinations = async () => {
    setLoadingDestinations(true);
    setDestinationsError(null);

    try {
      const data = await apiFetch<ApiDestination[]>(getFreshDestinationsEndpoint());
      const mapped = Array.isArray(data)
        ? data.map((item, index) => toDestinationCardModel(item, index))
        : [];
      setDestinations(mapped);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load destinations.";
      setDestinationsError(message);
    } finally {
      setLoadingDestinations(false);
    }
  };

  useEffect(() => {
    void loadDestinations();
  }, []);

  useEffect(() => {
    const handleWindowFocus = () => {
      void loadDestinations();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void loadDestinations();
      }
    };

    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const filterLabels: { value: FilterOption; label: string }[] = isAr
    ? [
        { value: "All", label: "الكل" },
        { value: "Cultural", label: "ثقافي" },
        { value: "Desert", label: "صحراوي" },
        { value: "Sea & Diving", label: "بحري وغوص" },
        { value: "Eco & Wellness", label: "بيئي واستجمام" },
      ]
    : [
        { value: "All", label: "All" },
        { value: "Cultural", label: "Cultural" },
        { value: "Desert", label: "Desert" },
        { value: "Sea & Diving", label: "Sea & Diving" },
        { value: "Eco & Wellness", label: "Eco & Wellness" },
      ];

  const sortLabels: { value: SortOption; label: string }[] = isAr
    ? [
        { value: "popular", label: "الأكثر شيوعاً" },
        { value: "rating", label: "الأعلى تقييماً" },
        { value: "reviews", label: "الأكثر مراجعات" },
        { value: "alpha", label: "أبجدي" },
      ]
    : [
        { value: "popular", label: "Most Popular" },
        { value: "rating", label: "Top Rated" },
        { value: "reviews", label: "Most Reviewed" },
        { value: "alpha", label: "A-Z" },
      ];

  const copy = {
    heroTop: isAr ? "أفضل" : "Top",
    heroHighlight: isAr ? "الوجهات" : "Destinations",
    heroSub: isAr ? "في مصر" : "in Egypt",
    heroDesc: isAr
      ? "استكشف أشهر الأماكن في مصر — من العجائب الأثرية إلى المناظر الطبيعية المذهلة."
      : "Explore the most iconic places across Egypt — from ancient wonders to breathtaking natural landscapes.",
    search: isAr ? "ابحث عن وجهات، مدن، مناطق…" : "Search destinations, cities, regions…",
    sort: isAr ? "ترتيب" : "Sort",
    featuredOnly: isAr ? "المميز فقط" : "Featured Only",
    showingFeatured: isAr ? "عرض المميز" : "Showing Featured",
    countSuffix: isAr ? "وجهة" : "destination",
    countSuffixPlural: isAr ? "وجهات" : "destinations",
    countFound: isAr ? "متاحة" : "found",
    discoverEgypt: isAr ? "اكتشف مصر" : "Discover Egypt",
    noResults: isAr ? "لا توجد نتائج مطابقة" : "No destinations found",
    noResultsHint: isAr ? "جرّب بحثاً أو فلتراً مختلفاً" : "Try a different search or filter",
    loading: isAr ? "جاري تحميل الوجهات..." : "Loading destinations...",
    loadError: isAr ? "تعذر تحميل الوجهات" : "Failed to load destinations",
    retry: isAr ? "إعادة المحاولة" : "Retry",
    scroll: isAr ? "مرر" : "Scroll",
    bannerTitle1: isAr ? "كل رحلة تبدأ" : "Every Journey Begins With",
    bannerTitle2: isAr ? "بخطوة واحدة" : "a Single Step",
    bannerDesc: isAr
      ? "استخدم الخريطة التفاعلية لاستكشاف وجهات مصر بصرياً."
      : "Use our interactive map to explore Egypt's destinations visually.",
    openMap: isAr ? "افتح الخريطة التفاعلية" : "Open Interactive Map",
  };

  const filtered = useMemo(() => {
    const base = destinations.filter((d) => {
      const matchType = active === "All" || d.type === active;
      const matchSearch =
        search === "" ||
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.city.toLowerCase().includes(search.toLowerCase()) ||
        d.region.toLowerCase().includes(search.toLowerCase());
      const matchFeatured = !featuredOnly || d.featured;
      return matchType && matchSearch && matchFeatured;
    });
    const sorted = [...base];
    if (sortBy === "rating") sorted.sort((a, b) => b.rating - a.rating);
    if (sortBy === "reviews") sorted.sort((a, b) => b.reviews - a.reviews);
    if (sortBy === "alpha") sorted.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === "popular")
      sorted.sort(
        (a, b) =>
          b.rating * 1000 + b.reviews - (a.rating * 1000 + a.reviews)
      );
    return sorted;
  }, [active, search, featuredOnly, sortBy, destinations]);

  /* ── font shortcuts ── */
  const K = "'Cinzel', serif";
  const KD = "'Cinzel Decorative', serif";
  const L = "'Lora', serif";
  const GGOLD = "linear-gradient(135deg, #E8C97A, #E8A000, #C9762A)";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Cinzel:wght@400;600;700&family=Lora:ital,wght@0,400;1,400&display=swap');
        @keyframes scrollBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(8px)} }
        @keyframes shine { to { background-position-x: -200%; } }
      `}</style>

      <div
        style={{
          background: "#0D0A06",
          minHeight: "100vh",
          fontFamily: L,
          color: "#F7F0E3",
        }}
      >
        {/* ── HERO ─────────────────────────────────────────── */}
        <section
          style={{
            position: "relative",
            minHeight: "88vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "url('https://images.unsplash.com/photo-1539768942893-daf53e448371?w=1600&q=85')",
              backgroundSize: "cover",
              backgroundPosition: "center 40%",
              transform: "scale(1.05)",
              filter: "brightness(0.35) saturate(0.8)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(13,10,6,0.5) 0%, rgba(13,10,6,0.2) 40%, rgba(13,10,6,0.85) 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse 60% 80% at 50% 50%, rgba(232,160,0,0.04) 0%, transparent 70%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.025,
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 79px, rgba(232,160,0,1) 79px, rgba(232,160,0,1) 80px), repeating-linear-gradient(90deg, transparent, transparent 79px, rgba(232,160,0,1) 79px, rgba(232,160,0,1) 80px)",
            }}
          />
          {/* Ornamental frame */}
          <div
            style={{
              position: "absolute",
              inset: "2rem",
              border: "1px solid rgba(232,160,0,0.12)",
              pointerEvents: "none",
            }}
          >
            {[
              { top: "-5px", left: "-5px" },
              { top: "-5px", right: "-5px" },
              { bottom: "-5px", left: "-5px" },
              { bottom: "-5px", right: "-5px" },
            ].map((pos, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  ...pos,
                  width: "10px",
                  height: "10px",
                  background: "#E8A000",
                  opacity: 0.5,
                  clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                }}
              />
            ))}
          </div>

          {/* Hero content */}
          <div
            style={{
              position: "relative",
              zIndex: 2,
              textAlign: "center",
              padding: "4rem 2rem",
              maxWidth: "860px",
            }}
          >
            <div
              style={{
                fontFamily: K,
                fontSize: "0.7rem",
                letterSpacing: "0.45em",
                color: "#E8A000",
                textTransform: "uppercase",
                marginBottom: "1.8rem",
                opacity: heroLoaded ? 1 : 0,
                transform: heroLoaded ? "translateY(0)" : "translateY(20px)",
                transition:
                  "opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "1rem",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: "40px",
                  height: "1px",
                  background: "#E8A000",
                  opacity: 0.5,
                }}
              />
              Egypt Panorama
              <span
                style={{
                  display: "inline-block",
                  width: "40px",
                  height: "1px",
                  background: "#E8A000",
                  opacity: 0.5,
                }}
              />
            </div>

            <h1
              style={{
                fontFamily: KD,
                fontSize: "clamp(2.4rem, 7vw, 5.5rem)",
                fontWeight: 900,
                lineHeight: 1.1,
                color: "#F7F0E3",
                marginBottom: "0.15em",
                opacity: heroLoaded ? 1 : 0,
                transform: heroLoaded ? "translateY(0)" : "translateY(30px)",
                transition:
                  "opacity 0.9s ease 0.4s, transform 0.9s ease 0.4s",
              }}
            >
              {copy.heroTop}{" "}
              <span
                style={{
                  background: GGOLD,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {copy.heroHighlight}
              </span>
              <br />
              {copy.heroSub}
            </h1>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "1rem",
                margin: "2rem 0",
                opacity: heroLoaded ? 1 : 0,
                transition: "opacity 0.8s ease 0.6s",
              }}
            >
              <div
                style={{
                  width: "70px",
                  height: "1px",
                  background: "linear-gradient(90deg, transparent, #E8A000)",
                }}
              />
              <span style={{ color: "#E8A000", fontSize: "1rem" }}>◈</span>
              <div
                style={{
                  width: "70px",
                  height: "1px",
                  background: "linear-gradient(90deg, #E8A000, transparent)",
                }}
              />
            </div>

            <p
              style={{
                fontSize: "clamp(0.95rem, 1.8vw, 1.15rem)",
                lineHeight: 1.85,
                color: "rgba(247,240,227,0.6)",
                fontStyle: "italic",
                maxWidth: "600px",
                margin: "0 auto 2.5rem",
                opacity: heroLoaded ? 1 : 0,
                transform: heroLoaded ? "translateY(0)" : "translateY(20px)",
                transition:
                  "opacity 0.8s ease 0.7s, transform 0.8s ease 0.7s",
              }}
            >
              {copy.heroDesc}
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "2rem",
                flexWrap: "wrap",
                opacity: heroLoaded ? 1 : 0,
                transition: "opacity 0.8s ease 0.9s",
              }}
            >
              {[
                {
                  n: "9+",
                  l: isAr ? "وجهات" : "Destinations",
                },
                {
                  n: "4",
                  l: isAr ? "أنواع سياحة" : "Tourism Types",
                },
                {
                  n: "7,000",
                  l: isAr ? "سنة من التاريخ" : "Years of History",
                },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontFamily: KD,
                      fontSize: "1.6rem",
                      fontWeight: 900,
                      color: "#E8A000",
                      lineHeight: 1,
                    }}
                  >
                    {s.n}
                  </div>
                  <div
                    style={{
                      fontFamily: K,
                      fontSize: "0.6rem",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: "rgba(247,240,227,0.35)",
                      marginTop: "4px",
                    }}
                  >
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll indicator */}
          <div
            style={{
              position: "absolute",
              bottom: "2rem",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
              animation: "scrollBounce 2s ease infinite",
              opacity: 0.4,
            }}
          >
            <span
              style={{
                fontFamily: K,
                fontSize: "0.55rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "#E8A000",
              }}
            >
              {copy.scroll}
            </span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#E8A000"
              strokeWidth="1.5"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </section>

        {/* ── FILTER + SEARCH ──────────────────────────────── */}
        <section
          ref={sectionRef}
          style={{ background: "#0D0A06", padding: "4rem 2rem 0" }}
        >
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "2.5rem",
                opacity: sectionInView ? 1 : 0,
                transform: sectionInView
                  ? "translateY(0)"
                  : "translateY(30px)",
                transition: "opacity 0.7s ease, transform 0.7s ease",
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: "800px",
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "0.75rem",
                }}
              >
                {/* Search */}
                <div style={{ position: "relative" }}>
                  <svg
                    style={{
                      position: "absolute",
                      left: "16px",
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="rgba(232,160,0,0.5)"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    placeholder={copy.search}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.85rem 1rem 0.85rem 2.8rem",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(232,160,0,0.2)",
                      borderRadius: "10px",
                      color: "#F7F0E3",
                      fontSize: "0.9rem",
                      fontFamily: L,
                      outline: "none",
                      transition: "border-color 0.3s",
                    }}
                    onFocus={(e) =>
                      (e.target.style.borderColor = "rgba(232,160,0,0.5)")
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = "rgba(232,160,0,0.2)")
                    }
                  />
                </div>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  style={{
                    padding: "0.85rem 1rem",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(232,160,0,0.2)",
                    borderRadius: "10px",
                    color: "#F7F0E3",
                    fontSize: "0.85rem",
                    fontFamily: K,
                    letterSpacing: "0.08em",
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  {sortLabels.map((o) => (
                    <option
                      key={o.value}
                      value={o.value}
                      style={{ color: "#0D0A06" }}
                    >
                      {copy.sort}: {o.label}
                    </option>
                  ))}
                </select>

                {/* Featured toggle */}
                <button
                  type="button"
                  onClick={() => setFeaturedOnly((p) => !p)}
                  style={{
                    padding: "0.85rem 1rem",
                    background: featuredOnly
                      ? "linear-gradient(135deg, #E8A000, #C9A84C)"
                      : "rgba(255,255,255,0.04)",
                    border: `1px solid ${
                      featuredOnly
                        ? "transparent"
                        : "rgba(232,160,0,0.2)"
                    }`,
                    borderRadius: "10px",
                    color: featuredOnly ? "#0D0A06" : "#E8C97A",
                    fontFamily: K,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    fontSize: "0.7rem",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                >
                  {featuredOnly ? copy.showingFeatured : copy.featuredOnly}
                </button>
              </div>
            </div>

            {/* Filter pills */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.75rem",
                flexWrap: "wrap",
                marginBottom: "1rem",
                opacity: sectionInView ? 1 : 0,
                transform: sectionInView
                  ? "translateY(0)"
                  : "translateY(20px)",
                transition:
                  "opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s",
              }}
            >
              {filterLabels.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setActive(f.value)}
                  style={{
                    padding: "0.55rem 1.4rem",
                    borderRadius: "30px",
                    border: `1px solid ${
                      active === f.value
                        ? "#E8A000"
                        : "rgba(255,255,255,0.1)"
                    }`,
                    background:
                      active === f.value
                        ? "linear-gradient(135deg, #E8A000, #C9A84C)"
                        : "rgba(255,255,255,0.03)",
                    color:
                      active === f.value
                        ? "#0D0A06"
                        : "rgba(247,240,227,0.55)",
                    fontFamily: K,
                    fontSize: "0.68rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    fontWeight: active === f.value ? 700 : 400,
                    transition: "all 0.3s ease",
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Result count */}
            <div
              style={{
                textAlign: "center",
                marginBottom: "3.5rem",
                fontFamily: K,
                fontSize: "0.65rem",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "rgba(247,240,227,0.25)",
              }}
            >
              {filtered.length}{" "}
              {filtered.length !== 1
                ? copy.countSuffixPlural
                : copy.countSuffix}{" "}
              {copy.countFound}
            </div>

            {/* Section label */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1.5rem",
                marginBottom: "3rem",
              }}
            >
              <div
                style={{
                  fontFamily: K,
                  fontSize: "0.65rem",
                  letterSpacing: "0.4em",
                  textTransform: "uppercase",
                  color: "#E8A000",
                  whiteSpace: "nowrap",
                }}
              >
                {copy.discoverEgypt}
              </div>
              <div
                style={{
                  flex: 1,
                  height: "1px",
                  background: "rgba(232,160,0,0.15)",
                }}
              />
              <div
                style={{
                  fontFamily: KD,
                  fontSize: "0.7rem",
                  color: "rgba(247,240,227,0.2)",
                }}
              >
                ◈
              </div>
            </div>
          </div>
        </section>

        {/* ── CARD GRID ────────────────────────────────────── */}
        <section style={{ padding: "0 2rem 8rem" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            {loadingDestinations ? (
              <>
                <div
                  style={{
                    textAlign: "center",
                    marginBottom: "1.5rem",
                    fontFamily: K,
                    fontSize: "0.75rem",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "rgba(247,240,227,0.45)",
                  }}
                >
                  {copy.loading}
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                    gap: "1.8rem",
                  }}
                >
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={`skeleton-${index}`}
                      style={{
                        height: "420px",
                        borderRadius: "16px",
                        border: "1px solid rgba(255,255,255,0.08)",
                        background:
                          "linear-gradient(110deg, rgba(255,255,255,0.03) 8%, rgba(255,255,255,0.08) 18%, rgba(255,255,255,0.03) 33%)",
                        backgroundSize: "200% 100%",
                        animation: "shine 1.4s linear infinite",
                      }}
                    />
                  ))}
                </div>
              </>
            ) : destinationsError ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "6rem 2rem",
                  color: "rgba(247,240,227,0.3)",
                }}
              >
                <div style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.3 }}>◈</div>
                <p style={{ fontFamily: K, fontSize: "1rem", letterSpacing: "0.1em" }}>
                  {copy.loadError}
                </p>
                <p style={{ fontSize: "0.85rem", marginTop: "0.5rem", fontStyle: "italic" }}>
                  {destinationsError}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    void loadDestinations();
                  }}
                  style={{
                    marginTop: "1.3rem",
                    padding: "0.7rem 1.8rem",
                    borderRadius: "8px",
                    border: "1px solid rgba(232,160,0,0.4)",
                    background: "transparent",
                    color: "#E8A000",
                    fontFamily: K,
                    fontSize: "0.68rem",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                  }}
                >
                  {copy.retry}
                </button>
              </div>
            ) : filtered.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(320px, 1fr))",
                  gap: "1.8rem",
                }}
              >
                {filtered.map((dest, i) => (
                  <DestinationCard
                    key={dest.id}
                    destination={dest}
                    index={i}
                    isAr={isAr}
                  />
                ))}
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "6rem 2rem",
                  color: "rgba(247,240,227,0.3)",
                }}
              >
                <div
                  style={{
                    fontSize: "3rem",
                    marginBottom: "1rem",
                    opacity: 0.3,
                  }}
                >
                  ◈
                </div>
                <p
                  style={{
                    fontFamily: K,
                    fontSize: "1rem",
                    letterSpacing: "0.1em",
                  }}
                >
                  {copy.noResults}
                </p>
                <p
                  style={{
                    fontSize: "0.85rem",
                    marginTop: "0.5rem",
                    fontStyle: "italic",
                  }}
                >
                  {copy.noResultsHint}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ── BOTTOM BANNER ────────────────────────────────── */}
        <section
          style={{
            background:
              "linear-gradient(135deg, #0A0600 0%, #1A1208 50%, #0A1A28 100%)",
            padding: "6rem 2rem",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            borderTop: "1px solid rgba(232,160,0,0.1)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse 60% 80% at 50% 50%, rgba(232,160,0,0.05) 0%, transparent 70%)",
            }}
          />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div
              style={{
                fontSize: "2rem",
                color: "#E8A000",
                opacity: 0.3,
                marginBottom: "1.5rem",
              }}
            >
              𓂀
            </div>
            <h2
              style={{
                fontFamily: KD,
                fontSize: "clamp(1.6rem, 4vw, 3rem)",
                fontWeight: 700,
                color: "#F7F0E3",
                marginBottom: "1rem",
                lineHeight: 1.2,
              }}
            >
              {copy.bannerTitle1}
              <br />
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #E8C97A, #E8A000)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {copy.bannerTitle2}
              </span>
            </h2>
            <p
              style={{
                fontSize: "1rem",
                color: "rgba(247,240,227,0.45)",
                fontStyle: "italic",
                maxWidth: "480px",
                margin: "0 auto 2.5rem",
                lineHeight: 1.8,
              }}
            >
              {copy.bannerDesc}
            </p>
            <a
              href="/maps"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.9rem 2.5rem",
                border: "1px solid rgba(232,160,0,0.4)",
                color: "#E8A000",
                fontFamily: K,
                fontSize: "0.72rem",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                textDecoration: "none",
                borderRadius: "6px",
                transition: "all 0.3s",
                background: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#E8A000";
                e.currentTarget.style.color = "#0D0A06";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#E8A000";
              }}
            >
              {copy.openMap} ◈
            </a>
          </div>
        </section>
      </div>
    </>
  );
}
