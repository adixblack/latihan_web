<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailVerificationToken extends Model
{
    protected $fillable = [
        'user_id',
        'email',
        'token_hash',
        'attempts',
        'expires_at',
        'sent_at',
        'consumed_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'sent_at' => 'datetime',
        'consumed_at' => 'datetime',
    ];
}
