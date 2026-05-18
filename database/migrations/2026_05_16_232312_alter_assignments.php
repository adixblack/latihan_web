<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('assignments', function (Blueprint $table) {
            $table->boolean('ai_review_enabled')->default(false)->after('status');
            $table->string('ai_model', 80)->nullable()->after('ai_review_enabled');
            $table->string('ai_prompt_version', 40)->nullable()->after('ai_model');
            $table->boolean('auto_generate_ai_review')->default(true)->after('ai_prompt_version');
        });
    }

    public function down(): void
    {
        Schema::table('assignments', function (Blueprint $table) {
            $table->dropColumn([
                'ai_review_enabled',
                'ai_model',
                'ai_prompt_version',
                'auto_generate_ai_review',
            ]);
        });
    }
};