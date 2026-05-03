<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Illuminate\Http\File as HttpFile;
use Carbon\Carbon;

/**
 * ActivityAudioGenerator
 *
 * Responsible for creating WAV from text using a platform-available TTS
 * (PowerShell/System.Speech, macOS `say`, Linux `espeak`), converting
 * WAV -> MP3 with FFmpeg, storing file on configured disk and updating
 * the activity record.
 *
 * The class is intentionally small, testable and uses external commands
 * via Symfony Process for safer quoting and error handling.
 */
class ActivityAudioGenerator
{
    protected string $ffmpeg;
    protected string $disk;

    public function __construct(string $ffmpeg = 'ffmpeg', string $disk = 'public')
    {
        $this->ffmpeg = $ffmpeg;
        $this->disk = $disk;
    }

    /**
     * Generate audio for a single activity.
     * Returns array with status: 'created', 'skipped', or 'failed' and details.
     */
    public function generateForActivity($activity, array $opts = []): array
    {
        // Safety: do not overwrite existing audio_path
        if (!empty($activity->audio_path) && Storage::disk($this->disk)->exists($activity->audio_path)) {
            return ['status' => 'skipped', 'reason' => 'already_has_audio'];
        }

        // Option: shorten for low-priority/low-rating
        $shortThreshold = $opts['short_threshold'] ?? 3; // rating < 3 -> short
        $shortForm = ($activity->rating ?? 0) < $shortThreshold;

        $text = $this->composeText($activity, $shortForm);

        $tmpDir = storage_path('app/activity_audio_tmp');
        if (!is_dir($tmpDir)) {
            mkdir($tmpDir, 0755, true);
        }

        $textFile = $tmpDir . DIRECTORY_SEPARATOR . 'activity_' . $activity->id . '_' . Str::random(6) . '.txt';
        file_put_contents($textFile, $text);

        $wavPath = $tmpDir . DIRECTORY_SEPARATOR . 'activity_' . $activity->id . '_' . Str::random(8) . '.wav';
        $mp3Temp = $tmpDir . DIRECTORY_SEPARATOR . 'activity_' . $activity->id . '_' . Str::random(8) . '.mp3';

        try {
            $this->generateWaveFromTextFile($textFile, $wavPath);
        } catch (\Throwable $e) {
            Log::error('TTS failed for activity '.$activity->id, ['error' => $e->getMessage()]);
            @unlink($textFile);
            return ['status' => 'failed', 'phase' => 'tts', 'error' => $e->getMessage()];
        }

        // Ensure destination filename doesn't collide
        $filename = 'activity_' . $activity->id . '_' . Carbon::now()->format('YmdHis') . '.mp3';
        $destPath = 'activities/audio/' . $filename;

        // If final path already exists on disk, skip (no overwrite)
        if (Storage::disk($this->disk)->exists($destPath)) {
            @unlink($textFile);
            @unlink($wavPath);
            return ['status' => 'skipped', 'reason' => 'target_exists'];
        }

        try {
            $this->convertWavToMp3($wavPath, $mp3Temp);
        } catch (\Throwable $e) {
            Log::error('FFmpeg conversion failed for activity '.$activity->id, ['error' => $e->getMessage()]);
            @unlink($textFile);
            @unlink($wavPath);
            @unlink($mp3Temp);
            return ['status' => 'failed', 'phase' => 'convert', 'error' => $e->getMessage()];
        }

        // Put to storage disk
        try {
            $fileObj = new HttpFile($mp3Temp);
            Storage::disk($this->disk)->putFileAs('activities/audio', $fileObj, $filename);
            // Persist relative path (no leading slash) so Storage::disk($disk)->url($activity->audio_path) works
            $activity->audio_path = 'activities/audio/' . $filename;
            $activity->save();
            Log::info('Audio created', ['activity_id' => $activity->id, 'path' => $activity->audio_path]);
            $status = ['status' => 'created', 'path' => $activity->audio_path];
        } catch (\Throwable $e) {
            Log::error('Storing MP3 failed for activity '.$activity->id, ['error' => $e->getMessage()]);
            $status = ['status' => 'failed', 'phase' => 'store', 'error' => $e->getMessage()];
        }

        // Cleanup temps
        @unlink($textFile);
        @unlink($wavPath);
        @unlink($mp3Temp);

        return $status;
    }

