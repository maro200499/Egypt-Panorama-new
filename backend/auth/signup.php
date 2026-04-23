<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/bootstrap.php';

requireMethod('POST');

$input = getJsonInput();
requireFields($input, ['name', 'email', 'password', 'nationality']);

$name = cleanString($input['name']);
$email = strtolower(cleanString($input['email']));
$password = (string)$input['password'];
$nationality = cleanString($input['nationality']);

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    errorResponse('Invalid email format', 422);
}

if (strlen($password) < 8) {
    errorResponse('Password must be at least 8 characters', 422);
}

if (strlen($name) < 2) {
    errorResponse('Name must be at least 2 characters', 422);
}

if (strlen($nationality) < 2) {
    errorResponse('Nationality must be at least 2 characters', 422);
}

try {
    $pdo = db();

    $usersSchema = resolveUsersSchema($pdo);

    $usersTable = quoteIdentifier($usersSchema['table']);
    $idColumn = quoteIdentifier($usersSchema['id']);
    $nameColumn = quoteIdentifier($usersSchema['name']);
    $emailColumn = quoteIdentifier($usersSchema['email']);
    $passwordColumn = quoteIdentifier($usersSchema['password']);

    $nationalityColumn = $usersSchema['nationality'] !== null ? quoteIdentifier($usersSchema['nationality']) : null;
    $roleColumn = $usersSchema['role'] !== null ? quoteIdentifier($usersSchema['role']) : null;

    $checkSql = "SELECT {$idColumn} FROM {$usersTable} WHERE {$emailColumn} = :email LIMIT 1";
    $checkStmt = $pdo->prepare($checkSql);
    $checkStmt->execute([':email' => $email]);

    if ($checkStmt->fetch()) {
        errorResponse('Email already exists', 409);
    }

    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    $insertColumns = [
        $nameColumn,
        $emailColumn,
        $passwordColumn,
    ];

    $insertValues = [
        ':name',
        ':email',
        ':password',
    ];

    $insertParams = [
        ':name' => $name,
        ':email' => $email,
        ':password' => $hashedPassword,
    ];

    if ($nationalityColumn !== null) {
        $insertColumns[] = $nationalityColumn;
        $insertValues[] = ':nationality';
        $insertParams[':nationality'] = $nationality;
    }

    if ($roleColumn !== null) {
        $insertColumns[] = $roleColumn;
        $insertValues[] = ':role';
        $insertParams[':role'] = 'user';
    }

    $insertSql = 'INSERT INTO ' . $usersTable . ' (' . implode(', ', $insertColumns) . ') VALUES (' . implode(', ', $insertValues) . ')';

    $insertStmt = $pdo->prepare($insertSql);

    $insertStmt->execute($insertParams);

    $userId = (int)$pdo->lastInsertId();

    successResponse([
        'id' => $userId,
        'name' => $name,
        'email' => $email,
        'nationality' => $nationality,
        'role' => 'user',
    ], 'Account created successfully', 201);
} catch (PDOException $e) {
    // Handle race-condition duplicates even if pre-check passes.
    if ($e->getCode() === '23000') {
        error_log('Duplicate email during signup: ' . $e->getMessage());
        errorResponse('Email already exists', 409);
    }

    error_log('Database error during signup: ' . $e->getMessage());
    dbErrorResponse($e, 500);
} catch (Throwable $e) {
    error_log('Error during signup: ' . $e->getMessage());
    dbErrorResponse($e, 500);
}
