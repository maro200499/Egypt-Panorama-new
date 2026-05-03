<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/bootstrap.php';

if (PHP_SAPI !== 'cli') {
    $requestMethod = $_SERVER['REQUEST_METHOD'] ?? '';

    if ($requestMethod !== 'GET' && $requestMethod !== 'POST') {
        jsonErrorResponse('Method not allowed', 405);
    }

    if (!isset($_GET['run']) || $_GET['run'] !== 'true') {
        echo 'Add ?run=true to execute script';
        exit;
    }
}

try {
    $pdo = db();

    $activitiesSchema = resolveActivitiesSchema($pdo);
    $destinationsSchema = resolveDestinationsSchema($pdo);

    ensureActivityDescriptionColumn($pdo, $activitiesSchema['table']);
    ensureActivityAudioColumn($pdo, $activitiesSchema['table']);

    $activitiesTable = quoteIdentifier($activitiesSchema['table']);
    $activityId = quoteIdentifier($activitiesSchema['id']);
    $activityName = quoteIdentifier($activitiesSchema['name']);
    $activityType = quoteIdentifier($activitiesSchema['type']);
    $activityDestinationId = quoteIdentifier($activitiesSchema['destination_id']);
    $activityDescription = quoteIdentifier('description');
    $activityAudioUrl = quoteIdentifier('audio_url');

    $destinationsTable = quoteIdentifier($destinationsSchema['table']);
    $destinationId = quoteIdentifier($destinationsSchema['id']);
    $destinationName = quoteIdentifier($destinationsSchema['name']);

    $selectSql = "SELECT a.{$activityId} AS id, a.{$activityName} AS name, a.{$activityType} AS type,
                         a.{$activityDestinationId} AS destination_id, d.{$destinationName} AS destination_name,
                         a.{$activityDescription} AS description, a.{$activityAudioUrl} AS audio_url
                  FROM {$activitiesTable} a
                  INNER JOIN {$destinationsTable} d ON d.{$destinationId} = a.{$activityDestinationId}
                  ORDER BY a.{$activityId} ASC";
    $selectStmt = $pdo->prepare($selectSql);
    $selectStmt->execute();
    $activities = $selectStmt->fetchAll();

    if ($activities === []) {
        echo 'No activities to update';
        exit;
    }

    $updateSql = "UPDATE {$activitiesTable}
                  SET {$activityDescription} = :description,
                      {$activityAudioUrl} = :audio_url
                  WHERE {$activityId} = :id";
    $updateStmt = $pdo->prepare($updateSql);

    $updated = 0;
    $skipped = 0;

    foreach ($activities as $activity) {
        $activityIdValue = (int)$activity['id'];
        $existingDescription = trim((string)($activity['description'] ?? ''));
        $existingAudioUrl = trim((string)($activity['audio_url'] ?? ''));
        $audioFileName = 'activity_' . $activityIdValue . '.mp3';
        $audioRelativePath = 'backend/uploads/audio/' . $audioFileName;
        $audioAbsolutePath = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'backend' . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'audio' . DIRECTORY_SEPARATOR . $audioFileName;

        $audioAlreadyExists = file_exists($audioAbsolutePath) || ($existingAudioUrl !== '' && file_exists(resolveProjectPath($existingAudioUrl)));

        if ($audioAlreadyExists) {
            if ($existingDescription === '') {
                $existingDescription = generateActivityDescription(
                    $activityIdValue,
                    (string)$activity['name'],
                    (string)$activity['type'],
                    (string)$activity['destination_name']
                );
            }

            $updateStmt->execute([
                ':description' => $existingDescription,
                ':audio_url' => $audioRelativePath,
                ':id' => $activityIdValue,
            ]);

            $skipped++;
            emitProgress('Skipping activity ID: ' . $activityIdValue . ' (audio already exists)');
            continue;
        }

        if ($existingDescription === '') {
            $existingDescription = generateActivityDescription(
                $activityIdValue,
                (string)$activity['name'],
                (string)$activity['type'],
                (string)$activity['destination_name']
            );
        }

        emitProgress('Processing activity ID: ' . $activityIdValue);

        ensureDirectoryExists(dirname($audioAbsolutePath));

        $tempTextPath = tempnam(sys_get_temp_dir(), 'activity_text_');
        $tempWavBase = tempnam(sys_get_temp_dir(), 'activity_wav_');

        if ($tempTextPath === false || $tempWavBase === false) {
            throw new RuntimeException('Unable to create temporary files for audio generation');
        }

        $tempWavPath = $tempWavBase . '.wav';
        @unlink($tempWavBase);

        file_put_contents($tempTextPath, $existingDescription);

        try {
            generateSpeechWaveFile($tempTextPath, $tempWavPath);
            encodeWaveToMp3($tempWavPath, $audioAbsolutePath);

            $updateStmt->execute([
                ':description' => $existingDescription,
                ':audio_url' => $audioRelativePath,
                ':id' => $activityIdValue,
            ]);

            $updated += $updateStmt->rowCount() > 0 ? 1 : 0;
        } catch (Throwable $rowError) {
            $skipped++;
            if (file_exists($audioAbsolutePath)) {
                @unlink($audioAbsolutePath);
            }
            error_log('Skipping activity ' . $activityIdValue . ': ' . $rowError->getMessage());
        } finally {
            if (file_exists($tempTextPath)) {
                @unlink($tempTextPath);
            }
            if (file_exists($tempWavPath)) {
                @unlink($tempWavPath);
            }
        }
    }

    echo json_encode([
        'status' => 'success',
        'message' => 'Activities updated successfully',
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
} catch (Throwable $e) {
    error_log('Activity description generation failed: ' . $e->getMessage());
    jsonErrorResponse(PHP_SAPI === 'cli' || isDebugMode() ? $e->getMessage() : 'Database operation failed', 500);
}

function jsonErrorResponse(string $message, int $statusCode = 400): void
{
    if (PHP_SAPI !== 'cli') {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
    }

    echo json_encode([
        'status' => 'error',
        'message' => $message,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function ensureActivityDescriptionColumn(PDO $pdo, string $tableName): void
{
    if (columnExists($pdo, $tableName, 'description')) {
        return;
    }

    $table = quoteIdentifier($tableName);
    $pdo->exec("ALTER TABLE {$table} ADD COLUMN description TEXT NULL AFTER price");
}

function ensureActivityAudioColumn(PDO $pdo, string $tableName): void
{
    if (columnExists($pdo, $tableName, 'audio_url')) {
        return;
    }

    $table = quoteIdentifier($tableName);
    $pdo->exec("ALTER TABLE {$table} ADD COLUMN audio_url VARCHAR(500) NULL AFTER description");
}

function ensureDirectoryExists(string $directory): void
{
    if (is_dir($directory)) {
        return;
    }

    if (!mkdir($directory, 0775, true) && !is_dir($directory)) {
        throw new RuntimeException('Unable to create audio directory: ' . $directory);
    }
}

function resolveProjectPath(string $relativePath): string
{
    $normalized = str_replace(['\\', '/'], DIRECTORY_SEPARATOR, trim($relativePath));

    if (preg_match('/^[A-Za-z]:\\/', $normalized) === 1 || str_starts_with($normalized, DIRECTORY_SEPARATOR)) {
        return $normalized;
    }

    return dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . ltrim($normalized, DIRECTORY_SEPARATOR);
}

function emitProgress(string $message): void
{
    if (PHP_SAPI === 'cli') {
        echo $message . PHP_EOL;
        return;
    }

    echo $message . '<br>';
    @ob_flush();
    @flush();
}

function generateSpeechWaveFile(string $textFilePath, string $waveFilePath): void
{
    $script = <<<'PS1'
param(
    [string]$TextFile,
    [string]$WaveFile
)

Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
try {
    $text = Get-Content -Path $TextFile -Raw
    $synth.SetOutputToWaveFile($WaveFile)
    $synth.Rate = 0
    $synth.Volume = 100
    $synth.Speak($text)
} finally {
    $synth.Dispose()
}
PS1;

    $scriptBase = tempnam(sys_get_temp_dir(), 'activity_ps_');
    if ($scriptBase === false) {
        throw new RuntimeException('Unable to create temporary PowerShell script');
    }

    $scriptFile = $scriptBase . '.ps1';
    @unlink($scriptBase);
    file_put_contents($scriptFile, $script);

    $command = sprintf(
        'powershell -NoProfile -ExecutionPolicy Bypass -File %s -TextFile %s -WaveFile %s',
        escapeshellarg($scriptFile),
        escapeshellarg($textFilePath),
        escapeshellarg($waveFilePath)
    );

    runCommand($command, 'Failed to synthesize speech to WAV');

    if (file_exists($scriptFile)) {
        @unlink($scriptFile);
    }
}

function encodeWaveToMp3(string $waveFilePath, string $mp3FilePath): void
{
    $nodeScript = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'frontend' . DIRECTORY_SEPARATOR . 'scripts' . DIRECTORY_SEPARATOR . 'encode_wave_to_mp3.js';

    $command = sprintf(
        'node %s %s %s',
        escapeshellarg($nodeScript),
        escapeshellarg($waveFilePath),
        escapeshellarg($mp3FilePath)
    );

    runCommand($command, 'Failed to encode MP3');
}

function runCommand(string $command, string $errorMessage): void
{
    $descriptors = [
        1 => ['pipe', 'w'],
        2 => ['pipe', 'w'],
    ];

    $process = proc_open($command, $descriptors, $pipes);

    if (!is_resource($process)) {
        throw new RuntimeException($errorMessage);
    }

    $stdout = stream_get_contents($pipes[1]);
    $stderr = stream_get_contents($pipes[2]);

    fclose($pipes[1]);
    fclose($pipes[2]);

    $exitCode = proc_close($process);

    if ($exitCode !== 0) {
        throw new RuntimeException(trim($errorMessage . ' ' . $stdout . ' ' . $stderr));
    }
}

function generateActivityDescription(int $id, string $name, string $type, string $destinationName): string
{
    $name = trim($name);
    $type = trim($type);
    $destinationName = trim($destinationName);

    $leadIns = [
        'Experience',
        'Discover',
        'Explore',
        'Step into',
        'Uncover',
        'Take in',
        'Enjoy',
        'Wander through',
    ];

    $settings = [
        'an atmospheric corner of',
        'one of the most memorable spots in',
        'a local favorite in',
        'a distinctive stop in',
        'a scenic highlight of',
        'a character-rich experience in',
        'a must-see part of',
        'a vibrant side of',
    ];

    $descriptors = [
        'rich in local flavor',
        'layered with cultural detail',
        'shaped by everyday life and heritage',
        'easy to enjoy at a relaxed pace',
        'ideal for curious travelers',
        'full of texture and atmosphere',
        'grounded in the spirit of the destination',
        'designed to leave a lasting impression',
    ];

    $activityAngles = [
        'It suits travelers who want a close look at the city rather than a rushed pass-through.',
        'It works well for visitors looking for a memorable stop between the headline sights.',
        'It adds a deeper layer to the itinerary with a more personal, place-based experience.',
        'It feels rewarding for anyone who enjoys stories, surroundings, and a strong sense of place.',
        'It offers a calm, engaging way to connect with the destination beyond the usual route.',
        'It brings together atmosphere, character, and a clear local identity.',
    ];

    $closingLines = [
        'Plan a little time here and the visit becomes one of the trip\'s quieter highlights.',
        'It is the kind of stop that turns a day in the city into a more memorable journey.',
        'For travelers chasing authenticity, this is an easy place to slow down and take it in.',
        'It pairs well with nearby landmarks and gives the day a more complete feeling.',
        'A short visit here can add variety, context, and a stronger sense of place to the route.',
    ];

    $seed = $id . '|' . strtolower($name . '|' . $type . '|' . $destinationName);
    $lead = pickFromList($leadIns, $seed, 1);
    $setting = pickFromList($settings, $seed, 2);
    $descriptor = pickFromList($descriptors, $seed, 3);
    $angle = pickFromList($activityAngles, $seed, 4);
    $closing = pickFromList($closingLines, $seed, 5);

    return sprintf(
        '%s %s %s %s, %s in %s. %s %s is %s. %s',
        $lead,
        $name,
        $setting,
        $destinationName,
        $type,
        $destinationName,
        $name,
        $type,
        $descriptor,
        $angle . ' ' . $closing
    );
}

function pickFromList(array $items, string $seed, int $offset): string
{
    $count = count($items);

    if ($count === 0) {
        return '';
    }

    $hash = crc32($seed . '|' . $offset);
    $index = (int)($hash % $count);

    return $items[$index];
}