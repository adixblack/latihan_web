<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('classes', function (Blueprint $table) {
            $table->string('subject_name', 150)->after('name');
            $table->string('join_code', 20)->nullable()->after('class_code');
            $table->boolean('allow_self_join')->default(true)->after('join_code');
            $table->unsignedInteger('max_students')->nullable()->after('allow_self_join');
            $table->string('visibility', 20)->default('private')->after('max_students'); // private|open
            $table->timestamp('join_opens_at')->nullable()->after('visibility');
            $table->timestamp('join_closes_at')->nullable()->after('join_opens_at');
            $table->timestamp('starts_at')->nullable()->after('join_closes_at');
            $table->timestamp('ends_at')->nullable()->after('starts_at');
            $table->timestamp('archived_at')->nullable()->after('is_active');

            $table->unique('join_code');
            $table->index(['instructor_id', 'is_active'], 'classes_instructor_active_index');
            $table->index(['archived_at'], 'classes_archived_at_index');
        });

        DB::table('classes')
            ->select('id', 'join_code')
            ->orderBy('id')
            ->chunkById(100, function ($rows) {
                foreach ($rows as $row) {
                    if (!$row->join_code) {
                        DB::table('classes')
                            ->where('id', $row->id)
                            ->update([
                                'join_code' => $this->generateJoinCode(),
                            ]);
                    }
                }
            });
    }

    public function down(): void
    {
        Schema::table('classes', function (Blueprint $table) {
            $table->dropIndex('classes_instructor_active_index');
            $table->dropIndex('classes_archived_at_index');
            $table->dropUnique(['join_code']);

            $table->dropColumn([
                'subject_name',
                'join_code',
                'allow_self_join',
                'max_students',
                'visibility',
                'join_opens_at',
                'join_closes_at',
                'starts_at',
                'ends_at',
                'archived_at',
            ]);
        });
    }

    private function generateJoinCode(): string
    {
        do {
            $code = strtoupper(Str::random(8));
        } while (
            DB::table('classes')->where('join_code', $code)->exists()
        );

        return $code;
    }
};