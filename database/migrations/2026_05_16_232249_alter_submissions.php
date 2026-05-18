<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('submissions', function (Blueprint $table) {
            $table->string('review_status', 20)->default('not_reviewed')->after('status');
            $table->timestamp('published_feedback_at')->nullable()->after('finalized_at');
        });
    }

    public function down(): void
    {
        Schema::table('submissions', function (Blueprint $table) {
            $table->dropColumn([
                'review_status',
                'published_feedback_at',
            ]);
        });
    }
};