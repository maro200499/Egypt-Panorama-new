import { splitActivityLabel } from "@/lib/hiddenGems";

type Activity = {
  time: string;
  activity: string;
  icon: string;
};

type DayPlan = {
  day: number;
  title: string;
  activities: Activity[];
  highlight: string;
};

type DayCardProps = {
  day: DayPlan;
  index: number;
  isArabic: boolean;
  mode: "full" | "preview";
  dayLabel: string;
  localizeTime: (value: string) => string;
};

const TIME_COLORS: Record<string, string> = {
  Morning: "text-amber-400",
  Afternoon: "text-orange-300",
  Evening: "text-sky-300",
};

export default function DayCard({ day, index, isArabic, mode, dayLabel, localizeTime }: DayCardProps) {
  return (
    <article
      className="overflow-hidden rounded-2xl border border-white/10 bg-[#110e09]/95 shadow-[0_20px_60px_-38px_rgba(0,0,0,0.8)]"
      style={{ animation: `fadeUp 0.55s ease ${index * 0.07}s both` }}
    >
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-300/20 bg-gradient-to-r from-amber-300/10 via-orange-200/5 to-transparent px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-300 to-orange-300 text-xs font-black text-[#241505]">
            {day.day}
          </span>
          <span className="text-sm font-semibold tracking-wide text-amber-100">
            {dayLabel} {day.day} · {day.title}
          </span>
        </div>

        <span className="rounded-full border border-amber-300/35 bg-amber-300/10 px-2.5 py-1 text-[0.66rem] tracking-wide text-amber-200">
          ✦ {day.highlight}
        </span>
      </header>

      <div className="space-y-3 px-4 py-4 sm:px-5">
        {day.activities.map((activity, activityIndex) => {
          const titleOnly = splitActivityLabel(activity.activity).name;
          const content = mode === "preview" ? titleOnly : activity.activity;

          return (
            <div key={`${day.day}-${activityIndex}-${activity.time}`} className="flex items-start gap-3">
              <span className={`mt-0.5 min-w-20 text-[0.68rem] uppercase tracking-[0.12em] ${TIME_COLORS[activity.time] ?? "text-amber-300"}`}>
                {localizeTime(activity.time)}
              </span>
              <span className="text-sm">{activity.icon}</span>
              <span className="text-sm leading-relaxed text-amber-50/75">
                {content}
              </span>
            </div>
          );
        })}
      </div>

      {mode === "preview" && (
        <div className="border-t border-white/10 bg-sky-300/10 px-4 py-2.5 text-[0.72rem] italic text-sky-100/90 sm:px-5">
          {isArabic ? "هذه معاينة جزئية: تم إخفاء تفاصيل الأنشطة." : "Partial preview: activity details are hidden."}
        </div>
      )}
    </article>
  );
}
