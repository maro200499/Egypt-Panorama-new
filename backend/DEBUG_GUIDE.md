# Backend Database Operations - Debug Guide

## Overview
All database operations have been updated with comprehensive error handling, proper HTTP status codes, and detailed error logging. This guide helps verify the fixes and troubleshoot any remaining issues.

## Enable Debug Mode

To see detailed SQL error messages during development, add this to your Apache environment variables:

**Windows (XAMPP Control Panel):**
1. Click "Config" button → "PHP (php.ini)"
2. Add this near the end of the file:
   ```
   APP_DEBUG=1
   ```
3. Restart Apache

Or add to your .env file if you're using environment variable loading.

## API Response Format

All endpoints now return JSON in this format:

**Success Response (HTTP 200, 201):**
```json
{
  "status": "success",
  "message": "Description of successful operation",
  "data": { ... }
}
```

**Error Response (HTTP 400, 404, 422, 500):**
```json
{
  "status": "error",
  "message": "Error description (SQL details in debug mode)"
}
```

## HTTP Status Codes

- **200**: GET operations, successful UPDATE/DELETE
- **201**: POST successful creation (add.php endpoints)
- **400**: Bad request, invalid JSON
- **404**: Resource not found
- **405**: Method not allowed
- **422**: Validation error (invalid data)
- **500**: Database/server error

## Testing Activities Endpoints

### 1. Get All Activities
```bash
GET http://localhost/backend/api/activities/get_all.php
```

Expected Response (200):
```json
{
  "status": "success",
  "message": "Activities fetched successfully",
  "data": [
    {
      "id": 1,
      "name": "Activity Name",
      "type": "Type",
      "destination_id": 1,
      "destination_name": "Destination Name"
    }
  ]
}
```

### 2. Get One Activity
```bash
GET http://localhost/backend/api/activities/get_one.php?id=1
```

Expected Response (200):
```json
{
  "status": "success",
  "message": "Activity fetched successfully",
  "data": { ... }
}
```

### 3. Create Activity
```bash
POST http://localhost/backend/api/activities/add.php
Content-Type: application/json

{
  "name": "Hiking",
  "type": "Adventure",
  "destination_id": 1
}
```

Expected Response (201):
```json
{
  "status": "success",
  "message": "Activity created successfully",
  "data": {
    "id": 99,
    "name": "Hiking",
    "type": "Adventure",
    "destination_id": 1
  }
}
```

### 4. Update Activity
```bash
POST http://localhost/backend/api/activities/update.php
Content-Type: application/json

{
  "id": 1,
  "name": "Updated Name",
  "type": "Updated Type"
}
```

Expected Response (200):
```json
{
  "status": "success",
  "message": "Activity updated successfully"
}
```

### 5. Delete Activity
```bash
GET http://localhost/backend/api/activities/delete.php?id=1
```

Expected Response (200):
```json
{
  "status": "success",
  "message": "Activity deleted successfully"
}
```

### 6. Get Activities by Destination
```bash
GET http://localhost/backend/api/activities/get_by_destination.php?destination_id=1
```

OR:
```bash
GET http://localhost/backend/api/activities/get_by_destination.php?destination_name=Cairo
```

Expected Response (200):
```json
{
  "status": "success",
  "message": "Activities fetched successfully",
  "data": [ ... ]
}
```

## Error Scenarios to Test

### 1. Invalid ID (should return 422)
```bash
GET http://localhost/backend/api/activities/get_one.php?id=-1
```

Response:
```json
{
  "status": "error",
  "message": "Invalid activity id"
}
```

### 2. Non-existent Resource (should return 404)
```bash
GET http://localhost/backend/api/activities/get_one.php?id=99999
```

Response:
```json
{
  "status": "error",
  "message": "Activity not found"
}
```

### 3. Missing Required Fields (should return 422)
```bash
POST http://localhost/backend/api/activities/add.php
Content-Type: application/json

{
  "name": "Activity"
}
```

