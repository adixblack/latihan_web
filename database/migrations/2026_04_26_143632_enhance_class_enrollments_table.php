<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('class_enrollments', function (Blueprint $table) {
            $table->string('status', 20)->default('active')->after('user_id'); // active|removed
            $table->string('joined_via', 20)->nullable()->after('status'); // join_code|manual|restore
            $table->timestamp('removed_at')->nullable()->after('joined_at');
            $table->foreignId('removed_by')->nullable()->after('removed_at')->constrained('users')->nullOnDelete();
            $table->text('removed_reason')->nullable()->after('removed_by');

            $table->unique(['class_id', 'user_id'], 'class_enrollments_class_user_unique');
            $table->index(['class_id', 'status'], 'class_enrollments_class_status_index');
        });
    }

    public function down(): void
    {
        Schema::table('class_enrollments', function (Blueprint $table) {
            $table->dropIndex('class_enrollments_class_status_index');
            $table->dropUnique('class_enrollments_class_user_unique');
            $table->dropConstrainedForeignId('removed_by');

            $table->dropColumn([
                'status',
                'joined_via',
                'removed_at',
                'removed_reason',
            ]);
        });
    }
};