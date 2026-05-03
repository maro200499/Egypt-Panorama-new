"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import ActivityFilter from "@/components/plan/ActivityFilter";

/**
 * Example: Activities Page
 * 
 * This is a simple example showing how to integrate the ActivityFilter component.
 * You can use this on:
 * - Destination detail pages
 * - Tourism category pages
 * - Trip planning pages
 * - Activity discovery pages
 */

export default function ActivitiesExamplePage() {
  const [selectedDestinationId, setSelectedDestinationId] = useState<number | null>(null);
  const [selectedTourismType, setSelectedTourismType] = useState<string | null>(null);
  const locale = useLocale();
  const t = useTranslations();

  const handleFilterChange = (destId: number | null, type: string | null) => {
    setSelectedDestinationId(destId);
    setSelectedTourismType(type);
    console.log("Filters updated:", { destId, type });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-12">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-[#F7F0E3]">
          {locale === "ar" ? "الأنشطة والفعاليات" : "Activities & Experiences"}
        </h1>
        <p className="text-lg text-white/60">
          {locale === "ar"
            ? "اكتشف الأنشطة والتجارب المميزة في جميع أنحاء مصر"
            : "Discover unique activities and experiences across Egypt"}
        </p>
      </div>

      {/* Active Filters Display */}
      {(selectedDestinationId || selectedTourismType) && (
        <div className="rounded-xl border border-amber-300/30 bg-amber-300/10 p-4">
          <p className="text-sm text-amber-200">
            {locale === "ar" ? "المرشحات المفعلة: " : "Active filters: "}
            {selectedDestinationId && (
              <span className="font-semibold">Destination #{selectedDestinationId}</span>
            )}
            {selectedDestinationId && selectedTourismType && " • "}
            {selectedTourismType && (
              <span className="font-semibold">{selectedTourismType}</span>
            )}
          </p>
        </div>
      )}

      {/* Main Activity Filter Component */}
      <ActivityFilter
        destinationId={selectedDestinationId}
        tourismType={selectedTourismType}
        showFilters={true}
        showClearButton={true}
        title={locale === "ar" ? "جميع الأنشطة" : "All Activities"}
        emptyMessage={
          locale === "ar"
            ? "لم نجد أنشطة تطابق معاييرك. حاول تغيير المرشحات."
            : "No activities match your filters. Try adjusting them."
        }
        onFilterChange={handleFilterChange}
      />

      {/* Usage Tips */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
        <h3 className="font-semibold text-white">
          {locale === "ar" ? "نصائح الاستخدام" : "Usage Tips"}
        </h3>
        <ul className="space-y-2 text-sm text-white/70">
          <li>
            {locale === "ar"
              ? "• انقر على نوع السياحة لتصفية الأنشطة"
              : "• Click on a tourism type to filter activities"}
          </li>
          <li>
            {locale === "ar"
              ? "• يمكنك تحديد عدة معايير في نفس الوقت"
              : "• You can combine multiple filters at once"}
          </li>
          <li>
            {locale === "ar"
              ? "• اضغط 'مسح الفلاتر' للعودة إلى جميع الأنشطة"
              : "• Click 'Clear Filters' to see all activities again"}
          </li>
          <li>
            {locale === "ar"
              ? "• تتم تحديث النتائج بشكل فوري دون تحديث الصفحة"
              : "• Results update instantly without page reload"}
          </li>
        </ul>
      </div>

      {/* Implementation Examples */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="mb-4 font-semibold text-white">
          {locale === "ar" ? "أمثلة على الاستخدام" : "Integration Examples"}
        </h3>

        <div className="space-y-6">
          {/* Example 1 */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-amber-300">
              {locale === "ar" ? "مثال 1: صفحة وجهة سياحية" : "Example 1: Destination Detail Page"}
            </h4>
            <pre className="overflow-x-auto rounded-lg bg-black/30 p-4 text-xs text-white/80">
{`<ActivityFilter
  destinationId={destinationId}
  showFilters={true}
  title="Activities in this destination"
/>`}
            </pre>
          </div>

          {/* Example 2 */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-amber-300">
              {locale === "ar"
                ? "مثال 2: صفحة نوع السياحة"
                : "Example 2: Tourism Type Page"}
            </h4>
            <pre className="overflow-x-auto rounded-lg bg-black/30 p-4 text-xs text-white/80">
{`<ActivityFilter
  tourismType="Sea"
  showFilters={false}
  title="Sea Activities across Egypt"
/>`}
            </pre>
          </div>

          {/* Example 3 */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-amber-300">
              {locale === "ar" ? "مثال 3: صفحة اكتشاف الأنشطة" : "Example 3: Activity Discovery Page"}
            </h4>
            <pre className="overflow-x-auto rounded-lg bg-black/30 p-4 text-xs text-white/80">
{`<ActivityFilter
  showFilters={true}
  showClearButton={true}
  title="Discover Activities"
  onFilterChange={(destId, type) => {
    console.log('Filters changed:', {destId, type});
  }}
/>`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
