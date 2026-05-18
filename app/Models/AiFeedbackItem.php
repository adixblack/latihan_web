<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiFeedbackItem extends Model
{
    use HasFactory;
    
    protected $table = 'ai_feedback_items';

    protected $fillable = [
        'ai_feedback_id',
        'rubric_criterion_id',
        'criterion_title_snapshot',
        'criterion_description_snapshot',
        'weight_snapshot',
        'max_score_snapshot',
        'sort_order_snapshot',
        'score_ai',
        'feedback_ai',
        'evidence_ai',
        'score_final',
        'feedback_final',
        'is_overridden',
        'override_note',
    ];

    protected $casts = [
        'weight_snapshot' => 'decimal:2',
        'max_score_snapshot' => 'decimal:2',
        'score_ai' => 'decimal:2',
        'score_final' => 'decimal:2',
        'evidence_ai' => 'array',
        'is_overridden' => 'boolean',
    ];

    public function aiFeedback(): BelongsTo
    {
        return $this->belongsTo(AiFeedback::class, 'ai_feedback_id');
    }

    public function rubricCriterion(): BelongsTo
    {
        return $this->belongsTo(RubricCriterion::class, 'rubric_criterion_id');
    }
}