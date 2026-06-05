<?php
declare(strict_types=1);

require_once __DIR__ . '/../../middleware/auth.php';

requireMethod('GET');
requireAdmin();

try {
    $pdo = db();

    $usersSchema = resolveUsersSchema($pdo);

    $usersTable = quoteIdentifier($usersSchema['table']);
    $idColumn = quoteIdentifier($usersSchema['id']);
    $nameColumn = quoteIdentifier($usersSchema['name']);
    $emailColumn = quoteIdentifier($usersSchema['email']);
    $roleColumn = $usersSchema['role'] !== null ? quoteIdentifier($usersSchema['role']) : null;
    $countryColumn = $usersSchema['nationality'] !== null ? quoteIdentifier($usersSchema['nationality']) : null;
    $createdAtColumn = columnExists($pdo, $usersSchema['table'], 'created_at') ? quoteIdentifier('created_at') : null;

    $roleSql = $roleColumn !== null ? "COALESCE({$roleColumn}, 'user') AS role" : "'user' AS role";
    $countrySql = $countryColumn !== null ? "{$countryColumn} AS country" : "'' AS country";
    $joinedSql = $createdAtColumn !== null
        ? "DATE_FORMAT({$createdAtColumn}, '%b %Y') AS joined"
        : "'' AS joined";

    $sql = "SELECT {$idColumn} AS id,
                   {$nameColumn} AS name,
                   {$emailColumn} AS email,
                   {$countrySql},
                   {$roleSql},
                   {$joinedSql}
            FROM {$usersTable}
            ORDER BY role DESC, {$idColumn} ASC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute();

    successResponse($stmt->fetchAll(), 'Admin users fetched successfully', 200);
} catch (PDOException $e) {
    error_log('Database error while fetching admin users: ' . $e->getMessage());
    dbErrorResponse($e, 500);
} catch (Throwable $e) {
    error_log('Error fetching admin users: ' . $e->getMessage());
    dbErrorResponse($e, 500);
}