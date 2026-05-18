<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // pastikan kolomnya nullable (sesuai ERD)
            // kalau kolom sudah ada dan nullable, ini aman.
            // jika tidak nullable, ubah sesuai kebutuhan Anda.
            $table->foreign('instructor_reviewed_by')
                ->references('id')->on('users')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['instructor_reviewed_by']);
        });
    }
};
