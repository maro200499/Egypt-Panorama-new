<?php
declare(strict_types=1);

require_once __DIR__ . '/../../config/bootstrap.php';
require_once __DIR__ . '/../../config/company_assignment.php';

requireMethod('POST');

$input = getJsonInput();
requireFields($input, ['name', 'type', 'destination_id']);

$name = cleanString($input['name']);
$type = cleanString($input['type']);
$category = array_key_exists('category', $input) ? cleanString($input['category']) : 'Cultural';
$destinationId = (int)$input['destination_id'];
$rating = isset($input['rating']) && $input['rating'] !== '' ? (float)$input['rating'] : 4.0;
$price = array_key_exists('price', $input) ? trim((string)$input['price']) : 'N/A';
$imageUrl = array_key_exists('image_url', $input) ? trim((string)$input['image_url']) : null;
$isHidden = !empty($input['is_hidden']) ? 1 : 0;

if ($name === '' || $type === '' || $category === '' || $destinationId <= 0) {
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
	$activityCategory = quoteIdentifier($activitiesSchema['category']);
	$activityDestinationId = quoteIdentifier($activitiesSchema['destination_id']);
	$activityRating = quoteIdentifier($activitiesSchema['rating']);
	$activityPrice = quoteIdentifier($activitiesSchema['price']);
	$activityImageUrl = quoteIdentifier($activitiesSchema['image_url']);
	$activityHidden = quoteIdentifier($activitiesSchema['is_hidden']);
	$activityCompanyId = quoteIdentifier('company_id');

	$destinationsTable = quoteIdentifier($destinationsSchema['table']);
	$destinationIdColumn = quoteIdentifier($destinationsSchema['id']);
	$destinationNameColumn = quoteIdentifier($destinationsSchema['name']);

	$destinationSql = "SELECT {$destinationIdColumn} AS id, {$destinationNameColumn} AS name
		FROM {$destinationsTable}
		WHERE {$destinationIdColumn} = :id
		LIMIT 1";
	$destinationStmt = $pdo->prepare($destinationSql);
	$destinationStmt->execute([':id' => $destinationId]);
	$destination = $destinationStmt->fetch();

	if (!$destination) {
		errorResponse('Destination not found', 404);
	}

	$companyId = resolveAssignedCompanyId(
		$pdo,
		(string)$destination['name'],
		$type,
		$name
	);

	$insertSql = "INSERT INTO {$activitiesTable} ({$activityName}, {$activityType}, {$activityCategory}, {$activityDestinationId}, {$activityRating}, {$activityPrice}, {$activityImageUrl}, {$activityHidden}, {$activityCompanyId})
	              VALUES (:name, :type, :category, :destination_id, :rating, :price, :image_url, :is_hidden, :company_id)";
	$insertStmt = $pdo->prepare($insertSql);
	$insertStmt->execute([
		':name' => $name,
		':type' => $type,
		':category' => $category,
		':destination_id' => $destinationId,
		':rating' => $rating,
		':price' => $price,
		':image_url' => $imageUrl === '' ? null : $imageUrl,
		':is_hidden' => $isHidden,
		':company_id' => $companyId,
	]);

	successResponse([
		'id' => (int)$pdo->lastInsertId(),
		'name' => $name,
		'type' => $type,
		'category' => $category,
		'destination_id' => $destinationId,
		'rating' => $rating,
		'price' => $price,
		'image_url' => $imageUrl === '' ? null : $imageUrl,
		'is_hidden' => $isHidden,
		'company_id' => $companyId,
	], 'Activity created successfully', 201);
} catch (PDOException $e) {
	error_log('Database error while creating activity: ' . $e->getMessage());
	dbErrorResponse($e, 500);
} catch (Throwable $e) {
	error_log('Error creating activity: ' . $e->getMessage());
	dbErrorResponse($e, 500);
}