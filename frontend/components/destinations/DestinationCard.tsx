"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Destination } from "@/lib/destinationsData";
import { typeFallbackImages } from "@/lib/destinationsData";

interface Props {
  destination: Destination;
  index?: number;
  isAr?: boolean;
}

export default function DestinationCard({ destination: d, index = 0, isAr = false }: Props) {
  const [imgError, setImgError] = useState(false);

  const src = imgError ? (typeFallbackImages[d.type] ?? "/images/hero/pyramids.jpg") : d.coverImage;

  const delay = `${(index % 3) * 0.1}s`;

  return (
    <div
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-[#110E09] shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-300 hover:border-amber-400/40 hover:shadow-[0_20px_60px_rgba(232,160,0,0.13)]"
      style={{ animationDelay: delay }}
    >
      {/* ── Image ── */}
      <div className="relative h-56 overflow-hidden shrink-0">
        <Image
          src={src}
          alt={d.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          style={{ objectPosition: d.coverPosition ?? "center" }}
          onError={() => setImgError(true)}
        />
      </div>

      {/* ── Content ── */}
      <div className="flex flex-1 flex-col gap-4 p-5">
        <h3
          className="text-[1.2rem] font-bold leading-tight tracking-wide text-[#F7F0E3] transition-colors duration-300 group-hover:text-amber-300"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          {d.name}
        </h3>

        {/* CTA */}
        <Link
          href={`/destinations/${d.id}`}
          className="flex items-center justify-center gap-2 rounded-lg border border-amber-400/30 py-2.5 text-[0.7rem] uppercase tracking-[0.2em] text-amber-400/80 transition-all duration-300 hover:border-transparent hover:bg-linear-to-r hover:from-amber-400 hover:to-amber-600 hover:text-[#0D0A06] hover:font-bold"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          {isAr ? "استكشف الوجهة" : "Explore Destination"}
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="transition-transform duration-300 group-hover:translate-x-0.5"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
