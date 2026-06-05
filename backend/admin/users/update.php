<?php
declare(strict_types=1);

require_once __DIR__ . '/../../middleware/auth.php';

requireMethod('PUT');
requireAdmin();

$input = getJsonInput();

$id = isset($input['id']) ? (int)$input['id'] : 0;
$role = isset($input['role']) ? cleanString($input['role']) : '';

if ($id <= 0) {
    errorResponse('Valid user id is required', 422);
}

if (!in_array($role, ['user', 'admin'], true)) {
    errorResponse('Invalid role', 422);
}

try {
    $pdo = db();
    $usersSchema = resolveUsersSchema($pdo);

    if ($usersSchema['role'] === null) {
        errorResponse('Users table does not support role updates', 422);
    }

    $usersTable = quoteIdentifier($usersSchema['table']);
    $idColumn = quoteIdentifier($usersSchema['id']);
    $roleColumn = quoteIdentifier($usersSchema['role']);

    $existsStmt = $pdo->prepare('SELECT ' . $idColumn . ' AS id FROM ' . $usersTable . ' WHERE ' . $idColumn . ' = :id LIMIT 1');
    $existsStmt->execute([':id' => $id]);

    if (!$existsStmt->fetch()) {
        errorResponse('User not found', 404);
    }

    $updateStmt = $pdo->prepare('UPDATE ' . $usersTable . ' SET ' . $roleColumn . ' = :role WHERE ' . $idColumn . ' = :id');
    $updateStmt->execute([
        ':id' => $id,
        ':role' => $role,
    ]);

    successResponse([
        'id' => $id,
        'role' => $role,
    ], 'User role updated successfully', 200);
} catch (PDOException $e) {
    error_log('Database error while updating user role: ' . $e->getMessage());
    dbErrorResponse($e, 500);
} catch (Throwable $e) {
    error_log('Error updating user role: ' . $e->getMessage());
    dbErrorResponse($e, 500);
}