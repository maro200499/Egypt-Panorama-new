<?php
declare(strict_types=1);

require_once __DIR__ . '/../../config/bootstrap.php';

requireMethod('GET');

try {
    $pdo = db();

    $activitiesSchema = resolveActivitiesSchema($pdo);
    $activitiesTable = quoteIdentifier($activitiesSchema['table']);
    $activityPrice = quoteIdentifier($activitiesSchema['price']);
    $activityHidden = quoteIdentifier($activitiesSchema['is_hidden']);

    // Requested stats query for visible activities.
    $sql = "SELECT
                MIN(CAST({$activityPrice} AS DECIMAL(10,2))) AS min_price,
                MAX(CAST({$activityPrice} AS DECIMAL(10,2))) AS max_price,
                AVG(CAST({$activityPrice} AS DECIMAL(10,2))) AS avg_price
            FROM {$activitiesTable}
            WHERE {$activityHidden} = 0";

    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $stats = $stmt->fetch();

    successResponse($stats, 'Activity price stats fetched successfully', 200);
} catch (PDOException $e) {
    error_log('Database error while fetching activity price stats: ' . $e->getMessage());
    dbErrorResponse($e, 500);
} catch (Throwable $e) {
    error_log('Error fetching activity price stats: ' . $e->getMessage());
    dbErrorResponse($e, 500);
}
