<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('rubrics', function (Blueprint $table) {
            $table->id();

            $table->foreignId('instructor_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->string('title');
            $table->text('description')->nullable();

            // contoh: "points", "levels", dll (bebas)
            $table->string('scale_type', 30)->default('points');

            $table->unsignedInteger('max_score')->default(100);

            // kalau Anda ingin rubric reusable sebagai template
            $table->boolean('is_template')->default(true);

            $table->timestamps();

            $table->index(['instructor_id', 'is_template']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rubrics');
    }
};

