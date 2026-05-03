"use client";

import { useState } from "react";
import { useLocale } from "next-intl";

interface Activity {
  time: string;
  activity: string;
  icon: string;
}

interface DayPlan {
  day: number;
  title: string;
  activities: Activity[];
  highlight: string;
}

interface ApiResponse {
  plan?: Array<{ day: string; activities: Activity[] }>;
  days?: DayPlan[];
  totalCost?: number;
  perNight?: number;
  status?: string;
  message?: string;
  error?: string;
}

interface GeneratedPlan {
  days: DayPlan[];
  totalCost?: number;
  perNight?: number;
}

interface FormData {
  destination: string;
  nights: number;
  budget: "Budget" | "Standard" | "Luxury";
  style: "Cultural" | "Adventure" | "Relaxation" | "Mixed";
}

interface ToastMessage {
  type: "success" | "error";
  message: string;
}

export default function TripPlanner() {
  const locale = useLocale();
  const isArabic = locale === "ar";

  // Form State
  const [formData, setFormData] = useState<FormData>({
    destination: "",
    nights: 3,
    budget: "Standard",
    style: "Mixed",
  });

  // UI State
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Translations
  const translations = {
    en: {
      title: "AI Trip Planner",
      destination: "Destination",
      nights: "Number of Nights",
      budget: "Budget",
      style: "Travel Style",
      generate: "Generate Plan",
      generating: "Generating...",
      day: "Day",
      activities: "Activities",
      totalCost: "Total Cost",
      perNight: "Per Night",
      error: "Failed to generate plan",
      errorRequired: "Please fill in all fields",
      success: "Plan generated successfully!",
    },
    ar: {
      title: "مخطط الرحلة الذكي",
      destination: "الوجهة",
      nights: "عدد الليالي",
      budget: "الميزانية",
      style: "نمط السفر",
      generate: "إنشاء الخطة",
      generating: "جاري الإنشاء...",
      day: "اليوم",
      activities: "الأنشطة",
      totalCost: "التكلفة الإجمالية",
      perNight: "لكل ليلة",
      error: "فشل في إنشاء الخطة",
      errorRequired: "يرجى ملء جميع الحقول",
      success: "تم إنشاء الخطة بنجاح!",
    },
  };

  const t = translations[isArabic ? "ar" : "en"];

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const generatePlan = async () => {
    if (!formData.destination || !formData.nights) {
      setToast({ type: "error", message: t.errorRequired });
      return;
    }

    setLoading(true);
    setPlan(null);

    try {
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          place: formData.destination,
          days: formData.nights,
          budget: formData.budget,
          style: formData.style,
        }),
      });

      if (!response.ok) {
        throw new Error(t.error);
      }

      const data: ApiResponse = await response.json();
      
      // Handle different response formats
      if (data.plan && Array.isArray(data.plan)) {
        const formattedDays: DayPlan[] = (data.plan as any[]).map((dayItem, idx) => ({
          day: idx + 1,
          title: `Day ${idx + 1}`,
          highlight: dayItem.activities?.[0]?.activity || "Explore",
          activities: dayItem.activities || [],
        }));
        
        setPlan({ days: formattedDays, totalCost: data.totalCost, perNight: data.perNight });
      } else if (data.days) {
        setPlan({ days: data.days, totalCost: data.totalCost, perNight: data.perNight });
      } else {
        throw new Error(data.message || data.error || t.error);
      }
      setToast({ type: "success", message: t.success });
    } catch (error) {
      console.error("Error generating plan:", error);
      setToast({ type: "error", message: t.error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`p-6 max-w-5xl mx-auto ${isArabic ? "rtl" : "ltr"}`}>
      {/* Header */}
      <h1 className="text-3xl font-bold mb-2 text-amber-100">{t.title}</h1>
      <p className="text-amber-50/80 mb-8">
        {isArabic
          ? "أنشئ خطة رحلة مخصصة في ثوان باستخدام قوة الذكاء الاصطناعي"
          : "Create a personalized itinerary in seconds using AI"}
      </p>

      {/* Input Form */}
      <div className="bg-black/40 backdrop-blur-md border border-amber-200/20 rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Destination */}
          <div>
            <label className="block text-sm font-medium text-amber-100 mb-2">
              {t.destination}
            </label>
            <input
              type="text"
              placeholder={
                isArabic
                  ? "مثال: القاهرة، الأقصر، أسوان"
                  : "e.g., Cairo, Luxor, Aswan"
              }
              value={formData.destination}
              onChange={(e) => handleInputChange("destination", e.target.value)}
              className="w-full bg-white/10 border border-amber-200/30 rounded-md px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Nights */}
          <div>
            <label className="block text-sm font-medium text-amber-100 mb-2">
              {t.nights}
            </label>
            <input
              type="number"
              min="1"
              max="14"
              value={formData.nights}
              onChange={(e) =>
                handleInputChange("nights", parseInt(e.target.value) || 1)
              }
              className="w-full bg-white/10 border border-amber-200/30 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-medium text-amber-100 mb-2">
              {t.budget}
            </label>
            <select
              value={formData.budget}
              onChange={(e) =>
                handleInputChange(
                  "budget",
                  e.target.value as "Budget" | "Standard" | "Luxury"
                )
              }
              className="w-full bg-white/10 border border-amber-200/30 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="Budget">Budget</option>
              <option value="Standard">Standard</option>
              <option value="Luxury">Luxury</option>
            </select>
          </div>

          {/* Style */}
          <div>
            <label className="block text-sm font-medium text-amber-100 mb-2">
              {t.style}
            </label>
            <select
              value={formData.style}
              onChange={(e) =>
                handleInputChange(
                  "style",
                  e.target.value as
                    | "Cultural"
                    | "Adventure"
                    | "Relaxation"
                    | "Mixed"
                )
              }
              className="w-full bg-white/10 border border-amber-200/30 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="Cultural">
                {isArabic ? "ثقافي" : "Cultural"}
              </option>
              <option value="Adventure">
                {isArabic ? "مغامرة" : "Adventure"}
              </option>
              <option value="Relaxation">
                {isArabic ? "استرخاء" : "Relaxation"}
              </option>
              <option value="Mixed">{isArabic ? "مختلط" : "Mixed"}</option>
            </select>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={generatePlan}
          disabled={loading}
          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-3 px-6 rounded-md transition-all duration-300 disabled:opacity-70"
        >
          {loading ? t.generating : t.generate}
        </button>
      </div>

      {/* Generated Plan */}
      {plan && plan.days && (
        <div className="space-y-4">
          {plan.days.map((day, dayIndex) => (
            <div
              key={dayIndex}
              className="bg-black/40 backdrop-blur-md border border-amber-200/20 rounded-lg p-6 hover:border-amber-200/40 transition-all"
            >
              <div className="mb-4">
                <h2 className="text-xl font-bold text-amber-100">
                  {t.day} {day.day} • {day.title}
                </h2>
                <p className="text-amber-50/70 text-sm mt-1">
                  ✨ {day.highlight}
                </p>
              </div>

              <div className="space-y-3">
                {day.activities && day.activities.length > 0 ? (
                  day.activities.map((activity, actIndex) => (
                    <div
                      key={actIndex}
                      className="border-l-2 border-amber-400 pl-4 py-2"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{activity.icon}</span>
                        <div className="flex-1">
                          <p className="font-semibold text-amber-100">
                            {activity.time}
                          </p>
                          <p className="text-amber-50/80">{activity.activity}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-amber-50/60">{t.activities}</p>
                )}
              </div>
            </div>
          ))}

          {/* Cost Summary */}
          {(plan.totalCost || plan.perNight) && (
            <div className="bg-gradient-to-r from-amber-900/30 to-amber-800/30 border border-amber-400/50 rounded-lg p-6 mt-8">
              <h3 className="text-lg font-bold text-amber-100 mb-4">
                💰 {t.totalCost}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plan.totalCost && (
                  <div>
                    <p className="text-amber-50/70 text-sm">{t.totalCost}</p>
                    <p className="text-2xl font-bold text-amber-300">
                      ${plan.totalCost}
                    </p>
                  </div>
                )}
                {plan.perNight && (
                  <div>
                    <p className="text-amber-50/70 text-sm">{t.perNight}</p>
                    <p className="text-2xl font-bold text-amber-300">
                      ${plan.perNight}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 z-50 max-w-sm rounded-xl border px-4 py-3 text-sm shadow-xl ${
            toast.type === "success"
              ? "border-emerald-300/40 bg-slate-900/95 text-emerald-300"
              : "border-red-300/40 bg-slate-900/95 text-red-300"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
