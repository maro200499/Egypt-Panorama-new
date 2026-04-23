<?php
declare(strict_types=1);

function isDebugMode(): bool
{
    $value = strtolower((string)(getenv('APP_DEBUG') ?: '1'));
    return !in_array($value, ['0', 'false', 'off', 'no'], true);
}

function jsonResponse(string $status, $data = null, ?string $message = null, int $statusCode = 200): void
{
    http_response_code($statusCode);

    $payload = [
        'status' => $status,
        'message' => $message ?? ($status === 'success' ? 'Request successful' : 'Request failed'),
    ];

    if ($data !== null) {
        $payload['data'] = $data;
    }

    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function successResponse($data = null, ?string $message = null, int $statusCode = 200): void
{
    jsonResponse('success', $data, $message, $statusCode);
}

function errorResponse(string $message, int $statusCode = 400, $data = null): void
{
    jsonResponse('error', $data, $message, $statusCode);
}

function dbErrorResponse(Throwable $e, int $statusCode = 500): void
{
    $message = isDebugMode() ? $e->getMessage() : 'Database operation failed';
    error_log('Database error: ' . $e->getMessage() . ' | ' . $e->getFile() . ':' . $e->getLine());
    errorResponse($message, $statusCode);
}

function requireMethod(string $expectedMethod): void
{
    if ($_SERVER['REQUEST_METHOD'] !== strtoupper($expectedMethod)) {
        errorResponse('Method not allowed', 405);
    }
}

function getJsonInput(): array
{
    $raw = file_get_contents('php://input');

    if ($raw === false || trim($raw) === '') {
        return [];
    }

    $decoded = json_decode($raw, true);

    if (!is_array($decoded)) {
        errorResponse('Invalid JSON body', 400);
    }

    return $decoded;
}

function cleanString($value): string
{
    return trim((string)$value);
}

function requireFields(array $input, array $fields): void
{
    foreach ($fields as $field) {
        if (!array_key_exists($field, $input) || cleanString($input[$field]) === '') {
            errorResponse("Missing required field: {$field}", 422);
        }
    }
}

function validatePositiveInt($value, ?string $fieldName = null): int
{
    $intValue = (int)$value;
    if ($intValue <= 0) {
        $name = $fieldName ? ": {$fieldName}" : '';
        errorResponse("Invalid integer value{$name}", 422);
    }
    return $intValue;
}
