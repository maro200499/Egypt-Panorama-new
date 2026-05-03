-- Migration: 2026_05_01_000000_extend_companies_table.sql
-- Adds company detail fields to the companies table

ALTER TABLE companies ADD COLUMN IF NOT EXISTS (
    phone VARCHAR(20) NULL,
    email VARCHAR(190) NULL,
    address VARCHAR(255) NULL,
    city VARCHAR(120) DEFAULT 'Cairo',
    rating DECIMAL(2,1) DEFAULT 4.5,
    description TEXT NULL,
    image_url VARCHAR(500) NULL
);

-- Optional: Add indexes for better query performance
ALTER TABLE companies ADD INDEX idx_city (city);
ALTER TABLE companies ADD INDEX idx_rating (rating);
