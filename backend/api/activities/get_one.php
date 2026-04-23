<?php
declare(strict_types=1);

require_once __DIR__ . '/../../config/bootstrap.php';

requireMethod('GET');

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($id <= 0) {
    errorResponse('Invalid activity id', 422);
}

try {
    $pdo = db();

    $activitiesSchema = resolveActivitiesSchema($pdo);
    $destinationsSchema = resolveDestinationsSchema($pdo);

    $activitiesTable = quoteIdentifier($activitiesSchema['table']);
    $destinationsTable = quoteIdentifier($destinationsSchema['table']);
    $activityId = quoteIdentifier($activitiesSchema['id']);
    $activityName = quoteIdentifier($activitiesSchema['name']);
    $activityType = quoteIdentifier($activitiesSchema['type']);
    $activityDestinationId = quoteIdentifier($activitiesSchema['destination_id']);
    $destinationId = quoteIdentifier($destinationsSchema['id']);
    $destinationName = quoteIdentifier($destinationsSchema['name']);

    $sql = "SELECT a.{$activityId} AS id, a.{$activityName} AS name, a.{$activityType} AS type,
                   a.{$activityDestinationId} AS destination_id, d.{$destinationName} AS destination_name
            FROM {$activitiesTable} a
            INNER JOIN {$destinationsTable} d ON d.{$destinationId} = a.{$activityDestinationId}
            WHERE a.{$activityId} = :id
            LIMIT 1";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([':id' => $id]);
    $activity = $stmt->fetch();

    if (!$activity) {
        errorResponse('Activity not found', 404);
    }

    successResponse($activity, 'Activity fetched successfully', 200);
} catch (PDOException $e) {
    dbErrorResponse($e, 500);
} catch (Throwable $e) {
    error_log('Error fetching activity: ' . $e->getMessage());
    dbErrorResponse($e, 500);
}
