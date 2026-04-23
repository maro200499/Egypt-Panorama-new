<?php
declare(strict_types=1);

require_once __DIR__ . '/../../config/bootstrap.php';

requireMethod('GET');

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($id <= 0) {
    errorResponse('Invalid company id', 422);
}

try {
    $pdo = db();

    $schema = resolveCompaniesSchema($pdo);
    $table = quoteIdentifier($schema['table']);
    $idColumn = quoteIdentifier($schema['id']);
    $nameColumn = quoteIdentifier($schema['name']);

    $sql = "SELECT {$idColumn} AS id, {$nameColumn} AS name
            FROM {$table}
            WHERE {$idColumn} = :id
            LIMIT 1";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([':id' => $id]);
    $company = $stmt->fetch();

    if (!$company) {
        errorResponse('Company not found', 404);
    }

    successResponse($company, 'Company fetched successfully', 200);
} catch (PDOException $e) {
    error_log('Database error while fetching company: ' . $e->getMessage());
    dbErrorResponse($e, 500);
} catch (Throwable $e) {
    error_log('Error fetching company: ' . $e->getMessage());
    dbErrorResponse($e, 500);
}
