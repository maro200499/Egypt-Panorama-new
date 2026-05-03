<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/bootstrap.php';

requireMethod('GET');

try {
    $pdo = db();
    
    $tourismType = isset($_GET['tourism_type']) ? trim($_GET['tourism_type']) : null;
    
    if (!$tourismType || $tourismType === '') {
        errorResponse('tourism_type parameter is required', 422);
    }
    
    $destinationsSchema = resolveDestinationsSchema($pdo);
    $activitiesSchema = resolveActivitiesSchema($pdo);
    
    $destinationsTable = quoteIdentifier($destinationsSchema['table']);
    $activitiesTable = quoteIdentifier($activitiesSchema['table']);
    
    $destinationId = quoteIdentifier($destinationsSchema['id']);
    $destinationName = quoteIdentifier($destinationsSchema['name']);
    $destinationCity = quoteIdentifier($destinationsSchema['city']);
    $destinationLatitude = quoteIdentifier($destinationsSchema['latitude']);
    $destinationLongitude = quoteIdentifier($destinationsSchema['longitude']);
    $destinationType = quoteIdentifier($destinationsSchema['type']);
    $destinationCoverImage = quoteIdentifier($destinationsSchema['cover_image']);
    $destinationGalleryImages = quoteIdentifier($destinationsSchema['gallery_images']);
    
    $activityDestinationId = quoteIdentifier($activitiesSchema['destination_id']);
    $activityType = quoteIdentifier($activitiesSchema['type']);
    $activityHidden = quoteIdentifier($activitiesSchema['is_hidden']);
    
    // Get DISTINCT destinations that have activities of the specified tourism type
    $sql = "SELECT DISTINCT 
                d.{$destinationId} AS id,
                d.{$destinationName} AS name,
                d.{$destinationCity} AS city,
                d.{$destinationLatitude} AS latitude,
                d.{$destinationLongitude} AS longitude,
                d.{$destinationType} AS type,
                d.{$destinationCoverImage} AS cover_image,
                d.{$destinationGalleryImages} AS gallery_images
            FROM {$destinationsTable} d
            INNER JOIN {$activitiesTable} a ON d.{$destinationId} = a.{$activityDestinationId}
            WHERE a.{$activityType} = :tourism_type 
              AND a.{$activityHidden} = 0
            ORDER BY d.{$destinationName} ASC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':tourism_type' => $tourismType]);
    $destinations = $stmt->fetchAll();
    
    if (empty($destinations)) {
        successResponse([], sprintf('No destinations found with activities of type "%s"', $tourismType), 200);
    } else {
        successResponse(
            $destinations,
            sprintf('Destinations fetched for tourism type "%s"', $tourismType),
            200
        );
    }
    
} catch (PDOException $e) {
    error_log('Database error while fetching tourism destinations: ' . $e->getMessage());
    dbErrorResponse($e, 500);
} catch (Throwable $e) {
    error_log('Error fetching tourism destinations: ' . $e->getMessage());
    dbErrorResponse($e, 500);
}
