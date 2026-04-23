<?php
declare(strict_types=1);

require_once __DIR__ . '/../../config/bootstrap.php';

requireMethod('GET');

$companyId = isset($_GET['company_id']) ? (int)$_GET['company_id'] : 0;

if ($companyId <= 0) {
    errorResponse('Invalid company_id', 422);
}

try {
    $pdo = db();

    $reviewsSchema = resolveReviewsSchema($pdo);
    $usersSchema = resolveUsersSchema($pdo);
    $companiesSchema = resolveCompaniesSchema($pdo);

    $reviewsTable = quoteIdentifier($reviewsSchema['table']);
    $reviewId = quoteIdentifier($reviewsSchema['id']);
    $reviewUserId = quoteIdentifier($reviewsSchema['user_id']);
    $reviewCompanyId = quoteIdentifier($reviewsSchema['company_id']);
    $reviewBody = quoteIdentifier($reviewsSchema['review']);
    $reviewRating = quoteIdentifier($reviewsSchema['rating']);
    $reviewCreatedAt = $reviewsSchema['created_at'] !== null ? quoteIdentifier($reviewsSchema['created_at']) . ' AS created_at' : 'NULL AS created_at';

    $usersTable = quoteIdentifier($usersSchema['table']);
    $userIdColumn = quoteIdentifier($usersSchema['id']);
    $userNameColumn = quoteIdentifier($usersSchema['name']);

    $companiesTable = quoteIdentifier($companiesSchema['table']);
    $companyIdColumn = quoteIdentifier($companiesSchema['id']);

    $sql = "SELECT r.{$reviewId} AS id,
                   r.{$reviewUserId} AS user_id,
                   u.{$userNameColumn} AS user_name,
                   r.{$reviewCompanyId} AS company_id,
                   r.{$reviewBody} AS review,
                   r.{$reviewRating} AS rating,
                   {$reviewCreatedAt}
            FROM {$reviewsTable} r
            INNER JOIN {$usersTable} u ON u.{$userIdColumn} = r.{$reviewUserId}
            INNER JOIN {$companiesTable} c ON c.{$companyIdColumn} = r.{$reviewCompanyId}
            WHERE r.{$reviewCompanyId} = :company_id
            ORDER BY r.{$reviewId} DESC";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([':company_id' => $companyId]);

    successResponse($stmt->fetchAll(), 'Reviews fetched successfully', 200);
} catch (PDOException $e) {
    error_log('Database error while fetching reviews: ' . $e->getMessage());
    dbErrorResponse($e, 500);
} catch (Throwable $e) {
    error_log('Error fetching reviews: ' . $e->getMessage());
    dbErrorResponse($e, 500);
}
