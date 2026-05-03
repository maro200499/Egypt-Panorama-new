"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { API_ENDPOINTS, apiFetch, type ApiActivity } from "@/lib/api";

function useInView(threshold = 0.1) {
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

interface SubCategory {
  name: string;
  icon: string;
  color: string;
  desc: string;
  href?: string;
}

interface TourismCategory {
  id: string;
  href: string;
  route: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  color: string;
  icon: string;
  tags: string[];
  subCategories?: SubCategory[];
}

interface ActivityGroup {
  type: string;
  names: string[];
}

const categories: TourismCategory[] = [
  {
    id: "ancient",
    href: "/tourism/cultural",
    route: "PHARAONIC HERITAGE",
    title: "Ancient Egyptian Tourism",
    subtitle: "The cradle of one of humanity's greatest civilizations",
    description:
      "Coverage of Egypt's Pharaonic civilization and its monumental legacy across the country from iconic landmarks to lesser-visited ancient sites. Content spans temple complexes, royal burial grounds, museum collections, and the Nubian heritage of Egypt's deep south.",
    image: "https://images.unsplash.com/photo-1539768942893-daf53e448371?w=900&q=85",
    color: "#C9A84C",
    icon: "𓂀",
    tags: ["Pyramids of Giza", "Luxor Temple", "Valley of the Kings", "Abu Simbel", "Grand Egyptian Museum"],
  },
  {
    id: "religious",
    href: "/tourism/religious",
    route: "SACRED HERITAGE",
    title: "Religious Tourism",
    subtitle: "Two faiths, thousands of years, one living landscape",
    description:
      "Coverage of Egypt's extraordinary religious heritage across two of the world's oldest continuously practiced faiths from the ancient churches and desert monasteries of Coptic Christianity to the medieval Islamic urban landscapes of Cairo recognized by UNESCO.",
    image: "/images/Egypt%27s%20Rich%20Religious%20Tourism%20Background.png",
    color: "#8B6BA8",
    icon: "𓆙",
    tags: ["Al-Azhar Mosque", "Hanging Church", "St. Catherine's Monastery", "Holy Family Route", "Islamic Cairo"],
    subCategories: [
      {
        name: "Coptic Christian Tourism",
        icon: "✦",
        color: "#8B6BA8",
        desc: "Egypt's Christian heritage is among the oldest in the world. Ancient churches, desert monasteries, and the Holy Family pilgrimage route form a major spiritual corridor.",
        href: "/tourism/religious/coptic",
      },
      {
        name: "Islamic Tourism",
        icon: "◈",
        color: "#6B8BA8",
        desc: "One of the richest concentrations of Islamic architecture and living history in the world, centered around medieval Cairo and landmark mosques.",
        href: "/tourism/religious/islamic",
      },
    ],
  },
  {
    id: "coastal",
    href: "/tourism/sea",
    route: "MARINE & COASTAL",
    title: "Coastal & Diving Tourism",
    subtitle: "Three seas, one extraordinary coastline",
    description:
      "Coverage of Egypt's world-class coastal destinations across the Red Sea, Gulf of Aqaba, and Mediterranean. Includes top diving zones, marine reserves, major resorts, and quieter shores.",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=900&q=85",
    color: "#2A7B9B",
    icon: "𓇌",
    tags: ["Ras Mohamed", "Hurghada", "Sharm El-Sheikh", "Dahab Blue Hole", "Marsa Alam"],
  },
  {
    id: "nature",
    href: "/tourism/eco",
    route: "NATURAL WONDERS",
    title: "Nature & Adventure Tourism",
    subtitle: "A country of remarkable natural diversity",
    description:
      "Coverage of Egypt's dramatic natural landscapes, from surreal desert formations and oasis cultures to mountain reserves and unique lakeside ecosystems.",
    image: "https://images.unsplash.com/photo-1609951651556-5334e2706168?w=900&q=85",
    color: "#4A8B5C",
    icon: "𓆣",
    tags: ["White Desert", "Siwa Oasis", "Wadi El Rayan", "St. Catherine Reserve", "Sinai Mountains"],
  },
];

function SubCategoryCard({ sub, hovered }: { sub: SubCategory; hovered: boolean }) {
  const card = (
    <div
      style={{
        background: `${sub.color}10`,
        border: `1px solid ${hovered ? `${sub.color}60` : `${sub.color}35`}`,
        borderRadius: "12px",
        padding: "1.1rem 1.3rem",
        flex: 1,
        minWidth: "220px",
        transition: "border-color 0.3s, background 0.3s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.55rem" }}>
        <span style={{ color: sub.color, fontSize: "0.9rem" }}>{sub.icon}</span>
        <p
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: "0.72rem",
            fontWeight: 700,
            color: sub.color,
            letterSpacing: "0.04em",
          }}
        >
          {sub.name}
        </p>
      </div>
      <p
        style={{
          fontSize: "0.78rem",
          lineHeight: 1.7,
          color: "rgba(247,240,227,0.42)",
          fontFamily: "'Lora', serif",
          fontStyle: "italic",
        }}
      >
        {sub.desc}
      </p>
    </div>
  );

  return sub.href ? (
    <Link href={sub.href} style={{ flex: 1, minWidth: "220px", textDecoration: "none" }}>
      {card}
    </Link>
  ) : (
    card
  );
}

