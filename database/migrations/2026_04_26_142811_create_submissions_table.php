<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('submissions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('assignment_id')
                ->constrained('assignments')
                ->cascadeOnDelete();

            // student/user yang submit
            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            // isi submission (teks/URL/JSON) — nanti bisa Anda kembangkan
            $table->longText('content')->nullable();

            // "draft" | "submitted"
            $table->string('status', 20)->default('submitted');

            $table->timestamp('submitted_at')->nullable();

            // ditandai ketika submit (lebih cepat untuk dashboard)
            $table->boolean('is_late')->default(false);

            // nilai final setelah instruktur publish/finalize
            $table->decimal('final_score', 8, 2)->nullable();
            $table->timestamp('finalized_at')->nullable();
            $table->foreignId('finalized_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();

            // 1 mahasiswa 1 submission per tugas (MVP). Kalau mau multi-attempt nanti kita ubah.
            $table->unique(['assignment_id', 'user_id']);
            $table->index(['user_id', 'submitted_at']);
            $table->index(['assignment_id', 'submitted_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('submissions');
    }
};
