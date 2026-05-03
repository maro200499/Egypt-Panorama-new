"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "@/lib/api";

type RawDestination = {
  id: number | string;
  name: string;
  latitude: number | string | null;
  longitude: number | string | null;
  category?: string | null;
  type?: string | null;
  is_hidden?: boolean | number | string | null;
};

type RawActivity = {
  id: number | string;
  name: string;
  destination_id: number | string;
  destination_name: string;
  latitude: number | string | null;
  longitude: number | string | null;
  category?: string | null;
  type?: string | null;
  rating?: number | string | null;
  price?: number | string | null;
  is_hidden?: boolean | number | string | null;
};

type MapPayload = {
  destinations: RawDestination[];
  activities: RawActivity[];
};

export type PlaceCategory = "Cultural" | "Adventure" | "Sea";

export type PlaceItem = {
  id: number;
  source: "destination" | "activity";
  name: string;
  destinationName: string;
  category: PlaceCategory;
  type: string;
  rating?: number;
  price?: string;
  isHidden: boolean;
  latitude: number;
  longitude: number;
};

const mapLegendItems: Array<{ category: PlaceCategory; color: string }> = [
  { category: "Cultural", color: "#f59e0b" },
  { category: "Adventure", color: "#ef4444" },
  { category: "Sea", color: "#06b6d4" },
];

const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
});

function asFiniteNumber(value: unknown): number | null {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function asBoolean(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "1" || normalized === "true" || normalized === "yes";
  }

  return false;
}

function normalizeCategory(rawCategory: unknown, rawType: unknown, name: string, isHidden: boolean): PlaceCategory {
  if (isHidden || /hidden|gem/i.test(name)) {
    return "Adventure";
  }

  const merged = `${String(rawCategory ?? "")} ${String(rawType ?? "")} ${name}`.toLowerCase();

  if (/sea|coast|beach|dive|marine|red sea|island|snorkel/.test(merged)) {
    return "Sea";
  }

  if (/desert|safari|mountain|hike|camp|oasis|adventure|nature|eco|wadi/.test(merged)) {
    return "Adventure";
  }

  if (/ancient|pharaoh|temple|pyramid|archaeolog|historic|islam|mosque|coptic|religious|heritage|museum/.test(merged)) {
    return "Cultural";
  }

  return "Cultural";
}

function priceBand(price: string): "Budget" | "Mid" | "Premium" | "N/A" {
  if (price === "N/A") {
    return "N/A";
  }

  const numeric = Number(price.replace(/[^\d.]/g, ""));
  if (!Number.isFinite(numeric)) {
    const lower = price.toLowerCase();
    if (/budget|cheap|low/.test(lower)) {
      return "Budget";
    }
    if (/luxury|premium|vip/.test(lower)) {
      return "Premium";
    }
    if (/mid|standard|moderate/.test(lower)) {
      return "Mid";
    }
    return "N/A";
  }

  if (numeric < 50) {
    return "Budget";
  }
  if (numeric <= 150) {
    return "Mid";
  }
  return "Premium";
}

function categoryIcon(category: PlaceCategory): string {
  if (category === "Cultural") {
    return "🏛️";
  }
  if (category === "Adventure") {
    return "🏜️";
  }
  return "🌊";
}

