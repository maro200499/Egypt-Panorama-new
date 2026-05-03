<?php
declare(strict_types=1);

require_once __DIR__ . '/../../config/bootstrap.php';

requireMethod('GET');

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($id <= 0) {
    errorResponse('Invalid company id', 422);
}

try {
    $pdo = db();

    // Try normalized `companies` table first; if the table is missing, fall back to legacy schema
    try {
        $sql = 'SELECT 
                    id AS company_id,
                    name AS comp_name,
                    phone AS comp_phone,
                    email AS comp_email,
                    address AS comp_address,
                    city,
                    rating,
                    description,
                    image_url
                FROM companies
                WHERE id = :id
                LIMIT 1';

        $stmt = $pdo->prepare($sql);
        $stmt->execute([':id' => $id]);
        $company = $stmt->fetch();
    } catch (PDOException $e) {
        // If companies table doesn't exist, try legacy tourism_company table
        if ($e->getCode() === '42S02' || stripos($e->getMessage(), "doesn't exist") !== false) {
            $fallbackSql = 'SELECT 
                                company_id AS company_id,
                                comp_name AS comp_name,
                                comp_phone AS comp_phone,
                                comp_email AS comp_email,
                                comp_address AS comp_address,
                                city,
                                rating,
                                description,
                                image_url
                            FROM tourism_company
                            WHERE company_id = :id
                            LIMIT 1';

            $stmt = $pdo->prepare($fallbackSql);
            $stmt->execute([':id' => $id]);
            $company = $stmt->fetch();
        } else {
            throw $e;
        }
    }

    if (!$company) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Company not found',
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => $company,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
} catch (PDOException $e) {
    error_log('Database error while fetching company: ' . $e->getMessage());
    dbErrorResponse($e, 500);
} catch (Throwable $e) {
    error_log('Error fetching company: ' . $e->getMessage());
    dbErrorResponse($e, 500);
}
