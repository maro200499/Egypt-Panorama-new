"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type DestinationItem = {
  id: number | string;
  name?: string;
  city?: string;
  type?: string;
  cover_image?: string;
};

type ActivityItem = {
  id: number | string;
  name?: string;
  destination_name?: string;
  tourism_type?: string;
  type?: string;
  category?: string;
  image_url?: string;
};

type SearchKind = "destination" | "activity";

type FlatResult =
  | { kind: "destination"; item: DestinationItem; index: number }
  | { kind: "activity"; item: ActivityItem; index: number };

const DESTINATIONS_URL = "http://localhost/Egypt_panorama/backend/api/destinations/get_all.php";
const ACTIVITIES_URL = "http://localhost/Egypt_panorama/backend/api/activities/get_all.php";

const TRENDING_PILLS = [
  "Ancient Egyptian",
  "Red Sea Diving",
  "Egypt Untold",
  "Siwa Oasis",
  "Islamic Cairo",
];

function toArray(payload: unknown): any[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object" && Array.isArray((payload as { data?: unknown }).data)) {
    return (payload as { data: unknown[] }).data;
  }
  return [];
}

function cleanString(value: unknown): string {
  return String(value ?? "").trim();
}

function matchesQuery(text: string, query: string): boolean {
  if (!query) return true;
  return text.toLowerCase().includes(query.toLowerCase());
}

function openSearchEvent() {
  return new Event("open-global-search");
}

