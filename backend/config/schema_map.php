<?php
declare(strict_types=1);

function quoteIdentifier(string $name): string
{
    if (!preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/', $name)) {
        throw new RuntimeException('Invalid SQL identifier: ' . $name);
    }

    return '`' . $name . '`';
}

function tableExists(PDO $pdo, string $tableName): bool
{
    $stmt = $pdo->prepare(
        'SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = :table_name'
    );
    $stmt->execute([':table_name' => $tableName]);

    return (int)$stmt->fetchColumn() > 0;
}

function columnExists(PDO $pdo, string $tableName, string $columnName): bool
{
    $stmt = $pdo->prepare(
        'SELECT COUNT(*) FROM information_schema.columns
         WHERE table_schema = DATABASE() AND table_name = :table_name AND column_name = :column_name'
    );
    $stmt->execute([
        ':table_name' => $tableName,
        ':column_name' => $columnName,
    ]);

    return (int)$stmt->fetchColumn() > 0;
}

function resolveDestinationsSchema(PDO $pdo): array
{
    static $cache = null;

    if (is_array($cache)) {
        return $cache;
    }

    if (!tableExists($pdo, 'destinations')) {
        throw new RuntimeException('destinations table is missing');
    }

    $idColumn = columnExists($pdo, 'destinations', 'id') ? 'id' : 'destination_id';

    if (!columnExists($pdo, 'destinations', $idColumn)) {
        throw new RuntimeException('No destination id column found (expected id or destination_id)');
    }

    if (columnExists($pdo, 'destinations', 'name')) {
        $nameColumn = 'name';
    } elseif (columnExists($pdo, 'destinations', 'NAME')) {
        $nameColumn = 'NAME';
    } else {
        throw new RuntimeException('No destination name column found (expected name or NAME)');
    }

    if (!columnExists($pdo, 'destinations', 'city')) {
        $pdo->exec("ALTER TABLE destinations ADD COLUMN city VARCHAR(120) NOT NULL DEFAULT 'Egypt' AFTER {$nameColumn}");
    }

    if (!columnExists($pdo, 'destinations', 'latitude')) {
        $pdo->exec('ALTER TABLE destinations ADD COLUMN latitude DECIMAL(10,8) NULL AFTER city');
    }

    if (!columnExists($pdo, 'destinations', 'longitude')) {
        $pdo->exec('ALTER TABLE destinations ADD COLUMN longitude DECIMAL(11,8) NULL AFTER latitude');
    }

    if (!columnExists($pdo, 'destinations', 'type')) {
        $pdo->exec("ALTER TABLE destinations ADD COLUMN type VARCHAR(80) NOT NULL DEFAULT 'Cultural' AFTER longitude");
    }

    if (!columnExists($pdo, 'destinations', 'cover_image')) {
        $pdo->exec('ALTER TABLE destinations ADD COLUMN cover_image VARCHAR(500) NULL AFTER type');
    }

    if (!columnExists($pdo, 'destinations', 'gallery_images')) {
        $pdo->exec('ALTER TABLE destinations ADD COLUMN gallery_images TEXT NULL AFTER cover_image');
    }

    $cache = [
        'table' => 'destinations',
        'id' => $idColumn,
        'name' => $nameColumn,
        'city' => 'city',
        'latitude' => 'latitude',
        'longitude' => 'longitude',
        'type' => 'type',
        'cover_image' => 'cover_image',
        'gallery_images' => 'gallery_images',
    ];

    return $cache;
}

