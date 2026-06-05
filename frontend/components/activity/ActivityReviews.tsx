"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { apiFetch, API_ENDPOINTS } from "@/lib/api";
import { getAuthToken } from "@/lib/session";
import type { UserProfile } from "@/lib/userProfile";

type ReviewEntry = {
  id: number | string;
  activity_id: number | string;
  user_id: number | string | null;
  rating: number;
  comment: string;
  created_at: string;
  user_name?: string;
};

type ActivityReviewsResponse = {
  reviews: ReviewEntry[];
  stats: {
    total_reviews: number;
    average_rating: number;
  };
};

interface Props {
  activityId: number | string;
  activityName: string;
}

function parseJwtPayload(token: string): { sub?: number; role?: string } | null {
  const parts = token.split(".");

  if (parts.length < 2) {
    return null;
  }

  try {
    const normalized = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const json = atob(padded);
    return JSON.parse(json) as { sub?: number; role?: string };
  } catch {
    return null;
  }
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function StarRow({
  rating,
  interactive = false,
  onSelect,
}: {
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
          disabled={!interactive}
          className={interactive ? "transition-transform duration-200 hover:scale-110" : "cursor-default"}
          aria-label={`Set rating to ${value}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={value <= rating ? "#E8A000" : "none"} stroke="#E8A000" strokeWidth="1.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export default function ActivityReviews({ activityId, activityName }: Props) {
  const [reviews, setReviews] = useState<ActivityReviewsResponse | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authToken, setAuthToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setAuthToken(getAuthToken());

    try {
      const rawUser = window.localStorage.getItem("user");
      setCurrentUser(rawUser ? (JSON.parse(rawUser) as UserProfile) : null);
    } catch {
      setCurrentUser(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadReviews = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await apiFetch<ActivityReviewsResponse>(
          `${API_ENDPOINTS.activityReviewsGet}?activity_id=${encodeURIComponent(String(activityId))}`,
          authToken ? { headers: { Authorization: `Bearer ${authToken}` } } : undefined
        );

        if (mounted) {
          setReviews(response);
        }
      } catch (loadError) {
        if (mounted) {
          const message = loadError instanceof Error ? loadError.message : "Failed to load reviews.";
          setError(message);
          setReviews({ reviews: [], stats: { total_reviews: 0, average_rating: 0 } });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadReviews();

    return () => {
      mounted = false;
    };
  }, [activityId, authToken]);

  const reviewList = reviews?.reviews ?? [];
  const stats = reviews?.stats ?? { total_reviews: 0, average_rating: 0 };
  const jwt = authToken ? parseJwtPayload(authToken) : null;
  const isSignedIn = Boolean(authToken && jwt?.sub);
  const canSubmit = isSignedIn && !submitting;

  const reviewerName = useMemo(() => {
    if (!currentUser) {
      return "";
    }

    return currentUser.name || [currentUser.firstName, currentUser.lastName].filter(Boolean).join(" ") || currentUser.email;
  }, [currentUser]);

  const submitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      setError("Please sign in to submit a review.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const saved = await apiFetch<ReviewEntry>(API_ENDPOINTS.activityReviewsAdd, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          activity_id: activityId,
          rating,
          comment,
        }),
      });

      setReviews((current) => {
        const existing = current ?? { reviews: [], stats: { total_reviews: 0, average_rating: 0 } };
        const nextReviews = [
          {
            ...saved,
            user_name: reviewerName || "You",
          },
          ...existing.reviews,
        ];

        const totalReviews = nextReviews.length;
        const averageRating = totalReviews > 0
          ? nextReviews.reduce((sum, entry) => sum + Number(entry.rating || 0), 0) / totalReviews
          : 0;

        return {
          reviews: nextReviews,
          stats: {
            total_reviews: totalReviews,
            average_rating: averageRating,
          },
        };
      });

      setComment("");
      setRating(5);
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Failed to submit review.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-14 rounded-[28px] border border-white/10 bg-[#0f1419]/90 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-md md:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
        <div className="lg:w-[360px] lg:shrink-0">
          <p className="text-[0.7rem] uppercase tracking-[0.28em] text-amber-400/80">Activity Reviews</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">Share your experience</h2>
          <p className="mt-3 text-sm leading-7 text-white/65">
            Tell other travelers what to expect at {activityName}. Your review is saved through the project backend.
          </p>

          <div className="mt-6 rounded-2xl border border-amber-400/15 bg-amber-400/5 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.2em] text-amber-400/75">Average Rating</p>
                <p className="mt-2 text-3xl font-semibold text-white">{stats.average_rating.toFixed(1)}</p>
              </div>
              <StarRow rating={Math.round(stats.average_rating || 0)} />
            </div>
            <p className="mt-3 text-sm text-white/55">
              {stats.total_reviews.toLocaleString()} review{stats.total_reviews === 1 ? "" : "s"}
            </p>
          </div>

          {!isSignedIn && (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white/65">
              Sign in to add a review.
              <div className="mt-3">
                <Link href="/login" className="inline-flex rounded-full border border-amber-400/30 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-amber-300 transition hover:bg-amber-400/10">
                  Go to Login
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-6">
          <form onSubmit={submitReview} className="space-y-4 rounded-3xl border border-white/10 bg-white/4 p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.2em] text-amber-400/75">Write a Review</p>
                <h3 className="mt-2 text-lg font-semibold text-white">Rate your visit</h3>
              </div>
              <StarRow rating={rating} interactive onSelect={setRating} />
            </div>

            <label className="block">
              <span className="text-[0.65rem] uppercase tracking-[0.18em] text-white/45">Your Name</span>
              <input
                value={reviewerName}
                readOnly
                disabled
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/75 outline-none"
              />
            </label>

            <label className="block">
              <span className="text-[0.65rem] uppercase tracking-[0.18em] text-white/45">Comment</span>
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                rows={5}
                disabled={!isSignedIn}
                className="mt-2 w-full resize-none rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-7 text-white outline-none placeholder:text-white/30 disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="Share what stood out, what to improve, and any tips for travelers."
              />
            </label>

            {error && (
              <p className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-amber-600 px-5 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#120d05] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Post Review"}
            </button>
          </form>

          <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.2em] text-amber-400/75">Recent Reviews</p>
                <h3 className="mt-2 text-lg font-semibold text-white">What travelers are saying</h3>
              </div>
              <span className="rounded-full border border-white/10 px-3 py-1 text-[0.68rem] text-white/55">
                {reviewList.length.toLocaleString()} total
              </span>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/55">
                  Loading reviews...
                </div>
              ) : reviewList.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-amber-400/20 bg-amber-400/5 p-5 text-sm leading-7 text-white/55">
                  No reviews yet. Be the first to leave feedback for this activity.
                </div>
              ) : (
                reviewList.map((entry) => (
                  <article key={entry.id} className="rounded-2xl border border-white/8 bg-[#111822] p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-white">{entry.user_name || "Anonymous"}</p>
                        <p className="mt-1 text-[0.68rem] uppercase tracking-[0.18em] text-white/35">
                          {formatDate(entry.created_at)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <StarRow rating={entry.rating} />
                        <span className="text-[0.7rem] text-amber-300/80">{entry.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    {entry.comment && (
                      <p className="mt-3 text-sm leading-7 text-white/65">
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
    </section>
  );
}