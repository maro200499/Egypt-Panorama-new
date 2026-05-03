"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { API_ENDPOINTS, apiFetch, type ApiActivity } from "@/lib/api";

type EgyptUntoldActivity = ApiActivity & {
  image?: string | null;
  image_url?: string | null;
  cover_image?: string | null;
  thumbnail?: string | null;
};

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?w=1200&q=85";

function normalizeTourismType(value: string | undefined | null): string {
  return (value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function getCardImage(activity: EgyptUntoldActivity): string {
  const candidate =
    activity.image ??
    activity.image_url ??
    activity.cover_image ??
    activity.thumbnail ??
    null;
  return candidate ? String(candidate).trim() : FALLBACK_IMAGE;
}

export default function EgyptUntoldPage() {
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState<EgyptUntoldActivity[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const response = await apiFetch<EgyptUntoldActivity[]>(API_ENDPOINTS.activitiesGetAll);
        if (!response?.length) {
          throw new Error("Invalid response structure");
        }
        // Filter to show only hidden/untold activities
        const untoldActivities = response.filter(activity => activity.is_hidden === 1 || activity.is_hidden === true);
        setActivities(untoldActivities);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const skeletonItems = useMemo(() => Array.from({ length: 6 }), []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Cinzel:wght@400;600;700&family=Lora:ital,wght@0,400;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        @media (max-width: 900px) {
          .untold-hero-inner { padding: 4.5rem 1.25rem 3.25rem !important; }
          .untold-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "radial-gradient(circle at 15% 10%, rgba(212,129,58,0.11), transparent 35%), radial-gradient(circle at 85% 0%, rgba(232,169,76,0.08), transparent 45%), #0D0A06",
          color: "#F7F0E3",
          fontFamily: "'Lora', serif",
          paddingBottom: "5rem",
        }}
      >
        <section
          style={{
            position: "relative",
            overflow: "hidden",
            borderBottom: "1px solid rgba(212,129,58,0.2)",
            background:
              "linear-gradient(180deg, rgba(14,9,5,0.92) 0%, rgba(13,10,6,0.85) 100%), url('https://images.unsplash.com/photo-1466442929976-97f336a657be?w=1800&q=80') center/cover",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.03,
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 78px, rgba(232,160,0,1) 78px, rgba(232,160,0,1) 79px), repeating-linear-gradient(90deg, transparent, transparent 78px, rgba(232,160,0,1) 78px, rgba(232,160,0,1) 79px)",
            }}
          />

          <div className="untold-hero-inner" style={{ position: "relative", zIndex: 1, maxWidth: "1200px", margin: "0 auto", padding: "6.5rem 2rem 5rem" }}>
            <p
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: "0.68rem",
                letterSpacing: "0.42em",
                color: "#D4813A",
                textTransform: "uppercase",
                marginBottom: "1.25rem",
              }}
            >
              Signature Collection
            </p>

            <h1
              style={{
                fontFamily: "'Cinzel Decorative', serif",
                fontSize: "clamp(2.2rem, 7vw, 5rem)",
                lineHeight: 1.05,
                marginBottom: "1rem",
                color: "#F7F0E3",
              }}
            >
              Egypt <span style={{ background: "linear-gradient(135deg,#E8C97A,#D4813A,#C9762A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Untold</span>
            </h1>

            <p
              style={{
                maxWidth: "760px",
                fontSize: "clamp(1rem, 2vw, 1.16rem)",
                lineHeight: 1.85,
                color: "rgba(247,240,227,0.68)",
                fontStyle: "italic",
              }}
            >
              The Egypt that most of the world has never seen
            </p>

            <div style={{ marginTop: "1.8rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              {["Forgotten Monuments", "Hidden Routes", "Living Culture"].map((pill) => (
                <span
                  key={pill}
                  style={{
                    border: "1px solid rgba(212,129,58,0.35)",
                    background: "rgba(212,129,58,0.1)",
                    color: "#DDA35F",
                    borderRadius: "999px",
                    fontFamily: "'Cinzel', serif",
                    fontSize: "0.62rem",
                    letterSpacing: "0.11em",
                    textTransform: "uppercase",
                    padding: "6px 13px",
                  }}
                >
                  {pill}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "2.5rem 2rem 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1.8rem" }}>
            <p
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: "0.68rem",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "#D4813A",
              }}
            >
              Egypt Untold Activities
            </p>
            <Link
              href="/tourism"
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: "0.62rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(247,240,227,0.62)",
                textDecoration: "none",
                border: "1px solid rgba(212,129,58,0.3)",
                borderRadius: "10px",
                padding: "0.6rem 1rem",
              }}
            >
              Back To Tourism
            </Link>
          </div>

          {loading ? (
            <div className="untold-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "1.2rem" }}>
              {skeletonItems.map((_, index) => (
                <article
                  key={`skeleton-${index}`}
                  style={{
                    borderRadius: "16px",
                    overflow: "hidden",
                    border: "1px solid rgba(212,129,58,0.2)",
                    background: "rgba(17,14,9,0.88)",
                  }}
                >
                  <div style={{ height: "210px", background: "rgba(247,240,227,0.08)" }} />
                  <div style={{ padding: "1rem" }}>
                    <div style={{ height: "16px", width: "68%", background: "rgba(247,240,227,0.1)", borderRadius: "8px" }} />
                    <div style={{ height: "12px", width: "48%", background: "rgba(247,240,227,0.08)", borderRadius: "8px", marginTop: "0.7rem" }} />
                  </div>
                </article>
              ))}
            </div>
          ) : error ? (
            <div
              style={{
                borderRadius: "14px",
                border: "1px solid rgba(224,86,86,0.4)",
                background: "rgba(224,86,86,0.08)",
                color: "#F9CACA",
                padding: "1rem 1.2rem",
                fontSize: "0.95rem",
              }}
            >
              Failed to load activities. {error}
            </div>
          ) : activities.length === 0 ? (
            <div
              style={{
                borderRadius: "14px",
                border: "1px solid rgba(212,129,58,0.3)",
                background: "rgba(212,129,58,0.08)",
                color: "rgba(247,240,227,0.76)",
                padding: "1rem 1.2rem",
                fontStyle: "italic",
              }}
            >
              No Egypt Untold activities are available right now.
            </div>
          ) : (
            <div className="untold-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "1.2rem" }}>
              {activities.map((activity) => {
                const name = activity.name?.trim() || "Untitled activity";
                const destination = activity.destination_name?.trim() || "Egypt";
                const image = getCardImage(activity);

                return (
                  <Link
                    key={String(activity.id)}
                    href={`/activities/${encodeURIComponent(String(activity.id))}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <article
                      style={{
                        borderRadius: "16px",
                        overflow: "hidden",
                        border: "1px solid rgba(212,129,58,0.25)",
                        background: "linear-gradient(180deg, rgba(28,21,14,0.88), rgba(17,14,9,0.9))",
                        boxShadow: "0 16px 40px rgba(0,0,0,0.35)",
                        transition: "transform 0.25s ease, border-color 0.25s ease",
                        cursor: "pointer",
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = "translateY(-8px)";
                        e.currentTarget.style.borderColor = "rgba(232,169,76,0.5)";
                        e.currentTarget.style.boxShadow = "0 24px 48px rgba(0,0,0,0.5)";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.borderColor = "rgba(212,129,58,0.25)";
                        e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.35)";
                      }}
                    >
                    <div style={{ position: "relative", height: "210px", overflow: "hidden", borderBottom: "1px solid rgba(212,129,58,0.2)" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image}
                        alt={name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background:
                            "linear-gradient(to top, rgba(8,7,5,0.7) 0%, rgba(8,7,5,0.08) 55%, rgba(8,7,5,0) 100%)",
                        }}
                      />
                    </div>

                    <div style={{ padding: "1rem 1rem 1.1rem" }}>
                      <h2
                        style={{
                          fontFamily: "'Cinzel Decorative', serif",
                          fontSize: "1.15rem",
                          lineHeight: 1.3,
                          color: "#F7F0E3",
                          marginBottom: "0.65rem",
                        }}
                      >
                        {name}
                      </h2>

                      <p
                        style={{
                          fontFamily: "'Cinzel', serif",
                          fontSize: "0.66rem",
                          letterSpacing: "0.18em",
                          textTransform: "uppercase",
                          color: "#DDA35F",
                        }}
                      >
                        {destination}
                      </p>
                    </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
