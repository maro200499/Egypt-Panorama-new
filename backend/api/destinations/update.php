<?php
declare(strict_types=1);

require_once __DIR__ . '/../../config/bootstrap.php';

requireMethod('POST');

$input = getJsonInput();
$id = isset($input['id']) ? (int)$input['id'] : 0;

if ($id <= 0) {
	errorResponse('Valid destination id is required', 422);
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

	$fields = [];
	$params = [':id' => $id];

	if (array_key_exists('name', $input)) {
		$name = cleanString($input['name']);
		if ($name === '') {
			errorResponse('name cannot be empty', 422);
		}
		$fields[] = "{$nameColumn} = :name";
		$params[':name'] = $name;
	}

	if (array_key_exists('city', $input)) {
		$city = cleanString($input['city']);
		if ($city === '') {
			$city = 'Egypt';
		}
		$fields[] = "{$cityColumn} = :city";
		$params[':city'] = $city;
	}

	if (array_key_exists('latitude', $input)) {
		$params[':latitude'] = $input['latitude'] === '' ? null : (float)$input['latitude'];
		$fields[] = "{$latitudeColumn} = :latitude";
	}

	if (array_key_exists('longitude', $input)) {
		$params[':longitude'] = $input['longitude'] === '' ? null : (float)$input['longitude'];
		$fields[] = "{$longitudeColumn} = :longitude";
	}

	if (array_key_exists('type', $input)) {
		$type = cleanString($input['type']);
		if ($type === '') {
			$type = 'Cultural';
		}
		$fields[] = "{$typeColumn} = :type";
		$params[':type'] = $type;
	}

	if (array_key_exists('cover_image', $input)) {
		$coverImage = cleanString($input['cover_image']);
		$params[':cover_image'] = $coverImage === '' ? null : $coverImage;
		$fields[] = "{$coverImageColumn} = :cover_image";
	}

	if (array_key_exists('gallery_images', $input)) {
		$galleryValue = $input['gallery_images'];
		if (is_array($galleryValue)) {
			$normalizedGallery = array_values(array_filter(array_map('trim', array_map('strval', $galleryValue)), static fn(string $value): bool => $value !== ''));
			$galleryImages = json_encode($normalizedGallery, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) ?: null;
		} else {
			$galleryImages = trim((string)$galleryValue);
		}
		$params[':gallery_images'] = $galleryImages === '' ? null : $galleryImages;
		$fields[] = "{$galleryImagesColumn} = :gallery_images";
	}

	if ($fields === []) {
		errorResponse('No fields provided for update', 422);
	}

	$existsStmt = $pdo->prepare("SELECT {$idColumn} AS id, {$nameColumn} AS name, {$cityColumn} AS city, {$latitudeColumn} AS latitude, {$longitudeColumn} AS longitude, {$typeColumn} AS type, {$coverImageColumn} AS cover_image, {$galleryImagesColumn} AS gallery_images FROM {$table} WHERE {$idColumn} = :id LIMIT 1");
	$existsStmt->execute([':id' => $id]);
	$current = $existsStmt->fetch();

	if (!$current) {
		errorResponse('Destination not found', 404);
	}

	$updateSql = "UPDATE {$table} SET " . implode(', ', $fields) . " WHERE {$idColumn} = :id";
	$updateStmt = $pdo->prepare($updateSql);
	$updateStmt->execute($params);

	successResponse([
		'id' => $id,
		'name' => array_key_exists('name', $input) ? $params[':name'] : $current['name'],
		'city' => array_key_exists('city', $input) ? $params[':city'] : $current['city'],
		'latitude' => array_key_exists('latitude', $input) ? $params[':latitude'] : $current['latitude'],
		'longitude' => array_key_exists('longitude', $input) ? $params[':longitude'] : $current['longitude'],
		'type' => array_key_exists('type', $input) ? $params[':type'] : $current['type'],
		'cover_image' => array_key_exists('cover_image', $input) ? $params[':cover_image'] : $current['cover_image'],
		'gallery_images' => array_key_exists('gallery_images', $input) ? $params[':gallery_images'] : $current['gallery_images'],
	], 'Destination updated successfully', 200);
} catch (PDOException $e) {
	error_log('Database error while updating destination: ' . $e->getMessage());
	dbErrorResponse($e, 500);
} catch (Throwable $e) {
	error_log('Error updating destination: ' . $e->getMessage());
	dbErrorResponse($e, 500);
}