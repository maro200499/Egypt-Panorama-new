# API Testing & Verification Commands

This file contains curl commands to test all fixed endpoints. Run these to verify the backend fixes are working.

## Prerequisites

```powershell
# Ensure curl is available (Windows 10+ has it built-in)
curl --version

# Set base URL as variable for easier testing
$BASE = "http://localhost/backend"
```

## 1. Activities Endpoints

### 1.1 Get All Activities (Should return 200)
```powershell
curl.exe -X GET "$BASE/api/activities/get_all.php"
```

**Expected Output:**
```json
{
  "status": "success",
  "message": "Activities fetched successfully",
  "data": [
    {
      "id": 1,
      "name": "Pyramid Tour",
      "type": "Historical",
      "destination_id": 1,
      "destination_name": "Giza"
    }
  ]
}
```

### 1.2 Get One Activity (Should return 200)
```powershell
curl.exe -X GET "$BASE/api/activities/get_one.php?id=1"
```

### 1.3 Get One Activity - Invalid ID (Should return 422)
```powershell
curl.exe -X GET "$BASE/api/activities/get_one.php?id=-1"
```

**Expected Error:**
```json
{"status":"error","message":"Invalid activity id"}
```

### 1.4 Get One Activity - Not Found (Should return 404)
```powershell
curl.exe -X GET "$BASE/api/activities/get_one.php?id=99999"
```

**Expected Error:**
```json
{"status":"error","message":"Activity not found"}
```

### 1.5 Create Activity - Success (Should return 201)
```powershell
$headers = @{"Content-Type"="application/json"}
$body = @{
    name = "Camel Ride"
    type = "Adventure"
    destination_id = 1
} | ConvertTo-Json

curl.exe -X POST "$BASE/api/activities/add.php" `
  -H "Content-Type: application/json" `
  -d $body
```

### 1.6 Create Activity - Missing Field (Should return 422)
```powershell
$body = @{
    name = "Camel Ride"
    destination_id = 1
} | ConvertTo-Json

curl.exe -X POST "$BASE/api/activities/add.php" `
  -H "Content-Type: application/json" `
  -d $body
```

**Expected Error:**
```json
{"status":"error","message":"Missing required field: type"}
```

### 1.7 Create Activity - Invalid Destination (Should return 404)
```powershell
$body = @{
    name = "Camel Ride"
    type = "Adventure"
    destination_id = 99999
} | ConvertTo-Json

curl.exe -X POST "$BASE/api/activities/add.php" `
  -H "Content-Type: application/json" `
  -d $body
```

**Expected Error:**
```json
{"status":"error","message":"Destination not found"}
```

### 1.8 Update Activity - Success (Should return 200)
```powershell
$body = @{
    id = 1
    name = "Updated Pyramid Tour"
    type = "Updated Type"
} | ConvertTo-Json

curl.exe -X POST "$BASE/api/activities/update.php" `
  -H "Content-Type: application/json" `
  -d $body
```

### 1.9 Update Activity - No Fields (Should return 422)
```powershell
$body = @{
    id = 1
} | ConvertTo-Json

curl.exe -X POST "$BASE/api/activities/update.php" `
  -H "Content-Type: application/json" `
  -d $body
```

**Expected Error:**
```json
{"status":"error","message":"No fields provided for update"}
```

### 1.10 Delete Activity - Success (Should return 200)
```powershell
curl.exe -X GET "$BASE/api/activities/delete.php?id=1"
```

### 1.11 Delete Activity - Not Found (Should return 404)
```powershell
curl.exe -X GET "$BASE/api/activities/delete.php?id=99999"
```

### 1.12 Get Activities by Destination ID (Should return 200)
```powershell
curl.exe -X GET "$BASE/api/activities/get_by_destination.php?destination_id=1"
```

### 1.13 Get Activities by Destination Name (Should return 200)
```powershell
curl.exe -X GET "$BASE/api/activities/get_by_destination.php?destination_name=Cairo"
```

### 1.14 Get Activities by Destination - Missing Parameter (Should return 422)
```powershell
curl.exe -X GET "$BASE/api/activities/get_by_destination.php"
```

**Expected Error:**
```json
{"status":"error","message":"destination_id or destination_name query parameter is required"}
```

## 2. Destinations Endpoints

### 2.1 Get All Destinations (Should return 200)
```powershell
curl.exe -X GET "$BASE/api/destinations/get_all.php"
```

### 2.2 Get One Destination (Should return 200)
```powershell
curl.exe -X GET "$BASE/api/destinations/get_one.php?id=1"
```

## 3. Companies Endpoints

### 3.1 Get All Companies (Should return 200)
```powershell
curl.exe -X GET "$BASE/api/companies/get_all.php"
```

### 3.2 Get One Company (Should return 200)
```powershell
curl.exe -X GET "$BASE/api/companies/get_one.php?id=1"
```

## 4. Generate Plan Endpoint

### 4.1 Generate Travel Plan (Should return 200)
```powershell
$body = @{
    days = 3
    destination = "1"
} | ConvertTo-Json

curl.exe -X POST "$BASE/api/generate_plan.php" `
  -H "Content-Type: application/json" `
  -d $body
```

### 4.2 Generate Plan by Name (Should return 200)
```powershell
$body = @{
    days = 3
    destination = "Cairo"
} | ConvertTo-Json

curl.exe -X POST "$BASE/api/generate_plan.php" `
  -H "Content-Type: application/json" `
  -d $body
```

