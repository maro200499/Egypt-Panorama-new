<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Activity;
use App\Services\ActivityAudioGenerator;
use Illuminate\Support\Facades\Log;

/**
 * Artisan command to generate activity audio files.
 *
 * Usage examples:
 *  php artisan activities:generate-audio           # process up to --limit activities (default ordered by rating desc)
 *  php artisan activities:generate-audio --id=44   # process a single activity id
 *  php artisan activities:generate-audio --limit=1 --batch=1
 */
class GenerateActivityAudio extends Command
{
    protected $signature = 'activities:generate-audio
                            {--id= : Specific activity id to process}
                            {--limit=10 : Max activities to process when not using --id}
                            {--batch=5 : Process in batches (chunk size)}
                            {--short-threshold=3 : Ratings below this use a shorter audio form}
                            {--ffmpeg=ffmpeg : FFmpeg binary path}
                            {--disk=public : Storage disk to write files to}';

    protected $description = 'Generate MP3 audio descriptions for activities (WAV via TTS -> FFmpeg MP3)';

    public function handle()
    {
        $id = $this->option('id');
        $limit = (int) $this->option('limit');
        $batch = (int) $this->option('batch');
        $ffmpeg = $this->option('ffmpeg') ?: 'ffmpeg';
        $disk = $this->option('disk') ?: 'public';
        $shortThreshold = (int) $this->option('short-threshold');

        $generator = new ActivityAudioGenerator($ffmpeg, $disk);

        if ($id) {
            $activity = Activity::find($id);
            if (!$activity) {
                $this->error('Activity not found: ' . $id);
                return 1;
            }
            $this->info('Processing activity ' . $id);
            $result = $generator->generateForActivity($activity, ['short_threshold' => $shortThreshold]);
            $this->logResult($activity->id, $result);
            return 0;
        }

        $query = Activity::query()
            ->whereNull('audio_path')
            ->orderByDesc('rating')
            ->limit($limit);

        $this->info('Processing up to ' . $limit . ' activities (batch size ' . $batch . ')');

        // Use chunk to avoid loading everything into memory
        $count = 0;
        $query->chunk($batch, function ($activities) use (&$count, $generator, $shortThreshold) {
            foreach ($activities as $activity) {
                $this->info(sprintf('[%d] %s (rating: %s)', $activity->id, $activity->name, $activity->rating));
                try {
                    $result = $generator->generateForActivity($activity, ['short_threshold' => $shortThreshold]);
                    $this->logResult($activity->id, $result);
                } catch (\Throwable $e) {
                    Log::error('Unexpected error while processing activity '.$activity->id, ['error' => $e->getMessage()]);
                    $this->error('Failed: '.$e->getMessage());
                }
                $count++;
            }
        });

        $this->info('Done. Processed ' . $count . ' activities.');
        return 0;
    }

    protected function logResult($activityId, array $result): void
    {
        if ($result['status'] === 'created') {
            Log::info('Activity audio created', ['activity_id' => $activityId, 'path' => $result['path']]);
            $this->info('Created: ' . ($result['path'] ?? '')); 
        } elseif ($result['status'] === 'skipped') {
            Log::info('Activity audio skipped', ['activity_id' => $activityId, 'reason' => $result['reason'] ?? '']);
            $this->info('Skipped: ' . ($result['reason'] ?? 'already has audio'));
        } else {
            Log::error('Activity audio failed', ['activity_id' => $activityId, 'result' => $result]);
            $this->error('Failed: ' . ($result['error'] ?? json_encode($result)));
        }
    }
}
