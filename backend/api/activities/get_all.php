<?php
declare(strict_types=1);

require_once __DIR__ . '/../../config/bootstrap.php';

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
    $hasTourismType = columnExists($pdo, $activitiesSchema['table'], 'tourism_type');
    $tourismTypeSelect = $hasTourismType
        ? ', a.' . quoteIdentifier('tourism_type') . ' AS tourism_type'
        : ", '' AS tourism_type";

    $destinationFilter = isset($_GET['destination_id']) ? (int)$_GET['destination_id'] : 0;
    $visibleOnly = isset($_GET['visible_only']) && (string)$_GET['visible_only'] === '1';
    $hasMinPrice = isset($_GET['min_price']) && is_numeric((string)$_GET['min_price']);
    $hasMaxPrice = isset($_GET['max_price']) && is_numeric((string)$_GET['max_price']);
    $minPrice = $hasMinPrice ? (float)$_GET['min_price'] : null;
    $maxPrice = $hasMaxPrice ? (float)$_GET['max_price'] : null;

    $whereClauses = [];
    $params = [];

    if ($destinationFilter > 0) {
        $whereClauses[] = "a.{$activityDestinationId} = :destination_id";
        $params[':destination_id'] = $destinationFilter;
    }

    if ($visibleOnly) {
        $whereClauses[] = "a.{$activityHidden} = 0";
    }

    if ($hasMinPrice && $hasMaxPrice) {
        // Filter by budget range using SQL placeholders so min/max are passed explicitly.
        $whereClauses[] = "CAST(a.{$activityPrice} AS DECIMAL(10,2)) BETWEEN :minPrice AND :maxPrice";
        $params[':minPrice'] = $minPrice;
        $params[':maxPrice'] = $maxPrice;
    }

    $whereSql = $whereClauses === []
        ? ''
        : ' WHERE ' . implode(' AND ', $whereClauses);

    $sql = "SELECT a.{$activityId} AS id, a.{$activityName} AS name, a.{$activityType} AS type,
               a.{$activityCategory} AS category, a.{$activityDestinationId} AS destination_id,
               d.{$destinationName} AS destination_name, a.{$activityRating} AS rating,
               a.{$activityPrice} AS price, TRIM(a.{$activityImageUrl}) AS image_url, a.{$activityHidden} AS is_hidden{$tourismTypeSelect},
               a.latitude AS latitude, a.longitude AS longitude
        FROM {$activitiesTable} a
        INNER JOIN {$destinationsTable} d ON d.{$destinationId} = a.{$activityDestinationId}
        {$whereSql}
        ORDER BY a.{$activityId} DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    $activities = $stmt->fetchAll();

    successResponse($activities, 'Activities fetched successfully', 200);
} catch (PDOException $e) {
    dbErrorResponse($e, 500);
} catch (Throwable $e) {
    error_log('Error fetching activities: ' . $e->getMessage());
    dbErrorResponse($e, 500);
}
