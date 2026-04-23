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
	$activityDestinationIdColumn = quoteIdentifier($activitiesSchema['destination_id']);
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

	if ($fields === []) {
		errorResponse('No fields provided for update', 422);
	}

	$existsSql = "SELECT
		a.{$activityId} AS id,
		a.{$activityNameColumn} AS name,
		a.{$activityTypeColumn} AS type,
		a.{$activityDestinationIdColumn} AS destination_id,
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
	$effectiveDestinationName = (string)$currentActivity['destination_name'];

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

	$fields[] = "{$activityCompanyIdColumn} = :company_id";
	$params[':company_id'] = $assignedCompanyId;

	$sql = "UPDATE {$activitiesTable} SET " . implode(', ', $fields) . " WHERE {$activityId} = :id";
	$updateStmt = $pdo->prepare($sql);
	$updateStmt->execute($params);

	successResponse(null, 'Activity updated successfully', 200);
} catch (PDOException $e) {
	error_log('Database error while updating activity: ' . $e->getMessage());
	dbErrorResponse($e, 500);
} catch (Throwable $e) {
	error_log('Error updating activity: ' . $e->getMessage());
	dbErrorResponse($e, 500);
}