### 4.3 Generate Plan - Invalid Days (Should return 422)
```powershell
$body = @{
    days = 31
    destination = "1"
} | ConvertTo-Json

curl.exe -X POST "$BASE/api/generate_plan.php" `
  -H "Content-Type: application/json" `
  -d $body
```

**Expected Error:**
```json
{"status":"error","message":"days must be between 1 and 30"}
```

## 5. Error Response Verification

### 5.1 Content-Type Verification
All responses should have `Content-Type: application/json`. 

```powershell
curl.exe -X GET "$BASE/api/activities/get_all.php" -v
```

Look for header:
```
Content-Type: application/json; charset=utf-8
```

### 5.2 Status Code Verification
```powershell
# 200 Success
curl.exe -X GET "$BASE/api/activities/get_all.php" -w "`nHTTP Status: %{http_code}`n"

# 201 Created
$body = @{name = "Test"; type = "Test"; destination_id = 1} | ConvertTo-Json
curl.exe -X POST "$BASE/api/activities/add.php" `
  -H "Content-Type: application/json" `
  -d $body `
  -w "`nHTTP Status: %{http_code}`n"

# 404 Not Found
curl.exe -X GET "$BASE/api/activities/get_one.php?id=99999" -w "`nHTTP Status: %{http_code}`n"

# 422 Unprocessable Entity
curl.exe -X GET "$BASE/api/activities/get_one.php?id=-1" -w "`nHTTP Status: %{http_code}`n"
```

## 6. JSON Format Verification

All responses must be valid JSON. Test with:

```powershell
$response = (curl.exe -X GET "$BASE/api/activities/get_all.php" | ConvertFrom-Json)
$response.status  # Should print "success"
$response.message  # Should print message
```

## 7. Error Logging Verification

### Windows XAMPP
```powershell
# View last 50 lines of error log
Get-Content "C:\xampp\apache\logs\error.log" -Tail 50

# Follow in real-time
Get-Content "C:\xampp\apache\logs\error.log" -Tail 50 -Wait
```

Look for entries like:
```
Database error while fetching activity: SQLSTATE[42S22]...
Error fetching activities: ...
```

## Quick Test Script

Save as `test-api.ps1`:

```powershell
$BASE = "http://localhost/backend"

# Test 1: Get All
Write-Host "Test 1: Get All Activities" -ForegroundColor Green
$result = curl.exe -s -X GET "$BASE/api/activities/get_all.php" | ConvertFrom-Json
Write-Host "Status: $($result.status)" -ForegroundColor Yellow
Write-Host "Count: $($result.data.Count)" -ForegroundColor Yellow
Write-Host ""

# Test 2: Error Handling
Write-Host "Test 2: Invalid ID" -ForegroundColor Green
$result = curl.exe -s -X GET "$BASE/api/activities/get_one.php?id=-1" | ConvertFrom-Json
Write-Host "Status: $($result.status)" -ForegroundColor Yellow
Write-Host "Message: $($result.message)" -ForegroundColor Yellow
Write-Host ""

# Test 3: Not Found
Write-Host "Test 3: Activity Not Found" -ForegroundColor Green
$result = curl.exe -s -X GET "$BASE/api/activities/get_one.php?id=99999" | ConvertFrom-Json
Write-Host "Status: $($result.status)" -ForegroundColor Yellow
Write-Host "Message: $($result.message)" -ForegroundColor Yellow
Write-Host ""

# Test 4: Create
Write-Host "Test 4: Create Activity" -ForegroundColor Green
$body = @{name = "Camel Ride"; type = "Adventure"; destination_id = 1} | ConvertTo-Json
$result = curl.exe -s -X POST "$BASE/api/activities/add.php" `
  -H "Content-Type: application/json" `
  -d $body | ConvertFrom-Json
Write-Host "Status: $($result.status)" -ForegroundColor Yellow
Write-Host "ID: $($result.data.id)" -ForegroundColor Yellow
```

Run it:
```powershell
.\test-api.ps1
```

## Troubleshooting

### No Response / Connection Error
- Verify Apache is running: `C:\xampp\apache\logs\access.log`
- Check firewall allows localhost traffic
- Verify URL is correct

### Generic "Database operation failed" Message
- Enable debug mode: Set `APP_DEBUG=1`
- Check error logs: `C:\xampp\apache\logs\error.log`
- Verify database connection works

### Invalid JSON Response
- Check error logs for PHP parse errors
- Verify content type header is correct
- Ensure all endpoints are fixed with try-catch blocks

### 405 Method Not Allowed
- Verify correct HTTP method (GET vs POST)
- Check endpoint requires specific method

### 422 Validation Error
- Check field names match API requirements
- Ensure required fields are provided
- Verify data types are correct (integers for IDs)

## Success Checklist

- [ ] All GET requests return 200
- [ ] All POST creations return 201
- [ ] All 404s return 404
- [ ] All validation errors return 422
- [ ] All responses are JSON
- [ ] Error messages appear in debug mode
- [ ] Generic messages appear in production mode
- [ ] Error logs contain detailed information
- [ ] Foreign key constraints are enforced
- [ ] Invalid IDs are rejected
- [ ] Missing fields are rejected
