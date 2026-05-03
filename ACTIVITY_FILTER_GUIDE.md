# Activity Filter System - Integration Guide

## Overview
The Activity Filter system provides a complete solution for fetching, filtering, and displaying activities based on destination and tourism type.

## Backend Endpoint

### URL
```
GET /api/activities.php
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `destination_id` | integer | No | Filter by destination ID |
| `tourism_type` | string | No | Filter by tourism type (Cultural, Sea, Desert, Eco, Medical, Religious) |

### Examples

```bash
# All activities
GET http://localhost/backend/api/activities.php

# Activities in destination 1
GET http://localhost/backend/api/activities.php?destination_id=1

# Activities of Sea tourism type
GET http://localhost/backend/api/activities.php?tourism_type=Sea

# Activities in destination 1 AND Sea tourism type
GET http://localhost/backend/api/activities.php?destination_id=1&tourism_type=Sea
```

### Response Format

**Success (200)**
```json
{
  "status": "success",
  "message": "Activities fetched successfully",
  "data": [
    {
      "id": "1",
      "name": "Snorkeling at Ras Mohamed",
      "type": "Sea",
      "category": "Water Sports",
      "destination_id": 5,
      "destination_name": "Hurghada",
      "rating": 4.8,
      "price": "$45",
      "is_hidden": 0,
      "latitude": 27.7345,
      "longitude": 34.3543
    }
  ]
}
```

**Error (400/500)**
```json
{
  "status": "error",
  "message": "Database connection failed"
}
```

## Frontend Components

### ActivityFilter Component

The main component for displaying filtered activities with search and filter UI.

**Location:** `frontend/components/plan/ActivityFilter.tsx`

**Props:**
```typescript
type ActivityFilterProps = {
  destinationId?: number | null;        // Initial destination filter
  tourismType?: string | null;          // Initial tourism type filter
  showFilters?: boolean;                // Show/hide filter UI (default: true)
  showClearButton?: boolean;            // Show clear filters button (default: true)
  title?: string;                       // Optional section title
  emptyMessage?: string;                // Message when no activities found
  onFilterChange?: (destination_id: number | null, tourism_type: string | null) => void;
};
```

**Usage Example:**

```tsx
import ActivityFilter from "@/components/plan/ActivityFilter";

export default function MyPage() {
  return (
    <ActivityFilter
      tourismType="Sea"
      showFilters={true}
      title="Water Activities"
      onFilterChange={(destId, type) => {
        console.log(`Filters changed: destination=${destId}, type=${type}`);
      }}
    />
  );
}
```

### ActivityCardView Component

Individual activity card component.

**Location:** `frontend/components/plan/ActivityCardView.tsx`

**Props:**
```typescript
type ActivityCardViewProps = {
  activity: {
    id: string;
    name: string;
    price: string;
  };
  hiddenBadge?: string;                 // Badge for hidden gem activities
  priceLabel: string;                   // Label for price (i18n)
  noPriceLabel: string;                 // Label when price is N/A (i18n)
  showType?: boolean;                   // Show activity type (default: false)
  type?: string;                        // Activity type (Cultural, Sea, etc)
  rating?: number;                      // Activity rating (0-5)
};
```

## Features

### 1. Dynamic Filtering
- Filter by tourism type (Cultural, Sea, Desert, Eco, Medical, Religious)
- Filter by destination ID
- Combine both filters
- Real-time updates without page reload

### 2. Loading States
- Skeleton loaders while fetching data
- Error handling with user-friendly messages
- Empty state when no activities found

### 3. Visual Feedback
- Active filter highlighting
- Clear filters button (appears when filters are active)
- Activity count display
- Star rating display

### 4. Internationalization
- Supports both English and Arabic
- Translations in `/frontend/messages/` files

### 5. Responsive Design
- Mobile-friendly grid layout
- Smooth hover animations
- Touch-optimized buttons

## Database Schema

**Table:** `activities`

| Column | Type | Notes |
|--------|------|-------|
| id | INT UNSIGNED | Primary key |
| name | VARCHAR(180) | Activity name |
| type | VARCHAR(100) | Tourism type (type field maps to tourism_type) |
| category | VARCHAR(100) | Activity category |
| destination_id | INT | Foreign key to destinations |
| company_id | INT UNSIGNED | Optional: company association |
| latitude | DECIMAL(10,8) | Activity location latitude |
| longitude | DECIMAL(11,8) | Activity location longitude |
| rating | DECIMAL(2,1) | Activity rating (0-5) |
| price | VARCHAR(80) | Activity price display |
| is_hidden | TINYINT(1) | Hidden gem indicator |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Record update time |

## Important Notes

✅ **What's Supported:**
- Dynamic filtering based on existing database fields
- PDO prepared statements (SQL injection safe)
- Proper JSON response handling
- Error logging
- Multi-language support
- Hidden activities are excluded from public API

⚠️ **Important:**
- The `type` column in the database maps to `tourism_type` in the API
- Only activities with `is_hidden = 0` are returned
- Results are ordered by rating (DESC) then name (ASC)
- The system uses existing database schema - no modifications needed

## Testing

### Backend Test
```bash
# From project root
curl "http://localhost/Egypt_panorama/backend/api/activities.php?tourism_type=Sea"
```

### Frontend Integration
```tsx
// In any page component
import ActivityFilter from "@/components/plan/ActivityFilter";

export default function TestPage() {
  return (
    <div className="p-6">
      <ActivityFilter
        tourismType="Cultural"
        showFilters={true}
        title="Cultural Activities"
      />
    </div>
  );
}
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Empty activities list | Check if activities exist in database with matching filters |
| 404 error | Verify `/api/activities.php` file exists and is accessible |
| Database errors | Check database connection in `.env` file |
| Translation missing | Ensure translation keys exist in `messages/en.json` and `messages/ar.json` |
| API CORS errors | Verify CORS headers are enabled in `backend/config/bootstrap.php` |

## API Response Examples

### Get all activities
```bash
curl "http://localhost/Egypt_panorama/backend/api/activities.php"
```

### Filter by destination
```bash
curl "http://localhost/Egypt_panorama/backend/api/activities.php?destination_id=3"
```

### Filter by tourism type
```bash
curl "http://localhost/Egypt_panorama/backend/api/activities.php?tourism_type=Desert"
```

### Combined filters
```bash
curl "http://localhost/Egypt_panorama/backend/api/activities.php?destination_id=2&tourism_type=Sea"
```
