<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/bootstrap.php';

requireMethod('POST');

$input = getJsonInput();
requireFields($input, ['days', 'destination']);

$days = (int)$input['days'];
$destinationInput = cleanString($input['destination']);

if ($days <= 0 || $days > 30) {
    errorResponse('days must be between 1 and 30', 422);
}

if ($destinationInput === '') {
    errorResponse('destination is required', 422);
}

try {
    $pdo = db();

    $activitiesSchema = resolveActivitiesSchema($pdo);
    $destinationsSchema = resolveDestinationsSchema($pdo);

    $activitiesTable = quoteIdentifier($activitiesSchema['table']);
    $activityId = quoteIdentifier($activitiesSchema['id']);
    $activityName = quoteIdentifier($activitiesSchema['name']);
    $activityType = quoteIdentifier($activitiesSchema['type']);
    $activityDestinationId = quoteIdentifier($activitiesSchema['destination_id']);

    $destinationsTable = quoteIdentifier($destinationsSchema['table']);
    $destinationIdColumn = quoteIdentifier($destinationsSchema['id']);
    $destinationNameColumn = quoteIdentifier($destinationsSchema['name']);

    if (ctype_digit($destinationInput)) {
        $destinationSql = "SELECT {$destinationIdColumn} AS id, {$destinationNameColumn} AS name
                           FROM {$destinationsTable}
                           WHERE {$destinationIdColumn} = :id
                           LIMIT 1";
        $destinationStmt = $pdo->prepare($destinationSql);
        $destinationStmt->execute([':id' => (int)$destinationInput]);
    } else {
        $destinationSql = "SELECT {$destinationIdColumn} AS id, {$destinationNameColumn} AS name
                           FROM {$destinationsTable}
                           WHERE {$destinationNameColumn} = :name
                           LIMIT 1";
        $destinationStmt = $pdo->prepare($destinationSql);
        $destinationStmt->execute([':name' => $destinationInput]);
    }

    $destination = $destinationStmt->fetch();

    if (!$destination) {
        errorResponse('Destination not found', 404);
    }

    $activitiesSql = "SELECT {$activityId} AS id, {$activityName} AS name, {$activityType} AS type
                      FROM {$activitiesTable}
                      WHERE {$activityDestinationId} = :destination_id";
    $activitiesStmt = $pdo->prepare($activitiesSql);
    $activitiesStmt->execute([':destination_id' => (int)$destination['id']]);
    $activities = $activitiesStmt->fetchAll();

    if ($activities === []) {
        errorResponse('No activities available for this destination', 404);
    }

    function pickActivitiesForDay(array $activities): array
    {
        $pool = $activities;
        shuffle($pool);

        $min = 2;
        $max = min(4, count($pool));
        $count = $max >= $min ? random_int($min, $max) : $max;

        return array_slice($pool, 0, $count);
    }

    $plan = [];

    for ($day = 1; $day <= $days; $day++) {
        $plan[] = [
            'day' => $day,
            'activities' => pickActivitiesForDay($activities),
        ];
    }

    successResponse([
        'destination' => [
            'id' => (int)$destination['id'],
            'name' => (string)$destination['name'],
        ],
        'days' => $days,
        'plan' => $plan,
    ], 'Travel plan generated successfully', 200);
} catch (PDOException $e) {
    error_log('Database error while generating plan: ' . $e->getMessage());
    dbErrorResponse($e, 500);
} catch (Throwable $e) {
    error_log('Error generating plan: ' . $e->getMessage());
    dbErrorResponse($e, 500);
}
