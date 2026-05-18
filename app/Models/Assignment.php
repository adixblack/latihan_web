<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Assignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'class_id',
        'rubric_id',
        'title',
        'description',
        'status',
        'max_score',
        'published_at',
        'due_at',
        'ai_review_enabled',
        'ai_model',
        'ai_prompt_version',
        'auto_generate_ai_review',
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'due_at' => 'datetime',
        'max_score' => 'decimal:2',
        'ai_review_enabled' => 'boolean',
        'auto_generate_ai_review' => 'boolean',
    ];

    public const STATUS_DRAFT = 'draft';
    public const STATUS_PUBLISHED = 'published';
    public const STATUS_CLOSED = 'closed';
    public const STATUS_ARCHIVED = 'archived';

    public function classroom(): BelongsTo
    {
        return $this->belongsTo(Classroom::class, 'class_id');
    }

    public function rubric(): BelongsTo
    {
        return $this->belongsTo(Rubric::class, 'rubric_id');
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(Submission::class, 'assignment_id');
    }

    public function aiFeedbacks(): HasManyThrough
    {
        return $this->hasManyThrough(
            AiFeedback::class,
            Submission::class,
            'assignment_id', // FK di submissions
            'submission_id', // FK di ai_feedbacks
            'id',            // PK di assignments
            'id'             // PK di submissions
        );
    }
}