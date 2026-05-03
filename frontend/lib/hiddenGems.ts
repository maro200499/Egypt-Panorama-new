export const HIDDEN_GEM_KEYWORDS = ["cafe", "village", "camp", "desert", "local", "spot", "hidden"] as const;

export type HiddenGemCard = {
  id: string;
  name: string;
  price: string;
};

export function isHiddenGemText(value: string) {
  const normalized = value.toLowerCase();
  return HIDDEN_GEM_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

export function splitActivityLabel(value: string) {
  const [namePart = "", pricePart = ""] = value.split("·").map((part) => part.trim());
  const cleanedName = namePart.replace(/\s*\([^)]*\)\s*$/, "").trim();

  return {
    name: cleanedName || namePart || value.trim(),
    price: pricePart,
  };
}

export function classifyHiddenGemCards(cards: HiddenGemCard[]) {
  const hiddenGems: HiddenGemCard[] = [];
  const normalActivities: HiddenGemCard[] = [];

  for (const card of cards) {
    if (isHiddenGemText(card.name)) {
      hiddenGems.push(card);
    } else {
      normalActivities.push(card);
    }
  }

  return { hiddenGems, normalActivities };
}

export function filterPlanActivities<T extends { activity: string }>(
  days: Array<{ day: number; title: string; highlight: string; activities: T[] }>,
  includeHiddenGems: boolean
) {
  if (includeHiddenGems) {
    return days;
  }

  return days.map((day) => {
    const activities = day.activities.filter((activity) => !isHiddenGemText(activity.activity));
    const highlight = activities[0]?.activity ?? day.highlight;

    return {
      ...day,
      activities,
      highlight,
    };
  });
}
