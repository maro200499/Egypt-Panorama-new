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
$rating = isset($input['rating']) && $input['rating'] !== '' ? (float)$input['rating'] : 4.0;
$price = array_key_exists('price', $input) ? trim((string)$input['price']) : 'N/A';
$imageUrl = array_key_exists('image_url', $input) ? trim((string)$input['image_url']) : null;

if ($name === '' || $type === '' || $destinationId <= 0) {
    errorResponse('Invalid input data', 422);
}

if ($rating < 0 || $rating > 5) {
    errorResponse('rating must be between 0 and 5', 422);
}

if ($price === '') {
    $price = 'N/A';
}

try {
    $pdo = db();

    $activitiesSchema = resolveActivitiesSchema($pdo);
    $destinationsSchema = resolveDestinationsSchema($pdo);

    $activitiesTable = quoteIdentifier($activitiesSchema['table']);
    $activityName = quoteIdentifier($activitiesSchema['name']);
    $activityType = quoteIdentifier($activitiesSchema['type']);
    $activityDestinationId = quoteIdentifier($activitiesSchema['destination_id']);
    $activityRating = quoteIdentifier($activitiesSchema['rating']);
    $activityPrice = quoteIdentifier($activitiesSchema['price']);
    $activityImageUrl = quoteIdentifier($activitiesSchema['image_url']);

    $destinationsTable = quoteIdentifier($destinationsSchema['table']);
    $destinationIdColumn = quoteIdentifier($destinationsSchema['id']);

    $destinationSql = "SELECT {$destinationIdColumn} FROM {$destinationsTable} WHERE {$destinationIdColumn} = :id LIMIT 1";
    $destinationStmt = $pdo->prepare($destinationSql);
    $destinationStmt->execute([':id' => $destinationId]);

    if (!$destinationStmt->fetch()) {
        errorResponse('Destination not found', 404);
    }

    $insertSql = "INSERT INTO {$activitiesTable} ({$activityName}, {$activityType}, {$activityDestinationId}, {$activityRating}, {$activityPrice}, {$activityImageUrl})
                  VALUES (:name, :type, :destination_id, :rating, :price, :image_url)";

    $insertStmt = $pdo->prepare($insertSql);

    $insertStmt->execute([
        ':name' => $name,
        ':type' => $type,
        ':destination_id' => $destinationId,
        ':rating' => $rating,
        ':price' => $price,
        ':image_url' => $imageUrl === '' ? null : $imageUrl,
    ]);

    successResponse([
        'id' => (int)$pdo->lastInsertId(),
        'name' => $name,
        'type' => $type,
        'destination_id' => $destinationId,
        'rating' => $rating,
        'price' => $price,
        'image_url' => $imageUrl === '' ? null : $imageUrl,
    ], 'Activity created successfully', 201);
} catch (PDOException $e) {
    error_log('Database error while adding activity: ' . $e->getMessage());
    dbErrorResponse($e, 500);
} catch (Throwable $e) {
    error_log('Error adding activity: ' . $e->getMessage());
    dbErrorResponse($e, 500);
}
