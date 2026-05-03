# 📖 Trip Planner Usage Examples

Complete code examples for integrating Trip Planner components into your project.

## Example 1: Simple Plan Page

```tsx
"use client";

import { TripPlanner } from "@/components/plan";

export default function PlanPage() {
  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <TripPlanner />
    </div>
  );
}
```

## Example 2: Plan Page with Subscription Features

```tsx
"use client";

import { AdvancedTripPlanner } from "@/components/plan";
import { useState } from "react";

export default function AdvancedPlanPage() {
  const [generatedPlan, setGeneratedPlan] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-amber-100 mb-8">Your Journey Awaits</h1>
        
        <AdvancedTripPlanner
          maxDaysPreview={2}
          showSubscriptionPrompt={true}
          onPlanGenerated={(plan) => {
            setGeneratedPlan(plan);
            console.log("Plan generated:", plan);
          }}
        />

        {generatedPlan && (
          <div className="mt-8 bg-black/40 rounded-lg p-6 border border-amber-200/20">
            <h2 className="text-xl font-bold text-amber-100">Your Generated Plan</h2>
            <pre className="mt-4 text-amber-50/70 text-sm overflow-auto">
              {JSON.stringify(generatedPlan, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
```

## Example 3: Quick Plan in Hero Section

```tsx
import { QuickPlanGenerator } from "@/components/plan";

export default function HeroSection() {
  return (
    <section className="relative h-screen flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-900/20 to-transparent"></div>
      
      <div className="relative z-10 text-center">
        <h1 className="text-5xl font-bold text-amber-100 mb-4">
          Discover Egypt
        </h1>
        <p className="text-amber-50/80 mb-8 text-lg">
          Generate your perfect travel itinerary in seconds
        </p>
        
        <QuickPlanGenerator compact />
      </div>
    </section>
  );
}
```

## Example 4: Custom Form with Validation

```tsx
"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import {
  validatePlannerConfig,
  calculateTotalCost,
  generatePlanPayload,
  DESTINATIONS,
  BUDGET_OPTIONS,
  STYLE_OPTIONS,
  NIGHT_OPTIONS,
} from "@/lib/plannerUtils";

export default function CustomPlannerForm() {
  const locale = useLocale();
  const [config, setConfig] = useState({
    destination: DESTINATIONS[0],
    nights: 3,
    budget: "Standard" as const,
    style: "Mixed" as const,
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    // Validate
    const { valid, errors: validationErrors } = validatePlannerConfig(config);
    if (!valid) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const payload = generatePlanPayload(config);
      const cost = calculateTotalCost(config.nights, config.budget);

      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`Generated ${config.nights}-day plan for $${cost}`);
        console.log(data);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <select
        value={config.destination}
        onChange={(e) => setConfig({ ...config, destination: e.target.value })}
        className="w-full px-4 py-2 bg-white/10 border border-amber-200/30 rounded text-white"
      >
        {DESTINATIONS.map((dest) => (
          <option key={dest} value={dest}>
            {dest}
          </option>
        ))}
      </select>

      <select
        value={config.nights}
        onChange={(e) => setConfig({ ...config, nights: parseInt(e.target.value) })}
        className="w-full px-4 py-2 bg-white/10 border border-amber-200/30 rounded text-white"
      >
        {NIGHT_OPTIONS.map((nights) => (
          <option key={nights} value={nights}>
            {nights} nights
          </option>
        ))}
      </select>

      <select
        value={config.budget}
        onChange={(e) =>
          setConfig({
            ...config,
            budget: e.target.value as "Budget" | "Standard" | "Luxury",
          })
        }
        className="w-full px-4 py-2 bg-white/10 border border-amber-200/30 rounded text-white"
      >
        {BUDGET_OPTIONS.map((budget) => (
          <option key={budget} value={budget}>
            {budget}
          </option>
        ))}
      </select>

      {errors.length > 0 && (
        <div className="bg-red-900/20 border border-red-500 rounded p-4">
          {errors.map((error, i) => (
            <p key={i} className="text-red-400 text-sm">
              {error}
            </p>
          ))}
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-500 text-white rounded font-bold"
      >
        {loading ? "Generating..." : "Generate Plan"}
      </button>
    </div>
  );
}
```

## Example 5: Server-side Plan Generation with Caching

```tsx
import { cache } from "react";

const generatePlanCached = cache(async (destination: string, days: number) => {
  const response = await fetch("http://localhost:3000/api/generate-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      place: destination,
      days,
      budget: "Standard",
      style: "Mixed",
    }),
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!response.ok) throw new Error("Failed to generate plan");
  return response.json();
});

export default async function CachedPlanPage({
  searchParams,
}: {
  searchParams: { destination?: string; days?: string };
}) {
  const destination = searchParams.destination || "Cairo";
  const days = parseInt(searchParams.days || "3");

  const plan = await generatePlanCached(destination, days);

  return (
    <div>
      {/* Render plan */}
    </div>
  );
}
```

## Example 6: Analytics Integration

```tsx
"use client";

import { TripPlanner } from "@/components/plan";

export default function PlanPageWithAnalytics() {
  const handlePlanGenerated = (plan: any) => {
    // Track with Google Analytics
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "plan_generated", {
        destination: plan.meta?.place,
        days: plan.meta?.days,
        budget: plan.meta?.budget,
        style: plan.meta?.style,
        timestamp: new Date().toISOString(),
      });
    }

    // Send to backend
    fetch("/api/analytics/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        destination: plan.meta?.place,
        days: plan.meta?.days,
        budget: plan.meta?.budget,
        style: plan.meta?.style,
      }),
    });
  };

  return <TripPlanner />;
}
```

## Example 7: PDF Export Feature

```tsx
"use client";

import { TripPlanner } from "@/components/plan";
import { useState } from "react";

export default function PlanPageWithPDFExport() {
  const [plan, setPlan] = useState(null);

  const exportToPDF = async () => {
    if (!plan) return;

    // Import jsPDF
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text("Your Egypt Travel Plan", 10, 10);

    let yPos = 20;
    (plan as any).days?.forEach((day: any, index: number) => {
      doc.setFontSize(14);
      doc.text(`Day ${day.day}: ${day.title}`, 10, yPos);
      yPos += 10;

      doc.setFontSize(10);
      day.activities?.forEach((activity: any) => {
        doc.text(`• ${activity.time}: ${activity.activity}`, 15, yPos);
        yPos += 5;
        if (yPos > 250) {
          doc.addPage();
          yPos = 10;
        }
      });

      yPos += 5;
    });

    doc.save("egypt-travel-plan.pdf");
  };

  return (
    <div>
      <TripPlanner />
      {plan && (
        <button
          onClick={exportToPDF}
          className="mt-4 px-6 py-2 bg-amber-500 text-white rounded font-bold"
        >
          Export to PDF
        </button>
      )}
    </div>
  );
}
```

---

## Tips

- Copy the code blocks above and adapt them for your needs
- Replace `"use client"` if integrating into server components
- Update imports to match your project structure
- Test each example in your development environment
- Refer to [TRIP_PLANNER_INTEGRATION.md](TRIP_PLANNER_INTEGRATION.md) for API details
