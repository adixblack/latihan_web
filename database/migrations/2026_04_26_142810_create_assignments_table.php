<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('assignments', function (Blueprint $table) {
            $table->id();

            $table->foreignId('class_id')
                ->constrained('classes')
                ->cascadeOnDelete();

            $table->foreignId('rubric_id')
                ->nullable()
                ->constrained('rubrics')
                ->nullOnDelete();

            $table->string('title');
            $table->longText('description')->nullable();

            // "draft" | "published" | "closed"
            $table->string('status', 20)->default('draft');

            $table->unsignedInteger('max_score')->default(100);

            $table->timestamp('published_at')->nullable();
            $table->timestamp('due_at')->nullable();

            $table->timestamps();

            $table->index(['class_id', 'status']);
            $table->index(['due_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assignments');
    }
};
