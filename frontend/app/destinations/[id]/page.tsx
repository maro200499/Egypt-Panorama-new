"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";

type BackendDestination = {
  id: number | string;
  name: string;
  city?: string;
  type?: string;
  cover_image?: string | null;
  gallery_images?: string | null;
};

type BackendActivity = {
  id: number | string;
  name: string;
  type?: string;
  tourism_type?: string;
  destination_name?: string;
  image_url?: string | null;
};

type BackendEnvelope<T> = {
  success?: boolean;
  status?: string;
  message?: string;
  data?: T;
};

function isSuccessPayload<T>(payload: BackendEnvelope<T>): boolean {
  return payload.success === true || payload.status === "success";
}

const K = "'Cinzel', serif";
const KD = "'Cinzel Decorative', serif";
const L = "'Lora', serif";

const HERO_FALLBACKS = [
  "https://images.unsplash.com/photo-1539768942893-daf53e448371?w=1400&q=85",
  "https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=1400&q=85",
  "https://images.unsplash.com/photo-1609951651556-5334e2706168?w=1400&q=85",
  "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1400&q=85",
];

function parseGalleryImages(raw: string | null | undefined): string[] {
  const value = (raw ?? "").trim();

  if (!value) {
    return [];
  }

  if (value.startsWith("[")) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
      }
    } catch {
      // Fall back to comma-separated parsing.
    }
  }

  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function pickHeroImage(destination: BackendDestination | null, index: number): string {
  const gallery = parseGalleryImages(destination?.gallery_images);
  const cover = (destination?.cover_image ?? "").trim();

  return cover || gallery[0] || HERO_FALLBACKS[index % HERO_FALLBACKS.length];
}

function pickActivityImage(activity: BackendActivity, fallbackImage: string): string {
  const imageUrl = activity.image_url?.trim();

  if (imageUrl) {
    return imageUrl;
  }

  return fallbackImage;
}

async function fetchJson<T>(url: string): Promise<BackendEnvelope<T>> {
  const response = await fetch(url, { cache: "no-store" });
  const payload = (await response.json()) as BackendEnvelope<T>;

  if (!response.ok) {
    throw new Error(payload.message ?? `Request failed with status ${response.status}.`);
  }

  return payload;
}

