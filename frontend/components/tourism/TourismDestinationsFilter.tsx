"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { API_BASE_URL } from "@/lib/api";

interface Destination {
  id: number | string;
  name: string;
  city?: string;
  type?: string;
  cover_image?: string | null;
  gallery_images?: string | null;
}

interface TourismDestinationsFilterProps {
  tourismType: string;
  title?: string;
  showTitle?: boolean;
}

export default function TourismDestinationsFilter({
  tourismType,
  title,
  showTitle = true,
}: TourismDestinationsFilterProps) {
  const router = useRouter();
  const locale = useLocale();
  const isAr = locale === "ar";
  const t = useTranslations();

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const FALLBACK_IMAGES = [
    "https://images.unsplash.com/photo-1539768942893-daf53e448371?w=600&q=85",
    "https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=600&q=85",
    "https://images.unsplash.com/photo-1609951651556-5334e2706168?w=600&q=85",
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=85",
  ];

  useEffect(() => {
    const fetchDestinations = async () => {
      setLoading(true);
      setError(null);

      try {
        const url = `${API_BASE_URL}/tourism-destinations.php?tourism_type=${encodeURIComponent(tourismType)}`;
        const response = await fetch(url, { cache: "no-store" });

        let data;
        try {
          data = await response.json();
        } catch {
          throw new Error("Invalid server response");
        }

        if (!response.ok) {
          throw new Error(data?.message || `Request failed with status ${response.status}`);
        }

        if (!data?.data) {
          throw new Error("API response does not include data");
        }

        setDestinations(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load destinations";
        setError(message);
        setDestinations([]);
      } finally {
        setLoading(false);
      }
    };

    if (tourismType) {
      fetchDestinations();
    }
  }, [tourismType]);

  const getImage = (destination: Destination, index: number) => {
    if (destination.cover_image) {
      return destination.cover_image;
    }
    if (destination.gallery_images) {
      try {
        const gallery = JSON.parse(destination.gallery_images as string);
        if (Array.isArray(gallery) && gallery.length > 0) {
          return gallery[0];
        }
      } catch {
        // Fall through
      }
    }
    return FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
  };

  const handleDestinationClick = (destinationId: number | string) => {
    router.push(`/destinations/${destinationId}`);
  };

  if (loading) {
    return (
      <div className="w-full">
        {showTitle && title && (
          <h2 className="mb-8 text-3xl font-bold text-amber-400">{title}</h2>
        )}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-lg bg-white/5"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        {showTitle && title && (
          <h2 className="mb-8 text-3xl font-bold text-amber-400">{title}</h2>
        )}
        <div className="rounded-lg border border-red-400/30 bg-red-400/10 p-6 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (destinations.length === 0) {
    return (
      <div className="w-full">
        {showTitle && title && (
          <h2 className="mb-8 text-3xl font-bold text-amber-400">{title}</h2>
        )}
        <div className="rounded-lg border border-amber-400/30 bg-amber-400/10 p-12 text-center">
          <p className="text-lg text-amber-400">
            {isAr
              ? `لا توجد وجهات تحتوي على أنشطة من نوع "${tourismType}"`
              : `No destinations found with activities of type "${tourismType}"`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {showTitle && title && (
        <h2 className="mb-8 text-3xl font-bold text-amber-400">{title}</h2>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {destinations.map((destination, index) => (
          <button
            key={destination.id}
            onClick={() => handleDestinationClick(destination.id)}
            className="group relative h-64 overflow-hidden rounded-lg transition-all duration-300 hover:shadow-2xl hover:shadow-amber-400/20"
          >
            {/* Background Image */}
            <img
              src={getImage(destination, index)}
              alt={destination.name}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.8),rgba(0,0,0,0.4),transparent)]" />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <h3 className="mb-2 font-serif text-xl font-bold text-white">
                {destination.name}
              </h3>
              <p className="text-sm text-white/70">
                {destination.city || "Egypt"}
              </p>
            </div>

            {/* Hover indicator */}
            <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-amber-400/20 text-amber-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              →
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
