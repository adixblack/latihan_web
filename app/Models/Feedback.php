<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Feedback extends Model
{
    use HasFactory;

    protected $table = 'ai_feedbacks';

    protected $fillable = [
        'submission_id',
        'ai_model',
        'prompt_version',
        'generated_at',
        'feedback_text',
        'reviewed_feedback_text',
        'rubric_scores',
        'reviewed_rubric_scores',
        'overall_score',
        'reviewed_overall_score',
        'raw_response',
        'status',
        'reviewed_by',
        'reviewed_at',
        'review_note',
        'published_at',
    ];

    protected $casts = [
        'generated_at' => 'datetime',
        'reviewed_at' => 'datetime',
        'published_at' => 'datetime',
        'rubric_scores' => 'array',
        'reviewed_rubric_scores' => 'array',
        'overall_score' => 'decimal:2',
        'reviewed_overall_score' => 'decimal:2',
    ];

    public const STATUS_QUEUED = 'queued';
    public const STATUS_GENERATED = 'generated';
    public const STATUS_REVIEWED = 'reviewed';
    public const STATUS_PUBLISHED = 'published';
    public const STATUS_FAILED = 'failed';

    public function submission(): BelongsTo
    {
        return $this->belongsTo(Submission::class, 'submission_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
