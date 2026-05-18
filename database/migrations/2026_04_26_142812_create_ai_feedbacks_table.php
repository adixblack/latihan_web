<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('ai_feedbacks', function (Blueprint $table) {
            $table->id();

            $table->foreignId('submission_id')
                ->constrained('submissions')
                ->cascadeOnDelete();

            // metadata AI
            $table->string('ai_model', 80)->nullable();        // contoh: gpt-4.1-mini
            $table->string('prompt_version', 40)->nullable();  // versi prompt
            $table->timestamp('generated_at')->nullable();

            // hasil AI (bebas: text + json)
            $table->longText('feedback_text')->nullable();
            $table->json('rubric_scores')->nullable();   // per kriteria
            $table->decimal('overall_score', 8, 2)->nullable();

            // raw response (opsional)
            $table->longText('raw_response')->nullable();

            // status human-in-the-loop
            // "draft" | "published"
            $table->string('status', 20)->default('draft');

            // review/publish oleh instruktur
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('review_note')->nullable();

            $table->timestamp('published_at')->nullable();

            $table->timestamps();

            $table->index(['submission_id', 'status']);
            $table->index(['status', 'published_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_feedbacks');
    }
};
