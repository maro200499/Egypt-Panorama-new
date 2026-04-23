<?php
declare(strict_types=1);

require_once __DIR__ . '/../../middleware/auth.php';

requireMethod('POST');
$user = requireAuth();

$input = getJsonInput();
$status = isset($input['status']) ? cleanString($input['status']) : 'active';

$allowedStatuses = ['active', 'paused', 'cancelled'];
if (!in_array($status, $allowedStatuses, true)) {
    errorResponse('Invalid subscription status', 422);
}

try {
    $pdo = db();

    $schema = resolveSubscriptionsSchema($pdo);
    $table = quoteIdentifier($schema['table']);
    $userIdColumn = quoteIdentifier($schema['user_id']);
    $statusColumn = quoteIdentifier($schema['status']);

    if ($schema['table'] === 'subscriptions') {
        $sql = "INSERT INTO {$table} ({$userIdColumn}, {$statusColumn})
                VALUES (:user_id, :status)
                ON DUPLICATE KEY UPDATE {$statusColumn} = VALUES({$statusColumn}), updated_at = CURRENT_TIMESTAMP";
    } else {
        $sql = "INSERT INTO {$table} ({$userIdColumn}, {$statusColumn})
                VALUES (:user_id, :status)
                ON DUPLICATE KEY UPDATE {$statusColumn} = VALUES({$statusColumn})";
    }

    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ':user_id' => $user['id'],
        ':status' => $status,
    ]);

    successResponse([
        'user_id' => $user['id'],
        'status' => $status,
    ], 'Subscription updated successfully', 200);
} catch (PDOException $e) {
    error_log('Database error while updating subscription: ' . $e->getMessage());
    dbErrorResponse($e, 500);
} catch (Throwable $e) {
    error_log('Error updating subscription: ' . $e->getMessage());
    dbErrorResponse($e, 500);
}
