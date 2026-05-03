<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/bootstrap.php';

requireMethod('GET');

try {
    $pdo = db();
    
    $activitiesSchema = resolveActivitiesSchema($pdo);
    $destinationsSchema = resolveDestinationsSchema($pdo);
    
    $activitiesTable = quoteIdentifier($activitiesSchema['table']);
    $destinationsTable = quoteIdentifier($destinationsSchema['table']);
    
    $activityId = quoteIdentifier($activitiesSchema['id']);
    $activityName = quoteIdentifier($activitiesSchema['name']);
    $activityType = quoteIdentifier($activitiesSchema['type']);
    $activityCategory = quoteIdentifier($activitiesSchema['category']);
    $activityDestinationId = quoteIdentifier($activitiesSchema['destination_id']);
    $activityRating = quoteIdentifier($activitiesSchema['rating']);
    $activityPrice = quoteIdentifier($activitiesSchema['price']);
    $activityImageUrl = quoteIdentifier($activitiesSchema['image_url']);
    $activityHidden = quoteIdentifier($activitiesSchema['is_hidden']);
    
    $destinationId = quoteIdentifier($destinationsSchema['id']);
    $destinationName = quoteIdentifier($destinationsSchema['name']);
    
    // Get query parameters
    $destinationId_param = isset($_GET['destination_id']) ? (int)$_GET['destination_id'] : null;
    $tourismType_param = isset($_GET['tourism_type']) ? trim($_GET['tourism_type']) : null;
    
    // Build SQL query dynamically based on parameters
    $sql = "SELECT a.{$activityId} AS id, a.{$activityName} AS name, a.{$activityType} AS type,
               a.{$activityCategory} AS category, a.{$activityDestinationId} AS destination_id,
               d.{$destinationName} AS destination_name, a.{$activityRating} AS rating,
               a.{$activityPrice} AS price, TRIM(a.{$activityImageUrl}) AS image_url, a.{$activityHidden} AS is_hidden,
               a.latitude AS latitude, a.longitude AS longitude
        FROM {$activitiesTable} a
        INNER JOIN {$destinationsTable} d ON d.{$destinationId} = a.{$activityDestinationId}
        WHERE 1=1";
    
    $params = [];
    
    // Add destination_id filter
    if ($destinationId_param !== null && $destinationId_param > 0) {
        $sql .= " AND a.{$activityDestinationId} = :destination_id";
        $params[':destination_id'] = $destinationId_param;
    }
    
    // Add tourism_type (type) filter
    if ($tourismType_param !== null && $tourismType_param !== '') {
        $sql .= " AND a.{$activityType} = :tourism_type";
        $params[':tourism_type'] = $tourismType_param;
    }
    
    // Always exclude hidden activities in public API
    $sql .= " AND a.{$activityHidden} = 0";
    
    // Order by rating and name for consistent results
    $sql .= " ORDER BY a.{$activityRating} DESC, a.{$activityName} ASC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $activities = $stmt->fetchAll();
    
    // Return success response with activities
    successResponse(
        $activities,
        sprintf(
            'Activities fetched successfully%s%s',
            $destinationId_param ? ' for destination ' . $destinationId_param : '',
            $tourismType_param ? ' with type ' . $tourismType_param : ''
        ),
        200
    );
    
} catch (PDOException $e) {
    dbErrorResponse($e, 500);
} catch (Throwable $e) {
    error_log('Error fetching activities: ' . $e->getMessage());
    dbErrorResponse($e, 500);
}
