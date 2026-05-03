/**
 * Trip Planner Utilities
 * Helper functions for the AI Trip Planner component
 */

export interface PlannerConfig {
  destination: string;
  nights: number;
  budget: "Budget" | "Standard" | "Luxury";
  style: "Cultural" | "Adventure" | "Relaxation" | "Mixed";
}

export const DESTINATIONS = [
  "Cairo",
  "Luxor",
  "Aswan",
  "Sharm El Sheikh",
  "Siwa Oasis",
  "Alexandria",
  "Hurghada",
];

export const BUDGET_OPTIONS = ["Budget", "Standard", "Luxury"] as const;

export const STYLE_OPTIONS = ["Cultural", "Adventure", "Relaxation", "Mixed"] as const;

export const NIGHT_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 10, 14];

const COST_PER_NIGHT: Record<string, number> = {
  Budget: 80,
  Standard: 150,
  Luxury: 300,
};

/**
 * Calculate estimated total cost for a plan
 */
export function calculateTotalCost(nights: number, budget: string): number {
  const costPerNight = COST_PER_NIGHT[budget] || COST_PER_NIGHT["Standard"];
  return costPerNight * nights;
}

/**
 * Validate planner configuration
 */
export function validatePlannerConfig(config: PlannerConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!config.destination?.trim()) {
    errors.push("Destination is required");
  }

  if (!config.nights || config.nights < 1 || config.nights > 14) {
    errors.push("Nights must be between 1 and 14");
  }

  if (!BUDGET_OPTIONS.includes(config.budget)) {
    errors.push("Invalid budget option");
  }

  if (!STYLE_OPTIONS.includes(config.style)) {
    errors.push("Invalid style option");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generate API request payload
 */
export function generatePlanPayload(config: PlannerConfig) {
  return {
    place: config.destination,
    days: config.nights,
    budget: config.budget,
    style: config.style,
  };
}

/**
 * Format activity with time and icon
 */
export function formatActivityDisplay(
  activity: string,
  time?: string,
  icon?: string
): string {
  let result = activity;
  if (time) result = `${time}: ${result}`;
  if (icon) result = `${icon} ${result}`;
  return result;
}

/**
 * Localize planner text
 */
export const PLANNER_I18N = {
  en: {
    destination: "Destination",
    nights: "Number of Nights",
    budgetLabel: "Budget",
    style: "Travel Style",
    generate: "Generate Plan",
    generating: "Generating...",
    error: "Failed to generate plan",
    errorRequired: "Please fill in all fields",
    success: "Plan generated successfully!",
    cultural: "Cultural",
    adventure: "Adventure",
    relaxation: "Relaxation",
    mixed: "Mixed",
    budget: "Budget",
    standard: "Standard",
    luxury: "Luxury",
  },
  ar: {
    destination: "الوجهة",
    nights: "عدد الليالي",
    budgetLabel: "الميزانية",
    style: "نمط السفر",
    generate: "إنشاء الخطة",
    generating: "جاري الإنشاء...",
    error: "فشل في إنشاء الخطة",
    errorRequired: "يرجى ملء جميع الحقول",
    success: "تم إنشاء الخطة بنجاح!",
    cultural: "ثقافي",
    adventure: "مغامرة",
    relaxation: "استرخاء",
    mixed: "مختلط",
    budget: "اقتصادي",
    standard: "متوسط",
    luxury: "فاخر",
  },
};
