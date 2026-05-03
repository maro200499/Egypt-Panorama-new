<?php
declare(strict_types=1);

require_once __DIR__ . '/../../config/bootstrap.php';

requireMethod('GET');

$destinationIdInput = isset($_GET['destination_id']) ? cleanString($_GET['destination_id']) : '';
$destinationNameInput = isset($_GET['destination_name']) ? cleanString($_GET['destination_name']) : '';
$destinationFallback = isset($_GET['destination']) ? cleanString($_GET['destination']) : '';

if ($destinationIdInput === '' && $destinationNameInput === '' && $destinationFallback !== '') {
    if (ctype_digit($destinationFallback)) {
        $destinationIdInput = $destinationFallback;
    } else {
        $destinationNameInput = $destinationFallback;
    }
}

if ($destinationIdInput === '' && $destinationNameInput === '') {
    errorResponse('destination_id or destination_name query parameter is required', 422);
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
    $activityHidden = quoteIdentifier($activitiesSchema['is_hidden']);
    $destinationId = quoteIdentifier($destinationsSchema['id']);
    $destinationName = quoteIdentifier($destinationsSchema['name']);

    if ($destinationIdInput !== '') {
        if (!ctype_digit($destinationIdInput) || (int)$destinationIdInput <= 0) {
            errorResponse('destination_id must be a positive integer', 422);
        }

        $sql = "SELECT a.{$activityId} AS id, a.{$activityName} AS name, a.{$activityType} AS type,
                   a.{$activityCategory} AS category, a.{$activityDestinationId} AS destination_id,
                   d.{$destinationName} AS destination_name, a.{$activityRating} AS rating,
                         a.{$activityPrice} AS price, TRIM(a.{$activityImageUrl}) AS image_url, a.{$activityHidden} AS is_hidden,
                   a.latitude AS latitude, a.longitude AS longitude
                FROM {$activitiesTable} a
                INNER JOIN {$destinationsTable} d ON d.{$destinationId} = a.{$activityDestinationId}
                WHERE a.{$activityDestinationId} = :destination_id
                ORDER BY a.{$activityId} DESC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([':destination_id' => (int)$destinationIdInput]);
    } else {
        $sql = "SELECT a.{$activityId} AS id, a.{$activityName} AS name, a.{$activityType} AS type,
                   a.{$activityCategory} AS category, a.{$activityDestinationId} AS destination_id,
                   d.{$destinationName} AS destination_name, a.{$activityRating} AS rating,
                         a.{$activityPrice} AS price, TRIM(a.{$activityImageUrl}) AS image_url, a.{$activityHidden} AS is_hidden,
                   a.latitude AS latitude, a.longitude AS longitude
                FROM {$activitiesTable} a
                INNER JOIN {$destinationsTable} d ON d.{$destinationId} = a.{$activityDestinationId}
                WHERE d.{$destinationName} = :destination_name
                ORDER BY a.{$activityId} DESC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([':destination_name' => $destinationNameInput]);
    }

    $activities = $stmt->fetchAll();

    successResponse($activities, 'Activities fetched successfully', 200);
} catch (PDOException $e) {
    error_log('Database error while fetching activities by destination: ' . $e->getMessage());
    dbErrorResponse($e, 500);
} catch (Throwable $e) {
    error_log('Error fetching activities by destination: ' . $e->getMessage());
    dbErrorResponse($e, 500);
}
