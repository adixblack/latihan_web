<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class RubricCriterion extends Model
{
    use HasFactory;

    protected $fillable = [
        'rubric_id',
        'title',
        'description',
        'weight',
        'max_score',
        'sort_order',
    ];

    protected $casts = [
        'weight' => 'decimal:2',
    ];

    public function rubric()
    {
        return $this->belongsTo(Rubric::class);
    }
}
