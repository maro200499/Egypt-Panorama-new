<?php
declare(strict_types=1);

require_once __DIR__ . '/../middleware/auth.php';

requireMethod('GET');
requireAdmin();

try {
    $pdo = db();

    $activitiesSchema = resolveActivitiesSchema($pdo);
    $destinationsSchema = resolveDestinationsSchema($pdo);
    $usersSchema = resolveUsersSchema($pdo);
    $companiesSchema = resolveCompaniesSchema($pdo);

    $activityCountStmt = $pdo->prepare('SELECT COUNT(*) FROM ' . quoteIdentifier($activitiesSchema['table']));
    $activityCountStmt->execute();

    $destinationCountStmt = $pdo->prepare('SELECT COUNT(*) FROM ' . quoteIdentifier($destinationsSchema['table']));
    $destinationCountStmt->execute();

    $companyCountStmt = $pdo->prepare('SELECT COUNT(*) FROM ' . quoteIdentifier($companiesSchema['table']));
    $companyCountStmt->execute();

    if ($usersSchema['role'] !== null) {
        $userCountSql = 'SELECT COUNT(*) FROM ' . quoteIdentifier($usersSchema['table']) . ' WHERE ' . quoteIdentifier($usersSchema['role']) . ' = :role';
        $userCountStmt = $pdo->prepare($userCountSql);
        $userCountStmt->execute([':role' => 'user']);
    } else {
        $userCountStmt = $pdo->prepare('SELECT COUNT(*) FROM ' . quoteIdentifier($usersSchema['table']));
        $userCountStmt->execute();
    }

    successResponse([
        'activityCount' => (int)$activityCountStmt->fetchColumn(),
        'userCount' => (int)$userCountStmt->fetchColumn(),
        'destCount' => (int)$destinationCountStmt->fetchColumn(),
        'companyCount' => (int)$companyCountStmt->fetchColumn(),
    ], 'Admin stats fetched successfully', 200);
} catch (PDOException $e) {
    error_log('Database error while fetching admin stats: ' . $e->getMessage());
    dbErrorResponse($e, 500);
} catch (Throwable $e) {
    error_log('Error fetching admin stats: ' . $e->getMessage());
    dbErrorResponse($e, 500);
}