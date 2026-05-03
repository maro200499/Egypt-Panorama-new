<?php
declare(strict_types=1);

require_once __DIR__ . '/../../config/bootstrap.php';

requireMethod('POST');

$input = getJsonInput();
requireFields($input, ['activity_id', 'rating', 'comment']);

$activityId = (int)$input['activity_id'];
$rating = (float)$input['rating'];
$comment = isset($input['comment']) ? cleanString($input['comment']) : '';
$userId = isset($input['user_id']) ? (int)$input['user_id'] : null;

if ($activityId <= 0) {
    errorResponse('Invalid activity_id', 422);
}

if ($rating < 1 || $rating > 5) {
    errorResponse('Rating must be between 1 and 5', 422);
}

if ($comment === '' && !isset($input['comment'])) {
    errorResponse('Comment is required', 422);
}

try {
    $pdo = db();

    ensureActivityReviewsTable($pdo);

    // Verify activity exists
    $activitiesSchema = resolveActivitiesSchema($pdo);
    $activitiesTable = quoteIdentifier($activitiesSchema['table']);
    $activityIdColumn = quoteIdentifier($activitiesSchema['id']);

    $activityCheckSql = "SELECT {$activityIdColumn} FROM {$activitiesTable} WHERE {$activityIdColumn} = :id LIMIT 1";
    $activityCheckStmt = $pdo->prepare($activityCheckSql);
    $activityCheckStmt->execute([':id' => $activityId]);

    if (!$activityCheckStmt->fetch()) {
        errorResponse('Activity not found', 404);
    }

    // Insert review
    $insertSql = "INSERT INTO activity_reviews (activity_id, user_id, rating, comment)
                  VALUES (:activity_id, :user_id, :rating, :comment)";

    $insertStmt = $pdo->prepare($insertSql);
    $insertStmt->execute([
        ':activity_id' => $activityId,
        ':user_id' => $userId,
        ':rating' => $rating,
        ':comment' => $comment
    ]);

    $reviewId = (int)$pdo->lastInsertId();

    successResponse([
        'id' => $reviewId,
        'activity_id' => $activityId,
        'user_id' => $userId,
        'rating' => $rating,
        'comment' => $comment,
        'created_at' => date('Y-m-d H:i:s')
    ], 'Review added successfully', 201);

} catch (PDOException $e) {
    error_log('Database error while adding activity review: ' . $e->getMessage());
    dbErrorResponse($e, 500);
} catch (Throwable $e) {
    error_log('Error adding activity review: ' . $e->getMessage());
    dbErrorResponse($e, 500);
}
