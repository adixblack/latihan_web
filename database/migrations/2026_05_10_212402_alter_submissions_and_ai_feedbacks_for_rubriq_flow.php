<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('submissions', function (Blueprint $table) {
            $table->string('status', 20)->default('draft')->change();
            $table->longText('content')->nullable()->change();
            $table->timestamp('submitted_at')->nullable()->change();
            $table->boolean('is_late')->default(false)->change();
            $table->decimal('final_score', 8, 2)->nullable()->change();
            $table->timestamp('finalized_at')->nullable()->change();
            $table->unsignedBigInteger('finalized_by')->nullable()->change();
        });

        Schema::table('ai_feedbacks', function (Blueprint $table) {
            if (!Schema::hasColumn('ai_feedbacks', 'reviewed_feedback_text')) {
                $table->longText('reviewed_feedback_text')->nullable()->after('feedback_text');
            }

            if (!Schema::hasColumn('ai_feedbacks', 'reviewed_rubric_scores')) {
                $table->longText('reviewed_rubric_scores')->nullable()->after('rubric_scores');
            }

            if (!Schema::hasColumn('ai_feedbacks', 'reviewed_overall_score')) {
                $table->decimal('reviewed_overall_score', 8, 2)->nullable()->after('overall_score');
            }

            if (!Schema::hasColumn('ai_feedbacks', 'published_at')) {
                $table->timestamp('published_at')->nullable()->after('reviewed_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('ai_feedbacks', function (Blueprint $table) {
            $columnsToDrop = [];

            if (Schema::hasColumn('ai_feedbacks', 'reviewed_feedback_text')) {
                $columnsToDrop[] = 'reviewed_feedback_text';
            }

            if (Schema::hasColumn('ai_feedbacks', 'reviewed_rubric_scores')) {
                $columnsToDrop[] = 'reviewed_rubric_scores';
            }

            if (Schema::hasColumn('ai_feedbacks', 'reviewed_overall_score')) {
                $columnsToDrop[] = 'reviewed_overall_score';
            }

            if (Schema::hasColumn('ai_feedbacks', 'published_at')) {
                $columnsToDrop[] = 'published_at';
            }

            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }
};
