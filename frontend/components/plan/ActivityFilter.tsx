"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { API_BASE_URL } from "@/lib/api";
import ActivityCardView from "./ActivityCardView";

export type Activity = {
  id: string | number;
  name: string;
  type: string;
  category: string;
  destination_id: number;
  destination_name: string;
  rating: number;
  price: string;
  is_hidden: number | boolean;
  latitude?: number;
  longitude?: number;
};

type ActivityFilterProps = {
  destinationId?: number | null;
  tourismType?: string | null;
  showFilters?: boolean;
  showClearButton?: boolean;
  title?: string;
  emptyMessage?: string;
  onFilterChange?: (destination_id: number | null, tourism_type: string | null) => void;
};

const TOURISM_TYPES = [
  "Cultural",
  "Sea",
  "Desert",
  "Eco",
  "Medical",
  "Religious",
];

export default function ActivityFilter({
  destinationId: initialDestinationId = null,
  tourismType: initialTourismType = null,
  showFilters = true,
  showClearButton = true,
  title,
  emptyMessage,
  onFilterChange,
}: ActivityFilterProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [destinationId, setDestinationId] = useState<number | null>(initialDestinationId);
  const [tourismType, setTourismType] = useState<string | null>(initialTourismType);
  const locale = useLocale();
  const t = useTranslations("activities");

  // Fetch activities whenever filters change
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (destinationId && destinationId > 0) {
          params.append("destination_id", destinationId.toString());
        }
        if (tourismType && tourismType.trim()) {
          params.append("tourism_type", tourismType);
        }

        const url = `${API_BASE_URL}/activities.php${params.toString() ? `?${params}` : ""}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const json = await response.json();

        if (json.status === "success" && Array.isArray(json.data)) {
          setActivities(json.data);
        } else {
          setActivities([]);
        }
      } catch (err) {
        console.error("Error fetching activities:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch activities");
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
    onFilterChange?.(destinationId, tourismType);
  }, [destinationId, tourismType, onFilterChange]);

  const handleClearFilters = () => {
    setDestinationId(null);
    setTourismType(null);
  };

  const handleTourismTypeToggle = (type: string) => {
    setTourismType(tourismType === type ? null : type);
  };

  const hasActiveFilters = destinationId !== null || tourismType !== null;

  return (
    <div className="space-y-5">
      {/* Title */}
      {title && (
        <h2 className="text-lg font-bold tracking-tight text-[#F7F0E3]">
          {title}
        </h2>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
          {/* Tourism Type Filter */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
              {locale === "ar" ? "نوع السياحة" : "Tourism Type"}
            </p>
            <div className="flex flex-wrap gap-2">
              {TOURISM_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => handleTourismTypeToggle(type)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                    tourismType === type
                      ? "border-amber-400/70 bg-amber-400/20 text-amber-200"
                      : "border-white/20 bg-white/5 text-white/70 hover:border-amber-400/40 hover:bg-amber-400/10 hover:text-amber-200"
                  }`}
                  style={{
                    border: tourismType === type ? "1px solid" : "1px solid",
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Clear Filters Button */}
          {showClearButton && hasActiveFilters && (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center rounded-full border border-rose-400/40 bg-rose-400/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-rose-300 transition hover:border-rose-400/70 hover:bg-rose-400/20"
              >
                ✕ {locale === "ar" ? "مسح الفلاتر" : "Clear Filters"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/10" />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 p-5 text-sm text-rose-200">
          {locale === "ar" ? "خطأ: " : "Error: "} {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && activities.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <p className="text-sm text-white/55">
            {emptyMessage ||
              (locale === "ar"
                ? "لم يتم العثور على أنشطة"
                : "No activities found")}
          </p>
        </div>
      )}

      {/* Activities Grid */}
      {!loading && !error && activities.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activities.map((activity) => (
            <ActivityCardView
              key={activity.id}
              activity={{
                id: activity.id.toString(),
                name: activity.name,
                price: activity.price,
              }}
              priceLabel={t("priceLabel")}
              noPriceLabel={t("noPriceLabel")}
              showType={true}
              type={activity.type}
              rating={activity.rating}
            />
          ))}
        </div>
      )}

      {/* Results Count */}
      {!loading && activities.length > 0 && (
        <div className="flex items-center justify-end">
          <span className="text-xs text-white/50">
            {locale === "ar"
              ? `${activities.length} نشاط`
              : `${activities.length} ${activities.length === 1 ? "activity" : "activities"}`}
          </span>
        </div>
      )}
    </div>
  );
}
