<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/bootstrap.php';

requireMethod('GET');

try {
    $pdo = db();

    $destinationsSchema = resolveDestinationsSchema($pdo);
    $activitiesSchema = resolveActivitiesSchema($pdo);

    $destTable = quoteIdentifier($destinationsSchema['table']);
    $destId = quoteIdentifier($destinationsSchema['id']);
    $destName = quoteIdentifier($destinationsSchema['name']);
    $destType = quoteIdentifier($destinationsSchema['type']);

    if (!columnExists($pdo, $destinationsSchema['table'], 'latitude') || !columnExists($pdo, $destinationsSchema['table'], 'longitude')) {
        errorResponse('destinations table must include latitude and longitude columns', 500);
    }

    if (!columnExists($pdo, $activitiesSchema['table'], 'latitude') || !columnExists($pdo, $activitiesSchema['table'], 'longitude')) {
        errorResponse('activities table must include latitude and longitude columns', 500);
    }

    $destinationsSql = "SELECT {$destId} AS id, {$destName} AS name, {$destType} AS type, latitude, longitude FROM {$destTable} ORDER BY {$destName} ASC";
    $destinationsStmt = $pdo->prepare($destinationsSql);
    $destinationsStmt->execute();
    $destinations = $destinationsStmt->fetchAll();

    $actTable = quoteIdentifier($activitiesSchema['table']);
    $actId = quoteIdentifier($activitiesSchema['id']);
    $actName = quoteIdentifier($activitiesSchema['name']);
    $actDestinationId = quoteIdentifier($activitiesSchema['destination_id']);
    $actRating = quoteIdentifier($activitiesSchema['rating']);
    $actPrice = quoteIdentifier($activitiesSchema['price']);
    $actHidden = quoteIdentifier($activitiesSchema['is_hidden']);

    $activityType = quoteIdentifier($activitiesSchema['type']);
    $activityCategory = quoteIdentifier($activitiesSchema['category']);

    $activitiesSql = "SELECT a.{$actId} AS id,
        a.{$actName} AS name,
        a.{$activityType} AS type,
        a.{$activityCategory} AS category,
        a.{$actDestinationId} AS destination_id,
        d.{$destName} AS destination_name,
        a.{$actRating} AS rating,
        a.{$actPrice} AS price,
        a.{$actHidden} AS is_hidden,
        a.latitude,
        a.longitude
      FROM {$actTable} a
      INNER JOIN {$destTable} d ON d.{$destId} = a.{$actDestinationId}
      ORDER BY a.{$actId} ASC";

    $activitiesStmt = $pdo->prepare($activitiesSql);
    $activitiesStmt->execute();
    $activities = $activitiesStmt->fetchAll();

    http_response_code(200);
    echo json_encode([
        'destinations' => $destinations,
        'activities' => $activities,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
} catch (PDOException $e) {
    dbErrorResponse($e, 500);
} catch (Throwable $e) {
    error_log('Map data endpoint failed: ' . $e->getMessage());
    dbErrorResponse($e, 500);
}
