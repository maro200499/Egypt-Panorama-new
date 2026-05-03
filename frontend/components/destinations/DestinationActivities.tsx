"use client";

import Link from "next/link";
import type { Activity } from "@/lib/destinationsData";

interface Props {
  activities: Activity[];
  isAr?: boolean;
}

const ClockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const TagIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

export default function DestinationActivities({ activities, isAr = false }: Props) {
  const labels = isAr
    ? { duration: "المدة", price: "السعر", from: "يبدأ من" }
    : { duration: "Duration", price: "Price", from: "From" };

  return (
    <div className="flex flex-col gap-4">
      {activities.map((act, index) => {
        const activityId = act.id ?? index + 1;

        return (
          <Link
            key={activityId}
            href={`/activities/${activityId}`}
            className="group relative block overflow-hidden rounded-xl border border-white/[0.07] p-5 transition-all duration-300 hover:border-amber-400/30"
            style={{
              textDecoration: "none",
              backgroundColor: "rgba(255,255,255,0.02)",
            }}
          >
            {act.price && (
              <span
                className="absolute right-4 top-4 rounded-full border border-amber-400/35 bg-amber-400/12 px-3 py-1 text-[0.6rem] uppercase tracking-wider text-amber-400"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {labels.from}: {act.price}
              </span>
            )}

            <h4
              className="mb-1 pr-28 text-[0.85rem] font-semibold tracking-wide text-[#F7F0E3]"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              {act.name}
            </h4>

            <p
              className="mb-3 text-[0.82rem] italic leading-relaxed text-white/50"
              style={{ fontFamily: "'Lora', serif" }}
            >
              {act.description}
            </p>

            <div className="flex flex-wrap gap-2">
              {act.duration && (
                <span className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1 text-[0.68rem] text-white/40">
                  <ClockIcon />
                  {act.duration}
                </span>
              )}
              {act.price && (
                <span className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1 text-[0.68rem] text-white/40">
                  <TagIcon />
                  {act.price}
                </span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
