<?php
declare(strict_types=1);

require_once __DIR__ . '/../../middleware/auth.php';

requireMethod('GET');
$user = requireAuth();

try {
    $pdo = db();

    $schema = resolveSubscriptionsSchema($pdo);
    $table = quoteIdentifier($schema['table']);
    $idColumn = quoteIdentifier($schema['id']);
    $userIdColumn = quoteIdentifier($schema['user_id']);
    $statusColumn = quoteIdentifier($schema['status']);

    $createdAtSql = $schema['created_at'] !== null
        ? quoteIdentifier($schema['created_at']) . ' AS created_at'
        : 'NULL AS created_at';

    $updatedAtSql = $schema['updated_at'] !== null
        ? quoteIdentifier($schema['updated_at']) . ' AS updated_at'
        : 'NULL AS updated_at';

    $sql = "SELECT {$idColumn} AS id, {$userIdColumn} AS user_id, {$statusColumn} AS status,
                   {$createdAtSql}, {$updatedAtSql}
            FROM {$table}
            WHERE {$userIdColumn} = :user_id
            LIMIT 1";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([':user_id' => $user['id']]);
    $subscription = $stmt->fetch();

    if (!$subscription) {
        successResponse([
            'user_id' => $user['id'],
            'status' => 'none',
        ], 'No subscription found', 200);
    }

    successResponse($subscription, 'Subscription fetched successfully', 200);
} catch (PDOException $e) {
    error_log('Database error while fetching subscription: ' . $e->getMessage());
    dbErrorResponse($e, 500);
} catch (Throwable $e) {
    error_log('Error fetching subscription: ' . $e->getMessage());
    dbErrorResponse($e, 500);
}
