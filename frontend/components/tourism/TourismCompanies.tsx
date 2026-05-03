"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS, apiFetch } from "@/lib/api";

interface Company {
  id: number;
  name: string;
  city: string;
  region: string;
  rating: number;
  reviews: number;
  description: string;
  image: string;
  imageUrl: string;
  specialties: string[];
  founded: string;
  tier: "Luxury" | "Premium" | "Expert" | "Boutique";
  tierColor: string;
  icon: string;
}

const COMPANY_FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1539768942893-daf53e448371?w=600&q=80",
  "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80",
  "https://images.unsplash.com/photo-1582010940411-0bd6f0a6fefb?w=600&q=80",
  "https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?w=600&q=80",
  "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=600&q=80",
  "https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=600&q=80",
  "https://images.unsplash.com/photo-1547531455-73cf00ae9e5e?w=600&q=80",
  "https://images.unsplash.com/photo-1609951651556-5334e2706168?w=600&q=80",
  "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600&q=80",
];

const TIER_META: Array<{ tier: Company["tier"]; color: string; icon: string }> = [
  { tier: "Luxury", color: "#E8A000", icon: "◈" },
  { tier: "Premium", color: "#C9A84C", icon: "◉" },
  { tier: "Expert", color: "#2A7B9B", icon: "◇" },
  { tier: "Boutique", color: "#4A8B5C", icon: "✦" },
];

function readLocalizedText(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const preferred = record.en ?? record.ar;
    if (typeof preferred === "string") {
      return preferred;
    }
  }

  return "";
}

function toCompanyModel(row: Record<string, unknown>, index: number): Company {
  const numericId = Number(row.company_id ?? row.id);
  const id = Number.isFinite(numericId) ? numericId : index + 1;
  const rating = Number(row.rating ?? 0);
  const normalizedRating = Number.isFinite(rating) && rating > 0 ? Math.min(5, rating) : 4.2;
  const tierMeta = TIER_META[index % TIER_META.length];
  const name = readLocalizedText(row.comp_name ?? row.name) || "Unknown Company";
  const city = readLocalizedText(row.city ?? row.location) || "Cairo";
  const description =
    readLocalizedText(row.description) ||
    "Trusted local tourism company offering curated experiences across Egypt.";
  const imageUrl =
    readLocalizedText(row.image_url ?? row.image) || COMPANY_FALLBACK_IMAGES[index % COMPANY_FALLBACK_IMAGES.length];

  const rawTier = readLocalizedText(row.tier);
  const matchedTier = TIER_META.find((meta) => meta.tier === rawTier);
  const resolvedTier = matchedTier ?? tierMeta;

  const rawSpecialties = row.specialties;
  const specialties = Array.isArray(rawSpecialties)
    ? rawSpecialties.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : rawSpecialties && typeof rawSpecialties === "object"
      ? (() => {
          const localized = (rawSpecialties as Record<string, unknown>).en ?? (rawSpecialties as Record<string, unknown>).ar;
          if (Array.isArray(localized)) {
            return localized.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
          }
          return [];
        })()
      : [];

  return {
    id,
    name,
    city,
    region: "Egypt",
    rating: normalizedRating,
    reviews: Number(row.reviews ?? row.review_count ?? 1200 + index * 173),
    description,
    image: imageUrl,
    imageUrl,
    specialties: specialties.length > 0 ? specialties : ["Cultural Tours", "Custom Itineraries", "Local Experts"],
    founded: String(row.founded ?? 1990 + (index % 25)),
    tier: resolvedTier.tier,
    tierColor: readLocalizedText(row.tierColor ?? row.tier_color) || resolvedTier.color,
    icon: resolvedTier.icon,
  };
}

const TIERS = ["All", "Luxury", "Premium", "Expert", "Boutique"] as const;
const RATINGS = ["All Ratings", "4.8+", "4.5+", "4.0+", "3.5+"] as const;
const MIN_RATING_MAP: Record<string, number> = {
  "All Ratings": 0,
  "4.8+": 4.8,
  "4.5+": 4.5,
  "4.0+": 4.0,
  "3.5+": 3.5,
};

