<?php
declare(strict_types=1);

require_once __DIR__ . '/../../config/bootstrap.php';
require_once __DIR__ . '/../../config/company_assignment.php';

requireMethod('POST');

$input = getJsonInput();

$id = isset($input['id']) ? (int)$input['id'] : 0;

if ($id <= 0) {
	errorResponse('Valid activity id is required', 422);
}

try {
	$pdo = db();

	$activitiesSchema = resolveActivitiesSchema($pdo);
	$destinationsSchema = resolveDestinationsSchema($pdo);

	$activitiesTable = quoteIdentifier($activitiesSchema['table']);
	$activityId = quoteIdentifier($activitiesSchema['id']);
	$activityNameColumn = quoteIdentifier($activitiesSchema['name']);
	$activityTypeColumn = quoteIdentifier($activitiesSchema['type']);
	$activityCategoryColumn = quoteIdentifier($activitiesSchema['category']);
	$activityDestinationIdColumn = quoteIdentifier($activitiesSchema['destination_id']);
	$activityRatingColumn = quoteIdentifier($activitiesSchema['rating']);
	$activityPriceColumn = quoteIdentifier($activitiesSchema['price']);
	$activityImageUrlColumn = quoteIdentifier($activitiesSchema['image_url']);
	$activityHiddenColumn = quoteIdentifier($activitiesSchema['is_hidden']);
	$activityCompanyIdColumn = quoteIdentifier('company_id');

	$destinationsTable = quoteIdentifier($destinationsSchema['table']);
	$destinationIdColumn = quoteIdentifier($destinationsSchema['id']);
	$destinationNameColumn = quoteIdentifier($destinationsSchema['name']);

	$fields = [];
	$params = [':id' => $id];

	if (array_key_exists('name', $input)) {
		$name = cleanString($input['name']);
		if ($name === '') {
			errorResponse('name cannot be empty', 422);
		}
		$fields[] = "{$activityNameColumn} = :name";
		$params[':name'] = $name;
	}

	if (array_key_exists('type', $input)) {
		$type = cleanString($input['type']);
		if ($type === '') {
			errorResponse('type cannot be empty', 422);
		}
		$fields[] = "{$activityTypeColumn} = :type";
		$params[':type'] = $type;
	}

	if (array_key_exists('category', $input)) {
		$category = cleanString($input['category']);
		if ($category === '') {
			errorResponse('category cannot be empty', 422);
		}
		$fields[] = "{$activityCategoryColumn} = :category";
		$params[':category'] = $category;
	}

	if (array_key_exists('destination_id', $input)) {
		$destinationId = (int)$input['destination_id'];
		if ($destinationId <= 0) {
			errorResponse('destination_id must be a positive integer', 422);
		}

		$destinationSql = "SELECT {$destinationIdColumn} FROM {$destinationsTable} WHERE {$destinationIdColumn} = :id LIMIT 1";
		$destinationStmt = $pdo->prepare($destinationSql);
		$destinationStmt->execute([':id' => $destinationId]);

		if (!$destinationStmt->fetch()) {
			errorResponse('Destination not found', 404);
		}

		$fields[] = "{$activityDestinationIdColumn} = :destination_id";
		$params[':destination_id'] = $destinationId;
	}

	if (array_key_exists('rating', $input)) {
		$rating = (float)$input['rating'];
		if ($rating < 0 || $rating > 5) {
			errorResponse('rating must be between 0 and 5', 422);
		}
		$fields[] = "{$activityRatingColumn} = :rating";
		$params[':rating'] = $rating;
	}

	if (array_key_exists('price', $input)) {
		$price = trim((string)$input['price']);
		if ($price === '') {
			$price = 'N/A';
		}
		$fields[] = "{$activityPriceColumn} = :price";
		$params[':price'] = $price;
	}

	if (array_key_exists('image_url', $input)) {
		$imageUrl = trim((string)$input['image_url']);
		$fields[] = "{$activityImageUrlColumn} = :image_url";
		$params[':image_url'] = $imageUrl === '' ? null : $imageUrl;
	}

	if (array_key_exists('is_hidden', $input)) {
		$fields[] = "{$activityHiddenColumn} = :is_hidden";
		$params[':is_hidden'] = !empty($input['is_hidden']) ? 1 : 0;
	}

	if ($fields === []) {
		errorResponse('No fields provided for update', 422);
	}

	$existsSql = "SELECT
		a.{$activityId} AS id,
		a.{$activityNameColumn} AS name,
		a.{$activityTypeColumn} AS type,
		a.{$activityCategoryColumn} AS category,
		a.{$activityDestinationIdColumn} AS destination_id,
		a.{$activityRatingColumn} AS rating,
		a.{$activityPriceColumn} AS price,
		a.{$activityImageUrlColumn} AS image_url,
		a.{$activityHiddenColumn} AS is_hidden,
		d.{$destinationNameColumn} AS destination_name
		FROM {$activitiesTable} a
		INNER JOIN {$destinationsTable} d ON d.{$destinationIdColumn} = a.{$activityDestinationIdColumn}
		WHERE a.{$activityId} = :id
		LIMIT 1";
	$existsStmt = $pdo->prepare($existsSql);
	$existsStmt->execute([':id' => $id]);
	$currentActivity = $existsStmt->fetch();

	if (!$currentActivity) {
		errorResponse('Activity not found', 404);
	}

	$effectiveName = array_key_exists('name', $input) ? $params[':name'] : (string)$currentActivity['name'];
	$effectiveType = array_key_exists('type', $input) ? $params[':type'] : (string)$currentActivity['type'];
	$effectiveCategory = array_key_exists('category', $input) ? $params[':category'] : (string)$currentActivity['category'];
	$effectiveDestinationName = (string)$currentActivity['destination_name'];
	$effectiveRating = array_key_exists('rating', $input) ? (float)$params[':rating'] : (float)$currentActivity['rating'];
	$effectivePrice = array_key_exists('price', $input) ? (string)$params[':price'] : (string)$currentActivity['price'];
	$effectiveImageUrl = array_key_exists('image_url', $input) ? $params[':image_url'] : ($currentActivity['image_url'] ?? null);
	$effectiveHidden = array_key_exists('is_hidden', $input) ? (int)$params[':is_hidden'] : (int)$currentActivity['is_hidden'];

	if (array_key_exists('destination_id', $input)) {
		$destinationNameSql = "SELECT {$destinationNameColumn} AS name
			FROM {$destinationsTable}
			WHERE {$destinationIdColumn} = :id
			LIMIT 1";
		$destinationNameStmt = $pdo->prepare($destinationNameSql);
		$destinationNameStmt->execute([':id' => $params[':destination_id']]);
		$destinationRow = $destinationNameStmt->fetch();

		if (!$destinationRow) {
			errorResponse('Destination not found', 404);
		}

		$effectiveDestinationName = (string)$destinationRow['name'];
	}

	$assignedCompanyId = resolveAssignedCompanyId(
		$pdo,
		$effectiveDestinationName,
		$effectiveType,
		$effectiveName
	);

	// Keep the computed variables referenced so rating/price remain part of the update payload flow.
	$params[':rating'] = $effectiveRating;
	$params[':price'] = $effectivePrice;
	$params[':image_url'] = $effectiveImageUrl;
	$params[':is_hidden'] = $effectiveHidden;

	$fields[] = "{$activityCompanyIdColumn} = :company_id";
	$params[':company_id'] = $assignedCompanyId;

	$sql = "UPDATE {$activitiesTable} SET " . implode(', ', $fields) . " WHERE {$activityId} = :id";
	$updateStmt = $pdo->prepare($sql);
	$updateStmt->execute($params);

	successResponse([
		'id' => $id,
		'name' => $effectiveName,
		'type' => $effectiveType,
		'category' => $effectiveCategory,
		'destination_id' => array_key_exists('destination_id', $input) ? (int)$params[':destination_id'] : (int)$currentActivity['destination_id'],
		'rating' => $effectiveRating,
		'price' => $effectivePrice,
		'image_url' => $effectiveImageUrl,
		'is_hidden' => $effectiveHidden,
		'company_id' => $assignedCompanyId,
	], 'Activity updated successfully', 200);
} catch (PDOException $e) {
	error_log('Database error while updating activity: ' . $e->getMessage());
	dbErrorResponse($e, 500);
} catch (Throwable $e) {
	error_log('Error updating activity: ' . $e->getMessage());
	dbErrorResponse($e, 500);
}
