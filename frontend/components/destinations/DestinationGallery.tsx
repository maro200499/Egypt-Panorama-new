"use client";

import Image from "next/image";
import { useState } from "react";

interface Props {
  images: string[];
  name: string;
  isAr?: boolean;
}

export default function DestinationGallery({ images, name, isAr = false }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [errors, setErrors] = useState<Set<string>>(new Set());

  const markError = (src: string) =>
    setErrors((prev) => new Set([...prev, src]));

  const validImages = images.filter((src) => !errors.has(src));
  const [main, ...rest] = validImages.length > 0 ? validImages : images;

  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {/* Main large image */}
        <button
          type="button"
          onClick={() => setSelected(main)}
          className="col-span-2 row-span-2 relative h-56 sm:h-72 overflow-hidden rounded-xl cursor-zoom-in group"
        >
          <Image
            src={main}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => markError(main)}
          />
          <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/15 rounded-xl" />
        </button>

        {/* Thumbnails */}
        {rest.slice(0, 4).map((src, i) => (
          <button
            key={src + i}
            type="button"
            onClick={() => setSelected(src)}
            className="relative h-[6.5rem] sm:h-[8.5rem] overflow-hidden rounded-xl cursor-zoom-in group"
          >
            <Image
              src={src}
              alt={`${name} ${i + 2}`}
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => markError(src)}
            />
            <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/15 rounded-xl" />
          </button>
        ))}
      </div>

      <p
        className="mt-2 text-right text-[0.65rem] uppercase tracking-[0.18em] text-white/25"
        style={{ fontFamily: "'Cinzel', serif" }}
      >
        {isAr ? "انقر للتكبير" : "Click to enlarge"}
      </p>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/70 transition hover:bg-white/20"
            aria-label="Close"
          >
            ✕
          </button>
          <div
            className="relative max-h-[85vh] max-w-5xl w-full"
            style={{ aspectRatio: "16/9" }}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selected}
              alt={name}
              fill
              className="object-contain rounded-xl"
              sizes="90vw"
            />
          </div>
        </div>
      )}
    </>
  );
}
