<?php
// Migration to extend companies table with additional fields for company details

$sql = <<<SQL
ALTER TABLE companies ADD COLUMN IF NOT EXISTS (
    phone VARCHAR(20) NULL,
    email VARCHAR(190) NULL,
    address VARCHAR(255) NULL,
    city VARCHAR(120) DEFAULT 'Cairo',
    rating DECIMAL(2,1) DEFAULT 0.0,
    description TEXT NULL,
    image_url VARCHAR(500) NULL
);
SQL;

// Note: Run this migration with appropriate database tool or manually execute the SQL above
// Example: php -r "require 'config/bootstrap.php'; $pdo = db(); $pdo->exec(file_get_contents(__FILE__));"
?>
