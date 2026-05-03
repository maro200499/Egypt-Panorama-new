<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasColumn('activities', 'audio_path')) {
            Schema::table('activities', function (Blueprint $table) {
                $table->string('audio_path')->nullable()->after('description')->comment('Relative path on storage disk to generated MP3');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('activities', 'audio_path')) {
            Schema::table('activities', function (Blueprint $table) {
                $table->dropColumn('audio_path');
            });
        }
    }
};
