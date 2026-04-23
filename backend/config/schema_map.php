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

    $cache = [
        'table' => 'destinations',
        'id' => $idColumn,
        'name' => $nameColumn,
    ];

    return $cache;
}

function ensureActivitiesTable(PDO $pdo): void
{
    if (tableExists($pdo, 'activities')) {
        return;
    }

    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS activities (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(180) NOT NULL,
            type VARCHAR(100) NOT NULL,
            destination_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
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

    $required = ['id', 'name', 'type', 'destination_id'];

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
    ];

    return $cache;
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
