<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Carbon\Carbon;
use App\Models\Activity;

/**
 * GenerateActivityAudioApi
 *
 * Simple Artisan command that calls a configurable TTS HTTP API to produce MP3
 * audio for activities. It is intentionally minimal and safe:
 * - Skips activities that already have `audio_path` set or target file exists
 * - Processes a single activity with --id, or small batches otherwise
 * - Saves MP3 to configured storage disk and persists `audio_path`
 * - Logs success/failure and continues on errors
 */
class GenerateActivityAudioApi extends Command
{
    protected $signature = 'activities:generate-audio-api
                            {--id= : Specific activity id to process}
                            {--limit=10 : Max activities to process when not using --id}
                            {--batch=5 : Chunk size when processing multiple activities}
                            {--disk=public : Storage disk to save MP3s}
                            {--tts-url= : TTS API URL (or set TTS_API_URL env)}
                            {--tts-key= : TTS API key (or set TTS_API_KEY env)}
                            {--voice= : Voice to request from the TTS API (optional)}';

    protected $description = 'Generate MP3 audio for activities using a TTS HTTP API (returns MP3 or base64)';

    public function handle()
    {
        $id = $this->option('id');
        $limit = (int) $this->option('limit');
        $batch = (int) $this->option('batch');
        $disk = $this->option('disk') ?: 'public';
        $ttsUrl = $this->option('tts-url') ?: env('TTS_API_URL');
        $ttsKey = $this->option('tts-key') ?: env('TTS_API_KEY');
        $voice = $this->option('voice') ?: null;

        if (empty($ttsUrl)) {
            $this->error('TTS API URL not provided (--tts-url or TTS_API_URL env)');
            return 1;
        }

        if (empty($ttsKey)) {
            $this->warn('No TTS API key provided; proceeding without Authorization header');
        }

        if ($id) {
            $activity = Activity::find($id);
            if (!$activity) {
                $this->error('Activity not found: ' . $id);
                return 1;
            }
            $this->processSingle($activity, $ttsUrl, $ttsKey, $voice, $disk);
            return 0;
        }

        $query = Activity::query()
            ->whereNull('audio_path')
            ->orderByDesc('rating')
            ->limit($limit);

        $this->info('Processing up to ' . $limit . ' activities (batch size ' . $batch . ')');

        $processed = 0;
        $query->chunk($batch, function ($activities) use (&$processed, $ttsUrl, $ttsKey, $voice, $disk) {
            foreach ($activities as $activity) {
                $this->info(sprintf('[%d] %s (rating: %s)', $activity->id, $activity->name, $activity->rating));
                try {
                    $this->processSingle($activity, $ttsUrl, $ttsKey, $voice, $disk);
                } catch (\Throwable $e) {
                    Log::error('Unexpected error during activity audio generation', ['activity_id' => $activity->id, 'error' => $e->getMessage()]);
                    $this->error('Error: ' . $e->getMessage());
                }
                $processed++;
            }
        });

        $this->info('Done. Processed ' . $processed . ' activities.');
        return 0;
    }

    protected function processSingle(Activity $activity, string $ttsUrl, ?string $ttsKey, ?string $voice, string $disk): void
    {
        // Skip if already has an audio_path and file exists
        if (!empty($activity->audio_path) && Storage::disk($disk)->exists($activity->audio_path)) {
            $this->info('Skipped (already has audio): ' . $activity->id);
            Log::info('Skipped activity audio generation (already present)', ['activity_id' => $activity->id]);
            return;
        }

        $text = trim($activity->description ?: $activity->name ?: 'No description available');
        if ($text === '') {
            $this->warn('Empty text for activity ' . $activity->id . ', skipping');
            Log::warning('Empty text for TTS', ['activity_id' => $activity->id]);
            return;
        }

        // Prepare headers
        $headers = ['Accept' => '*/*'];
        if (!empty($ttsKey)) {
            $headers['Authorization'] = 'Bearer ' . $ttsKey;
        }

        // Compose payload. Many TTS APIs accept {text, voice, format}. Adapt as needed.
        $payload = ['text' => $text, 'format' => 'mp3'];
        if ($voice) {
            $payload['voice'] = $voice;
        }

        $this->info('Requesting TTS for activity ' . $activity->id);

        try {
            $response = Http::withHeaders($headers)->timeout(60)->post($ttsUrl, $payload);
        } catch (\Throwable $e) {
            Log::error('HTTP request failed for TTS', ['activity_id' => $activity->id, 'error' => $e->getMessage()]);
            $this->error('TTS request failed: ' . $e->getMessage());
            return;
        }

        if (!$response->successful()) {
            Log::error('TTS API returned non-success status', ['activity_id' => $activity->id, 'status' => $response->status(), 'body' => $response->body()]);
            $this->error('TTS API error: HTTP ' . $response->status());
            return;
        }

        $contentType = $response->header('Content-Type', '');
        $now = Carbon::now()->format('YmdHis');
        $filename = 'activity_' . $activity->id . '_' . $now . '.mp3';
        $path = 'activities/audio/' . $filename;

        // Determine if API returned JSON with base64 audio or binary MP3
        $body = $response->body();
        $written = false;

        if (stripos($contentType, 'application/json') !== false) {
            // Try to decode JSON and find base64 field
            $json = $response->json();
            // Common fields: audio, audioContent, base64_audio
            $b64 = $json['audio'] ?? $json['audioContent'] ?? $json['base64_audio'] ?? null;
            if ($b64) {
                try {
                    $binary = base64_decode($b64, true);
                    if ($binary === false) {
                        throw new \RuntimeException('Base64 decode failed');
                    }
                    Storage::disk($disk)->put($path, $binary);
                    $written = true;
                } catch (\Throwable $e) {
                    Log::error('Failed to decode/store TTS base64 response', ['activity_id' => $activity->id, 'error' => $e->getMessage()]);
                    $this->error('Failed to write MP3 for activity ' . $activity->id);
                    return;
                }
            } else {
                Log::error('JSON response missing audio field', ['activity_id' => $activity->id, 'json' => $json]);
                $this->error('TTS JSON missing audio content for activity ' . $activity->id);
                return;
            }
        } else {
            // Assume binary MP3 in body
            try {
                Storage::disk($disk)->put($path, $body);
                $written = true;
            } catch (\Throwable $e) {
                Log::error('Failed to store binary MP3', ['activity_id' => $activity->id, 'error' => $e->getMessage()]);
                $this->error('Failed to write MP3 for activity ' . $activity->id);
                return;
            }
        }

        if ($written) {
            // Persist path and log
            $activity->audio_path = $path;
            $activity->save();
            $this->info('Created audio: ' . $path);
            Log::info('Created activity audio via TTS API', ['activity_id' => $activity->id, 'path' => $path]);
        }
    }
}
