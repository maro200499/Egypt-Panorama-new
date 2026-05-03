<?php
declare(strict_types=1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once __DIR__ . '/../../config/bootstrap.php';

requireMethod('GET');

try {
    $pdo = db();

    try {
        // Prefer the normalized `companies` table when available
        $sql = 'SELECT id, name, image_url FROM companies ORDER BY id ASC';
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        $companies = $stmt->fetchAll();
    } catch (PDOException $e) {
        // If the companies table doesn't exist, fall back to legacy tourism_company
        // Table name on some installs is `tourism_company` with different column names
        if ($e->getCode() === '42S02' || stripos($e->getMessage(), "doesn't exist") !== false) {
            $fallbackSql = 'SELECT company_id AS id, comp_name AS name, city, rating, description, comp_phone AS phone, comp_email AS email, image_url FROM tourism_company ORDER BY company_id ASC';
            $stmt = $pdo->prepare($fallbackSql);
            $stmt->execute();
            $companies = $stmt->fetchAll();
        } else {
            throw $e;
        }
    }

    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'data' => $companies,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
} catch (PDOException $e) {
    error_log('Database error fetching companies: ' . $e->getMessage());
    dbErrorResponse($e, 500);
} catch (Throwable $e) {
    error_log('Error fetching companies: ' . $e->getMessage());
    dbErrorResponse($e, 500);
}
