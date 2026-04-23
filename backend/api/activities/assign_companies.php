<?php
declare(strict_types=1);

require_once __DIR__ . '/../../config/bootstrap.php';
require_once __DIR__ . '/../../config/company_assignment.php';

requireMethod('POST');

try {
    $pdo = db();

    $activitiesSchema = resolveActivitiesSchema($pdo);
    $destinationsSchema = resolveDestinationsSchema($pdo);
    $companiesSchema = resolveCompaniesSchema($pdo);

    ensureActivityCompanyColumn($pdo);

    $activitiesTable = quoteIdentifier($activitiesSchema['table']);
    $activityIdCol = quoteIdentifier($activitiesSchema['id']);
    $activityNameCol = quoteIdentifier($activitiesSchema['name']);
    $activityTypeCol = quoteIdentifier($activitiesSchema['type']);
    $activityDestinationIdCol = quoteIdentifier($activitiesSchema['destination_id']);
    $activityCompanyIdCol = quoteIdentifier('company_id');

    $destinationsTable = quoteIdentifier($destinationsSchema['table']);
    $destinationIdCol = quoteIdentifier($destinationsSchema['id']);
    $destinationNameCol = quoteIdentifier($destinationsSchema['name']);

    $pdo->beginTransaction();

    $companyIdMap = ensureTourismCompanies($pdo, $companiesSchema);

    $fetchSql = "SELECT
            a.{$activityIdCol} AS id,
            a.{$activityNameCol} AS activity_name,
            a.{$activityTypeCol} AS activity_type,
            a.{$activityDestinationIdCol} AS destination_id,
            d.{$destinationNameCol} AS destination_name
        FROM {$activitiesTable} a
        INNER JOIN {$destinationsTable} d ON d.{$destinationIdCol} = a.{$activityDestinationIdCol}";

    $fetchStmt = $pdo->prepare($fetchSql);
    $fetchStmt->execute();
    $activities = $fetchStmt->fetchAll();

    $updateSql = "UPDATE {$activitiesTable} SET {$activityCompanyIdCol} = :company_id WHERE {$activityIdCol} = :id";
    $updateStmt = $pdo->prepare($updateSql);

    $updatedCount = 0;

    foreach ($activities as $activity) {
        $destinationName = (string)($activity['destination_name'] ?? '');
        $activityType = (string)($activity['activity_type'] ?? '');
        $activityName = (string)($activity['activity_name'] ?? '');

        $companyId = resolveAssignedCompanyId($pdo, $destinationName, $activityType, $activityName);

        $updateStmt->execute([
            ':company_id' => $companyId,
            ':id' => (int)$activity['id'],
        ]);

        $updatedCount++;
    }

    // Strict safety net: no activity is allowed to keep NULL company_id.
    $nullCountSql = "SELECT COUNT(*) FROM {$activitiesTable} WHERE {$activityCompanyIdCol} IS NULL";
    $nullCountStmt = $pdo->prepare($nullCountSql);
    $nullCountStmt->execute();
    $nullCount = (int)$nullCountStmt->fetchColumn();

    if ($nullCount > 0) {
        $fallbackCompanyId = $companyIdMap['Travco Group'];
        $fillNullSql = "UPDATE {$activitiesTable}
            SET {$activityCompanyIdCol} = :fallback_company_id
            WHERE {$activityCompanyIdCol} IS NULL";

        $fillNullStmt = $pdo->prepare($fillNullSql);
        $fillNullStmt->execute([':fallback_company_id' => $fallbackCompanyId]);
    }

    $pdo->commit();

    successResponse([
        'updated_activities' => $updatedCount,
        'companies_used' => $companyIdMap,
    ], 'Activity companies assigned successfully', 200);
} catch (PDOException $e) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    dbErrorResponse($e, 500);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    error_log('Error assigning companies to activities: ' . $e->getMessage());
    errorResponse(isDebugMode() ? $e->getMessage() : 'Failed to assign companies', 500);
}
