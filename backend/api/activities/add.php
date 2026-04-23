<?php
declare(strict_types=1);

require_once __DIR__ . '/../../config/bootstrap.php';
require_once __DIR__ . '/../../config/company_assignment.php';

requireMethod('POST');

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

	$activityCompanyId = quoteIdentifier('company_id');

	$insertSql = "INSERT INTO {$activitiesTable} ({$activityName}, {$activityType}, {$activityDestinationId}, {$activityCompanyId})
				  VALUES (:name, :type, :destination_id, :company_id)";

	$insertStmt = $pdo->prepare($insertSql);

	$insertStmt->execute([
		':name' => $name,
		':type' => $type,
		':destination_id' => $destinationId,
		':company_id' => $companyId,
	]);

	successResponse([
		'id' => (int)$pdo->lastInsertId(),
		'name' => $name,
		'type' => $type,
		'destination_id' => $destinationId,
		'company_id' => $companyId,
	], 'Activity created successfully', 201);
} catch (PDOException $e) {
	error_log('Database error while adding activity: ' . $e->getMessage());
	dbErrorResponse($e, 500);
} catch (Throwable $e) {
	error_log('Error adding activity: ' . $e->getMessage());
	dbErrorResponse($e, 500);
}
