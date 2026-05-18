<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('ai_feedbacks', function (Blueprint $table) {
            $table->unsignedInteger('attempt_no')->default(1)->after('submission_id');

            $table->longText('final_feedback_text')->nullable()->after('feedback_text');
            $table->decimal('final_overall_score', 8, 2)->nullable()->after('overall_score');

            $table->unsignedBigInteger('finalized_by')->nullable()->after('reviewed_by');
            $table->timestamp('finalized_at')->nullable()->after('reviewed_at');

            $table->timestamp('processing_started_at')->nullable()->after('generated_at');
            $table->timestamp('processing_finished_at')->nullable()->after('processing_started_at');

            $table->text('error_message')->nullable()->after('status');

            $table->longText('strengths')->nullable()->after('raw_response');
            $table->longText('weaknesses')->nullable()->after('strengths');
            $table->longText('suggestions')->nullable()->after('weaknesses');
        });
    }

    public function down(): void
    {
        Schema::table('ai_feedbacks', function (Blueprint $table) {
            $table->dropColumn([
                'attempt_no',
                'final_feedback_text',
                'final_overall_score',
                'finalized_by',
                'finalized_at',
                'processing_started_at',
                'processing_finished_at',
                'error_message',
                'strengths',
                'weaknesses',
                'suggestions',
            ]);
        });
    }
};