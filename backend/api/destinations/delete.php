<?php
declare(strict_types=1);

require_once __DIR__ . '/../../config/bootstrap.php';

if (!in_array($_SERVER['REQUEST_METHOD'], ['GET', 'POST', 'DELETE'], true)) {
	errorResponse('Method not allowed', 405);
}

$input = $_SERVER['REQUEST_METHOD'] === 'GET' ? $_GET : getJsonInput();
$id = isset($input['id']) ? (int)$input['id'] : 0;

if ($id <= 0) {
	errorResponse('Valid destination id is required', 422);
}

try {
	$pdo = db();
	$schema = resolveDestinationsSchema($pdo);

	$table = quoteIdentifier($schema['table']);
	$idColumn = quoteIdentifier($schema['id']);

	$stmt = $pdo->prepare("DELETE FROM {$table} WHERE {$idColumn} = :id");
	$stmt->execute([':id' => $id]);

	if ($stmt->rowCount() === 0) {
		errorResponse('Destination not found', 404);
	}

	successResponse(['id' => $id], 'Destination deleted successfully', 200);
} catch (PDOException $e) {
	error_log('Database error while deleting destination: ' . $e->getMessage());
	dbErrorResponse($e, 500);
} catch (Throwable $e) {
	error_log('Error deleting destination: ' . $e->getMessage());
	dbErrorResponse($e, 500);
}