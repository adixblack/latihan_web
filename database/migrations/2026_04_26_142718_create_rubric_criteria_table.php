<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('rubric_criteria', function (Blueprint $table) {
            $table->id();

            $table->foreignId('rubric_id')
                ->constrained('rubrics')
                ->cascadeOnDelete();

            $table->string('title');
            $table->text('description')->nullable();

            // bobot tiap kriteria (opsional)
            $table->decimal('weight', 6, 2)->default(1.00);

            $table->unsignedInteger('max_score')->default(100);

            // urutan tampilan
            $table->unsignedSmallInteger('sort_order')->default(1);

            $table->timestamps();

            $table->index(['rubric_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rubric_criteria');
    }
};