function ensureActivitiesTable(PDO $pdo): void
{
    if (tableExists($pdo, 'activities')) {
        if (!columnExists($pdo, 'activities', 'company_id')) {
            $pdo->exec('ALTER TABLE activities ADD COLUMN company_id INT UNSIGNED NULL AFTER destination_id');
        }

        if (!columnExists($pdo, 'activities', 'latitude')) {
            $pdo->exec('ALTER TABLE activities ADD COLUMN latitude DECIMAL(10,8) NULL AFTER company_id');
        }

        if (!columnExists($pdo, 'activities', 'longitude')) {
            $pdo->exec('ALTER TABLE activities ADD COLUMN longitude DECIMAL(11,8) NULL AFTER latitude');
        }

        if (!columnExists($pdo, 'activities', 'category')) {
            $pdo->exec("ALTER TABLE activities ADD COLUMN category VARCHAR(100) NOT NULL DEFAULT 'Cultural' AFTER type");
        }

        if (!columnExists($pdo, 'activities', 'rating')) {
            $pdo->exec('ALTER TABLE activities ADD COLUMN rating DECIMAL(2,1) NOT NULL DEFAULT 4.0 AFTER longitude');
        }

        if (!columnExists($pdo, 'activities', 'price')) {
            $pdo->exec("ALTER TABLE activities ADD COLUMN price VARCHAR(80) NOT NULL DEFAULT 'N/A' AFTER rating");
        }

        if (!columnExists($pdo, 'activities', 'image_url')) {
            $pdo->exec('ALTER TABLE activities ADD COLUMN image_url VARCHAR(500) NULL AFTER price');
        }

        if (!columnExists($pdo, 'activities', 'is_hidden')) {
            $pdo->exec('ALTER TABLE activities ADD COLUMN is_hidden TINYINT(1) NOT NULL DEFAULT 0 AFTER image_url');
        }

        return;
    }

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS activities (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(180) NOT NULL,
            type VARCHAR(100) NOT NULL,
            category VARCHAR(100) NOT NULL DEFAULT 'Cultural',
            destination_id INT NOT NULL,
            company_id INT UNSIGNED NULL,
            latitude DECIMAL(10,8) NULL,
            longitude DECIMAL(11,8) NULL,
            rating DECIMAL(2,1) NOT NULL DEFAULT 4.0,
            price VARCHAR(80) NOT NULL DEFAULT 'N/A',
            image_url VARCHAR(500) NULL,
            is_hidden TINYINT(1) NOT NULL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
    );
}

function resolveActivitiesSchema(PDO $pdo): array
{
    static $cache = null;

    if (is_array($cache)) {
        return $cache;
    }

    ensureActivitiesTable($pdo);

    if (!tableExists($pdo, 'activities')) {
        throw new RuntimeException('activities table is missing');
    }

    $required = ['id', 'name', 'type', 'category', 'destination_id', 'rating', 'price', 'is_hidden'];

    foreach ($required as $column) {
        if (!columnExists($pdo, 'activities', $column)) {
            throw new RuntimeException('activities table is missing required column: ' . $column);
        }
    }

    $cache = [
        'table' => 'activities',
        'id' => 'id',
        'name' => 'name',
        'type' => 'type',
        'destination_id' => 'destination_id',
        'category' => 'category',
        'latitude' => 'latitude',
        'longitude' => 'longitude',
        'rating' => 'rating',
        'price' => 'price',
        'image_url' => 'image_url',
        'is_hidden' => 'is_hidden',
    ];

    return $cache;
}

function ensureActivityReviewsTable(PDO $pdo): void
{
    if (tableExists($pdo, 'activity_reviews')) {
        if (!columnExists($pdo, 'activity_reviews', 'activity_id')) {
            $pdo->exec('ALTER TABLE activity_reviews ADD COLUMN activity_id INT UNSIGNED NOT NULL AFTER id');
        }

        if (!columnExists($pdo, 'activity_reviews', 'user_id')) {
            $pdo->exec('ALTER TABLE activity_reviews ADD COLUMN user_id INT UNSIGNED NULL AFTER activity_id');
        }

        if (!columnExists($pdo, 'activity_reviews', 'rating')) {
            $pdo->exec('ALTER TABLE activity_reviews ADD COLUMN rating TINYINT UNSIGNED NOT NULL AFTER user_id');
        }

        if (!columnExists($pdo, 'activity_reviews', 'comment')) {
            $pdo->exec('ALTER TABLE activity_reviews ADD COLUMN comment TEXT NOT NULL AFTER rating');
        }

        if (!columnExists($pdo, 'activity_reviews', 'created_at')) {
            $pdo->exec('ALTER TABLE activity_reviews ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER comment');
        }

        return;
    }

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS activity_reviews (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            activity_id INT UNSIGNED NOT NULL,
            user_id INT UNSIGNED NULL,
            rating TINYINT UNSIGNED NOT NULL,
            comment TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_activity_reviews_activity_id (activity_id),
            INDEX idx_activity_reviews_user_id (user_id),
            INDEX idx_activity_reviews_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
    );
}

