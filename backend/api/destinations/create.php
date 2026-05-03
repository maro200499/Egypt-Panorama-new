<?php
declare(strict_types=1);

require_once __DIR__ . '/../../config/bootstrap.php';

requireMethod('POST');

$input = getJsonInput();
requireFields($input, ['name']);

$name = cleanString($input['name']);
$city = array_key_exists('city', $input) ? cleanString($input['city']) : 'Egypt';
$latitude = array_key_exists('latitude', $input) && $input['latitude'] !== '' ? (float)$input['latitude'] : null;
$longitude = array_key_exists('longitude', $input) && $input['longitude'] !== '' ? (float)$input['longitude'] : null;
$type = array_key_exists('type', $input) ? cleanString($input['type']) : 'Cultural';
$coverImage = array_key_exists('cover_image', $input) ? cleanString($input['cover_image']) : null;
$galleryImages = null;

if (array_key_exists('gallery_images', $input)) {
	$galleryValue = $input['gallery_images'];
	if (is_array($galleryValue)) {
		$normalizedGallery = array_values(array_filter(array_map('trim', array_map('strval', $galleryValue)), static fn(string $value): bool => $value !== ''));
		$galleryImages = json_encode($normalizedGallery, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) ?: null;
	} else {
		$galleryImages = trim((string)$galleryValue);
	}
}

if ($name === '') {
	errorResponse('Invalid input data', 422);
}

try {
	$pdo = db();
	$schema = resolveDestinationsSchema($pdo);

	$table = quoteIdentifier($schema['table']);
	$idColumn = quoteIdentifier($schema['id']);
	$nameColumn = quoteIdentifier($schema['name']);
	$cityColumn = quoteIdentifier($schema['city']);
	$latitudeColumn = quoteIdentifier($schema['latitude']);
	$longitudeColumn = quoteIdentifier($schema['longitude']);
	$typeColumn = quoteIdentifier($schema['type']);
	$coverImageColumn = quoteIdentifier($schema['cover_image']);
	$galleryImagesColumn = quoteIdentifier($schema['gallery_images']);

	$insertSql = "INSERT INTO {$table} ({$nameColumn}, {$cityColumn}, {$latitudeColumn}, {$longitudeColumn}, {$typeColumn}, {$coverImageColumn}, {$galleryImagesColumn})
	              VALUES (:name, :city, :latitude, :longitude, :type, :cover_image, :gallery_images)";
	$stmt = $pdo->prepare($insertSql);
	$stmt->execute([
		':name' => $name,
		':city' => $city === '' ? 'Egypt' : $city,
		':latitude' => $latitude,
		':longitude' => $longitude,
		':type' => $type === '' ? 'Cultural' : $type,
		':cover_image' => $coverImage === '' ? null : $coverImage,
		':gallery_images' => $galleryImages === '' ? null : $galleryImages,
	]);

	successResponse([
		'id' => (int)$pdo->lastInsertId(),
		'name' => $name,
		'city' => $city === '' ? 'Egypt' : $city,
		'latitude' => $latitude,
		'longitude' => $longitude,
		'type' => $type === '' ? 'Cultural' : $type,
		'cover_image' => $coverImage === '' ? null : $coverImage,
		'gallery_images' => $galleryImages === '' ? null : $galleryImages,
	], 'Destination created successfully', 201);
} catch (PDOException $e) {
	error_log('Database error while creating destination: ' . $e->getMessage());
	dbErrorResponse($e, 500);
} catch (Throwable $e) {
	error_log('Error creating destination: ' . $e->getMessage());
	dbErrorResponse($e, 500);
}