export default function DestinationDetailPage() {
  const params = useParams<{ id: string }>();
  const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const destinationId = Number(rawId);

  const [destination, setDestination] = useState<BackendDestination | null>(null);
  const [activities, setActivities] = useState<BackendActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(destinationId) || destinationId <= 0) {
      setError("Invalid destination id.");
      setLoading(false);
      return;
    }

    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const [destinationPayload, activitiesPayload] = await Promise.all([
          fetchJson<BackendDestination>(`${API_BASE_URL}/destinations/get_one.php?id=${destinationId}`),
          fetchJson<BackendActivity[]>(`${API_BASE_URL}/activities/get_by_destination.php?destination_id=${destinationId}`),
        ]);

        const nextDestination = isSuccessPayload(destinationPayload) ? destinationPayload.data ?? null : null;
        const nextActivities =
          isSuccessPayload(activitiesPayload) && Array.isArray(activitiesPayload.data)
            ? activitiesPayload.data
            : [];

        if (!mounted) {
          return;
        }

        if (!nextDestination) {
          throw new Error("Destination not found.");
        }

        setDestination(nextDestination);
        setActivities(nextActivities);
      } catch (fetchError) {
        if (!mounted) {
          return;
        }

        const message = fetchError instanceof Error ? fetchError.message : "Failed to load destination.";
        setError(message);
        setDestination(null);
        setActivities([]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [destinationId]);

  const heroImage = useMemo(() => pickHeroImage(destination, destinationId || 0), [destination, destinationId]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Cinzel:wght@400;600;700&family=Lora:ital,wght@0,400;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @media (max-width: 900px) {
          .dest-hero-inner { padding: 4.75rem 1.25rem 3rem !important; }
          .dest-grid { grid-template-columns: 1fr !important; }
          .dest-back { top: 1.25rem !important; left: 1rem !important; right: auto !important; }
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#0D0A06", color: "#F7F0E3", fontFamily: L }}>
        <section style={{ position: "relative", minHeight: "72vh", overflow: "hidden", borderBottom: "1px solid rgba(232,160,0,0.16)" }}>
          <Image
            src={heroImage}
            alt={destination?.name ?? "Destination"}
            fill
            priority
            style={{ objectFit: "cover", objectPosition: "center", filter: "brightness(0.38) saturate(0.85)" }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(13,10,6,0.25) 0%, rgba(13,10,6,0.75) 55%, rgba(13,10,6,0.96) 100%)" }} />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 50% at 50% 55%, rgba(232,160,0,0.08) 0%, transparent 72%)" }} />

          <Link
            className="dest-back"
            href="/destinations"
            style={{
              position: "absolute",
              top: "5.5rem",
              left: "2rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.55rem",
              padding: "0.6rem 1.1rem",
              borderRadius: "999px",
              background: "rgba(13,10,6,0.62)",
              border: "1px solid rgba(232,160,0,0.24)",
              color: "#E8C97A",
              textDecoration: "none",
              fontFamily: K,
              fontSize: "0.68rem",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              backdropFilter: "blur(10px)",
              zIndex: 2,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to Destinations
          </Link>

          <div className="dest-hero-inner" style={{ position: "relative", zIndex: 1, maxWidth: "1200px", margin: "0 auto", padding: "7rem 2rem 4rem" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", padding: "0.35rem 0.85rem", borderRadius: "999px", border: "1px solid rgba(232,160,0,0.28)", background: "rgba(232,160,0,0.1)", marginBottom: "1.2rem" }}>
              <span style={{ fontFamily: K, fontSize: "0.58rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#E8C97A" }}>
                Destination Details
              </span>
            </div>

            <h1 style={{ fontFamily: KD, fontSize: "clamp(2.3rem, 6vw, 5rem)", lineHeight: 1.05, marginBottom: "0.9rem", color: "#F7F0E3", animation: "fadeUp 0.7s ease both" }}>
              {loading ? "Loading..." : destination?.name ?? "Destination"}
            </h1>

            <p style={{ maxWidth: "780px", fontSize: "clamp(1rem, 2vw, 1.12rem)", lineHeight: 1.85, color: "rgba(247,240,227,0.68)", fontStyle: "italic", animation: "fadeUp 0.85s ease both" }}>
              Explore this destination through its live activities and cultural layers, presented in the same dark luxury style across the project.
            </p>

            <div style={{ marginTop: "1.6rem", display: "flex", flexWrap: "wrap", gap: "0.7rem" }}>
              {[(destination?.city ?? "Egypt"), (destination?.type ?? "Cultural"), `${activities.length} activities`].map((pill) => (
                <span key={pill} style={{ border: "1px solid rgba(232,160,0,0.26)", background: "rgba(232,160,0,0.08)", color: "#E8C97A", borderRadius: "999px", padding: "0.45rem 0.8rem", fontFamily: K, fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  {pill}
                </span>
              ))}
            </div>
          </div>
        </section>

        <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "2.2rem 2rem 4.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
            <div>
              <p style={{ fontFamily: K, fontSize: "0.68rem", letterSpacing: "0.26em", textTransform: "uppercase", color: "#E8A000", marginBottom: "0.45rem" }}>
                Activities
              </p>
              <h2 style={{ fontFamily: KD, fontSize: "clamp(1.5rem, 3vw, 2.4rem)", lineHeight: 1.1 }}>
                Things to do in {destination?.name ?? "this destination"}
              </h2>
            </div>

            <Link
              href="/destinations"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.55rem",
                padding: "0.8rem 1.2rem",
                borderRadius: "12px",
                border: "1px solid rgba(232,160,0,0.34)",
                color: "#E8C97A",
                textDecoration: "none",
                fontFamily: K,
                fontSize: "0.68rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
              }}
            >
              Back
            </Link>
          </div>

          {loading ? (
            <div className="dest-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "1.25rem" }}>
              {[1, 2, 3].map((item) => (
                <div key={item} style={{ borderRadius: "18px", minHeight: "320px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(232,160,0,0.14)" }} />
              ))}
            </div>
          ) : error ? (
            <div style={{ border: "1px solid rgba(232,160,0,0.18)", background: "rgba(255,255,255,0.02)", borderRadius: "18px", padding: "1.25rem 1.4rem", color: "rgba(247,240,227,0.7)" }}>
              {error}
            </div>
          ) : activities.length === 0 ? (
            <div style={{ border: "1px solid rgba(232,160,0,0.18)", background: "rgba(255,255,255,0.02)", borderRadius: "18px", padding: "1.25rem 1.4rem", color: "rgba(247,240,227,0.7)", fontStyle: "italic" }}>
              No activities were found for this destination yet.
            </div>
          ) : (
            <div className="dest-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "1.25rem" }}>
              {activities.map((activity, index) => {
                const activityName = activity.name?.trim() || "Unnamed activity";
                const type = activity.type?.trim() || "Activity";
                const tourismType = activity.tourism_type?.trim() || "";
                const fallbackImage = destination ? pickHeroImage(destination, index) : HERO_FALLBACKS[index % HERO_FALLBACKS.length];
                const image = pickActivityImage(activity, fallbackImage);

                return (
                  <Link
                    key={String(activity.id)}
                    href={`/activities/${encodeURIComponent(String(activity.id))}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <article style={{ overflow: "hidden", borderRadius: "18px", border: "1px solid rgba(232,160,0,0.18)", background: "linear-gradient(180deg, rgba(24,18,11,0.94), rgba(14,10,6,0.98))", boxShadow: "0 14px 40px rgba(0,0,0,0.35)", transition: "transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease", cursor: "pointer" }}>
                      <div style={{ position: "relative", height: "210px", overflow: "hidden", borderBottom: "1px solid rgba(232,160,0,0.16)" }}>
                        <Image src={image} alt={activityName} fill style={{ objectFit: "cover", objectPosition: "center" }} />
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,7,5,0.76) 0%, rgba(8,7,5,0.1) 50%, rgba(8,7,5,0) 100%)" }} />
                      </div>

                      <div style={{ padding: "1rem 1rem 1.15rem" }}>
                        <h3 style={{ fontFamily: KD, fontSize: "1.12rem", lineHeight: 1.25, color: "#F7F0E3", marginBottom: "0.7rem" }}>
                          {activityName}
                        </h3>

                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.9rem" }}>
                          <span style={{ fontFamily: K, fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", padding: "0.35rem 0.65rem", borderRadius: "999px", border: "1px solid rgba(232,160,0,0.25)", color: "#E8C97A" }}>
                            {type}
                          </span>
                          {tourismType ? (
                            <span style={{ fontFamily: K, fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", padding: "0.35rem 0.65rem", borderRadius: "999px", border: "1px solid rgba(232,160,0,0.18)", color: "rgba(247,240,227,0.62)" }}>
                              {tourismType}
                            </span>
                          ) : null}
                        </div>

                        <p style={{ fontFamily: K, fontSize: "0.66rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(247,240,227,0.46)" }}>
                          Open activity details
                        </p>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
