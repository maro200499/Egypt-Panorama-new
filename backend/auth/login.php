<?php
declare(strict_types=1);

require_once __DIR__ . '/../auth/jwt.php';

requireMethod('POST');

$input = getJsonInput();
requireFields($input, ['email', 'password']);

$email = strtolower(cleanString($input['email']));
$password = (string)$input['password'];

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    errorResponse('Invalid email format', 422);
}

try {
    $pdo = db();

    $usersSchema = resolveUsersSchema($pdo);

    $usersTable = quoteIdentifier($usersSchema['table']);
    $idColumn = quoteIdentifier($usersSchema['id']);
    $nameColumn = quoteIdentifier($usersSchema['name']);
    $emailColumn = quoteIdentifier($usersSchema['email']);
    $passwordColumn = quoteIdentifier($usersSchema['password']);

    $nationalitySql = $usersSchema['nationality'] !== null
        ? quoteIdentifier($usersSchema['nationality']) . ' AS nationality'
        : "'' AS nationality";

    $roleSql = $usersSchema['role'] !== null
        ? quoteIdentifier($usersSchema['role']) . ' AS role'
        : "'user' AS role";

    $sql = "SELECT {$idColumn} AS id,
                   {$nameColumn} AS name,
                   {$emailColumn} AS email,
                   {$passwordColumn} AS password,
                   {$nationalitySql},
                   {$roleSql}
            FROM {$usersTable}
            WHERE {$emailColumn} = :email
            LIMIT 1";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([':email' => $email]);

    $user = $stmt->fetch();

    if (!$user || !password_verify($password, (string)$user['password'])) {
        errorResponse('Invalid email or password', 401);
    }

    $token = generateJWT([
        'id' => (int)$user['id'],
        'email' => (string)$user['email'],
        'role' => (string)$user['role'],
    ]);

    successResponse([
        'token' => $token,
        'user' => [
            'id' => (int)$user['id'],
            'name' => (string)$user['name'],
            'email' => (string)$user['email'],
            'nationality' => (string)$user['nationality'],
            'role' => (string)$user['role'],
        ],
    ], 'Login successful', 200);
} catch (PDOException $e) {
    error_log('Database error during login: ' . $e->getMessage());
    dbErrorResponse($e, 500);
} catch (Throwable $e) {
    error_log('Error during login: ' . $e->getMessage());
    dbErrorResponse($e, 500);
}
