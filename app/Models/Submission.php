<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Submission extends Model
{
    use HasFactory;

    protected $fillable = [
        'assignment_id',
        'user_id',
        'content',
        'status',
        'review_status',
        'submitted_at',
        'is_late',
        'final_score',
        'finalized_at',
        'published_feedback_at',
        'finalized_by',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'finalized_at' => 'datetime',
        'published_feedback_at' => 'datetime',
        'is_late' => 'boolean',
        'final_score' => 'decimal:2',
    ];

    // Status submission
    public const STATUS_DRAFT = 'draft';
    public const STATUS_SUBMITTED = 'submitted';

    // Status review
    public const REVIEW_NOT_REVIEWED = 'not_reviewed';
    public const REVIEW_QUEUED = 'queued';
    public const REVIEW_PROCESSING = 'processing';
    public const REVIEW_AI_READY = 'ai_ready';
    public const REVIEW_INSTRUCTOR_REVIEW = 'instructor_review';
    public const REVIEW_FINALIZED = 'finalized';
    public const REVIEW_PUBLISHED = 'published';
    public const REVIEW_FAILED = 'failed';

    public function assignment(): BelongsTo
    {
        return $this->belongsTo(Assignment::class, 'assignment_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function finalizer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'finalized_by');
    }

    public function aiFeedbacks(): HasMany
    {
        return $this->hasMany(AiFeedback::class, 'submission_id');
    }

    public function latestAiFeedback(): HasOne
    {
        return $this->hasOne(AiFeedback::class, 'submission_id')->latestOfMany();
    }

    // Opsional: alias kompatibilitas jika ada kode lama yang memanggil aiFeedback
    public function aiFeedback(): HasOne
    {
        return $this->hasOne(AiFeedback::class, 'submission_id')->latestOfMany();
    }
}