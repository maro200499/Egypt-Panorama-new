<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/bootstrap.php';

function jwtSecret(): string
{
    $secret = getenv('JWT_SECRET') ?: '';

    if ($secret === '') {
        errorResponse('JWT secret is not configured', 500);
    }

    return $secret;
}

function base64UrlEncode(string $input): string
{
    return rtrim(strtr(base64_encode($input), '+/', '-_'), '=');
}

function base64UrlDecode(string $input): string
{
    $remainder = strlen($input) % 4;
    if ($remainder > 0) {
        $input .= str_repeat('=', 4 - $remainder);
    }

    $decoded = base64_decode(strtr($input, '-_', '+/'), true);
    return $decoded === false ? '' : $decoded;
}

function generateJWT(array $user, int $ttlSeconds = 86400): string
{
    $header = [
        'alg' => 'HS256',
        'typ' => 'JWT',
    ];

    $issuedAt = time();

    $payload = [
        'sub' => (int)($user['id'] ?? 0),
        'email' => (string)($user['email'] ?? ''),
        'role' => (string)($user['role'] ?? 'user'),
        'iat' => $issuedAt,
        'exp' => $issuedAt + $ttlSeconds,
    ];

    $encodedHeader = base64UrlEncode(json_encode($header, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    $encodedPayload = base64UrlEncode(json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));

    $signature = hash_hmac('sha256', $encodedHeader . '.' . $encodedPayload, jwtSecret(), true);
    $encodedSignature = base64UrlEncode($signature);

    return $encodedHeader . '.' . $encodedPayload . '.' . $encodedSignature;
}

function verifyJWT(string $token): ?array
{
    $parts = explode('.', $token);

    if (count($parts) !== 3) {
        return null;
    }

    [$encodedHeader, $encodedPayload, $encodedSignature] = $parts;

    $headerJson = base64UrlDecode($encodedHeader);
    $payloadJson = base64UrlDecode($encodedPayload);

    if ($headerJson === '' || $payloadJson === '') {
        return null;
    }

    $header = json_decode($headerJson, true);
    $payload = json_decode($payloadJson, true);

    if (!is_array($header) || !is_array($payload)) {
        return null;
    }

    if (($header['alg'] ?? '') !== 'HS256') {
        return null;
    }

    $expected = base64UrlEncode(hash_hmac('sha256', $encodedHeader . '.' . $encodedPayload, jwtSecret(), true));

    if (!hash_equals($expected, $encodedSignature)) {
        return null;
    }

    if (!isset($payload['exp']) || !is_numeric($payload['exp']) || (int)$payload['exp'] < time()) {
        return null;
    }

    if (!isset($payload['sub']) || !is_numeric($payload['sub'])) {
        return null;
    }

    return $payload;
}
