<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/bootstrap.php';

requireMethod('POST');

/**
 * Base coordinates for major Egyptian destinations.
 */
const EGYPT_COORDINATES = [
    'cairo' => [30.0444, 31.2357],
    'giza' => [29.9870, 31.2118],
    'hurghada' => [27.2579, 33.8116],
    'sharm el sheikh' => [27.9158, 34.3300],
    'luxor' => [25.6872, 32.6396],
    'aswan' => [24.0889, 32.8998],
    'alexandria' => [31.2001, 29.9187],
    'dahab' => [28.5091, 34.5136],
    'marsa alam' => [25.0676, 34.8789],
    'siwa' => [29.2032, 25.5196],
    'fayoum' => [29.3084, 30.8428],
    'suez' => [29.9668, 32.5498],
    'ismailia' => [30.6043, 32.2723],
    'port said' => [31.2653, 32.3019],
    'minya' => [28.1099, 30.7503],
    'sohag' => [26.5591, 31.6957],
    'qena' => [26.1551, 32.7160],
    'matruh' => [31.3543, 27.2373],
    'white desert' => [27.2833, 28.0000],
];

const EGYPT_DEFAULT = [26.8206, 30.8025];

try {
    $pdo = db();

    $destinationsSchema = resolveDestinationsSchema($pdo);
    $activitiesSchema = resolveActivitiesSchema($pdo);

    // DDL statements can implicitly commit; ensure columns before opening transaction.
    ensureCoordinateColumns($pdo, $destinationsSchema['table']);
    ensureCoordinateColumns($pdo, $activitiesSchema['table']);

    $pdo->beginTransaction();

    $destTable = quoteIdentifier($destinationsSchema['table']);
    $destIdCol = quoteIdentifier($destinationsSchema['id']);
    $destNameCol = quoteIdentifier($destinationsSchema['name']);

    $selectDestinationsSql = "SELECT {$destIdCol} AS id, {$destNameCol} AS name, latitude, longitude
        FROM {$destTable}
        WHERE latitude IS NULL OR longitude IS NULL";
    $selectDestinationsStmt = $pdo->prepare($selectDestinationsSql);
    $selectDestinationsStmt->execute();
    $destinationsToUpdate = $selectDestinationsStmt->fetchAll();

    $updateDestinationSql = "UPDATE {$destTable} SET latitude = :lat, longitude = :lng WHERE {$destIdCol} = :id";
    $updateDestinationStmt = $pdo->prepare($updateDestinationSql);

    $destinationsUpdated = 0;
    $destinationCoordsById = [];

    foreach ($destinationsToUpdate as $destination) {
        $resolved = resolveEgyptCoordinate((string)$destination['name']);
        [$lat, $lng] = withSmallOffset($resolved[0], $resolved[1]);

        $updateDestinationStmt->execute([
            ':lat' => $lat,
            ':lng' => $lng,
            ':id' => (int)$destination['id'],
        ]);

        $destinationCoordsById[(int)$destination['id']] = [$lat, $lng];
        $destinationsUpdated++;
    }

    $allDestinationsSql = "SELECT {$destIdCol} AS id, latitude, longitude FROM {$destTable}";
    $allDestinationsStmt = $pdo->prepare($allDestinationsSql);
    $allDestinationsStmt->execute();

    foreach ($allDestinationsStmt->fetchAll() as $row) {
        if ($row['latitude'] !== null && $row['longitude'] !== null) {
            $destinationCoordsById[(int)$row['id']] = [(float)$row['latitude'], (float)$row['longitude']];
        }
    }

    $actTable = quoteIdentifier($activitiesSchema['table']);
    $actIdCol = quoteIdentifier($activitiesSchema['id']);
    $actNameCol = quoteIdentifier($activitiesSchema['name']);
    $actDestIdCol = quoteIdentifier($activitiesSchema['destination_id']);

    $selectActivitiesSql = "SELECT {$actIdCol} AS id, {$actNameCol} AS name, {$actDestIdCol} AS destination_id, latitude, longitude
        FROM {$actTable}
        WHERE latitude IS NULL OR longitude IS NULL";
    $selectActivitiesStmt = $pdo->prepare($selectActivitiesSql);
    $selectActivitiesStmt->execute();
    $activitiesToUpdate = $selectActivitiesStmt->fetchAll();

    $updateActivitySql = "UPDATE {$actTable} SET latitude = :lat, longitude = :lng WHERE {$actIdCol} = :id";
    $updateActivityStmt = $pdo->prepare($updateActivitySql);

    $activitiesUpdated = 0;

    foreach ($activitiesToUpdate as $activity) {
        $destinationId = (int)$activity['destination_id'];
        $base = $destinationCoordsById[$destinationId] ?? resolveEgyptCoordinate((string)$activity['name']);
        [$lat, $lng] = withSmallOffset($base[0], $base[1]);

        $updateActivityStmt->execute([
            ':lat' => $lat,
            ':lng' => $lng,
            ':id' => (int)$activity['id'],
        ]);

        $activitiesUpdated++;
    }

    $pdo->commit();

    successResponse([
        'destinations_updated' => $destinationsUpdated,
        'activities_updated' => $activitiesUpdated,
    ], 'Missing coordinates populated successfully', 200);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    error_log('Coordinate autofill failed: ' . $e->getMessage());
    dbErrorResponse($e, 500);
}

function ensureCoordinateColumns(PDO $pdo, string $tableName): void
{
    $table = quoteIdentifier($tableName);

    if (!columnExists($pdo, $tableName, 'latitude')) {
        $pdo->exec("ALTER TABLE {$table} ADD COLUMN latitude DECIMAL(10,7) NULL AFTER name");
    }

    if (!columnExists($pdo, $tableName, 'longitude')) {
        $pdo->exec("ALTER TABLE {$table} ADD COLUMN longitude DECIMAL(10,7) NULL AFTER latitude");
    }
}

function resolveEgyptCoordinate(string $name): array
{
    $normalized = strtolower(trim($name));

    if ($normalized === '') {
        return EGYPT_DEFAULT;
    }

    foreach (EGYPT_COORDINATES as $keyword => $coords) {
        if (strpos($normalized, $keyword) !== false) {
            return $coords;
        }
    }

    return EGYPT_DEFAULT;
}

function withSmallOffset(float $lat, float $lng): array
{
    $latOffset = mt_rand(-100, 100) / 10000;
    $lngOffset = mt_rand(-100, 100) / 10000;

    return [round($lat + $latOffset, 7), round($lng + $lngOffset, 7)];
}
