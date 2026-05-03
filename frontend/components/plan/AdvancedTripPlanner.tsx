"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { getAuthToken } from "@/lib/session";
import Toast from "@/components/subscription/Toast";

interface SubscriptionStatus {
  isSubscribed: boolean;
  planType?: "basic" | "standard" | "premium";
  expiresAt?: string;
}

interface AdvancedTripPlannerProps {
  onPlanGenerated?: (plan: any) => void;
  showSubscriptionPrompt?: boolean;
  maxDaysPreview?: number;
}

export default function AdvancedTripPlanner({
  onPlanGenerated,
  showSubscriptionPrompt = true,
  maxDaysPreview = 2,
}: AdvancedTripPlannerProps) {
  const locale = useLocale();
  const isArabic = locale === "ar";

  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [formData, setFormData] = useState({
    destination: "",
    nights: 3,
    budget: "Standard" as const,
    style: "Mixed" as const,
  });
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [toast, setToast] = useState<{
    visible: boolean;
    type: "success" | "error" | "info";
    message: string;
  }>({ visible: false, type: "success", message: "" });

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const token = await getAuthToken();
      if (token) {
        const response = await fetch("/api/subscription/status", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setSubscription(data.subscription || { isSubscribed: false });
        }
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };

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
      previewMessage: `Showing first ${maxDaysPreview} days. Subscribe for complete itinerary.`,
      subscribeNow: "Subscribe Now",
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
      previewMessage: `عرض أول ${maxDaysPreview} أيام. اشترك للحصول على البرنامج الكامل.`,
      subscribeNow: "اشترك الآن",
    },
  };

  const t = translations[isArabic ? "ar" : "en"];
  const displayedDays = subscription?.isSubscribed ? plan?.days || [] : (plan?.days || []).slice(0, maxDaysPreview);
  const shouldShowUpgradePrompt = plan && !subscription?.isSubscribed && (plan.days || []).length > maxDaysPreview;

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ visible: true, type, message });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3000);
  };

  return (
    <div className={`space-y-6 ${isArabic ? "rtl" : "ltr"}`}>
      <div className="bg-black/40 backdrop-blur-md border border-amber-200/20 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-amber-100 mb-6">{t.title}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-amber-100 mb-2">{t.destination}</label>
            <input
              type="text"
              placeholder="Cairo, Luxor, Aswan..."
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              className="w-full bg-white/10 border border-amber-200/30 rounded-md px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-amber-100 mb-2">{t.nights}</label>
            <input
              type="number"
              min="1"
              max="14"
              value={formData.nights}
              onChange={(e) => setFormData({ ...formData, nights: parseInt(e.target.value) || 1 })}
              className="w-full bg-white/10 border border-amber-200/30 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-amber-100 mb-2">{t.budget}</label>
            <select
              value={formData.budget}
              onChange={(e) => {
                const val = e.target.value as any;
                setFormData({ ...formData, budget: val });
              }}
              className="w-full bg-white/10 border border-amber-200/30 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="Budget">Budget</option>
              <option value="Standard">Standard</option>
              <option value="Luxury">Luxury</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-amber-100 mb-2">{t.style}</label>
            <select
              value={formData.style}
              onChange={(e) => {
                const val = e.target.value as any;
                setFormData({ ...formData, style: val });
              }}
              className="w-full bg-white/10 border border-amber-200/30 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="Cultural">Cultural</option>
              <option value="Adventure">Adventure</option>
              <option value="Relaxation">Relaxation</option>
              <option value="Mixed">Mixed</option>
            </select>
          </div>
        </div>

        <button
          onClick={async () => {
            if (!formData.destination) {
              showToast("Please select a destination", "error");
              return;
            }

            setLoading(true);
            try {
              const response = await fetch("/api/generate-plan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  place: formData.destination,
                  days: formData.nights,
                  budget: formData.budget,
                  style: formData.style,
                }),
              });

              if (response.ok) {
                const data = await response.json();
                setPlan(data.data || data);
                onPlanGenerated?.(data);
                showToast("Plan generated!", "success");
              } else {
                showToast("Failed to generate plan", "error");
              }
            } catch (error) {
              showToast("Error generating plan", "error");
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-3 px-6 rounded-md transition-all"
        >
          {loading ? t.generating : t.generate}
        </button>
      </div>

      {plan && displayedDays.length > 0 && (
        <div className="space-y-4">
          {displayedDays.map((day: any, idx: number) => (
            <div key={idx} className="bg-black/40 backdrop-blur-md border border-amber-200/20 rounded-lg p-6">
              <h3 className="text-lg font-bold text-amber-100 mb-2">
                {t.day} {day.day} • {day.title}
              </h3>
              <p className="text-amber-50/70 text-sm mb-4">✨ {day.highlight}</p>
              <div className="space-y-2">
                {day.activities?.map((activity: any, aIdx: number) => (
                  <p key={aIdx} className="text-amber-50/80 flex items-center gap-2">
                    <span>{activity.icon}</span>
                    <span>{activity.time}: {activity.activity}</span>
                  </p>
                ))}
              </div>
            </div>
          ))}

          {shouldShowUpgradePrompt && (
            <div className="bg-gradient-to-r from-amber-900/30 to-amber-800/30 border border-amber-400 rounded-lg p-6 text-center">
              <p className="text-amber-100 mb-4">{t.previewMessage}</p>
              <a href="/pricing" className="inline-block px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-md">
                {t.subscribeNow}
              </a>
            </div>
          )}
        </div>
      )}

      {toast.visible && <Toast toast={toast} />}
    </div>
  );
}
