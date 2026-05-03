import DayCard from "@/components/plan/DayCard";
import LockedOverlay from "@/components/plan/LockedOverlay";

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

export type DayAccessLevel = "full" | "preview" | "locked";

type PreviewCardProps = {
  day: DayPlan;
  index: number;
  access: DayAccessLevel;
  isArabic: boolean;
  dayLabel: string;
  premiumBadge: string;
  lockedMessage: string;
  subscribeLabel: string;
  localizeTime: (value: string) => string;
  onSubscribe: () => void;
};

export default function PreviewCard({
  day,
  index,
  access,
  isArabic,
  dayLabel,
  premiumBadge,
  lockedMessage,
  subscribeLabel,
  localizeTime,
  onSubscribe,
}: PreviewCardProps) {
  const isLocked = access === "locked";

  return (
    <div className={`group relative transition-all duration-500 ${isLocked ? "cursor-pointer" : ""}`}>
      <div
        className={`transition-all duration-500 ${
          isLocked
            ? "pointer-events-none select-none opacity-70 blur-[2px] group-hover:opacity-60 group-hover:blur-[3px]"
            : "opacity-100 blur-0"
        }`}
      >
        <DayCard
          day={day}
          index={index}
          isArabic={isArabic}
          mode={access === "preview" ? "preview" : "full"}
          dayLabel={dayLabel}
          localizeTime={localizeTime}
        />
      </div>

      {isLocked && (
        <>
          <div className="pointer-events-none absolute inset-0 z-10 rounded-2xl bg-linear-to-b from-transparent via-[#0b1322]/24 to-[#0b1322]/65 transition-opacity duration-500 group-hover:opacity-95" />
          <LockedOverlay
            message={lockedMessage}
            premiumBadge={premiumBadge}
            ctaLabel={subscribeLabel}
            onSubscribe={onSubscribe}
          />
        </>
      )}
    </div>
  );
}
