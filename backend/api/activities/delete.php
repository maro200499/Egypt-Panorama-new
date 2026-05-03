<?php
declare(strict_types=1);

require_once __DIR__ . '/../../config/bootstrap.php';

if (!in_array($_SERVER['REQUEST_METHOD'], ['GET', 'POST', 'DELETE'], true)) {
	errorResponse('Method not allowed', 405);
}

$input = $_SERVER['REQUEST_METHOD'] === 'GET' ? $_GET : getJsonInput();
$id = isset($input['id']) ? (int)$input['id'] : 0;

if ($id <= 0) {
	errorResponse('Invalid activity id', 422);
}

try {
	$pdo = db();

	$activitiesSchema = resolveActivitiesSchema($pdo);
	$activitiesTable = quoteIdentifier($activitiesSchema['table']);
	$activityId = quoteIdentifier($activitiesSchema['id']);

	$sql = "DELETE FROM {$activitiesTable} WHERE {$activityId} = :id";
	$stmt = $pdo->prepare($sql);
	$stmt->execute([':id' => $id]);

	if ($stmt->rowCount() === 0) {
		errorResponse('Activity not found', 404);
	}

	successResponse(['id' => $id], 'Activity deleted successfully', 200);
} catch (PDOException $e) {
	error_log('Database error while deleting activity: ' . $e->getMessage());
	dbErrorResponse($e, 500);
} catch (Throwable $e) {
	error_log('Error deleting activity: ' . $e->getMessage());
	dbErrorResponse($e, 500);
}
