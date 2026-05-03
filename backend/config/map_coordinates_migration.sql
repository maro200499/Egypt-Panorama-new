ALTER TABLE destinations
  ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,7) NULL,
  ADD COLUMN IF NOT EXISTS longitude DECIMAL(10,7) NULL;

ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,7) NULL,
  ADD COLUMN IF NOT EXISTS longitude DECIMAL(10,7) NULL;

UPDATE destinations
SET
  latitude = CASE
    WHEN LOWER(name) LIKE '%cairo%' THEN 30.0444
    WHEN LOWER(name) LIKE '%giza%' THEN 29.9870
    WHEN LOWER(name) LIKE '%hurghada%' THEN 27.2579
    WHEN LOWER(name) LIKE '%sharm%' THEN 27.9158
    WHEN LOWER(name) LIKE '%luxor%' THEN 25.6872
    WHEN LOWER(name) LIKE '%aswan%' THEN 24.0889
    WHEN LOWER(name) LIKE '%alexandria%' THEN 31.2001
    WHEN LOWER(name) LIKE '%siwa%' THEN 29.2032
    ELSE 26.8206
  END,
  longitude = CASE
    WHEN LOWER(name) LIKE '%cairo%' THEN 31.2357
    WHEN LOWER(name) LIKE '%giza%' THEN 31.2118
    WHEN LOWER(name) LIKE '%hurghada%' THEN 33.8116
    WHEN LOWER(name) LIKE '%sharm%' THEN 34.3300
    WHEN LOWER(name) LIKE '%luxor%' THEN 32.6396
    WHEN LOWER(name) LIKE '%aswan%' THEN 32.8998
    WHEN LOWER(name) LIKE '%alexandria%' THEN 29.9187
    WHEN LOWER(name) LIKE '%siwa%' THEN 25.5196
    ELSE 30.8025
  END
WHERE latitude IS NULL OR longitude IS NULL;

UPDATE activities a
INNER JOIN destinations d ON d.id = a.destination_id
SET
  a.latitude = ROUND(d.latitude + ((RAND() - 0.5) / 50), 7),
  a.longitude = ROUND(d.longitude + ((RAND() - 0.5) / 50), 7)
WHERE a.latitude IS NULL OR a.longitude IS NULL;
