<?php
declare(strict_types=1);

require_once __DIR__ . '/../../config/bootstrap.php';

requireMethod('GET');

$activityId = isset($_GET['activity_id']) ? (int)$_GET['activity_id'] : 0;

if ($activityId <= 0) {
    errorResponse('Invalid activity_id', 422);
}

try {
    $pdo = db();

    ensureActivityReviewsTable($pdo);

    // Verify activity exists
    $activitiesSchema = resolveActivitiesSchema($pdo);
    $activitiesTable = quoteIdentifier($activitiesSchema['table']);
    $activityIdColumn = quoteIdentifier($activitiesSchema['id']);
    $usersSchema = resolveUsersSchema($pdo);
    $usersTable = quoteIdentifier($usersSchema['table']);
    $userIdColumn = quoteIdentifier($usersSchema['id']);
    $userNameColumn = quoteIdentifier($usersSchema['name']);

    $activityCheckSql = "SELECT {$activityIdColumn} FROM {$activitiesTable} WHERE {$activityIdColumn} = :id LIMIT 1";
    $activityCheckStmt = $pdo->prepare($activityCheckSql);
    $activityCheckStmt->execute([':id' => $activityId]);

    if (!$activityCheckStmt->fetch()) {
        errorResponse('Activity not found', 404);
    }

    // Get activity reviews with user names
    $sql = "SELECT 
                ar.id,
                ar.activity_id,
                ar.user_id,
                ar.rating,
                ar.comment,
                ar.created_at,
                COALESCE(u.{$userNameColumn}, 'Anonymous') AS user_name
            FROM activity_reviews ar
            LEFT JOIN {$usersTable} u ON u.{$userIdColumn} = ar.user_id
            WHERE ar.activity_id = :activity_id
            ORDER BY ar.created_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([':activity_id' => $activityId]);
    $reviews = $stmt->fetchAll();

    // Calculate average rating
    $avgRatingSql = "SELECT 
                        COUNT(*) as total_reviews,
                        AVG(rating) as average_rating
                    FROM activity_reviews
                    WHERE activity_id = :activity_id";

    $avgStmt = $pdo->prepare($avgRatingSql);
    $avgStmt->execute([':activity_id' => $activityId]);
    $stats = $avgStmt->fetch();

    successResponse([
        'reviews' => $reviews,
        'stats' => [
            'total_reviews' => (int)($stats['total_reviews'] ?? 0),
            'average_rating' => (float)($stats['average_rating'] ?? 0)
        ]
    ], 'Activity reviews fetched successfully', 200);

} catch (PDOException $e) {
    error_log('Database error while fetching activity reviews: ' . $e->getMessage());
    dbErrorResponse($e, 500);
} catch (Throwable $e) {
    error_log('Error fetching activity reviews: ' . $e->getMessage());
    dbErrorResponse($e, 500);
}