export default function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [destinations, setDestinations] = useState<DestinationItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("open-global-search", onOpen);
    return () => window.removeEventListener("open-global-search", onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }

      if (flatResults.length === 0) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((current) => (current + 1) % flatResults.length);
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((current) => (current - 1 + flatResults.length) % flatResults.length);
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        openActiveResult();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, activeIndex]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setFetchError("");

      try {
        const [destinationsResponse, activitiesResponse] = await Promise.all([
          fetch(DESTINATIONS_URL),
          fetch(ACTIVITIES_URL),
        ]);

        const [destinationsJson, activitiesJson] = await Promise.all([
          destinationsResponse.json(),
          activitiesResponse.json(),
        ]);

        setDestinations(toArray(destinationsJson));
        setActivities(toArray(activitiesJson));
      } catch (error) {
        console.error("Global search fetch failed:", error);
        setFetchError("Search data could not be loaded right now.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const normalizedQuery = query.trim();

  const filteredDestinations = useMemo(() => {
    return destinations.filter((item) => {
      const haystack = [item.name, item.city, item.type].map(cleanString).join(" ");
      return matchesQuery(haystack, normalizedQuery);
    });
  }, [destinations, normalizedQuery]);

  const filteredActivities = useMemo(() => {
    return activities.filter((item) => {
      const haystack = [item.name, item.destination_name, item.tourism_type, item.type, item.category]
        .map(cleanString)
        .join(" ");
      return matchesQuery(haystack, normalizedQuery);
    });
  }, [activities, normalizedQuery]);

  const flatResults = useMemo<FlatResult[]>(() => {
    const destinationResults = filteredDestinations.map((item, index) => ({ kind: "destination" as const, item, index }));
    const activityResults = filteredActivities.map((item, index) => ({ kind: "activity" as const, item, index }));
    return [...destinationResults, ...activityResults];
  }, [filteredDestinations, filteredActivities]);

  useEffect(() => {
    if (!open) return;
    if (flatResults.length === 0) {
      setActiveIndex(-1);
      return;
    }

    setActiveIndex((current) => (current < 0 || current >= flatResults.length ? 0 : current));
  }, [open, flatResults.length, normalizedQuery]);

  useEffect(() => {
    if (!open || activeIndex < 0) return;
    itemRefs.current[activeIndex]?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [open, activeIndex]);

  const destinationOffset = 0;
  const activityOffset = filteredDestinations.length;

  const openActiveResult = () => {
    const active = flatResults[activeIndex];
    if (!active) return;

    const id = active.item.id;
    setOpen(false);
    if (active.kind === "destination") {
      router.push(`/destinations/${id}`);
      return;
    }

    router.push(`/activities/${id}`);
  };

  const selectTrending = (pill: string) => {
    setQuery(pill);
    setOpen(true);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  };

  const closeOverlay = () => setOpen(false);

  const headerCount = flatResults.length;

  const resultTitle = (value: unknown) => cleanString(value) || "Untitled";

  const itemKey = (kind: SearchKind, id: number | string) => `${kind}-${id}`;

  const resultIcon = (kind: SearchKind) =>
    kind === "destination" ? (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3l8 13H4L12 3Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M10 16h4v5h-4z" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ) : (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 4c2.8 0 5 2.2 5 5s-2.2 5-5 5-5-2.2-5-5 2.2-5 5-5Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M7 18c1.4-2 3.5-3 5-3s3.6 1 5 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );

  return (
    <>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&display=swap');
        .overlay { position: fixed; inset: 0; z-index: 1200; background: #0D0A06; color: #f7efe1; font-family: 'Cinzel', serif; }
        .top-glow { position: absolute; inset: 0 0 auto 0; height: 2px; background: linear-gradient(90deg, transparent 0%, #E8A000 22%, #f7d98a 50%, #E8A000 78%, transparent 100%); box-shadow: 0 0 26px rgba(232,160,0,0.7); }
        .search-shell { position: relative; height: 100%; display: flex; flex-direction: column; }
        .search-panel { width: min(1240px, calc(100% - 24px)); margin: 0 auto; padding: 18px 0 20px; height: 100%; display: flex; flex-direction: column; }
        .glass { background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.015)); border: 1px solid rgba(232,160,0,0.12); box-shadow: 0 30px 80px rgba(0,0,0,0.5); backdrop-filter: blur(10px); }
        .search-input { width: 100%; min-height: 68px; background: rgba(14,10,6,0.94); border: 1px solid rgba(232,160,0,0.38); color: #fff; border-radius: 18px; padding: 0 18px 0 50px; outline: none; font-size: 18px; line-height: 1.2; box-shadow: inset 0 0 0 1px rgba(201,168,76,0.06); }
        .search-input::placeholder { color: rgba(247,239,225,0.36); }
        .search-input:focus { border-color: rgba(232,160,0,0.68); box-shadow: 0 0 0 4px rgba(232,160,0,0.12), inset 0 0 0 1px rgba(201,168,76,0.12); }
        .trending-pill { border: 1px solid rgba(232,160,0,0.25); background: rgba(255,255,255,0.03); color: #e6d5b2; transition: all 0.15s ease; }
        .trending-pill:hover { border-color: rgba(232,160,0,0.55); background: rgba(232,160,0,0.1); color: #fff5d9; transform: translateY(-1px); }
        .section-label { color: #E8A000; }
        .result-row { transition: all 0.15s ease; }
        .result-row:hover { transform: translateY(-1px); }
        .result-row.active { background: linear-gradient(135deg, rgba(232,160,0,0.2), rgba(255,255,255,0.03)); border-color: rgba(232,160,0,0.58); box-shadow: 0 12px 28px rgba(0,0,0,0.25); }
        .scroll-area { min-height: 0; }
        @media (max-width: 900px) {
          .mobile-stack { grid-template-columns: 1fr; }
        }
      `}</style>

      {open && (
        <div className="overlay" role="dialog" aria-modal="true" aria-label="Egypt Panorama Global Search" onMouseDown={closeOverlay}>
          <div className="top-glow" />
          <div className="search-shell" onMouseDown={(event) => event.stopPropagation()}>
            <div className="search-panel">
              <div className="flex items-center justify-between gap-4 px-1 pb-5">
                <div className="text-[13px] font-semibold uppercase tracking-[0.28em] text-amber-100/85">
                  Egypt Panorama · Global Search
                </div>
                <button
                  type="button"
                  onClick={closeOverlay}
                  className="rounded-full border border-amber-200/20 bg-white/5 px-4 py-2 text-[12px] font-bold uppercase tracking-[0.2em] text-amber-100 transition hover:border-amber-300/40 hover:bg-white/10"
                >
                  ESC
                </button>
              </div>

              <div className="glass rounded-[28px] p-5 md:p-6">
                <div className="relative">
                  <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[#E8A000]">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle cx="11" cy="11" r="7.5" stroke="currentColor" strokeWidth="1.8" />
                      <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </span>

                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="search-input"
                    placeholder="Search destinations, activities, hidden gems, regions..."
                    aria-label="Global search"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      const speak = window.SpeechRecognition || window.webkitSpeechRecognition;
                      if (!speak) {
                        setFetchError("Speech recognition is not supported in this browser.");
                        return;
                      }
                      setFetchError("");
                      const browserLanguage = navigator.language?.toLowerCase().startsWith("ar") ? "ar-EG" : "en-US";
                      const recognition = new speak();
                      recognition.continuous = false;
                      recognition.interimResults = true;
                      recognition.maxAlternatives = 1;
                      recognition.lang = browserLanguage;
                      recognition.onresult = (event: SpeechRecognitionEvent) => {
                        const transcript = Array.from(event.results)
                          .map((result) => result[0]?.transcript || "")
                          .join("")
                          .trim();
                        if (transcript) setQuery(transcript);
                      };
                      recognition.onerror = () => setFetchError("Microphone access is blocked or unavailable.");
                      recognition.start();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-amber-200/20 bg-[#14110f] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-100 transition hover:border-amber-300/40 hover:bg-[#1a1511]"
                  >
                    VOICE
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {TRENDING_PILLS.map((pill) => (
                    <button
                      key={pill}
                      type="button"
                      onClick={() => selectTrending(pill)}
                      className="trending-pill rounded-full px-4 py-2 text-sm font-semibold"
                    >
                      {pill}
                    </button>
                  ))}
                </div>

                <div className="mt-5 h-px w-full bg-linear-to-r from-transparent via-[#E8A000] to-transparent" />

                <div className="mt-5 grid gap-5 mobile-stack md:grid-cols-2">
                  <section className="min-w-0">
                    <div className="mb-3 flex items-center justify-between px-1">
                      <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] section-label">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-amber-300/20 bg-amber-300/10 text-[#E8A000]">
                          ⛭
                        </span>
                        Destinations
                      </div>
                      <div className="text-xs font-semibold text-amber-100/75">{filteredDestinations.length} results</div>
                    </div>

                    <div className="scroll-area flex max-h-[48vh] flex-col gap-3 overflow-y-auto pr-1">
                      {loading ? (
                        <div className="rounded-2xl border border-amber-200/10 bg-white/5 p-4 text-sm text-amber-100/70">Loading destinations...</div>
                      ) : filteredDestinations.length === 0 ? (
                        <div className="rounded-2xl border border-amber-200/10 bg-white/5 p-4 text-sm text-amber-100/70">No destinations match your search.</div>
                      ) : (
                        filteredDestinations.map((item, index) => {
                          const flatIndex = destinationOffset + index;
                          const active = activeIndex === flatIndex;

                          return (
                            <button
                              key={itemKey("destination", item.id)}
                              ref={(element) => {
                                itemRefs.current[flatIndex] = element;
                              }}
                              type="button"
                              onClick={() => {
                                setOpen(false);
                                router.push(`/destinations/${item.id}`);
                              }}
                              className={`result-row w-full rounded-2xl border p-4 text-left ${active ? "active" : "border-amber-200/10 bg-white/5 hover:border-amber-300/30 hover:bg-white/8"}`}
                            >
                              <div className="flex items-start gap-3">
                                <span className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber-300/20 bg-amber-300/10 text-[#E8A000]">
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                    <path d="M12 3l8 13H4L12 3Z" stroke="currentColor" strokeWidth="1.8" />
                                    <path d="M10 16h4v5h-4z" stroke="currentColor" strokeWidth="1.8" />
                                  </svg>
                                </span>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="truncate text-[15px] font-semibold text-white">{resultTitle(item.name)}</div>
                                    <span className="text-[#E8A000]">→</span>
                                  </div>
                                  <div className="mt-1 text-sm text-amber-100/70">{cleanString(item.city) || "Region not listed"}</div>
                                </div>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </section>

                  <section className="min-w-0">
                    <div className="mb-3 flex items-center justify-between px-1">
                      <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-amber-100/95">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-amber-300/20 bg-amber-300/10 text-[#C9A84C]">
                          ✦
                        </span>
                        Activities
                      </div>
                      <div className="text-xs font-semibold text-amber-100/75">{filteredActivities.length} results</div>
                    </div>

                    <div className="scroll-area flex max-h-[48vh] flex-col gap-3 overflow-y-auto pr-1">
                      {loading ? (
                        <div className="rounded-2xl border border-amber-200/10 bg-white/5 p-4 text-sm text-amber-100/70">Loading activities...</div>
                      ) : filteredActivities.length === 0 ? (
                        <div className="rounded-2xl border border-amber-200/10 bg-white/5 p-4 text-sm text-amber-100/70">No activities match your search.</div>
                      ) : (
                        filteredActivities.map((item, index) => {
                          const flatIndex = activityOffset + index;
                          const active = activeIndex === flatIndex;
                          const badge = cleanString(item.tourism_type || item.type || item.category || "Activity");

                          return (
                            <button
                              key={itemKey("activity", item.id)}
                              ref={(element) => {
                                itemRefs.current[flatIndex] = element;
                              }}
                              type="button"
                              onClick={() => {
                                setOpen(false);
                                router.push(`/activities/${item.id}`);
                              }}
                              className={`result-row w-full rounded-2xl border p-4 text-left ${active ? "active" : "border-amber-200/10 bg-white/5 hover:border-amber-300/30 hover:bg-white/8"}`}
                            >
                              <div className="flex items-start gap-3">
                                <span className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber-300/20 bg-amber-300/10 text-[#C9A84C]">
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                    <path d="M12 4c2.8 0 5 2.2 5 5s-2.2 5-5 5-5-2.2-5-5 2.2-5 5-5Z" stroke="currentColor" strokeWidth="1.8" />
                                    <path d="M7 18c1.4-2 3.5-3 5-3s3.6 1 5 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                                  </svg>
                                </span>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="truncate text-[15px] font-semibold text-white">{resultTitle(item.name)}</div>
                                    <span className="text-[#C9A84C]">→</span>
                                  </div>
                                  <div className="mt-2 flex flex-wrap items-center gap-2">
                                    <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-100">
                                      {badge}
                                    </span>
                                    <div className="text-sm text-amber-100/70">{cleanString(item.destination_name) || "Destination not listed"}</div>
                                  </div>
                                </div>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </section>
                </div>

                <div className="mt-5 flex flex-col gap-2 border-t border-amber-200/10 pt-4 text-sm text-amber-100/80 md:flex-row md:items-center md:justify-between">
                  <div>{headerCount} total results</div>
                  <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-amber-100/70">
                    <span className="rounded-full border border-amber-200/15 px-3 py-1">↑↓ Navigate</span>
                    <span className="rounded-full border border-amber-200/15 px-3 py-1">↵ Open</span>
                    <span className="rounded-full border border-amber-200/15 px-3 py-1">ESC Close</span>
                  </div>
                </div>

                {fetchError ? (
                  <div className="mt-3 rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-50">{fetchError}</div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
