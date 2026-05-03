"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { UserProfile } from "@/lib/userProfile";

type ReviewEntry = {
  id: string;
  rating: number;
  comment: string;
  author: string;
  createdAt: string;
};

interface Props {
  destinationId: number;
  destinationName: string;
  isAr?: boolean;
}

const STORAGE_PREFIX = "egypt-panorama.destination-reviews";

function getStorageKey(destinationId: number) {
  return `${STORAGE_PREFIX}:${destinationId}`;
}

function formatDate(createdAt: string, isAr: boolean) {
  return new Intl.DateTimeFormat(isAr ? "ar-EG" : "en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(createdAt));
}

function StarRow({ rating, interactive = false, onSelect }: {
  rating: number;
  interactive?: boolean;
  onSelect?: (value: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onSelect?.(value)}
          className={interactive ? "transition-transform duration-200 hover:scale-110" : "cursor-default"}
          aria-label={`Set rating to ${value}`}
          disabled={!interactive}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={value <= rating ? "#E8A000" : "none"} stroke="#E8A000" strokeWidth="1.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export default function DestinationReviews({ destinationId, destinationName, isAr = false }: Props) {
  const [reviews, setReviews] = useState<ReviewEntry[] | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const rawUser = localStorage.getItem("user");
        setCurrentUser(rawUser ? (JSON.parse(rawUser) as UserProfile) : null);

        const raw = localStorage.getItem(getStorageKey(destinationId));
        if (!raw) {
          setReviews([]);
          return;
        }

        const parsed = JSON.parse(raw) as ReviewEntry[];
        if (Array.isArray(parsed)) {
          const stored = parsed.filter((entry) =>
            typeof entry?.id === "string" &&
            typeof entry?.rating === "number" &&
            typeof entry?.comment === "string" &&
            typeof entry?.author === "string" &&
            typeof entry?.createdAt === "string"
          );

          setReviews((current) => {
            const existing = current ?? [];
            const merged = [...stored, ...existing].filter(
              (entry, index, all) => all.findIndex((candidate) => candidate.id === entry.id) === index
            );
            return merged;
          });
          return;
        }

        setReviews([]);
      } catch {
          setCurrentUser(null);
        setReviews([]);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [destinationId]);

  useEffect(() => {
    if (reviews === null) return;
    localStorage.setItem(getStorageKey(destinationId), JSON.stringify(reviews));
  }, [destinationId, reviews]);

  const averageRating = useMemo(() => {
    if (!reviews || reviews.length === 0) return 0;
    return reviews.reduce((total, entry) => total + entry.rating, 0) / reviews.length;
  }, [reviews]);

  const reviewList = reviews ?? [];
  const isSignedIn = Boolean(currentUser);
  const reviewerName = currentUser?.name || [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(" ") || currentUser?.email || "";

  const copy = isAr
    ? {
        title: "تقييمات الزوار",
        subtitle: "شارك تقييمك وتعليقك حول هذه الوجهة.",
        yourName: "اسمك (اختياري)",
        rating: "التقييم",
        comment: "مراجعتك",
        placeholder: "اكتب رأيك عن التجربة، التنظيم، أو أي نصيحة مفيدة للزوار الآخرين...",
        submit: "إرسال التقييم",
        saved: "تم حفظ التقييم محلياً على هذا الجهاز.",
        empty: "لا توجد مراجعات بعد. كن أول من يشارك رأيه.",
        average: "متوسط تقييم الزوار",
        reviews: "مراجعات",
        anonymous: "زائر",
      }
    : {
        title: "Visitor Reviews",
        subtitle: "Share your rating and a short comment about this destination.",
        yourName: "Your name (optional)",
        rating: "Rating",
        comment: "Your review",
        placeholder: "Write about the experience, service, atmosphere, or anything useful for other travelers...",
        submit: "Post Review",
        saved: "Your review is stored locally on this device.",
        empty: "No reviews yet. Be the first to leave one.",
        average: "Average visitor rating",
        reviews: "reviews",
        anonymous: "Traveler",
      };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedComment = comment.trim();
    const trimmedName = name.trim();

    if (rating < 1 || rating > 5) {
      setError(isAr ? "اختر تقييماً من 1 إلى 5." : "Choose a rating from 1 to 5.");
      return;
    }

    if (!trimmedComment) {
      setError(isAr ? "أضف تعليقاً قصيراً قبل الإرسال." : "Add a short comment before posting.");
      return;
    }

    if (!isSignedIn) {
      setError(isAr ? "يجب تسجيل الدخول لكتابة تقييم أو مراجعة." : "You must be signed in to leave a rating or review.");
      return;
    }

    const nextReview: ReviewEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      rating,
      comment: trimmedComment,
      author: trimmedName || reviewerName,
      createdAt: new Date().toISOString(),
    };

    setReviews((current) => [nextReview, ...(current ?? [])]);
    setComment("");
    setName("");
    setRating(5);
    setError("");
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-amber-400/15 bg-white/2 shadow-[0_25px_80px_rgba(0,0,0,0.28)]">
      <div className="border-b border-amber-400/10 bg-linear-to-r from-amber-400/8 via-transparent to-transparent px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-[0.65rem] uppercase tracking-[0.28em] text-amber-400/70" style={{ fontFamily: "'Cinzel', serif" }}>
              {copy.title}
            </p>
            <h3 className="text-[1.15rem] font-semibold text-[#F7F0E3]" style={{ fontFamily: "'Cinzel', serif" }}>
              {destinationName}
            </h3>
            <p className="mt-2 max-w-2xl text-[0.9rem] leading-7 text-white/55" style={{ fontFamily: "'Lora', serif" }}>
              {copy.subtitle}
            </p>
          </div>

          <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3 backdrop-blur-sm">
            <p className="text-[0.6rem] uppercase tracking-[0.18em] text-white/35" style={{ fontFamily: "'Cinzel', serif" }}>
              {copy.average}
            </p>
            <div className="mt-2 flex items-center gap-3">
              <span className="text-[1.5rem] font-black text-amber-400" style={{ fontFamily: "'Cinzel Decorative', serif" }}>
                {reviewList.length > 0 ? averageRating.toFixed(1) : "--"}
              </span>
              <div>
                <StarRow rating={reviewList.length > 0 ? Math.round(averageRating) : 0} />
                <p className="mt-1 text-[0.72rem] text-white/40">
                  {reviewList.length.toLocaleString()} {copy.reviews}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 px-5 py-6 lg:grid-cols-[1.1fr_0.9fr] sm:px-6">
        <form onSubmit={handleSubmit} className="rounded-[1.3rem] border border-white/6 bg-[#0f0c08] p-5">
          <div className="flex flex-col gap-5">
            {!isSignedIn && (
              <div className="rounded-2xl border border-amber-400/15 bg-amber-400/5 p-4 text-[0.9rem] leading-7 text-white/60">
                <p className="font-semibold text-[#F7F0E3]" style={{ fontFamily: "'Cinzel', serif" }}>
                  {isAr ? "سجّل الدخول أولاً" : "Sign in to review"}
                </p>
                <p className="mt-2" style={{ fontFamily: "'Lora', serif" }}>
                  {isAr
                    ? "يمكن للزوار المسجلين فقط إضافة تقييمات أو مراجعات لهذه الوجهة."
                    : "Only signed-in users can add ratings or reviews for this destination."}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center justify-center rounded-xl bg-linear-to-r from-amber-500 to-amber-700 px-4 py-2 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[#0D0A06]"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    {isAr ? "تسجيل الدخول" : "Login"}
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="inline-flex items-center justify-center rounded-xl border border-amber-400/30 px-4 py-2 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-amber-300"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    {isAr ? "إنشاء حساب" : "Sign Up"}
                  </Link>
                </div>
              </div>
            )}

            <div>
              <label className="mb-2 block text-[0.62rem] uppercase tracking-[0.22em] text-white/35" style={{ fontFamily: "'Cinzel', serif" }}>
                {copy.rating}
              </label>
              <StarRow rating={rating} interactive={isSignedIn} onSelect={isSignedIn ? setRating : undefined} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-[0.62rem] uppercase tracking-[0.2em] text-white/35" style={{ fontFamily: "'Cinzel', serif" }}>
                  {copy.yourName}
                </span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  disabled={!isSignedIn}
                  className="rounded-xl border border-white/10 bg-white/3 px-4 py-3 text-[0.9rem] text-[#F7F0E3] outline-none transition focus:border-amber-400/50 focus:bg-white/5"
                  placeholder={isAr ? "اكتب اسمك" : "Enter your name"}
                />
              </label>

              <div className="rounded-xl border border-amber-400/10 bg-amber-400/4 px-4 py-3">
                <p className="text-[0.62rem] uppercase tracking-[0.2em] text-amber-400/70" style={{ fontFamily: "'Cinzel', serif" }}>
                  {destinationName}
                </p>
                <p className="mt-2 text-[0.86rem] leading-6 text-white/55" style={{ fontFamily: "'Lora', serif" }}>
                  {copy.saved}
                </p>
              </div>
            </div>

            <label className="flex flex-col gap-2">
              <span className="text-[0.62rem] uppercase tracking-[0.2em] text-white/35" style={{ fontFamily: "'Cinzel', serif" }}>
                {copy.comment}
              </span>
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                rows={6}
                disabled={!isSignedIn}
                className="resize-none rounded-2xl border border-white/10 bg-white/3 px-4 py-3 text-[0.92rem] leading-7 text-[#F7F0E3] outline-none transition placeholder:text-white/22 focus:border-amber-400/50 focus:bg-white/5"
                placeholder={copy.placeholder}
              />
            </label>

            {error && (
              <p className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-[0.82rem] text-red-200">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!isSignedIn}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-amber-500 to-amber-700 px-5 py-3 text-[0.72rem] font-bold uppercase tracking-[0.2em] text-[#0D0A06] transition-transform duration-200 hover:-translate-y-0.5"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              {copy.submit}
            </button>
          </div>
        </form>

        <div className="rounded-[1.3rem] border border-white/6 bg-white/2 p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[0.62rem] uppercase tracking-[0.22em] text-amber-400/70" style={{ fontFamily: "'Cinzel', serif" }}>
                {isAr ? "المراجعات الحديثة" : "Recent Reviews"}
              </p>
              <h4 className="mt-2 text-[1rem] font-semibold text-[#F7F0E3]" style={{ fontFamily: "'Cinzel', serif" }}>
                {destinationName}
              </h4>
            </div>
            <span className="rounded-full border border-white/10 px-3 py-1 text-[0.68rem] text-white/45">
              {reviewList.length.toLocaleString()} {copy.reviews}
            </span>
          </div>

          <div className="flex max-h-124 flex-col gap-4 overflow-y-auto pr-1">
            {reviews === null ? (
              <div className="rounded-xl border border-white/5 bg-white/2 p-4 text-[0.85rem] text-white/35">
                {isAr ? "جارٍ تحميل المراجعات..." : "Loading reviews..."}
              </div>
            ) : reviewList.length === 0 ? (
              <div className="rounded-xl border border-dashed border-amber-400/15 bg-amber-400/3 p-5 text-[0.9rem] leading-7 text-white/45" style={{ fontFamily: "'Lora', serif" }}>
                {copy.empty}
              </div>
            ) : (
              reviewList.map((entry) => (
                <article key={entry.id} className="rounded-2xl border border-white/6 bg-[#0f0c08] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[0.82rem] font-semibold text-[#F7F0E3]">
                        {entry.author || copy.anonymous}
                      </p>
                      <p className="mt-1 text-[0.68rem] uppercase tracking-[0.16em] text-white/28" style={{ fontFamily: "'Cinzel', serif" }}>
                        {formatDate(entry.createdAt, isAr)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <StarRow rating={entry.rating} />
                      <span className="text-[0.7rem] text-amber-400/80">{entry.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  {entry.comment && (
                    <p className="mt-3 text-[0.9rem] leading-7 text-white/58" style={{ fontFamily: "'Lora', serif" }}>
                      {entry.comment}
                    </p>
                  )}
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
