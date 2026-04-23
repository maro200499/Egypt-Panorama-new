<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/bootstrap.php';

requireMethod('GET');

try {
    $pdo = db();

    $sql = 'SELECT company_id, comp_name, city, rating, description, comp_phone, comp_email
            FROM tourism_company';

    $conditions = [];
    $params = [];

    if (isset($_GET['search']) && cleanString($_GET['search']) !== '') {
        $conditions[] = 'comp_name LIKE :search';
        $params[':search'] = '%' . cleanString($_GET['search']) . '%';
    }

    if (isset($_GET['min_rating']) && cleanString($_GET['min_rating']) !== '') {
        if (!is_numeric($_GET['min_rating'])) {
            errorResponse('Invalid min_rating value', 422);
        }

        $minRating = (float)$_GET['min_rating'];

        if ($minRating < 0 || $minRating > 5) {
            errorResponse('min_rating must be between 0 and 5', 422);
        }

        $conditions[] = 'rating >= :min_rating';
        $params[':min_rating'] = $minRating;
    }

    if (!empty($conditions)) {
        $sql .= ' WHERE ' . implode(' AND ', $conditions);
    }

    $sql .= ' ORDER BY rating DESC';

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    $companies = $stmt->fetchAll();

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
    errorResponse(isDebugMode() ? $e->getMessage() : 'Internal server error', 500);
}
