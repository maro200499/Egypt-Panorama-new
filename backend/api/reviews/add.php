<?php
declare(strict_types=1);

require_once __DIR__ . '/../../middleware/auth.php';

requireMethod('POST');
$user = requireAuth();

$input = getJsonInput();
requireFields($input, ['company_id', 'review', 'rating']);

$companyId = (int)$input['company_id'];
$review = cleanString($input['review']);
$rating = (int)$input['rating'];

if ($companyId <= 0 || $review === '' || $rating < 1 || $rating > 5) {
    errorResponse('Invalid review payload', 422);
}

try {
    $pdo = db();

    $reviewsSchema = resolveReviewsSchema($pdo);
    $companiesSchema = resolveCompaniesSchema($pdo);

    $reviewsTable = quoteIdentifier($reviewsSchema['table']);
    $reviewUserId = quoteIdentifier($reviewsSchema['user_id']);
    $reviewCompanyId = quoteIdentifier($reviewsSchema['company_id']);
    $reviewBody = quoteIdentifier($reviewsSchema['review']);
    $reviewRating = quoteIdentifier($reviewsSchema['rating']);

    $companiesTable = quoteIdentifier($companiesSchema['table']);
    $companyIdColumn = quoteIdentifier($companiesSchema['id']);

    $companySql = "SELECT {$companyIdColumn} FROM {$companiesTable} WHERE {$companyIdColumn} = :id LIMIT 1";
    $companyStmt = $pdo->prepare($companySql);
    $companyStmt->execute([':id' => $companyId]);

    if (!$companyStmt->fetch()) {
        errorResponse('Company not found', 404);
    }

    $insertSql = "INSERT INTO {$reviewsTable} ({$reviewUserId}, {$reviewCompanyId}, {$reviewBody}, {$reviewRating})
                  VALUES (:user_id, :company_id, :review, :rating)";

    $insertStmt = $pdo->prepare($insertSql);

    $insertStmt->execute([
        ':user_id' => $user['id'],
        ':company_id' => $companyId,
        ':review' => $review,
        ':rating' => $rating,
    ]);

    successResponse([
        'id' => (int)$pdo->lastInsertId(),
        'user_id' => $user['id'],
        'company_id' => $companyId,
        'review' => $review,
        'rating' => $rating,
    ], 'Review added successfully', 201);
} catch (PDOException $e) {
    error_log('Database error while adding review: ' . $e->getMessage());
    dbErrorResponse($e, 500);
} catch (Throwable $e) {
    error_log('Error adding review: ' . $e->getMessage());
    dbErrorResponse($e, 500);
}
