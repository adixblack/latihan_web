<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Classroom extends Model
{
    protected $table = 'classes';

    protected $fillable = [
        'instructor_id',
        'name',
        'subject_name',
        'description',
        'class_code',
        'join_code',
        'allow_self_join',
        'max_students',
        'visibility',
        'join_opens_at',
        'join_closes_at',
        'starts_at',
        'ends_at',
        'is_active',
        'archived_at',
    ];

    protected $casts = [
        'allow_self_join' => 'boolean',
        'is_active' => 'boolean',
        'join_opens_at' => 'datetime',
        'join_closes_at' => 'datetime',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'archived_at' => 'datetime',
    ];

    public function instructor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(ClassEnrollment::class, 'class_id');
    }

    public function activeEnrollments(): HasMany
    {
        return $this->hasMany(ClassEnrollment::class, 'class_id')
            ->where('status', 'active');
    }

    public function removedEnrollments(): HasMany
    {
        return $this->hasMany(ClassEnrollment::class, 'class_id')
            ->where('status', 'removed');
    }

    public function students(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'class_enrollments', 'class_id', 'user_id')
            ->withPivot([
                'status',
                'joined_at',
                'joined_via',
                'removed_at',
                'removed_by',
                'removed_reason',
            ])
            ->withTimestamps()
            ->wherePivot('status', 'active');
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(Assignment::class, 'class_id');
    }

    public function isJoinAvailable(): bool
    {
        if (!$this->is_active || $this->archived_at !== null || !$this->allow_self_join) {
            return false;
        }

        $now = now();

        if ($this->join_opens_at && $now->lt($this->join_opens_at)) {
            return false;
        }

        if ($this->join_closes_at && $now->gt($this->join_closes_at)) {
            return false;
        }

        return true;
    }

    public function hasReachedCapacity(): bool
    {
        if (!$this->max_students) {
            return false;
        }

        return $this->activeEnrollments()->count() >= $this->max_students;
    }
}