    protected function composeText($activity, bool $short = false): string
    {
        // Smart, concise description that can be expanded later.
        $parts = [];
        $parts[] = $activity->name;
        if (!empty($activity->category)) {
            $parts[] = 'Category: ' . $activity->category;
        }
        if (!empty($activity->tourism_type)) {
            $parts[] = 'Type: ' . $activity->tourism_type;
        }
        if (!empty($activity->rating)) {
            $parts[] = 'Rating: ' . number_format($activity->rating, 1) . ' out of 5.';
        }
        // Prefer an existing short description column if available
        if (!$short && !empty($activity->description)) {
            $parts[] = $activity->description;
        }

        $text = implode('. ', $parts);
        if ($short) {
            // Keep shorter audio for low-priority items
            $text = $activity->name . '. Rated ' . ($activity->rating ?? 'unrated') . '.';
        }

        // Fail-safe: ensure not empty
        return trim($text) === '' ? 'No description available for this activity.' : $text;
    }

    protected function generateWaveFromTextFile(string $textFile, string $wavPath): void
    {
        $os = PHP_OS_FAMILY;

        if ($os === 'Windows') {
            // Write a .ps1 script and execute it to avoid quoting issues
            $ps1 = "`$text = Get-Content -Raw -Path '" . addslashes($textFile) . "'\n" .
                   "Add-Type -AssemblyName System.Speech\n" .
                   "`$s = New-Object System.Speech.Synthesis.SpeechSynthesizer\n" .
                   "`$s.SetOutputToWaveFile('" . addslashes($wavPath) . "')\n" .
                   "`$s.Speak(`$text)\n" .
                   "`$s.Dispose()\n";

            $ps1File = $textFile . '.ps1';
            file_put_contents($ps1File, $ps1);
            $process = new Process(['powershell', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', $ps1File]);
            $process->setTimeout(60);
            $process->run();
            @unlink($ps1File);
            if (!$process->isSuccessful()) {
                throw new ProcessFailedException($process);
            }
            return;
        }

        if ($os === 'Darwin') {
            // macOS `say` can write to a file directly
            $process = new Process(['say', '-o', $wavPath, '--data-format=LEI16@22050', '-f', $textFile]);
            $process->setTimeout(30);
            $process->run();
            if (!$process->isSuccessful()) {
                throw new ProcessFailedException($process);
            }
            return;
        }

        // Assume Linux-like: try `espeak` or `flite` if available
        if (trim(shell_exec('which espeak'))) {
            $process = new Process(['espeak', '-f', $textFile, '-w', $wavPath]);
            $process->setTimeout(30);
            $process->run();
            if (!$process->isSuccessful()) {
                throw new ProcessFailedException($process);
            }
            return;
        }

        if (trim(shell_exec('which flite'))) {
            $process = new Process(['flite', '-f', $textFile, '-o', $wavPath]);
            $process->setTimeout(30);
            $process->run();
            if (!$process->isSuccessful()) {
                throw new ProcessFailedException($process);
            }
            return;
        }

        throw new \RuntimeException('No supported TTS engine found (PowerShell/System.Speech, say, espeak, flite)');
    }

    protected function convertWavToMp3(string $wavPath, string $mp3OutPath): void
    {
        // Use ffmpeg with libmp3lame; -y is not used because we write to tmp
        $process = new Process([
            $this->ffmpeg,
            '-hide_banner',
            '-loglevel', 'error',
            '-i', $wavPath,
            '-codec:a', 'libmp3lame',
            '-qscale:a', '2',
            $mp3OutPath,
        ]);
        $process->setTimeout(60);
        $process->run();
        if (!$process->isSuccessful()) {
            throw new ProcessFailedException($process);
        }
    }
}
