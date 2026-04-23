<?php
declare(strict_types=1);

require_once __DIR__ . '/../../config/bootstrap.php';

requireMethod('GET');

try {
    $pdo = db();

    $schema = resolveDestinationsSchema($pdo);
    $table = quoteIdentifier($schema['table']);
    $idColumn = quoteIdentifier($schema['id']);
    $nameColumn = quoteIdentifier($schema['name']);

    $sql = "SELECT {$idColumn} AS id, {$nameColumn} AS name FROM {$table} ORDER BY {$nameColumn} ASC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();

    successResponse($stmt->fetchAll(), 'Destinations fetched successfully', 200);
} catch (PDOException $e) {
    error_log('Database error while fetching destinations: ' . $e->getMessage());
    dbErrorResponse($e, 500);
} catch (Throwable $e) {
    error_log('Error fetching destinations: ' . $e->getMessage());
    dbErrorResponse($e, 500);
}