Response:
```json
{
  "status": "error",
  "message": "Missing required field: type"
}
```

### 4. Invalid Foreign Key (should return 404)
```bash
POST http://localhost/backend/api/activities/add.php
Content-Type: application/json

{
  "name": "Activity",
  "type": "Type",
  "destination_id": 99999
}
```

Response:
```json
{
  "status": "error",
  "message": "Destination not found"
}
```

### 5. Database Error with Debug Mode
If schema is missing or corrupted, you'll see the actual SQL error in debug mode:
```json
{
  "status": "error",
  "message": "SQLSTATE[42S22]: Column not found: 1054 Unknown column 'activities.wrong_column' in 'field list'"
}
```

## Database Schema Verification

Run this SQL in phpMyAdmin to verify schema:

```sql
-- Check activities table
DESC activities;

-- Verify columns exist
SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'panorama_misr' AND TABLE_NAME = 'activities';

-- Check destinations table
DESC destinations;

-- Verify foreign key constraint
SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = 'panorama_misr' AND TABLE_NAME = 'activities' AND CONSTRAINT_TYPE = 'FOREIGN KEY';
```

## Viewing Error Logs

Errors are logged to Apache error log. Check these locations:

**Windows XAMPP:**
- `C:\xampp\apache\logs\error.log`
- `C:\xampp\apache\logs\access.log`

**View in real-time:**
```bash
# Windows PowerShell
Get-Content "C:\xampp\apache\logs\error.log" -Tail 50 -Wait
```

## Common Issues and Solutions

### Issue 1: "Database operation failed" with no details
**Solution:** Enable debug mode (APP_DEBUG=1) to see actual SQL error

### Issue 2: Destination not found when adding activity
**Solution:** Ensure destination exists with: `GET /api/destinations/get_all.php`

### Issue 3: Wrong columns in error message
**Solution:** Run schema verification SQL above, then recreate table if needed

### Issue 4: JOIN errors in get_all.php
**Solution:** Verify foreign key relationship exists between activities and destinations

### Issue 5: Invalid JSON response
**Solution:** Check error logs for parse errors, ensure all endpoints return valid JSON

## Performance Notes

- All queries use prepared statements (secure against SQL injection)
- Schema is cached in memory (after first resolution)
- Database columns are validated once per request type
- Foreign key relationships are checked before operations

## Next Steps

1. ✅ All endpoints have proper error handling
2. ✅ All endpoints return JSON responses
3. ✅ All endpoints have try-catch blocks
4. ✅ All errors are logged to error_log
5. ✅ HTTP status codes are correct
6. ✅ Input validation is implemented
7. Test all endpoints with the scenarios above
8. Monitor error logs for any edge cases
9. Once confirmed working, disable debug mode in production (APP_DEBUG=0)

## API Endpoints Summary

| Endpoint | Method | Status | Purpose |
|----------|--------|--------|---------|
| `/api/activities/get_all.php` | GET | 200 | List all activities |
| `/api/activities/get_one.php?id=X` | GET | 200 | Get single activity |
| `/api/activities/add.php` | POST | 201 | Create activity |
| `/api/activities/update.php` | POST | 200 | Update activity |
| `/api/activities/delete.php?id=X` | GET | 200 | Delete activity |
| `/api/activities/get_by_destination.php` | GET | 200 | Activities by destination |
| `/api/destinations/get_all.php` | GET | 200 | List all destinations |
| `/api/destinations/get_one.php?id=X` | GET | 200 | Get single destination |
| `/api/companies/get_all.php` | GET | 200 | List all companies |
| `/api/companies/get_one.php?id=X` | GET | 200 | Get single company |
| `/api/reviews/add.php` | POST | 201 | Add review |
| `/api/reviews/get.php?company_id=X` | GET | 200 | Get reviews |
| `/api/subscription/subscribe.php` | POST | 200 | Subscribe/update |
| `/api/subscription/status.php` | GET | 200 | Get subscription |
| `/api/generate_plan.php` | POST | 200 | Generate travel plan |
