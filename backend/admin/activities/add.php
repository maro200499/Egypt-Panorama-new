<?php
declare(strict_types=1);

require_once __DIR__ . '/../../middleware/auth.php';

requireMethod('POST');
requireAdmin();

$input = getJsonInput();
requireFields($input, ['name', 'type', 'destination_id']);

$name = cleanString($input['name']);
$type = cleanString($input['type']);
$destinationId = (int)$input['destination_id'];

if ($name === '' || $type === '' || $destinationId <= 0) {
    errorResponse('Invalid input data', 422);
}

try {
    $pdo = db();

    $activitiesSchema = resolveActivitiesSchema($pdo);
    $destinationsSchema = resolveDestinationsSchema($pdo);

    $activitiesTable = quoteIdentifier($activitiesSchema['table']);
    $activityName = quoteIdentifier($activitiesSchema['name']);
    $activityType = quoteIdentifier($activitiesSchema['type']);
    $activityDestinationId = quoteIdentifier($activitiesSchema['destination_id']);

    $destinationsTable = quoteIdentifier($destinationsSchema['table']);
    $destinationIdColumn = quoteIdentifier($destinationsSchema['id']);

    $destinationSql = "SELECT {$destinationIdColumn} FROM {$destinationsTable} WHERE {$destinationIdColumn} = :id LIMIT 1";
    $destinationStmt = $pdo->prepare($destinationSql);
    $destinationStmt->execute([':id' => $destinationId]);

    if (!$destinationStmt->fetch()) {
        errorResponse('Destination not found', 404);
    }

    $insertSql = "INSERT INTO {$activitiesTable} ({$activityName}, {$activityType}, {$activityDestinationId})
                  VALUES (:name, :type, :destination_id)";

    $insertStmt = $pdo->prepare($insertSql);

    $insertStmt->execute([
        ':name' => $name,
        ':type' => $type,
        ':destination_id' => $destinationId,
    ]);

    successResponse([
        'id' => (int)$pdo->lastInsertId(),
        'name' => $name,
        'type' => $type,
        'destination_id' => $destinationId,
    ], 'Activity created successfully', 201);
} catch (PDOException $e) {
    error_log('Database error while adding activity: ' . $e->getMessage());
    dbErrorResponse($e, 500);
} catch (Throwable $e) {
    error_log('Error adding activity: ' . $e->getMessage());
    dbErrorResponse($e, 500);
}
