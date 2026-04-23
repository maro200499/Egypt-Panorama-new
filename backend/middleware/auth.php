<?php
declare(strict_types=1);

require_once __DIR__ . '/../auth/jwt.php';

function getAuthorizationHeader(): string
{
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        return trim((string)$_SERVER['HTTP_AUTHORIZATION']);
    }

    if (function_exists('getallheaders')) {
        $headers = getallheaders();
        if (is_array($headers)) {
            foreach ($headers as $key => $value) {
                if (strtolower((string)$key) === 'authorization') {
                    return trim((string)$value);
                }
            }
        }
    }

    return '';
}

function getBearerToken(): string
{
    $header = getAuthorizationHeader();

    if ($header === '' || !preg_match('/^Bearer\s+(.+)$/i', $header, $matches)) {
        return '';
    }

    return trim($matches[1]);
}

function requireAuth(): array
{
    $token = getBearerToken();

    if ($token === '') {
        errorResponse('Missing or invalid Authorization header', 401);
    }

    $payload = verifyJWT($token);

    if ($payload === null) {
        errorResponse('Invalid or expired token', 401);
    }

    $user = [
        'id' => (int)$payload['sub'],
        'email' => (string)($payload['email'] ?? ''),
        'role' => (string)($payload['role'] ?? 'user'),
    ];

    if ($user['id'] <= 0) {
        errorResponse('Invalid token payload', 401);
    }

    return $user;
}

function requireAdmin(): array
{
    $user = requireAuth();

    if ($user['role'] !== 'admin') {
        errorResponse('Admin access required', 403);
    }

    return $user;
}