function useInView(threshold = 0.08) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView] as const;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", gap: "2px" }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="11" height="11" viewBox="0 0 24 24">
          <polygon
            points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
            fill={
              i <= Math.floor(rating)
                ? "#E8A000"
                : i === Math.ceil(rating) && rating % 1 >= 0.5
                  ? "#E8A00066"
                  : "#2A2418"
            }
            stroke="#E8A000"
            strokeWidth="1"
          />
        </svg>
      ))}
    </div>
  );
}

function CompanyCard({ company, index }: { company: Company; index: number }) {
  const [ref, inView] = useInView();
  const [hovered, setHovered] = useState(false);
  const router = useRouter();
  const isPhoto1553913861 = company.imageUrl.includes("photo-1553913861");

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#110E09",
        border: `1px solid ${hovered ? `${company.tierColor}55` : "rgba(255,255,255,0.07)"}`,
        borderRadius: "16px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        opacity: inView ? 1 : 0,
        transform: inView ? (hovered ? "translateY(-6px)" : "translateY(0)") : "translateY(44px)",
        transition:
          `opacity 0.65s ease ${(index % 3) * 0.07}s, transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94), border-color 0.3s, box-shadow 0.35s`,
        boxShadow: hovered
          ? `0 22px 55px rgba(0,0,0,0.5), 0 0 0 1px ${company.tierColor}22`
          : "0 4px 20px rgba(0,0,0,0.35)",
        cursor: "pointer",
      }}
      onClick={() => router.push(`/tourism-companies/${company.id}`)}
    >
      <div style={{ position: "relative", height: "190px", overflow: "hidden", flexShrink: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={company.imageUrl}
          alt={company.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: isPhoto1553913861 ? "center 55%" : "center",
            transform: hovered ? "scale(1.08)" : "scale(1)",
            transition: "transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94)",
            filter: isPhoto1553913861 ? "brightness(0.28) saturate(0.8)" : "brightness(0.55) saturate(0.8)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(17,14,9,0.96) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            background: `${company.tierColor}22`,
            border: `1px solid ${company.tierColor}55`,
            color: company.tierColor,
            padding: "3px 10px",
            borderRadius: "20px",
            fontFamily: "'Cinzel', serif",
            fontSize: "9px",
            letterSpacing: "0.1em",
            backdropFilter: "blur(8px)",
          }}
        >
          {company.tier}
        </div>

        <div
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            background: "rgba(13,10,6,0.75)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(247,240,227,0.45)",
            padding: "3px 9px",
            borderRadius: "20px",
            fontFamily: "'Cinzel', serif",
            fontSize: "9px",
            backdropFilter: "blur(8px)",
          }}
        >
          Est. {company.founded}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "12px",
            left: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              background: `${company.tierColor}22`,
              border: `1.5px solid ${company.tierColor}50`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.1rem",
              backdropFilter: "blur(10px)",
              flexShrink: 0,
            }}
          >
            {company.icon}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={company.tierColor} strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span style={{ fontSize: "10px", color: "rgba(247,240,227,0.55)", fontFamily: "'Lora', serif" }}>
                {company.city} · {company.region}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "1.25rem 1.4rem", display: "flex", flexDirection: "column", flex: 1 }}>
        <h3
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: "0.98rem",
            fontWeight: 700,
            color: hovered ? "#E8C97A" : "#F7F0E3",
            margin: "0 0 6px",
            letterSpacing: "0.02em",
            transition: "color 0.3s",
          }}
        >
          {company.name}
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "0.85rem" }}>
          <Stars rating={company.rating} />
          <span style={{ fontFamily: "'Cinzel', serif", fontSize: "11px", color: "#E8A000", fontWeight: 600 }}>
            {company.rating.toFixed(1)}
          </span>
          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.22)" }}>({company.reviews.toLocaleString()})</span>
        </div>

        <p
          style={{
            fontSize: "0.8rem",
            lineHeight: 1.75,
            color: "rgba(247,240,227,0.42)",
            fontFamily: "'Lora', serif",
            fontStyle: "italic",
            margin: "0 0 0.9rem",
            flex: 1,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          } as CSSProperties}
        >
          {company.description}
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "1.1rem" }}>
          {company.specialties.map((specialty) => (
            <span
              key={specialty}
              style={{
                fontSize: "8.5px",
                padding: "2px 8px",
                borderRadius: "20px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(247,240,227,0.32)",
                fontFamily: "'Cinzel', serif",
                letterSpacing: "0.05em",
              }}
            >
              {specialty}
            </span>
          ))}
        </div>

        <div
          style={{
            height: "1px",
            background: hovered ? `linear-gradient(90deg,${company.tierColor}50,transparent)` : "rgba(255,255,255,0.06)",
            marginBottom: "1rem",
            transition: "background 0.4s",
          }}
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.55rem" }}>
          <button
            onClick={(event) => {
              event.stopPropagation();
            }}
            style={{
              padding: "0.65rem 0",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "9px",
              color: "rgba(247,240,227,0.45)",
              fontFamily: "'Cinzel', serif",
              fontSize: "8.5px",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "all 0.25s",
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
              event.currentTarget.style.color = "rgba(247,240,227,0.75)";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
              event.currentTarget.style.color = "rgba(247,240,227,0.45)";
            }}
          >
            View Packages
          </button>
          <button
            onClick={(event) => {
              event.stopPropagation();
              router.push(`/plan?company=${encodeURIComponent(company.name)}`);
            }}
            style={{
              padding: "0.65rem 0",
              background: `linear-gradient(135deg,${company.tierColor},${company.tierColor}BB)`,
              border: "none",
              borderRadius: "9px",
              color: "#0D0A06",
              fontFamily: "'Cinzel', serif",
              fontSize: "8.5px",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              cursor: "pointer",
              fontWeight: 700,
              transition: "opacity 0.25s",
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.opacity = "0.85";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.opacity = "1";
            }}
          >
            Plan Trip →
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TourismCompanies() {
  const [search, setSearch] = useState("");
  const [activeTier, setActiveTier] = useState<string>("All");
  const [activeCity, setActiveCity] = useState<string>("All Cities");
  const [activeRating, setActiveRating] = useState<string>("All Ratings");
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [companiesData, setCompaniesData] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [companiesError, setCompaniesError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => setHeroLoaded(true), 80);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const loadCompanies = async () => {
      setLoadingCompanies(true);
      setCompaniesError(null);

      try {
        const rows = await apiFetch<Record<string, unknown>[]>(API_ENDPOINTS.companies, {
          method: "GET",
          mode: "cors",
          headers: {
            Accept: "application/json",
          },
        });
        console.log("[TourismCompanies] backend rows:", Array.isArray(rows) ? rows.length : 0);
        const mapped = Array.isArray(rows) ? rows.map((row, index) => toCompanyModel(row, index)) : [];
        setCompaniesData(mapped);
      } catch (error) {
        const details = error instanceof Error ? error.message : "Unknown error";
        console.error("Failed to load companies", { endpoint: API_ENDPOINTS.companies, details });
        setCompaniesError(`Unable to load companies. ${details}`);
        setCompaniesData([]);
      } finally {
        setLoadingCompanies(false);
      }
    };

    void loadCompanies();
  }, []);

  const cityOptions = useMemo(() => {
    const cities = Array.from(new Set(companiesData.map((company) => company.city).filter(Boolean))).sort();
    return ["All Cities", ...cities];
  }, [companiesData]);

  const sortedCompanies = useMemo(() => {
    const filtered = companiesData.filter((company) => {
      const lowerSearch = search.toLowerCase();
      const matchSearch =
        search === "" ||
        company.name.toLowerCase().includes(lowerSearch) ||
        company.city.toLowerCase().includes(lowerSearch) ||
        company.specialties.some((specialty) => specialty.toLowerCase().includes(lowerSearch));
      const matchTier = activeTier === "All" || company.tier === activeTier;
      const matchCity = activeCity === "All Cities" || company.city === activeCity;
      const matchRating = company.rating >= (MIN_RATING_MAP[activeRating] ?? 0);

      return matchSearch && matchTier && matchCity && matchRating;
    });

    return [...filtered].sort((a, b) => b.rating - a.rating);
  }, [activeCity, activeRating, activeTier, search, companiesData]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Cinzel:wght@400;600;700&family=Lora:ital,wght@0,400;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0D0A06; }
        input::placeholder { color: rgba(247,240,227,0.22); }
        @keyframes fadeUp { from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)} }
        @keyframes scrollBounce { 0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(8px)} }
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#0D0A06}::-webkit-scrollbar-thumb{background:rgba(232,160,0,0.2);border-radius:3px}
      `}</style>

      <div style={{ background: "#0D0A06", minHeight: "100vh", fontFamily: "'Lora', serif", color: "#F7F0E3" }}>
        <section
          style={{
            position: "relative",
            minHeight: "72vh",
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
              backgroundImage: "url('https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=1600&q=80')",
              backgroundSize: "cover",
              backgroundPosition: "center 55%",
              filter: "brightness(0.28) saturate(0.7)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to bottom, rgba(13,10,6,0.5) 0%, rgba(13,10,6,0.15) 35%, rgba(13,10,6,0.92) 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.022,
              backgroundImage:
                "repeating-linear-gradient(0deg,transparent,transparent 79px,rgba(232,160,0,1) 79px,rgba(232,160,0,1) 80px),repeating-linear-gradient(90deg,transparent,transparent 79px,rgba(232,160,0,1) 79px,rgba(232,160,0,1) 80px)",
            }}
          />

          <div style={{ position: "absolute", inset: "2rem", border: "1px solid rgba(232,160,0,0.1)", pointerEvents: "none" }}>
            {[{ t: "-4px", l: "-4px" }, { t: "-4px", r: "-4px" }, { b: "-4px", l: "-4px" }, { b: "-4px", r: "-4px" }].map(
              (position, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    ...(position as CSSProperties),
                    width: "8px",
                    height: "8px",
                    background: "#E8A000",
                    opacity: 0.4,
                    clipPath: "polygon(50% 0%,100% 50%,50% 100%,0% 50%)",
                  }}
                />
              )
            )}
          </div>

          <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "4rem 2rem", maxWidth: "820px" }}>
            <p
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: "0.68rem",
                letterSpacing: "0.45em",
                color: "#E8A000",
                textTransform: "uppercase",
                marginBottom: "1.6rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "1rem",
                opacity: heroLoaded ? 1 : 0,
                transform: heroLoaded ? "translateY(0)" : "translateY(20px)",
                transition: "all 0.8s ease 0.2s",
              }}
            >
              <span style={{ display: "inline-block", width: "35px", height: "1px", background: "#E8A000", opacity: 0.5 }} />
              Egypt Panorama
              <span style={{ display: "inline-block", width: "35px", height: "1px", background: "#E8A000", opacity: 0.5 }} />
            </p>

            <h1
              style={{
                fontFamily: "'Cinzel Decorative', serif",
                fontSize: "clamp(2.2rem,7vw,5.2rem)",
                fontWeight: 900,
                lineHeight: 1.1,
                color: "#F7F0E3",
                marginBottom: "0.2em",
                opacity: heroLoaded ? 1 : 0,
                transform: heroLoaded ? "translateY(0)" : "translateY(30px)",
                transition: "all 0.9s ease 0.35s",
              }}
            >
              Tourism <span style={{ background: "linear-gradient(135deg,#E8C97A,#E8A000,#C9762A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Companies</span>
              <br />in Egypt
            </h1>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", margin: "1.8rem 0", opacity: heroLoaded ? 1 : 0, transition: "opacity 0.8s ease 0.55s" }}>
              <div style={{ width: "60px", height: "1px", background: "linear-gradient(90deg,transparent,#E8A000)" }} />
              <span style={{ color: "#E8A000", fontSize: "0.9rem" }}>◈</span>
              <div style={{ width: "60px", height: "1px", background: "linear-gradient(90deg,#E8A000,transparent)" }} />
            </div>

            <p
              style={{
                fontSize: "clamp(0.9rem,1.8vw,1.1rem)",
                lineHeight: 1.85,
                color: "rgba(247,240,227,0.55)",
                fontStyle: "italic",
                maxWidth: "560px",
                margin: "0 auto 2.5rem",
                opacity: heroLoaded ? 1 : 0,
                transform: heroLoaded ? "translateY(0)" : "translateY(20px)",
                transition: "all 0.8s ease 0.65s",
              }}
            >
              Discover Egypt&apos;s most trusted travel agencies from ultra-luxury expedition specialists to boutique Nile operators and find your perfect travel partner today.
            </p>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "2.5rem", flexWrap: "wrap", opacity: heroLoaded ? 1 : 0, transition: "opacity 0.8s ease 0.8s" }}>
              {[{ n: `${companiesData.length}`, l: "Verified Agencies" }, { n: "4", l: "Tier Levels" }, { n: `${Math.max(0, cityOptions.length - 1)}`, l: "Cities Covered" }].map((stat, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <p style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "1.6rem", fontWeight: 900, color: "#E8A000", lineHeight: 1 }}>{stat.n}</p>
                  <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.58rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(247,240,227,0.3)", marginTop: "4px" }}>{stat.l}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ position: "absolute", bottom: "2rem", left: "50%", transform: "translateX(-50%)", animation: "scrollBounce 2s ease infinite", opacity: 0.35 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E8A000" strokeWidth="1.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </section>

        <section style={{ background: "#0D0A06", padding: "3.5rem 2rem 0" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem", animation: "fadeUp 0.7s ease both" }}>
              <div style={{ position: "relative", width: "100%", maxWidth: "520px" }}>
                <svg style={{ position: "absolute", left: "15px", top: "50%", transform: "translateY(-50%)" }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(232,160,0,0.45)" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by company name, city, or specialty..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.85rem 1rem 0.85rem 2.7rem",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(232,160,0,0.18)",
                    borderRadius: "10px",
                    color: "#F7F0E3",
                    fontSize: "0.88rem",
                    fontFamily: "'Lora', serif",
                    outline: "none",
                    transition: "border-color 0.3s",
                  }}
                  onFocus={(event) => {
                    event.target.style.borderColor = "rgba(232,160,0,0.5)";
                  }}
                  onBlur={(event) => {
                    event.target.style.borderColor = "rgba(232,160,0,0.18)";
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.65rem", justifyContent: "center", marginBottom: "0.75rem", animation: "fadeUp 0.7s ease 0.08s both" }}>
              {TIERS.map((tier) => (
                <button
                  key={tier}
                  onClick={() => setActiveTier(tier)}
                  style={{
                    padding: "0.5rem 1.3rem",
                    borderRadius: "30px",
                    border: `1px solid ${activeTier === tier ? "#E8A000" : "rgba(255,255,255,0.09)"}`,
                    background: activeTier === tier ? "linear-gradient(135deg,#E8A000,#C9A84C)" : "rgba(255,255,255,0.03)",
                    color: activeTier === tier ? "#0D0A06" : "rgba(247,240,227,0.5)",
                    fontFamily: "'Cinzel', serif",
                    fontSize: "0.66rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    fontWeight: activeTier === tier ? 700 : 400,
                    transition: "all 0.3s",
                  }}
                >
                  {tier}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center", marginBottom: "0.75rem", animation: "fadeUp 0.7s ease 0.14s both" }}>
              {cityOptions.map((city) => (
                <button
                  key={city}
                  onClick={() => setActiveCity(city)}
                  style={{
                    padding: "0.35rem 0.95rem",
                    borderRadius: "30px",
                    border: `1px solid ${activeCity === city ? "rgba(74,139,92,0.7)" : "rgba(255,255,255,0.06)"}`,
                    background: activeCity === city ? "rgba(74,139,92,0.15)" : "transparent",
                    color: activeCity === city ? "#4A8B5C" : "rgba(247,240,227,0.32)",
                    fontFamily: "'Cinzel', serif",
                    fontSize: "0.59rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    transition: "all 0.3s",
                  }}
                >
                  {city}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center", marginBottom: "1.2rem", animation: "fadeUp 0.7s ease 0.18s both" }}>
              {RATINGS.map((rating) => (
                <button
                  key={rating}
                  onClick={() => setActiveRating(rating)}
                  style={{
                    padding: "0.32rem 0.9rem",
                    borderRadius: "30px",
                    border: `1px solid ${activeRating === rating ? "rgba(232,160,0,0.5)" : "rgba(255,255,255,0.05)"}`,
                    background: activeRating === rating ? "rgba(232,160,0,0.1)" : "transparent",
                    color: activeRating === rating ? "#E8A000" : "rgba(247,240,227,0.28)",
                    fontFamily: "'Cinzel', serif",
                    fontSize: "0.57rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    transition: "all 0.3s",
                  }}
                >
                  {rating === "All Ratings" ? "⭐ All" : `⭐ ${rating}`}
                </button>
              ))}
            </div>

            <div style={{ textAlign: "center", marginBottom: "2.8rem", animation: "fadeUp 0.7s ease 0.22s both" }}>
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.6rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(247,240,227,0.2)" }}>
                {sortedCompanies.length} compan{sortedCompanies.length !== 1 ? "ies" : "y"} found
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "2.5rem" }}>
              <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.6rem", letterSpacing: "0.4em", textTransform: "uppercase", color: "#E8A000", whiteSpace: "nowrap" }}>
                Verified Agencies
              </p>
              <div style={{ flex: 1, height: "1px", background: "rgba(232,160,0,0.12)" }} />
              <span style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "0.65rem", color: "rgba(247,240,227,0.15)" }}>◈</span>
            </div>
          </div>
        </section>

        <section style={{ padding: "0 2rem 8rem" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            {loadingCompanies ? (
              <div style={{ textAlign: "center", padding: "6rem 2rem", color: "rgba(247,240,227,0.35)" }}>
                <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.9rem", letterSpacing: "0.1em" }}>Loading companies...</p>
              </div>
            ) : companiesError ? (
              <div style={{ textAlign: "center", padding: "6rem 2rem", color: "rgba(247,240,227,0.35)" }}>
                <p style={{ fontFamily: "'Cinzel', serif", fontSize: "1rem", letterSpacing: "0.1em" }}>Failed to load companies</p>
                <p style={{ fontSize: "0.85rem", marginTop: "0.6rem", fontStyle: "italic" }}>{companiesError}</p>
              </div>
            ) : sortedCompanies.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.75rem" }}>
                {sortedCompanies.map((company, index) => (
                  <CompanyCard key={company.id} company={company} index={index} />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "6rem 2rem", color: "rgba(247,240,227,0.25)" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.25 }}>◈</div>
                <p style={{ fontFamily: "'Cinzel', serif", fontSize: "1rem", letterSpacing: "0.1em" }}>No companies found</p>
                <p style={{ fontSize: "0.85rem", marginTop: "0.5rem", fontStyle: "italic" }}>Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </section>

        <section
          style={{
            background: "linear-gradient(135deg,#0A0600 0%,#1A1208 50%,#0A1A28 100%)",
            padding: "6rem 2rem",
            textAlign: "center",
            borderTop: "1px solid rgba(232,160,0,0.08)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 80% at 50% 50%,rgba(232,160,0,0.05) 0%,transparent 70%)" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: "1.8rem", color: "#E8A000", opacity: 0.3, marginBottom: "1.2rem" }}>𓂀</div>
            <h2 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "clamp(1.5rem,4vw,2.8rem)", fontWeight: 700, color: "#F7F0E3", marginBottom: "0.9rem", lineHeight: 1.25 }}>
              Not Sure Which Agency?
              <br />
              <span style={{ background: "linear-gradient(135deg,#E8C97A,#E8A000)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Let Us Help You Plan
              </span>
            </h2>
            <p style={{ fontSize: "0.98rem", color: "rgba(247,240,227,0.4)", fontStyle: "italic", maxWidth: "440px", margin: "0 auto 2.2rem", lineHeight: 1.8 }}>
              Use our AI Plan Suggestion tool to generate a personalised Egyptian itinerary in seconds.
            </p>
            <a
              href="/plan"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.9rem 2.4rem",
                background: "linear-gradient(135deg,#E8A000,#C9A84C)",
                color: "#0D0A06",
                fontFamily: "'Cinzel', serif",
                fontSize: "0.7rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                textDecoration: "none",
                borderRadius: "8px",
                fontWeight: 700,
                transition: "opacity 0.3s",
              }}
              onMouseEnter={(event) => {
                (event.currentTarget as HTMLAnchorElement).style.opacity = "0.85";
              }}
              onMouseLeave={(event) => {
                (event.currentTarget as HTMLAnchorElement).style.opacity = "1";
              }}
            >
              Start Planning ◈
            </a>
          </div>
        </section>
      </div>
    </>
  );
}

