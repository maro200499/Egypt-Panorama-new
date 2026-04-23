<?php
declare(strict_types=1);

/**
 * Normalize text for keyword matching.
 */
function normalizeAssignmentText(string $value): string
{
    $value = trim(strtolower($value));
    $value = preg_replace('/\s+/', ' ', $value) ?? $value;

    return $value;
}

/**
 * Check whether any keyword appears in text.
 */
function assignmentContainsAny(string $text, array $keywords): bool
{
    foreach ($keywords as $keyword) {
        if ($keyword !== '' && strpos($text, $keyword) !== false) {
            return true;
        }
    }

    return false;
}

/**
 * Ensure activities.company_id exists.
 */
function ensureActivityCompanyColumn(PDO $pdo): void
{
    if (columnExists($pdo, 'activities', 'company_id')) {
        return;
    }

    $pdo->exec('ALTER TABLE `activities` ADD COLUMN `company_id` INT UNSIGNED NULL AFTER `destination_id`');
}

/**
 * Destination bucketing by destination name.
 */
function detectDestinationBucket(string $destinationName): ?string
{
    $text = normalizeAssignmentText($destinationName);

    if (assignmentContainsAny($text, ['cairo', 'giza'])) {
        return 'cairo_giza';
    }

    if (assignmentContainsAny($text, ['sharm', 'hurghada', 'red sea'])) {
        return 'red_sea';
    }

    if (assignmentContainsAny($text, ['sinai', 'desert', 'oasis', 'siwa'])) {
        return 'desert';
    }

    if (assignmentContainsAny($text, ['luxor', 'historical', 'history', 'ancient'])) {
        return 'luxor_historical';
    }

    return null;
}

/**
 * Activity-based fallback bucket.
 */
function detectBucketByActivity(string $activityType, string $activityName): string
{
    $text = normalizeAssignmentText($activityType . ' ' . $activityName);

    if (assignmentContainsAny($text, ['dive', 'diving', 'snorkel', 'beach', 'sea', 'island'])) {
        return 'red_sea';
    }

    if (assignmentContainsAny($text, ['safari', 'desert', 'dune', 'quad', 'camel', 'bedouin', 'camp'])) {
        return 'desert';
    }

    if (assignmentContainsAny($text, ['luxor', 'historical', 'history', 'temple', 'tomb', 'ancient', 'pharaoh'])) {
        return 'luxor_historical';
    }

    return 'cairo_giza';
}

/**
 * Pick company name from bucket + activity details.
 */
function chooseCompanyName(string $bucket, string $activityType, string $activityName): string
{
    $text = normalizeAssignmentText($activityType . ' ' . $activityName);

    switch ($bucket) {
        case 'cairo_giza':
            if (assignmentContainsAny($text, ['museum', 'pyramid', 'historical', 'cultural', 'pharaoh'])) {
                return 'Memphis Tours';
            }
            if (assignmentContainsAny($text, ['city', 'private', 'luxury'])) {
                return 'Travco Group';
            }
            return "Pharaoh's Choice Travel";

        case 'red_sea':
            if (assignmentContainsAny($text, ['dive', 'diving', 'snorkel'])) {
                return 'Red Sea Diving Safari';
            }
            if (assignmentContainsAny($text, ['beach', 'sea', 'island', 'boat'])) {
                return 'Jolly Tour';
            }
            return 'Kuoni Egypt';

        case 'desert':
            if (assignmentContainsAny($text, ['safari', 'quad', 'camel', 'desert'])) {
                return 'Sinai Safari Adventures';
            }
            if (assignmentContainsAny($text, ['oasis', 'bedouin', 'camp'])) {
                return 'Oasis Desert Tours';
            }
            return 'Desert Quest Adventures';

        case 'luxor_historical':
            if (assignmentContainsAny($text, ['temple', 'tomb', 'museum', 'historical', 'cultural', 'ancient'])) {
                return 'Egypt Tailor Made';
            }
            if (assignmentContainsAny($text, ['nile', 'cruise', 'river'])) {
                return 'Nile Explorers';
            }
            return 'Abercrombie & Kent Egypt';

        default:
            return 'Travco Group';
    }
}

/**
 * Required companies for the tourism assignment model.
 */
function getRequiredTourismCompanies(): array
{
    return [
        'Memphis Tours',
        'Travco Group',
        "Pharaoh's Choice Travel",
        'Red Sea Diving Safari',
        'Jolly Tour',
        'Kuoni Egypt',
        'Sinai Safari Adventures',
        'Oasis Desert Tours',
        'Desert Quest Adventures',
        'Egypt Tailor Made',
        'Nile Explorers',
        'Abercrombie & Kent Egypt',
    ];
}

/**
 * Ensure required companies exist and return [name => id].
 */
function ensureTourismCompanies(PDO $pdo, array $companiesSchema): array
{
    $companyNames = getRequiredTourismCompanies();

    $table = quoteIdentifier($companiesSchema['table']);
    $idCol = quoteIdentifier($companiesSchema['id']);
    $nameCol = quoteIdentifier($companiesSchema['name']);

    $selectSql = "SELECT {$idCol} AS id, {$nameCol} AS name FROM {$table} WHERE {$nameCol} = :name LIMIT 1";
    $insertSql = "INSERT INTO {$table} ({$nameCol}) VALUES (:name)";

    $selectStmt = $pdo->prepare($selectSql);
    $insertStmt = $pdo->prepare($insertSql);

    $mapping = [];

    foreach ($companyNames as $name) {
        $selectStmt->execute([':name' => $name]);
        $row = $selectStmt->fetch();

        if ($row) {
            $mapping[$name] = (int)$row['id'];
            continue;
        }

        $insertStmt->execute([':name' => $name]);
        $mapping[$name] = (int)$pdo->lastInsertId();
    }

    return $mapping;
}

/**
 * Resolve assigned company ID for an activity.
 */
function resolveAssignedCompanyId(PDO $pdo, string $destinationName, string $activityType, string $activityName): int
{
    ensureActivityCompanyColumn($pdo);

    $companiesSchema = resolveCompaniesSchema($pdo);
    $companyIdMap = ensureTourismCompanies($pdo, $companiesSchema);

    $bucket = detectDestinationBucket($destinationName);
    if ($bucket === null) {
        $bucket = detectBucketByActivity($activityType, $activityName);
    }

    $companyName = chooseCompanyName($bucket, $activityType, $activityName);
    $companyId = $companyIdMap[$companyName] ?? 0;

    if ($companyId <= 0) {
        throw new RuntimeException('Failed to resolve company ID for: ' . $companyName);
    }

    return $companyId;
}