function normalizeActivityType(value: string): string {
  return value.trim().toLowerCase();
}

function formatActivityTypeLabel(value: string): string {
  return value
    .split(/[_\-\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function CategoryCard({ cat, index, activityGroups }: { cat: TourismCategory; index: number; activityGroups: ActivityGroup[] }) {
  const [ref, inView] = useInView(0.08);
  const [hovered, setHovered] = useState(false);
  const isEven = index % 2 === 0;
  const isReligious = cat.id === "religious";
  const t = useTranslations("tourismPage");
  const religiousBackgroundUrl = "/images/Egypt%27s%20Rich%20Religious%20Tourism%20Background.png";

  const cardStyle: CSSProperties = {
    background: isReligious
      ? `linear-gradient(135deg, rgba(11,8,18,0.88) 0%, rgba(11,8,18,0.76) 45%, rgba(11,8,18,0.92) 100%), url("${religiousBackgroundUrl}") center/cover no-repeat`
      : "#110E09",
    border: `1px solid ${hovered ? `${cat.color}50` : "rgba(255,255,255,0.07)"}`,
    borderRadius: "20px",
    overflow: "hidden",
    display: "grid",
    gridTemplateColumns: isEven ? "1fr 1.1fr" : "1.1fr 1fr",
    minHeight: "400px",
    transition: "border-color 0.35s, box-shadow 0.35s",
    boxShadow: hovered
      ? `0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px ${cat.color}22`
      : "0 4px 24px rgba(0,0,0,0.35)",
    backgroundSize: isReligious ? "cover" : undefined,
    backgroundPosition: isReligious ? "center" : undefined,
    backgroundRepeat: isReligious ? "no-repeat" : undefined,
  };

  const contentPanelStyle: CSSProperties = isReligious
    ? {
        background: "linear-gradient(180deg, rgba(11,8,18,0.38) 0%, rgba(11,8,18,0.62) 100%)",
        backdropFilter: "blur(7px)",
      }
    : {};

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(50px)",
        transition: `opacity 0.75s ease ${index * 0.1}s, transform 0.75s ease ${index * 0.1}s`,
      }}
    >
      <div
        className="category-grid"
        style={cardStyle}
      >
        <div style={{ order: isEven ? 0 : 1, position: "relative", overflow: "hidden" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cat.image}
            alt={cat.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: hovered ? "scale(1.06)" : "scale(1)",
              transition: "transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94)",
              filter: "brightness(0.6) saturate(0.85)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: isEven
                ? "linear-gradient(to right, transparent 50%, rgba(17,14,9,0.85) 100%)"
                : "linear-gradient(to left, transparent 50%, rgba(17,14,9,0.85) 100%)",
            }}
          />

          <div
            style={{
              position: "absolute",
              top: "1.2rem",
              left: "1.2rem",
              background: `${cat.color}22`,
              border: `1px solid ${cat.color}55`,
              color: cat.color,
              padding: "4px 14px",
              borderRadius: "20px",
              fontFamily: "'Cinzel', serif",
              fontSize: "0.6rem",
              letterSpacing: "0.2em",
              backdropFilter: "blur(8px)",
            }}
          >
            {cat.route}
          </div>

          <div
            style={{
              position: "absolute",
              bottom: "-1rem",
              right: isEven ? "-1rem" : "auto",
              left: isEven ? "auto" : "-1rem",
              fontSize: "8rem",
              opacity: hovered ? 0.1 : 0.06,
              color: cat.color,
              lineHeight: 1,
              userSelect: "none",
              pointerEvents: "none",
              transition: "opacity 0.4s",
            }}
          >
            {cat.icon}
          </div>
        </div>

        <div
          style={{
            order: isEven ? 1 : 0,
            padding: "2.5rem 2.5rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "0",
            ...contentPanelStyle,
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.9rem", marginBottom: "0.8rem" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                flexShrink: 0,
                background: `${cat.color}18`,
                border: `1px solid ${cat.color}40`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.3rem",
                transform: hovered ? "rotate(-5deg) scale(1.08)" : "none",
                transition: "transform 0.35s",
              }}
            >
              {cat.icon}
            </div>
            <div>
              <p
                style={{
                  fontFamily: "'Cinzel Decorative', serif",
                  fontSize: "clamp(1.1rem, 2vw, 1.5rem)",
                  fontWeight: 900,
                  color: hovered ? cat.color : "#F7F0E3",
                  lineHeight: 1.15,
                  transition: "color 0.3s",
                }}
              >
                {cat.title}
              </p>
              <p
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: "0.65rem",
                  letterSpacing: "0.12em",
                  color: "rgba(247,240,227,0.35)",
                  marginTop: "4px",
                  fontStyle: "italic",
                }}
              >
                {cat.subtitle}
              </p>
            </div>
          </div>

          <div
            style={{
              height: "1px",
              background: hovered ? `linear-gradient(90deg,${cat.color}60,transparent)` : "rgba(255,255,255,0.07)",
              marginBottom: "1.2rem",
              transition: "background 0.4s",
            }}
          />

          <p
            style={{
              fontSize: "0.85rem",
              lineHeight: 1.85,
              color: "rgba(247,240,227,0.52)",
              fontFamily: "'Lora', serif",
              fontStyle: "italic",
              marginBottom: "1.4rem",
            }}
          >
            {cat.description}
          </p>

          {cat.subCategories ? (
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.4rem" }}>
              {cat.subCategories.map((sub) => (
                <SubCategoryCard key={sub.name} sub={sub} hovered={hovered} />
              ))}
            </div>
          ) : null}

          {activityGroups.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem", marginBottom: "1.5rem" }}>
              {activityGroups.map((group) => (
                <div key={`${cat.id}-${group.type}`}>
                  <p
                    style={{
                      fontFamily: "'Cinzel', serif",
                      fontSize: "0.56rem",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: "rgba(247,240,227,0.4)",
                      marginBottom: "0.35rem",
                    }}
                  >
                    {formatActivityTypeLabel(group.type)}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {group.names.slice(0, 5).map((tag) => (
                      <span
                        key={`${group.type}-${tag}`}
                        style={{
                          fontSize: "0.68rem",
                          padding: "4px 12px",
                          borderRadius: "20px",
                          background: `${cat.color}12`,
                          border: `1px solid ${cat.color}35`,
                          color: cat.color,
                          fontFamily: "'Cinzel', serif",
                          letterSpacing: "0.06em",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.5rem" }}>
              {cat.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: "0.68rem",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    background: `${cat.color}12`,
                    border: `1px solid ${cat.color}35`,
                    color: cat.color,
                    fontFamily: "'Cinzel', serif",
                    letterSpacing: "0.06em",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <a
            href={cat.href}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "0.75rem 1.5rem",
              background: hovered ? `linear-gradient(135deg,${cat.color},${cat.color}BB)` : "transparent",
              border: `1px solid ${hovered ? "transparent" : `${cat.color}45`}`,
              borderRadius: "10px",
              color: hovered ? "#0D0A06" : cat.color,
              fontFamily: "'Cinzel', serif",
              fontSize: "0.68rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              fontWeight: hovered ? 700 : 400,
              textDecoration: "none",
              transition: "all 0.35s ease",
              alignSelf: "flex-start",
              boxShadow: hovered ? `0 8px 24px ${cat.color}35` : "none",
            }}
          >
            {t("exploreCategory")}
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ transform: hovered ? "translateX(3px)" : "translateX(0)", transition: "transform 0.3s" }}
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}

function EgyptUntold() {
  const [ref, inView] = useInView(0.06);
  const [hovered, setHovered] = useState(false);
  const t = useTranslations("tourismPage");

  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(60px)",
        transition: "opacity 0.9s ease, transform 0.9s ease",
        marginTop: "1rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "2.5rem" }}>
        <div style={{ flex: 1, height: "1px", background: "rgba(212,129,58,0.2)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ color: "#D4813A", fontSize: "0.7rem" }}>◈</span>
          <p
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: "0.6rem",
              letterSpacing: "0.42em",
              textTransform: "uppercase",
              color: "#D4813A",
            }}
          >
            {t("untoldSignature")}
          </p>
          <span style={{ color: "#D4813A", fontSize: "0.7rem" }}>◈</span>
        </div>
        <div style={{ flex: 1, height: "1px", background: "rgba(212,129,58,0.2)" }} />
      </div>

      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: "relative",
          background: "linear-gradient(160deg, #1A0F06 0%, #0D0A06 40%, #0A0F1A 100%)",
          border: `1px solid ${hovered ? "rgba(212,129,58,0.5)" : "rgba(212,129,58,0.2)"}`,
          borderRadius: "24px",
          overflow: "hidden",
          transition: "border-color 0.4s, box-shadow 0.4s",
          boxShadow: hovered
            ? "0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,129,58,0.15), 0 0 60px rgba(212,129,58,0.06)"
            : "0 8px 40px rgba(0,0,0,0.4)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "60%",
            height: "1px",
            background: "linear-gradient(90deg,transparent,rgba(212,129,58,0.7),transparent)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "40%",
            height: "80px",
            background: "radial-gradient(ellipse at 50% 0%, rgba(212,129,58,0.1), transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.015,
            backgroundImage:
              "repeating-linear-gradient(45deg,transparent,transparent 20px,rgba(212,129,58,1) 20px,rgba(212,129,58,1) 21px)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "absolute",
            right: "-2rem",
            top: "50%",
            transform: "translateY(-50%)",
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: "18rem",
            fontWeight: 900,
            color: hovered ? "rgba(212,129,58,0.055)" : "rgba(212,129,58,0.03)",
            lineHeight: 1,
            userSelect: "none",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            transition: "color 0.5s",
          }}
        >
          UNTOLD
        </div>

        <div className="untold-pad" style={{ position: "relative", zIndex: 1, padding: "3.5rem 3.5rem" }}>
          <div style={{ marginBottom: "2.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.2rem" }}>
              <div
                style={{
                  padding: "5px 16px",
                  background: "rgba(212,129,58,0.12)",
                  border: "1px solid rgba(212,129,58,0.4)",
                  borderRadius: "30px",
                  fontFamily: "'Cinzel', serif",
                  fontSize: "0.58rem",
                  letterSpacing: "0.32em",
                  color: "#D4813A",
                  textTransform: "uppercase",
                }}
              >
                {t("untoldExclusive")}
              </div>
            </div>

            <h2
              style={{
                fontFamily: "'Cinzel Decorative', serif",
                fontSize: "clamp(2.5rem, 6vw, 5rem)",
                fontWeight: 900,
                lineHeight: 1.05,
                color: "#F7F0E3",
                marginBottom: "0.15em",
              }}
            >
              {t("untoldTitlePrefix")} <span style={{ background: "linear-gradient(135deg, #E8C97A, #D4813A, #C9762A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{t("untoldTitleHighlight")}</span>
            </h2>
            <p
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: "0.75rem",
                letterSpacing: "0.18em",
                color: "rgba(212,129,58,0.6)",
                fontStyle: "italic",
                textTransform: "uppercase",
              }}
            >
              {t("untoldSubtitle")}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
            <div style={{ width: "40px", height: "1px", background: "rgba(212,129,58,0.4)" }} />
            <span style={{ color: "rgba(212,129,58,0.4)", fontSize: "0.8rem" }}>◈</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(212,129,58,0.1)" }} />
          </div>

          <div className="untold-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.5rem", marginBottom: "2.5rem" }}>
            <div>
              <p
                style={{
                  fontSize: "0.92rem",
                  lineHeight: 1.95,
                  color: "rgba(247,240,227,0.55)",
                  fontFamily: "'Lora', serif",
                  fontStyle: "italic",
                  marginBottom: "1.2rem",
                }}
              >
                Every country has its famous sites, but beneath what appears on postcards lies another Egypt of abandoned fortresses, forgotten cemeteries, and places history kept to itself.
              </p>
              <p
                style={{
                  fontSize: "0.92rem",
                  lineHeight: 1.95,
                  color: "rgba(247,240,227,0.55)",
                  fontFamily: "'Lora', serif",
                  fontStyle: "italic",
                }}
              >
                Alongside them is a living cultural Egypt of art spaces and communities that remain outside mainstream tourism, yet form a major part of the country&apos;s creative pulse.
              </p>
            </div>
            <div>
              <p
                style={{
                  fontSize: "0.92rem",
                  lineHeight: 1.95,
                  color: "rgba(247,240,227,0.55)",
                  fontFamily: "'Lora', serif",
                  fontStyle: "italic",
                  marginBottom: "1.2rem",
                }}
              >
                Egypt Untold brings both narratives together through carefully curated stories and destinations that reveal deeper historical and cultural layers.
              </p>
              <p
                style={{
                  fontSize: "0.92rem",
                  lineHeight: 1.95,
                  color: "rgba(247,240,227,0.55)",
                  fontFamily: "'Lora', serif",
                  fontStyle: "italic",
                }}
              >
                Some places feel frozen in time; others are active and vibrant. Both are extraordinary precisely because they were never designed for tourist optics.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.65rem", marginBottom: "2.5rem" }}>
            {[
              { icon: "𓂀", label: "Forgotten Monuments" },
              { icon: "◈", label: "Hidden Cemeteries" },
              { icon: "𓆣", label: "Abandoned Fortresses" },
              { icon: "𓅓", label: "Living Art Spaces" },
              { icon: "𓇌", label: "Unvisited Tombs" },
              { icon: "✦", label: "Cultural Underground" },
            ].map((pill) => (
              <div
                key={pill.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 14px",
                  borderRadius: "30px",
                  background: "rgba(212,129,58,0.08)",
                  border: "1px solid rgba(212,129,58,0.22)",
                }}
              >
                <span style={{ color: "#D4813A", fontSize: "0.85rem" }}>{pill.icon}</span>
                <span
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: "0.62rem",
                    letterSpacing: "0.1em",
                    color: "rgba(247,240,227,0.55)",
                  }}
                >
                  {pill.label}
                </span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1.5rem" }}>
            <p
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: "0.68rem",
                letterSpacing: "0.12em",
                color: "rgba(247,240,227,0.25)",
                fontStyle: "italic",
                maxWidth: "500px",
                lineHeight: 1.7,
              }}
            >
              Locations are selected and presented with narrative context by the Egypt Panorama team, with focus on history, cultural relevance, and why they remain off mainstream routes.
            </p>

            <Link
              href="/egypt-untold"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "0.95rem 2.2rem",
                background: hovered ? "linear-gradient(135deg, #D4813A, #C9762A)" : "transparent",
                border: `1px solid ${hovered ? "transparent" : "rgba(212,129,58,0.45)"}`,
                borderRadius: "12px",
                color: hovered ? "#0D0A06" : "#D4813A",
                fontFamily: "'Cinzel', serif",
                fontSize: "0.72rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                fontWeight: hovered ? 700 : 400,
                textDecoration: "none",
                transition: "all 0.35s ease",
                whiteSpace: "nowrap",
                boxShadow: hovered ? "0 10px 30px rgba(212,129,58,0.35)" : "none",
              }}
            >
              {t("untoldCta")}
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ transform: hovered ? "translateX(4px)" : "translateX(0)", transition: "transform 0.3s" }}
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TourismPage() {
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [activitiesByCategory, setActivitiesByCategory] = useState<Record<string, ActivityGroup[]>>({});
  const locale = useLocale();
  const t = useTranslations("tourismPage");
  const isArabic = locale === "ar";

  useEffect(() => {
    const timeout = window.setTimeout(() => setHeroLoaded(true), 80);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const categoryTypeMap: Record<string, string[]> = {
      ancient: ["cultural", "heritage", "pharaonic", "ancient", "histor"],
      religious: ["religious", "islam", "coptic", "faith", "spiritual"],
      coastal: ["sea", "diving", "marine", "coast", "beach", "water"],
      nature: ["eco", "wellness", "desert", "nature", "adventure", "oasis", "mountain", "safari"],
    };

    const loadActivities = async () => {
      try {
        const apiActivities = await apiFetch<ApiActivity[]>(API_ENDPOINTS.activities);
        const groupedByType = new Map<string, string[]>();

        for (const activity of apiActivities ?? []) {
          const rawType = (activity.type || "Other").trim() || "Other";
          const next = groupedByType.get(rawType) ?? [];
          next.push(activity.name);
          groupedByType.set(rawType, next);
        }

        const nextByCategory: Record<string, ActivityGroup[]> = {};

        for (const category of categories) {
          const keywords = categoryTypeMap[category.id] ?? [];
          const groups: ActivityGroup[] = [];

          groupedByType.forEach((names, rawType) => {
            const normalized = normalizeActivityType(rawType);
            const belongsToCategory = keywords.some(
              (keyword) => normalized.includes(keyword) || keyword.includes(normalized)
            );

            if (!belongsToCategory) {
              return;
            }

            const uniqueNames = Array.from(new Set(names));

            if (uniqueNames.length === 0) {
              return;
            }

            groups.push({
              type: rawType,
              names: uniqueNames,
            });
          });

          nextByCategory[category.id] = groups;
        }

        setActivitiesByCategory(nextByCategory);
      } catch {
        setActivitiesByCategory({});
      }
    };

    void loadActivities();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Cinzel:wght@400;600;700&family=Lora:ital,wght@0,400;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0D0A06; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)} }
        @keyframes scrollBounce { 0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(8px)} }
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-track{background:#0D0A06}
        ::-webkit-scrollbar-thumb{background:rgba(232,160,0,0.2);border-radius:3px}

        @media(max-width:768px){
          .category-grid { grid-template-columns: 1fr !important; }
          .untold-grid { grid-template-columns: 1fr !important; }
          .untold-pad { padding: 2rem 1.5rem !important; }
        }
      `}</style>

      <div dir={isArabic ? "rtl" : "ltr"} style={{ background: "#0D0A06", minHeight: "100vh", fontFamily: "'Lora', serif", color: "#F7F0E3" }}>
        <section
          style={{
            position: "relative",
            minHeight: "68vh",
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
              backgroundImage: "url('https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?w=1800&q=85')",
              backgroundSize: "cover",
              backgroundPosition: "center 45%",
              filter: "brightness(0.22) saturate(0.7)",
            }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(13,10,6,0.4) 0%, rgba(13,10,6,0.1) 30%, rgba(13,10,6,0.95) 100%)" }} />
          <div style={{ position: "absolute", inset: 0, opacity: 0.02, backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 79px,rgba(232,160,0,1) 79px,rgba(232,160,0,1) 80px),repeating-linear-gradient(90deg,transparent,transparent 79px,rgba(232,160,0,1) 79px,rgba(232,160,0,1) 80px)" }} />

          <div style={{ position: "absolute", inset: "2rem", border: "1px solid rgba(232,160,0,0.1)", pointerEvents: "none" }}>
            {[{ top: "-4px", left: "-4px" }, { top: "-4px", right: "-4px" }, { bottom: "-4px", left: "-4px" }, { bottom: "-4px", right: "-4px" }].map((position, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  ...(position as CSSProperties),
                  width: "8px",
                  height: "8px",
                  background: "#E8A000",
                  opacity: 0.45,
                  clipPath: "polygon(50% 0%,100% 50%,50% 100%,0% 50%)",
                }}
              />
            ))}
          </div>

          <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "4rem 2rem", maxWidth: "800px" }}>
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
              {t("brand")}
              <span style={{ display: "inline-block", width: "35px", height: "1px", background: "#E8A000", opacity: 0.5 }} />
            </p>

            <h1
              style={{
                fontFamily: "'Cinzel Decorative', serif",
                fontSize: "clamp(2.2rem,7vw,5.2rem)",
                fontWeight: 900,
                lineHeight: 1.1,
                color: "#F7F0E3",
                opacity: heroLoaded ? 1 : 0,
                transform: heroLoaded ? "translateY(0)" : "translateY(28px)",
                transition: "all 0.9s ease 0.35s",
              }}
            >
              {t("heroTitlePrefix")} <span style={{ background: "linear-gradient(135deg,#E8C97A,#E8A000,#C9762A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{t("heroTitleHighlight")}</span>
              <br />{t("heroTitleSuffix")}
            </h1>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", margin: "1.8rem 0", opacity: heroLoaded ? 1 : 0, transition: "opacity 0.8s ease 0.55s" }}>
              <div style={{ width: "60px", height: "1px", background: "linear-gradient(90deg,transparent,#E8A000)" }} />
              <span style={{ color: "#E8A000" }}>◈</span>
              <div style={{ width: "60px", height: "1px", background: "linear-gradient(90deg,#E8A000,transparent)" }} />
            </div>

            <p
              style={{
                fontSize: "clamp(0.9rem,1.8vw,1.1rem)",
                lineHeight: 1.85,
                color: "rgba(247,240,227,0.52)",
                fontStyle: "italic",
                maxWidth: "560px",
                margin: "0 auto",
                opacity: heroLoaded ? 1 : 0,
                transform: heroLoaded ? "translateY(0)" : "translateY(18px)",
                transition: "all 0.8s ease 0.65s",
              }}
            >
              {t("heroDescription")}
            </p>
          </div>

          <div style={{ position: "absolute", bottom: "2rem", left: "50%", animation: "scrollBounce 2s ease infinite", opacity: 0.35 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E8A000" strokeWidth="1.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </section>

        <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "5rem 1.5rem 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "3.5rem" }}>
            <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.62rem", letterSpacing: "0.4em", textTransform: "uppercase", color: "#E8A000", whiteSpace: "nowrap" }}>
              {t("categoriesLabel")}
            </p>
            <div style={{ flex: 1, height: "1px", background: "rgba(232,160,0,0.12)" }} />
            <span style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "0.65rem", color: "rgba(247,240,227,0.15)" }}>◈</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {categories.map((cat, index) => (
              <CategoryCard
                key={cat.id}
                cat={cat}
                index={index}
                activityGroups={activitiesByCategory[cat.id] ?? []}
              />
            ))}
          </div>
        </section>

        <section id="egypt-untold" style={{ maxWidth: "1200px", margin: "5rem auto 0", padding: "0 1.5rem" }}>
          <EgyptUntold />
        </section>

        <section style={{ padding: "6rem 2rem 8rem", textAlign: "center" }}>
          <div style={{ maxWidth: "600px", margin: "0 auto" }}>
            <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.62rem", letterSpacing: "0.4em", textTransform: "uppercase", color: "#E8A000", marginBottom: "1rem" }}>
              {t("bottomLabel")}
            </p>
            <h3 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "clamp(1.5rem,4vw,2.5rem)", fontWeight: 900, color: "#F7F0E3", marginBottom: "0.9rem", lineHeight: 1.25 }}>
              {t("bottomTitlePrefix")} <span style={{ background: "linear-gradient(135deg,#E8C97A,#E8A000)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{t("bottomTitleHighlight")}</span>
            </h3>
            <p style={{ fontSize: "0.95rem", color: "rgba(247,240,227,0.38)", fontStyle: "italic", marginBottom: "2rem", lineHeight: 1.8 }}>
              {t("bottomDescription")}
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link
                href="/destinations"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "0.85rem 2rem",
                  background: "transparent",
                  border: "1px solid rgba(232,160,0,0.3)",
                  borderRadius: "10px",
                  color: "#E8A000",
                  fontFamily: "'Cinzel', serif",
                  fontSize: "0.68rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  transition: "all 0.3s",
                }}
                onMouseEnter={(event) => {
                  (event.currentTarget as HTMLAnchorElement).style.background = "rgba(232,160,0,0.08)";
                  (event.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(232,160,0,0.6)";
                }}
                onMouseLeave={(event) => {
                  (event.currentTarget as HTMLAnchorElement).style.background = "transparent";
                  (event.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(232,160,0,0.3)";
                }}
              >
                {t("browseDestinations")} ◈
              </Link>
              <a
                href="/plan"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "0.85rem 2rem",
                  background: "linear-gradient(135deg,#E8A000,#C9A84C)",
                  border: "none",
                  borderRadius: "10px",
                  color: "#0D0A06",
                  fontFamily: "'Cinzel', serif",
                  fontSize: "0.68rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  textDecoration: "none",
                  transition: "opacity 0.3s",
                }}
                onMouseEnter={(event) => {
                  (event.currentTarget as HTMLAnchorElement).style.opacity = "0.85";
                }}
                onMouseLeave={(event) => {
                  (event.currentTarget as HTMLAnchorElement).style.opacity = "1";
                }}
              >
                {t("planMyTrip")} ◈
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
