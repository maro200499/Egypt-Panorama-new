import type { Destination } from "@/lib/destinationsData";

interface Props {
  destination: Destination;
  isAr?: boolean;
}

const budgetLabel = (level: Destination["budget"]) => {
  const map: Record<Destination["budget"], { en: string; ar: string; dots: number }> = {
    Budget:    { en: "Budget-Friendly", ar: "اقتصادي",      dots: 1 },
    "Mid-Range":{ en: "Mid-Range",      ar: "منتصف الميزانية", dots: 2 },
    Luxury:    { en: "Luxury",          ar: "فاخر",          dots: 3 },
  };
  return map[level] ?? map["Mid-Range"];
};

export default function DestinationInfo({ destination: d, isAr = false }: Props) {
  const fullStars = Math.floor(d.rating);
  const hasHalf = d.rating % 1 >= 0.5;
  const budget = budgetLabel(d.budget);

  const labels = isAr
    ? {
        about: "عن الوجهة",
        rating: "التقييم",
        reviews: "تقييم",
        attractions: "أبرز المعالم",
        travel: "معلومات الزيارة",
        bestTime: "أفضل وقت للزيارة",
        budgetLevel: "مستوى الميزانية",
        safety: "نصائح السلامة",
      }
    : {
        about: "About This Destination",
        rating: "Rating",
        reviews: "reviews",
        attractions: "Popular Attractions",
        travel: "Travel Information",
        bestTime: "Best Time to Visit",
        budgetLevel: "Budget Level",
        safety: "Safety Tips",
      };

  return (
    <div className="flex flex-col gap-10">
      {/* ── Full description ── */}
      <section>
        <SectionHeading>{labels.about}</SectionHeading>
        <p
          className="leading-[1.95] text-[0.95rem] text-white/65"
          style={{ fontFamily: "'Lora', serif", fontStyle: "italic" }}
        >
          {d.fullDescription}
        </p>
      </section>

      {/* ── Rating ── */}
      <section>
        <SectionHeading>{labels.rating}</SectionHeading>
        <div className="flex items-center gap-4">
          <span
            className="text-5xl font-black text-amber-400"
            style={{ fontFamily: "'Cinzel Decorative', serif" }}
          >
            {d.rating}
          </span>
          <div className="flex flex-col gap-1.5">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => {
                const filled = s <= fullStars;
                const half = !filled && hasHalf && s === fullStars + 1;
                return (
                  <svg key={s} width="16" height="16" viewBox="0 0 24 24">
                    <defs>
                      <linearGradient id={`sri-${d.id}-${s}`} x1="0" x2="1" y1="0" y2="0">
                        <stop offset="50%" stopColor="#E8A000" />
                        <stop offset="50%" stopColor="#2A2418" />
                      </linearGradient>
                    </defs>
                    <polygon
                      points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                      fill={filled ? "#E8A000" : half ? `url(#sri-${d.id}-${s})` : "#2A2418"}
                      stroke="#E8A000"
                      strokeWidth="1"
                    />
                  </svg>
                );
              })}
            </div>
            <span className="text-[0.78rem] text-white/40">
              {d.reviews.toLocaleString()} {labels.reviews}
            </span>
          </div>
        </div>
      </section>

      {/* ── Popular attractions ── */}
      <section>
        <SectionHeading>{labels.attractions}</SectionHeading>
        <ul className="flex flex-col gap-2.5">
          {d.attractions.map((attraction, i) => (
            <li key={i} className="flex items-center gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-400/15 text-[0.6rem] font-bold text-amber-400">
                {i + 1}
              </span>
              <span className="text-[0.9rem] text-white/70">{attraction}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Travel info ── */}
      <section>
        <SectionHeading>{labels.travel}</SectionHeading>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Best time */}
          <InfoCard
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            }
            label={labels.bestTime}
            value={d.bestTimeToVisit}
          />

          {/* Budget */}
          <InfoCard
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            }
            label={labels.budgetLevel}
            value={
              <span className="flex items-center gap-2">
                <span>{isAr ? budget.ar : budget.en}</span>
                <span className="flex gap-1">
                  {[1, 2, 3].map((dot) => (
                    <span
                      key={dot}
                      className="h-2 w-2 rounded-full"
                      style={{ background: dot <= budget.dots ? "#E8A000" : "rgba(255,255,255,0.1)" }}
                    />
                  ))}
                </span>
              </span>
            }
          />
        </div>

        {/* Safety tips */}
        <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/[0.04] p-5">
          <p
            className="mb-3 text-[0.65rem] uppercase tracking-[0.22em] text-amber-400/70"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            {labels.safety}
          </p>
          <ul className="flex flex-col gap-2">
            {d.safetyTips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[0.85rem] text-white/55">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#E8A000"
                  strokeWidth="2"
                  className="mt-0.5 shrink-0"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

// ── Internal helpers ───────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center gap-4">
      <h2
        className="text-[0.65rem] uppercase tracking-[0.3em] text-amber-400/80"
        style={{ fontFamily: "'Cinzel', serif" }}
      >
        {children}
      </h2>
      <div className="h-px flex-1 bg-amber-400/15" />
      <span className="text-amber-400/20" style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "0.7rem" }}>
        ◈
      </span>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
      <div className="mb-2 flex items-center gap-2 text-amber-400/60">{icon}</div>
      <p
        className="mb-1 text-[0.6rem] uppercase tracking-[0.18em] text-white/30"
        style={{ fontFamily: "'Cinzel', serif" }}
      >
        {label}
      </p>
      <div className="text-[0.88rem] text-white/70">{value}</div>
    </div>
  );
}
