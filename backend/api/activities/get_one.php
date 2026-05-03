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
    $activityCategory = quoteIdentifier($activitiesSchema['category']);
    $activityDestinationId = quoteIdentifier($activitiesSchema['destination_id']);
    $activityRating = quoteIdentifier($activitiesSchema['rating']);
    $activityPrice = quoteIdentifier($activitiesSchema['price']);
    $activityImageUrl = quoteIdentifier($activitiesSchema['image_url']);
    $activityLatitude = quoteIdentifier($activitiesSchema['latitude']);
    $activityLongitude = quoteIdentifier($activitiesSchema['longitude']);
    $activityHidden = quoteIdentifier($activitiesSchema['is_hidden']);
    $destinationId = quoteIdentifier($destinationsSchema['id']);
    $destinationName = quoteIdentifier($destinationsSchema['name']);

    // Check for description and audio_url columns
    $hasTourismType = columnExists($pdo, $activitiesSchema['table'], 'tourism_type');
    $hasDescription = columnExists($pdo, $activitiesSchema['table'], 'description');
    $hasAudioUrl = columnExists($pdo, $activitiesSchema['table'], 'audio_url');

    $selectParts = [
        "a.{$activityId} AS id",
        "a.{$activityName} AS name",
        "a.{$activityType} AS type",
        "a.{$activityCategory} AS category",
        "a.{$activityDestinationId} AS destination_id",
        "d.{$destinationName} AS destination_name",
        "a.{$activityRating} AS rating",
        "a.{$activityPrice} AS price",
        "TRIM(a.{$activityImageUrl}) AS image_url",
        "a.{$activityLatitude} AS latitude",
        "a.{$activityLongitude} AS longitude",
        "a.{$activityHidden} AS is_hidden",
        "a.created_at",
        "a.updated_at"
    ];

    if ($hasTourismType) {
        $activityTourismType = quoteIdentifier('tourism_type');
        $selectParts[] = "a.{$activityTourismType} AS tourism_type";
    }

    if ($hasDescription) {
        $activityDescription = quoteIdentifier('description');
        $selectParts[] = "a.{$activityDescription} AS description";
    }

    if ($hasAudioUrl) {
        $activityAudioUrl = quoteIdentifier('audio_url');
        $selectParts[] = "a.{$activityAudioUrl} AS audio_url";
    }

    $selectClause = implode(', ', $selectParts);

    $sql = "SELECT {$selectClause}
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
