<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AiFeedback extends Model
{
    use HasFactory;

    protected $table = 'ai_feedbacks';

    protected $fillable = [
        'submission_id',
        'attempt_no',
        'ai_model',
        'prompt_version',
        'generated_at',
        'processing_started_at',
        'processing_finished_at',
        'feedback_text',
        'final_feedback_text',
        'rubric_scores',
        'overall_score',
        'final_overall_score',
        'raw_response',
        'strengths',
        'weaknesses',
        'suggestions',
        'status',
        'error_message',
        'reviewed_by',
        'reviewed_at',
        'review_note',
        'finalized_by',
        'finalized_at',
        'published_at',
    ];

    protected $casts = [
        'generated_at' => 'datetime',
        'processing_started_at' => 'datetime',
        'processing_finished_at' => 'datetime',
        'reviewed_at' => 'datetime',
        'finalized_at' => 'datetime',
        'published_at' => 'datetime',
        'overall_score' => 'decimal:2',
        'final_overall_score' => 'decimal:2',
        'rubric_scores' => 'array',
        'strengths' => 'array',
        'weaknesses' => 'array',
        'suggestions' => 'array',
    ];

    public function submission(): BelongsTo
    {
        return $this->belongsTo(Submission::class, 'submission_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(AiFeedbackItem::class, 'ai_feedback_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function finalizer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'finalized_by');
    }
}