# Trip Planner Integration Guide

## Components Created

### 1. **TripPlanner** (`components/plan/TripPlanner.tsx`)
Full-featured trip planning component with form inputs and display.

**Features:**
- Destination selection
- Night customization (1-14 nights)
- Budget levels: Budget, Standard, Luxury
- Travel styles: Cultural, Adventure, Relaxation, Mixed
- Full i18n support (English/Arabic)
- Loading states
- Error handling with Toast notifications
- Responsive design
- RTL layout support

**Usage:**
```tsx
import { TripPlanner } from "@/components/plan";

export default function PlanPage() {
  return <TripPlanner />;
}
```

### 2. **QuickPlanGenerator** (`components/plan/QuickPlanGenerator.tsx`)
Lightweight component for quick plan generation with minimal inputs.

**Props:**
- `onPlanGenerated?: (plan: any) => void` - Callback when plan is generated
- `compact?: boolean` - Compact button style (default: false)

**Usage (Compact):**
```tsx
<QuickPlanGenerator compact onPlanGenerated={(plan) => console.log(plan)} />
```

**Usage (Full):**
```tsx
<QuickPlanGenerator onPlanGenerated={(plan) => handlePlanGenerated(plan)} />
```

### 3. **Planner Utilities** (`lib/plannerUtils.ts`)
Helper functions and configurations.

**Functions:**
- `calculateTotalCost(nights, budget)` - Calculate plan cost
- `validatePlannerConfig(config)` - Validate form inputs
- `generatePlanPayload(config)` - Create API payload
- `formatActivityDisplay(activity, time, icon)` - Format activity text
- `PLANNER_I18N` - Localization strings

**Constants:**
- `DESTINATIONS` - Array of available destinations
- `BUDGET_OPTIONS` - Budget tier options
- `STYLE_OPTIONS` - Travel style options
- `NIGHT_OPTIONS` - Available night durations

**Usage:**
```tsx
import {
  calculateTotalCost,
  validatePlannerConfig,
  DESTINATIONS,
  PLANNER_I18N,
} from "@/lib/plannerUtils";

// Calculate cost
const cost = calculateTotalCost(3, "Standard"); // 450

// Validate config
const { valid, errors } = validatePlannerConfig({
  destination: "Cairo",
  nights: 3,
  budget: "Standard",
  style: "Cultural",
});
```

## API Integration

### Endpoint: `/api/generate-plan`

**Method:** POST

**Request Body:**
```json
{
  "place": "Cairo",
  "days": 3,
  "budget": "Budget|Standard|Luxury",
  "style": "Cultural|Adventure|Relaxation|Mixed"
}
```

**Response:**
```json
{
  "plan": [
    {
      "day": "Day 1",
      "activities": [
        {
          "id": 1,
          "name": "Pyramids of Giza",
          "location": "Cairo",
          "type": "historical",
          "lat": 29.9792,
          "lng": 31.1342,
          "price": 20
        }
      ]
    }
  ],
  "isPremium": false,
  "meta": {
    "place": "Cairo",
    "style": "Mixed",
    "budget": "Standard",
    "matchedActivities": 12,
    "usedLocationFallback": false
  }
}
```

## Styling

All components use your project's **amber/black theme**:
- Primary color: `#f59e0b` (amber-500)
- Background: `#000` with transparency
- Accents: `#fcd34d` (amber-300)
- Borders: `#fed7aa` with opacity

## i18n Support

Both components automatically detect locale using `useLocale()` from `next-intl`.

**Supported Languages:**
- English (en)
- Arabic (ar)

Arabic components automatically use RTL layout.

## Subscription Integration

The TripPlanner works with your existing subscription system. Toast notifications display subscription-related messages using your existing Toast component.

## Examples

### Basic Usage in Page
```tsx
"use client";

import { TripPlanner } from "@/components/plan";

export default function PlanPage() {
  return (
    <div>
      <h1>Plan Your Trip</h1>
      <TripPlanner />
    </div>
  );
}
```

### With Custom Callback
```tsx
"use client";

import { TripPlanner } from "@/components/plan";
import { useState } from "react";

export default function PlanPageWithCallback() {
  const [generatedPlan, setGeneratedPlan] = useState(null);

  return (
    <div>
      <TripPlanner />
      {generatedPlan && (
        <div>
          <h2>Your Plan</h2>
          {/* Display generated plan */}
        </div>
      )}
    </div>
  );
}
```

### Quick Generator in Hero
```tsx
import { QuickPlanGenerator } from "@/components/plan";

export default function HeroSection() {
  return (
    <section>
      <h1>Discover Egypt</h1>
      <QuickPlanGenerator compact />
    </section>
  );
}
```

## Customization

### Changing Destinations
Update `DESTINATIONS` in `lib/plannerUtils.ts`:
```ts
export const DESTINATIONS = [
  "Cairo",
  "Luxor",
  "Alexandria",
  // Add more...
];
```

### Adjusting Budget Costs
Update `COST_PER_NIGHT` in `lib/plannerUtils.ts`:
```ts
const COST_PER_NIGHT = {
  Budget: 100,
  Standard: 200,
  Luxury: 400,
};
```

### Changing Colors
Update Tailwind classes in components:
```tsx
// Change from amber to another color
className="bg-amber-500" → className="bg-blue-500"
```

## Troubleshooting

### Plan not generating
1. Check browser console for errors
2. Verify API endpoint is accessible: `/api/generate-plan`
3. Ensure all required fields are filled
4. Check network tab for request/response

### Localization not working
1. Verify `next-intl` is properly configured
2. Check locale in URL (should be `/en/plan` or `/ar/plan`)
3. Ensure translation keys exist in component

### Styling issues
1. Verify Tailwind CSS is properly configured
2. Check RTL layout is applied for Arabic
3. Clear `.next` build cache if needed

## Performance Notes

- Components use lazy state management
- API calls are cached at route level when possible
- Images are optimized with Next.js Image component
- Toast notifications auto-dismiss after 3 seconds

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

- [ ] Save favorite plans
- [ ] Share plan via URL
- [ ] PDF export
- [ ] Integration with booking system
- [ ] User profile preferences
- [ ] Advanced filtering options
- [ ] Budget breakdown visualization
