<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('ai_feedback_items', function (Blueprint $table) {
            $table->id();

            $table->foreignId('ai_feedback_id')->constrained('ai_feedbacks')->cascadeOnDelete();
            $table->foreignId('rubric_criterion_id')->constrained('rubric_criteria')->restrictOnDelete();

            $table->string('criterion_title_snapshot');
            $table->text('criterion_description_snapshot')->nullable();
            $table->decimal('weight_snapshot', 6, 2)->default(0);
            $table->decimal('max_score_snapshot', 8, 2)->default(0);
            $table->unsignedSmallInteger('sort_order_snapshot')->nullable();

            $table->decimal('score_ai', 8, 2)->nullable();
            $table->longText('feedback_ai')->nullable();
            $table->longText('evidence_ai')->nullable();

            $table->decimal('score_final', 8, 2)->nullable();
            $table->longText('feedback_final')->nullable();

            $table->boolean('is_overridden')->default(false);
            $table->text('override_note')->nullable();

            $table->timestamps();

            $table->unique(['ai_feedback_id', 'rubric_criterion_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_feedback_items');
    }
};