export default function MapsPage() {
  const [places, setPlaces] = useState<PlaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<"All" | PlaceCategory>("All");
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [priceFilter, setPriceFilter] = useState<"All" | "Budget" | "Mid" | "Premium" | "N/A">("All");
  const [showDestinations, setShowDestinations] = useState(true);
  const [showActivities, setShowActivities] = useState(true);
  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);
  const [animationCycle, setAnimationCycle] = useState(0);

  const mapDataUrl = useMemo(() => `${API_BASE_URL}/map-data.php`, []);

  useEffect(() => {
    const loadMapData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(mapDataUrl, {
          method: "GET",
          mode: "cors",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const payload = (await response.json()) as MapPayload;

        const parsedDestinations = Array.isArray(payload.destinations)
          ? payload.destinations
              .map((row) => {
                const id = Number(row.id);
                const latitude = asFiniteNumber(row.latitude);
                const longitude = asFiniteNumber(row.longitude);

                if (!Number.isFinite(id) || latitude === null || longitude === null) {
                  return null;
                }

                const isHidden = asBoolean(row.is_hidden);
                const category = normalizeCategory(row.category, row.type, row.name, isHidden);

                return {
                  id,
                  source: "destination",
                  name: row.name,
                  destinationName: row.name,
                  category,
                  type: String(row.type ?? "Destination"),
                  isHidden,
                  latitude,
                  longitude,
                } as PlaceItem;
              })
              .filter((item): item is PlaceItem => item !== null)
          : [];

        const parsedActivities = Array.isArray(payload.activities)
          ? payload.activities
              .map((row) => {
                const id = Number(row.id);
                const destinationId = Number(row.destination_id);
                const latitude = asFiniteNumber(row.latitude);
                const longitude = asFiniteNumber(row.longitude);

                if (!Number.isFinite(id) || !Number.isFinite(destinationId) || latitude === null || longitude === null) {
                  return null;
                }

                const isHidden = asBoolean(row.is_hidden);
                const category = normalizeCategory(row.category, row.type, row.name, isHidden);

                return {
                  id: destinationId * 100000 + id,
                  source: "activity",
                  name: row.name,
                  destinationName: row.destination_name,
                  category,
                  type: String(row.type ?? "Activity"),
                  rating: asFiniteNumber(row.rating) ?? 4,
                  price: String(row.price ?? "N/A").trim() || "N/A",
                  isHidden,
                  latitude,
                  longitude,
                } as PlaceItem;
              })
              .filter((item): item is PlaceItem => item !== null)
          : [];

        setPlaces([...parsedDestinations, ...parsedActivities]);
      } catch (fetchError) {
        const message = fetchError instanceof Error ? fetchError.message : "Unknown fetch error";
        console.error("Failed to load map data", { url: mapDataUrl, message });
        setError(`Failed to load map data. ${message}`);
      } finally {
        setLoading(false);
      }
    };

    void loadMapData();
  }, [mapDataUrl]);

  const filteredPlaces = useMemo(() => {
    return places.filter((place) => {
      const categoryMatch = categoryFilter === "All" || place.category === categoryFilter;
      const ratingMatch = place.source === "activity" ? (place.rating ?? 0) >= ratingFilter : true;
      const priceMatch = place.source === "activity" ? priceFilter === "All" || priceBand(place.price ?? "N/A") === priceFilter : true;
      const sourceMatch =
        (showDestinations && place.source === "destination") ||
        (showActivities && place.source === "activity");
      return categoryMatch && ratingMatch && priceMatch && sourceMatch;
    });
  }, [categoryFilter, places, priceFilter, ratingFilter, showActivities, showDestinations]);

  const selectedPlace = useMemo(
    () => filteredPlaces.find((place) => place.id === selectedPlaceId) ?? null,
    [filteredPlaces, selectedPlaceId]
  );

  useEffect(() => {
    if (selectedPlaceId !== null && !filteredPlaces.some((place) => place.id === selectedPlaceId)) {
      setSelectedPlaceId(null);
    }
  }, [filteredPlaces, selectedPlaceId]);

  useEffect(() => {
    setAnimationCycle((value) => value + 1);
  }, [categoryFilter, ratingFilter, priceFilter, showDestinations, showActivities]);

  if (loading) {
    return (
      <div className="maps-shell min-h-screen w-full p-4 md:p-5 lg:p-6 text-slate-100">
        <div className="mx-auto grid h-[calc(100vh-2.5rem)] max-w-375 grid-cols-1 gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="maps-panel rounded-3xl border border-slate-700/40 p-4 animate-pulse">
            <div className="h-8 w-2/3 rounded-xl bg-slate-700/60" />
            <div className="mt-4 h-11 rounded-xl bg-slate-700/40" />
            <div className="mt-3 h-11 rounded-xl bg-slate-700/40" />
            <div className="mt-3 h-11 rounded-xl bg-slate-700/40" />
            <div className="mt-6 space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-20 rounded-2xl bg-slate-700/30" />
              ))}
            </div>
          </div>
          <div className="maps-panel rounded-3xl border border-slate-700/40 relative overflow-hidden">
            <div
              className="absolute inset-0 animate-pulse"
              style={{ backgroundImage: "linear-gradient(135deg, #071028 0%, #0f1e3d 45%, #0b1226 100%)" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-14 w-14 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="maps-shell min-h-screen w-full flex items-center justify-center p-6 text-center text-slate-100">
        {error}
      </div>
    );
  }

  return (
    <div className="maps-shell min-h-screen w-full p-4 md:p-5 lg:p-6 text-slate-100">
      <div className="mx-auto grid h-[calc(100vh-2.5rem)] max-w-375 grid-cols-1 gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="maps-panel rounded-3xl border border-slate-700/40 flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-600/30">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-50">Egypt Explorer Atlas</h1>
            <p className="text-sm text-slate-300/80 mt-1">Interactive graduation-level map for destinations and activities</p>

            <div className="mt-4 grid gap-3">
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value as "All" | PlaceCategory)}
                className="w-full rounded-xl border border-slate-600/50 bg-slate-950/60 px-3 py-2 text-sm outline-none transition focus:border-cyan-400/80"
              >
                <option value="All">All Categories</option>
                <option value="Cultural">Cultural</option>
                <option value="Adventure">Adventure</option>
                <option value="Sea">Sea</option>
              </select>

              <select
                value={ratingFilter}
                onChange={(event) => setRatingFilter(Number(event.target.value))}
                className="w-full rounded-xl border border-slate-600/50 bg-slate-950/60 px-3 py-2 text-sm outline-none transition focus:border-cyan-400/80"
              >
                <option value={0}>All Ratings</option>
                <option value={3}>3.0+</option>
                <option value={4}>4.0+</option>
                <option value={4.5}>4.5+</option>
              </select>

              <select
                value={priceFilter}
                onChange={(event) => setPriceFilter(event.target.value as "All" | "Budget" | "Mid" | "Premium" | "N/A")}
                className="w-full rounded-xl border border-slate-600/50 bg-slate-950/60 px-3 py-2 text-sm outline-none transition focus:border-cyan-400/80"
              >
                <option value="All">All Prices</option>
                <option value="Budget">Budget</option>
                <option value="Mid">Mid</option>
                <option value="Premium">Premium</option>
                <option value="N/A">N/A</option>
              </select>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowDestinations((value) => !value)}
                  className={`rounded-lg border px-3 py-2 font-medium transition-all duration-200 ${
                    showDestinations
                      ? "border-emerald-300/60 bg-emerald-500/20 text-emerald-100 shadow-[0_0_0_1px_rgba(16,185,129,0.28)]"
                      : "border-slate-600/60 bg-slate-900/60 text-slate-300"
                  }`}
                >
                  Toggle Destinations
                </button>
                <button
                  type="button"
                  onClick={() => setShowActivities((value) => !value)}
                  className={`rounded-lg border px-3 py-2 font-medium transition-all duration-200 ${
                    showActivities
                      ? "border-cyan-300/60 bg-cyan-500/20 text-cyan-100 shadow-[0_0_0_1px_rgba(6,182,212,0.26)]"
                      : "border-slate-600/60 bg-slate-900/60 text-slate-300"
                  }`}
                >
                  Toggle Activities
                </button>
              </div>
            </div>

            <div className="mt-4 text-xs text-slate-300/80">
              Showing {filteredPlaces.length} of {places.length} places
            </div>
          </div>

          <div className="overflow-y-auto p-3 space-y-2 scroll-smooth">
            {filteredPlaces.map((place, index) => {
              const isActive = selectedPlace?.id === place.id;
              const sourceLabel = place.source === "destination" ? "Destination" : "Activity";
              const activityRating = place.rating !== undefined ? place.rating.toFixed(1) : null;
              const showMetrics = place.source === "activity";

              return (
                <button
                  key={place.id}
                  onClick={() => setSelectedPlaceId(place.id)}
                  className={`maps-list-card w-full text-left rounded-2xl border px-3.5 py-3.5 transition-all duration-300 ease-out transform-gpu ${
                    isActive
                      ? "bg-slate-900/90 border-cyan-300/70 shadow-[0_0_0_1px_rgba(103,232,249,0.28),0_10px_30px_rgba(0,0,0,0.35)] scale-[1.01]"
                      : "bg-slate-950/55 border-slate-700/50 hover:border-cyan-300/45 hover:shadow-[0_8px_20px_rgba(0,0,0,0.3)] hover:scale-[1.01]"
                  }`}
                  style={{
                    animationDelay: `${Math.min(index, 10) * 36}ms`,
                    animationName: animationCycle % 2 === 0 ? "maps-card-stagger-a" : "maps-card-stagger-b",
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium leading-tight text-slate-100 flex items-center gap-2">
                      <span className="text-base" aria-hidden>
                        {categoryIcon(place.category)}
                      </span>
                      {place.name}
                    </p>
                    {showMetrics && activityRating ? <span className="text-xs text-cyan-200">{activityRating}★</span> : null}
                  </div>
                  <p className="text-xs text-slate-300/80 mt-1">{place.destinationName}</p>
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span className="rounded-full px-2 py-0.5 bg-slate-900/90 border border-slate-500/60 text-slate-200">
                      {place.category}
                    </span>
                    <span className="rounded-full px-2 py-0.5 bg-slate-900/90 border border-slate-600/70 text-slate-300/90">
                      {sourceLabel}
                    </span>
                    {showMetrics && place.price ? <span className="text-indigo-200">{place.price}</span> : null}
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="maps-panel rounded-3xl border border-slate-700/40 overflow-hidden bg-slate-950/50 relative">
          <div className="absolute z-500 left-3 top-3 md:left-4 md:top-4 rounded-2xl border border-slate-500/45 bg-slate-950/75 backdrop-blur px-3 py-2.5 shadow-[0_10px_24px_rgba(0,0,0,0.35)]">
            <p className="text-[11px] tracking-[0.08em] uppercase text-slate-300/80 font-semibold">Map Legend</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {mapLegendItems.map((item) => (
                <span
                  key={item.category}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-500/60 bg-slate-900/85 px-2.5 py-1 text-[11px] text-slate-100"
                >
                  <span className="text-sm leading-none" aria-hidden>
                    {categoryIcon(item.category)}
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.category}
                </span>
              ))}
            </div>
          </div>
          <MapComponent
            places={filteredPlaces}
            selectedPlaceId={selectedPlaceId}
            onSelectPlace={setSelectedPlaceId}
          />
        </section>
      </div>
    </div>
  );
}
