<?php
declare(strict_types=1);

require_once __DIR__ . '/../../middleware/auth.php';

requireMethod('DELETE');
requireAdmin();

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($id <= 0) {
    errorResponse('Invalid user id', 422);
}

try {
    $pdo = db();
    $usersSchema = resolveUsersSchema($pdo);

    $usersTable = quoteIdentifier($usersSchema['table']);
    $idColumn = quoteIdentifier($usersSchema['id']);
    $roleColumn = $usersSchema['role'] !== null ? quoteIdentifier($usersSchema['role']) : null;

    $selectSql = 'SELECT ' . $idColumn . ' AS id' . ($roleColumn !== null ? ', ' . $roleColumn . ' AS role' : '') . ' FROM ' . $usersTable . ' WHERE ' . $idColumn . ' = :id LIMIT 1';
    $selectStmt = $pdo->prepare($selectSql);
    $selectStmt->execute([':id' => $id]);
    $user = $selectStmt->fetch();

    if (!$user) {
        errorResponse('User not found', 404);
    }

    if (($user['role'] ?? 'user') === 'admin') {
        errorResponse('Cannot delete admin', 403);
    }

    $deleteStmt = $pdo->prepare('DELETE FROM ' . $usersTable . ' WHERE ' . $idColumn . ' = :id');
    $deleteStmt->execute([':id' => $id]);

    successResponse([
        'id' => $id,
    ], 'User deleted successfully', 200);
} catch (PDOException $e) {
    error_log('Database error while deleting user: ' . $e->getMessage());
    dbErrorResponse($e, 500);
} catch (Throwable $e) {
    error_log('Error deleting user: ' . $e->getMessage());
    dbErrorResponse($e, 500);
}