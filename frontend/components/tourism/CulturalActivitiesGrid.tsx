"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type ActivityItem = {
  id: number | string;
  name?: string;
  type?: string;
  tourism_type: string;
  category?: string;
  destination_id?: number | string;
  destination_name?: string;
  image_url?: string | null;
};

type BackendPayload = {
  success?: boolean;
  status?: string;
  message?: string;
  data?: ActivityItem[];
};

type CulturalActivitiesGridProps = {
  coverImage: string;
  cardBorderClass: string;
  accentLineClass: string;
  cardDescription: string;
  exploreDestination: string;
  tourismType: string;
  emptyLabel: string;
};

const ACTIVITIES_API_URL = "/api/activities";

function normalizeLabel(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function getTourismCandidates(tourismType: string): string[] {
  const normalized = normalizeLabel(tourismType);

  if (normalized === "egypt untold") {
    return ["egypt untold", "egypt untold tourism", "untold", "signature segment", "hidden", "forgotten"];
  }

  if (normalized === "nature & adventure tourism") {
    return ["nature & adventure tourism", "nature & adventure", "nature", "adventure", "eco"];
  }

  if (normalized === "coastal & diving") {
    return ["coastal & diving", "coastal & diving tourism", "sea"];
  }

  if (normalized === "ancient egyptian") {
    return ["ancient egyptian", "ancient egyptian tourism", "pharaonic", "heritage", "ancient"];
  }

  if (normalized === "desert") {
    return ["desert", "desert tourism"];
  }

  if (normalized === "medical") {
    return ["medical", "medical tourism"];
  }

  return [normalized];
}

function matchesTourismType(activity: ActivityItem, tourismType: string): boolean {
  const normalizedTourismTypes = getTourismCandidates(tourismType);
  const tourismTypeLabel = normalizeLabel(activity.tourism_type ?? "");

  // Prefer explicit tourism_type matching whenever backend provides it.
  if (tourismTypeLabel) {
    return normalizedTourismTypes.includes(tourismTypeLabel);
  }

  // Fallback for legacy rows that do not have tourism_type populated.
  const fallbackFields = [activity.type, activity.category]
    .filter((field): field is string => typeof field === "string" && field.trim().length > 0)
    .map(normalizeLabel);

  return fallbackFields.some((field) => normalizedTourismTypes.includes(field));
}

function getActivityImage(activity: ActivityItem, fallbackImage: string): string {
  const imageUrl = activity.image_url?.trim();

  if (imageUrl) {
    return imageUrl;
  }

  return fallbackImage;
}

export default function CulturalActivitiesGrid({
  coverImage,
  cardBorderClass,
  accentLineClass,
  cardDescription,
  exploreDestination,
  tourismType,
  emptyLabel,
}: CulturalActivitiesGridProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadActivities() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(ACTIVITIES_API_URL, { cache: "no-store" });
        const payload = (await response.json()) as BackendPayload;

        const isSuccess = payload.success === true || payload.status === "success";
        if (!response.ok || !isSuccess || !Array.isArray(payload.data)) {
          throw new Error(payload.message ?? "Failed to fetch activities");
        }

        const filtered = payload.data.filter((activity) => matchesTourismType(activity, tourismType));

        if (mounted) {
          setActivities(filtered);
        }
      } catch (fetchError) {
        if (mounted) {
          const message = fetchError instanceof Error ? fetchError.message : "Failed to load activities";
          setError(message);
          setActivities([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadActivities();

    return () => {
      mounted = false;
    };
  }, [tourismType]);

  const skeletonItems = useMemo(() => Array.from({ length: 6 }), []);

  if (loading) {
    return (
      <div className="relative grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {skeletonItems.map((_, index) => (
          <article
            key={`skeleton-${index}`}
            className={`group relative overflow-hidden rounded-2xl border bg-white/88 p-6 shadow-[0_16px_40px_-25px_rgba(15,23,42,0.65)] ring-1 ring-black/5 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/80 ${cardBorderClass}`}
          >
            <div className="-mx-6 -mt-6 mb-5 overflow-hidden border-b border-black/5 dark:border-white/10">
              <div className="h-40 w-full animate-pulse bg-slate-200/80 dark:bg-slate-700/70" />
            </div>

            <div className={`mb-5 h-1.5 w-24 rounded-full ${accentLineClass}`} />
            <div className="h-7 w-3/4 animate-pulse rounded bg-slate-200/80 dark:bg-slate-700/70" />
            <div className="mt-3 h-16 w-full animate-pulse rounded bg-slate-200/70 dark:bg-slate-700/60" />
            <div className="mt-6 h-5 w-1/2 animate-pulse rounded bg-slate-200/70 dark:bg-slate-700/60" />
          </article>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50/90 p-6 text-sm text-rose-700 dark:border-rose-400/40 dark:bg-rose-500/10 dark:text-rose-200">
        Failed to load activities. {error}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-6 text-sm text-amber-900 dark:border-amber-300/30 dark:bg-amber-400/10 dark:text-amber-200">
        No activities found for {emptyLabel} tourism.
      </div>
    );
  }

  return (
    <div className="relative grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {activities.map((activity) => {
        const name = activity.name?.trim() || "Unnamed activity";
        const destinationName = activity.destination_name?.trim() || "Egypt";
        const imageSrc = getActivityImage(activity, coverImage);

        return (
          <Link
            key={String(activity.id)}
            href={`/activities/${encodeURIComponent(String(activity.id))}`}
            className="block text-inherit no-underline"
          >
            <article
              className={`group relative overflow-hidden rounded-2xl border bg-white/88 p-6 shadow-[0_16px_40px_-25px_rgba(15,23,42,0.65)] ring-1 ring-black/5 backdrop-blur-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-24px_rgba(15,23,42,0.45)] dark:border-slate-700 dark:bg-slate-900/80 ${cardBorderClass}`}
            >
              <div className="-mx-6 -mt-6 mb-5 overflow-hidden border-b border-black/5 dark:border-white/10">
                <div className="relative h-40 w-full">
                  <Image
                    src={imageSrc}
                    alt={name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(10,10,12,0.56)_0%,rgba(10,10,12,0.05)_60%)]" />
                </div>
              </div>

              <div className={`mb-5 h-1.5 w-24 rounded-full ${accentLineClass}`} />

              <h2 className="text-xl font-semibold leading-tight text-slate-900 dark:text-slate-100">{name}</h2>

              <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-300">{cardDescription}</p>

              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                {destinationName}
              </p>

              <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-amber-800 transition group-hover:text-amber-700 dark:text-amber-300 dark:group-hover:text-amber-200">
                {exploreDestination}
                <span aria-hidden="true" className="transition group-hover:translate-x-1">
                  -&gt;
                </span>
              </div>
            </article>
          </Link>
        );
      })}
    </div>
  );
}
