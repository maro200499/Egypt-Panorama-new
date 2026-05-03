"use client";

import { useState } from "react";
import { useLocale } from "next-intl";

interface QuickPlanProps {
  onPlanGenerated?: (plan: any) => void;
  compact?: boolean;
}

export default function QuickPlanGenerator({ onPlanGenerated, compact = false }: QuickPlanProps) {
  const locale = useLocale();
  const isArabic = locale === "ar";
  const [loading, setLoading] = useState(false);

  const translations = {
    en: { generate: "Quick Plan", loading: "Generating..." },
    ar: { generate: "خطة سريعة", loading: "جاري الإنشاء..." },
  };

  const t = translations[isArabic ? "ar" : "en"];

  const generateQuickPlan = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          place: "Cairo",
          days: 3,
          budget: "Standard",
          style: "Mixed",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onPlanGenerated?.(data);
      }
    } catch (error) {
      console.error("Error generating quick plan:", error);
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <button
        onClick={generateQuickPlan}
        disabled={loading}
        className="px-3 py-1 text-sm bg-amber-500 hover:bg-amber-600 disabled:bg-gray-500 text-white rounded transition-colors"
      >
        {loading ? t.loading : t.generate}
      </button>
    );
  }

  return (
    <button
      onClick={generateQuickPlan}
      disabled={loading}
      className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-3 px-6 rounded-md transition-all duration-300 disabled:opacity-70"
    >
      {loading ? t.loading : t.generate}
    </button>
  );
}
