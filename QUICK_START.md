# Activity Filter System - Quick Start Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Test the Backend Endpoint

Open your terminal and run:

```bash
# Test all activities
curl "http://localhost/Egypt_panorama/backend/api/activities.php"

# Test with tourism type filter
curl "http://localhost/Egypt_panorama/backend/api/activities.php?tourism_type=Sea"

# Test with destination filter  
curl "http://localhost/Egypt_panorama/backend/api/activities.php?destination_id=1"

# Test with combined filters
curl "http://localhost/Egypt_panorama/backend/api/activities.php?destination_id=1&tourism_type=Cultural"
```

Expected response:
```json
{
  "status": "success",
  "message": "Activities fetched successfully",
  "data": [...]
}
```

### Step 2: Add ActivityFilter to Your Page

**Option A: Simple - Show all activities**
```tsx
import ActivityFilter from "@/components/plan/ActivityFilter";

export default function MyPage() {
  return <ActivityFilter />;
}
```

**Option B: Filter by tourism type**
```tsx
import ActivityFilter from "@/components/plan/ActivityFilter";

export default function SeaActivitiesPage() {
  return (
    <ActivityFilter
      tourismType="Sea"
      title="Water Activities"
    />
  );
}
```

**Option C: Filter by destination**
```tsx
import ActivityFilter from "@/components/plan/ActivityFilter";

export default function DestinationPage() {
  return (
    <ActivityFilter
      destinationId={3}
      title="Activities in this destination"
    />
  );
}
```

**Option D: Full featured**
```tsx
import ActivityFilter from "@/components/plan/ActivityFilter";

export default function ActivitiesPage() {
  return (
    <ActivityFilter
      showFilters={true}
      showClearButton={true}
      title="Discover Activities"
      onFilterChange={(destId, type) => {
        console.log("User changed filters:", { destId, type });
      }}
    />
  );
}
```

### Step 3: See It In Action

Visit: `http://localhost/Egypt_panorama/frontend/activities-example`

This example page shows all integration patterns in one place.

---

## 📁 Files Created

| File | Purpose |
|------|---------|
| `backend/api/activities.php` | Main backend API endpoint |
| `frontend/components/plan/ActivityFilter.tsx` | Main filter component |
| `frontend/components/plan/ActivityCardView.tsx` | Activity card display |
| `frontend/app/activities-example/page.tsx` | Integration examples |
| `ACTIVITY_FILTER_GUIDE.md` | Detailed technical documentation |
| `IMPLEMENTATION_SUMMARY.md` | Complete implementation overview |
| `QUICK_START.md` | This file |

---

## ✨ Key Features

✅ **Real-time Filtering** - No page reload needed
✅ **Multiple Filters** - Combine destination + tourism type
✅ **Beautiful UI** - Smooth animations and responsive design
✅ **Bilingual** - Works in English and Arabic
✅ **Error Handling** - Graceful error messages
✅ **Loading States** - Skeleton loaders while fetching
✅ **Empty States** - Helpful messages when no results
✅ **Type Safe** - Full TypeScript support

---

## 🔧 Common Tasks

### Show only specific tourism types
```tsx
<ActivityFilter tourismType="Desert" />
```

### Update parent component when filters change
```tsx
const [activeFilters, setActiveFilters] = useState({
  destId: null,
  type: null
});

<ActivityFilter
  onFilterChange={(destId, type) => {
    setActiveFilters({ destId, type });
  }}
/>
```

### Hide the filter UI (show results only)
```tsx
<ActivityFilter
  tourismType="Sea"
  showFilters={false}
/>
```

### Custom empty message
```tsx
<ActivityFilter
  emptyMessage="Oops! No activities match your filters. Try adjusting them."
/>
```

---

## 🎯 Tourism Types Available

The filter supports these tourism types (from your database):
- Cultural
- Sea
- Desert
- Eco
- Medical
- Religious

---

## 📊 API Response Structure

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

---

## 🐛 Troubleshooting

### Issue: "No activities found"
**Solution:** 
- Check if activities exist in database with `destination_id` and `type` fields
- Verify `is_hidden = 0` for activities you want to display
- Check the database connection is working

### Issue: API returns 404
**Solution:**
- Verify `/backend/api/activities.php` file exists
- Check file permissions
- Ensure backend server is running

### Issue: Translations not showing
**Solution:**
- Check `frontend/messages/en.json` and `ar.json` have the `activities` section
- Verify you're using `useTranslations("activities")`

### Issue: Styles don't look right
**Solution:**
- Ensure Tailwind CSS is properly configured
- Check all class names are valid Tailwind classes
- Verify dark mode settings

---

## 📖 Detailed Documentation

For more detailed information, see:
- **ACTIVITY_FILTER_GUIDE.md** - Complete API and component reference
- **IMPLEMENTATION_SUMMARY.md** - Full implementation details

---

## ✅ Verification Checklist

Before deploying, verify:

- [ ] Backend endpoint responds to requests: `curl http://localhost/Egypt_panorama/backend/api/activities.php`
- [ ] Activities exist in database with proper `destination_id` and `type`
- [ ] Frontend component renders without errors
- [ ] Filters work (click on tourism type buttons)
- [ ] Activities display correctly
- [ ] Clear filters button works
- [ ] Error handling works (try invalid filters)
- [ ] Responsive design works on mobile
- [ ] Bilingual support works (both EN and AR)

---

## 🎓 Learning Path

1. **Start Here:** Read this file (you are here)
2. **Quick Test:** Run curl commands to test backend
3. **See Examples:** Visit `activities-example` page
4. **Integrate:** Add ActivityFilter to your page
5. **Reference:** Check ACTIVITY_FILTER_GUIDE.md for details
6. **Customize:** Modify styles and behavior as needed

---

## 💡 Pro Tips

- Use `onFilterChange` callback to sync with URL parameters
- Combine with Next.js `useSearchParams` for URL-based filtering
- Add activity details modal on card click
- Track filter changes with analytics
- Cache results for better performance
- Add more tourism types as database grows

---

## 🚨 Important Notes

⚠️ **Don't forget:**
- Activities with `is_hidden = 1` are automatically excluded
- Results are sorted by rating (highest first)
- The `type` column in database = `tourism_type` in API
- All components are fully typed with TypeScript

---

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review ACTIVITY_FILTER_GUIDE.md for detailed API docs
3. Check browser console for errors
4. Verify database has activities with proper data
5. Ensure all files are created and in correct locations

---

**You're all set! Start using ActivityFilter in your pages. 🎉**
