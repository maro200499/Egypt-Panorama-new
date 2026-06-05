<?php
declare(strict_types=1);

require_once __DIR__ . '/../../middleware/auth.php';

requireMethod('GET');
requireAdmin();

try {
    $pdo = db();

    $activitiesSchema = resolveActivitiesSchema($pdo);
    $destinationsSchema = resolveDestinationsSchema($pdo);

    $activitiesTable = quoteIdentifier($activitiesSchema['table']);
    $destinationsTable = quoteIdentifier($destinationsSchema['table']);

    $activityId = quoteIdentifier($activitiesSchema['id']);
    $activityName = quoteIdentifier($activitiesSchema['name']);
    $activityType = quoteIdentifier($activitiesSchema['type']);
    $activityCategory = quoteIdentifier($activitiesSchema['category']);
    $activityDestinationId = quoteIdentifier($activitiesSchema['destination_id']);
    $activityRating = quoteIdentifier($activitiesSchema['rating']);
    $activityPrice = quoteIdentifier($activitiesSchema['price']);
    $activityImageUrl = quoteIdentifier($activitiesSchema['image_url']);
    $activityHidden = quoteIdentifier($activitiesSchema['is_hidden']);

    $destinationId = quoteIdentifier($destinationsSchema['id']);
    $destinationName = quoteIdentifier($destinationsSchema['name']);

    $sql = "SELECT a.{$activityId} AS id,
                   a.{$activityName} AS name,
                   a.{$activityType} AS type,
                   a.{$activityType} AS tourism_type,
                   a.{$activityCategory} AS category,
                   a.{$activityDestinationId} AS destination_id,
                   d.{$destinationName} AS destination_name,
                   a.{$activityRating} AS rating,
                   a.{$activityPrice} AS price,
                   TRIM(a.{$activityImageUrl}) AS image_url,
                   a.{$activityHidden} AS is_hidden,
                   CASE WHEN a.{$activityHidden} = 1 THEN 'Hidden' ELSE 'Visible' END AS status,
                   a.latitude AS latitude,
                   a.longitude AS longitude
            FROM {$activitiesTable} a
            LEFT JOIN {$destinationsTable} d ON d.{$destinationId} = a.{$activityDestinationId}
            ORDER BY a.{$activityId} DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute();

    successResponse($stmt->fetchAll(), 'Admin activities fetched successfully', 200);
} catch (PDOException $e) {
    error_log('Database error while fetching admin activities: ' . $e->getMessage());
    dbErrorResponse($e, 500);
} catch (Throwable $e) {
    error_log('Error fetching admin activities: ' . $e->getMessage());
    dbErrorResponse($e, 500);
}