function resolveUsersSchema(PDO $pdo): array
{
    static $cache = null;

    if (is_array($cache)) {
        return $cache;
    }

    if (!tableExists($pdo, 'users')) {
        throw new RuntimeException('users table is missing');
    }

    $idColumn = columnExists($pdo, 'users', 'id') ? 'id' : 'user_id';
    $nameColumn = columnExists($pdo, 'users', 'name') ? 'name' : (columnExists($pdo, 'users', 'NAME') ? 'NAME' : null);
    $passwordColumn = columnExists($pdo, 'users', 'password')
        ? 'password'
        : (columnExists($pdo, 'users', 'PASSWORD') ? 'PASSWORD' : null);

    if (!columnExists($pdo, 'users', $idColumn) || $nameColumn === null || $passwordColumn === null || !columnExists($pdo, 'users', 'email')) {
        throw new RuntimeException('users table has unsupported schema');
    }

    $nationalityColumn = null;
    if (columnExists($pdo, 'users', 'nationality')) {
        $nationalityColumn = 'nationality';
    } elseif (columnExists($pdo, 'users', 'country')) {
        $nationalityColumn = 'country';
    }

    $cache = [
        'table' => 'users',
        'id' => $idColumn,
        'name' => $nameColumn,
        'email' => 'email',
        'password' => $passwordColumn,
        'nationality' => $nationalityColumn,
        'role' => columnExists($pdo, 'users', 'role') ? 'role' : null,
    ];

    return $cache;
}

function resolveCompaniesSchema(PDO $pdo): array
{
    static $cache = null;

    if (is_array($cache)) {
        return $cache;
    }

    if (tableExists($pdo, 'companies')) {
        $cache = [
            'table' => 'companies',
            'id' => 'id',
            'name' => 'name',
        ];

        return $cache;
    }

    if (tableExists($pdo, 'tourism_company')) {
        $cache = [
            'table' => 'tourism_company',
            'id' => 'company_id',
            'name' => 'comp_name',
        ];

        return $cache;
    }

    throw new RuntimeException('No companies table found (expected companies or tourism_company)');
}

function resolveSubscriptionsSchema(PDO $pdo): array
{
    static $cache = null;

    if (is_array($cache)) {
        return $cache;
    }

    if (tableExists($pdo, 'subscriptions')) {
        $cache = [
            'table' => 'subscriptions',
            'id' => 'id',
            'user_id' => 'user_id',
            'status' => 'status',
            'created_at' => columnExists($pdo, 'subscriptions', 'created_at') ? 'created_at' : null,
            'updated_at' => columnExists($pdo, 'subscriptions', 'updated_at') ? 'updated_at' : null,
        ];

        return $cache;
    }

    if (tableExists($pdo, 'subscription')) {
        $cache = [
            'table' => 'subscription',
            'id' => 'subscription_id',
            'user_id' => 'user_id',
            'status' => 'status',
            'created_at' => null,
            'updated_at' => null,
        ];

        return $cache;
    }

    throw new RuntimeException('No subscription table found (expected subscriptions or subscription)');
}

function ensureReviewsTable(PDO $pdo): void
{
    if (tableExists($pdo, 'reviews')) {
        return;
    }

    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS reviews (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            company_id INT NOT NULL,
            review TEXT NOT NULL,
            rating TINYINT UNSIGNED NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
    );
}

function resolveReviewsSchema(PDO $pdo): array
{
    static $cache = null;

    if (is_array($cache)) {
        return $cache;
    }

    ensureReviewsTable($pdo);

    if (!tableExists($pdo, 'reviews')) {
        throw new RuntimeException('reviews table is missing');
    }

    $cache = [
        'table' => 'reviews',
        'id' => 'id',
        'user_id' => 'user_id',
        'company_id' => 'company_id',
        'review' => 'review',
        'rating' => 'rating',
        'created_at' => columnExists($pdo, 'reviews', 'created_at') ? 'created_at' : null,
    ];

    return $cache;
}
