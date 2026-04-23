-- phpMyAdmin-ready setup script for panorama_misr
-- Safe to run multiple times (idempotent where possible)

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- 1) Core tables used by backend (compatible with existing legacy schema)
CREATE TABLE IF NOT EXISTS `companies` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(190) NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_companies_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `subscriptions` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `status` ENUM('active','paused','cancelled') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_subscriptions_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `reviews` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `company_id` INT(11) NOT NULL,
  `review` TEXT NOT NULL,
  `rating` TINYINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_reviews_user_id` (`user_id`),
  KEY `idx_reviews_company_id` (`company_id`),
  CONSTRAINT `chk_reviews_rating` CHECK (`rating` BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2) Ensure activities.company_id exists
SET @has_company_col := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'activities'
    AND column_name = 'company_id'
);
SET @sql := IF(@has_company_col = 0,
  'ALTER TABLE `activities` ADD COLUMN `company_id` INT(11) NULL AFTER `destination_id`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_company_idx := (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'activities'
    AND index_name = 'idx_activities_company_id'
);
SET @sql := IF(@has_company_idx = 0,
  'ALTER TABLE `activities` ADD INDEX `idx_activities_company_id` (`company_id`)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3) Seed required tourism companies in companies table
INSERT INTO `companies` (`name`)
SELECT src.company_name
FROM (
  SELECT 'Memphis Tours' AS company_name UNION ALL
  SELECT 'Travco Group' UNION ALL
  SELECT 'Pharaoh''s Choice Travel' UNION ALL
  SELECT 'Red Sea Diving Safari' UNION ALL
  SELECT 'Jolly Tour' UNION ALL
  SELECT 'Kuoni Egypt' UNION ALL
  SELECT 'Sinai Safari Adventures' UNION ALL
  SELECT 'Oasis Desert Tours' UNION ALL
  SELECT 'Desert Quest Adventures' UNION ALL
  SELECT 'Egypt Tailor Made' UNION ALL
  SELECT 'Nile Explorers' UNION ALL
  SELECT 'Abercrombie & Kent Egypt'
) AS src
LEFT JOIN `companies` c ON c.`name` = src.company_name
WHERE c.`id` IS NULL;

-- 4) If legacy tourism_company table exists, sync names in both directions
SET @has_legacy_company_table := (
  SELECT COUNT(*)
  FROM information_schema.tables
  WHERE table_schema = DATABASE()
    AND table_name = 'tourism_company'
);

SET @sql := IF(@has_legacy_company_table > 0,
  'INSERT INTO `companies` (`name`)\n   SELECT DISTINCT tc.`comp_name`\n   FROM `tourism_company` tc\n   WHERE tc.`comp_name` IS NOT NULL AND tc.`comp_name` <> ""\n     AND NOT EXISTS (SELECT 1 FROM `companies` c WHERE c.`name` = tc.`comp_name`)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(@has_legacy_company_table > 0,
  'INSERT INTO `tourism_company` (`comp_name`)\n   SELECT c.`name`\n   FROM `companies` c\n   WHERE NOT EXISTS (SELECT 1 FROM `tourism_company` tc WHERE tc.`comp_name` = c.`name`)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 5) Seed key destinations based on actual destination name column (name or NAME)
SET @destination_name_col := (
  SELECT CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = DATABASE() AND table_name = 'destinations' AND column_name = 'NAME'
    ) THEN 'NAME'
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = DATABASE() AND table_name = 'destinations' AND column_name = 'name'
    ) THEN 'name'
    ELSE NULL
  END
);

SET @sql := IF(@destination_name_col IS NOT NULL,
  CONCAT(
    'INSERT INTO `destinations` (`', @destination_name_col, '`) ',
    'SELECT src.destination_name FROM (',
    'SELECT ''Cairo'' AS destination_name UNION ALL ',
    'SELECT ''Giza'' UNION ALL ',
    'SELECT ''Sharm El Sheikh'' UNION ALL ',
    'SELECT ''Hurghada'' UNION ALL ',
    'SELECT ''Sinai'' UNION ALL ',
    'SELECT ''Western Desert'' UNION ALL ',
    'SELECT ''Luxor'' UNION ALL ',
    'SELECT ''Aswan''',
    ') src ',
    'LEFT JOIN `destinations` d ON d.`', @destination_name_col, '` = src.destination_name ',
    'WHERE d.`', @destination_name_col, '` IS NULL'
  ),
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
