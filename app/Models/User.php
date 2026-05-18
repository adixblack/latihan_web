<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail as MustVerifyEmailContract;
use Illuminate\Auth\MustVerifyEmail;
use App\Models\Classroom;
use App\Models\ClassEnrollment;


class User extends Authenticatable implements MustVerifyEmailContract
{
    // Gabungkan semua trait di sini
    use Notifiable, MustVerifyEmail;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'instructor_status',
        'instructor_application',
        'instructor_applied_at',
        'instructor_reviewed_at',
        'instructor_reviewed_by',
        'instructor_review_note',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'instructor_application' => 'array',
            'instructor_applied_at' => 'datetime',
            'instructor_reviewed_at' => 'datetime',
        ];
    }

    /**
     * Override method untuk mengirim notifikasi verifikasi via EmailOtpService.
     */
    public function sendEmailVerificationNotification()
    {
        // Pastikan Service ini sudah terdaftar di Service Container
        app(\App\Services\EmailOtpService::class)->send($this);
    }

    /*
    |--------------------------------------------------------------------------
    | Role Helpers
    |--------------------------------------------------------------------------
    */

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isInstructor(): bool
    {
        return $this->role === 'instructor';
    }

    public function isStudent(): bool
    {
        return $this->role === 'student';
    }

    public function isInstructorApproved(): bool
    {
        return $this->isInstructor() && $this->instructor_status === 'approved';
    }
    public function taughtClasses()
    {
        return $this->hasMany(Classroom::class, 'instructor_id');
    }

    public function classEnrollments()
    {
        return $this->hasMany(ClassEnrollment::class, 'user_id');
    }

    public function activeEnrolledClasses()
    {
        return $this->belongsToMany(Classroom::class, 'class_enrollments', 'user_id', 'class_id')
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

    public function rubrics()
    {
        return $this->hasMany(Rubric::class, ‘instructor_id’);
    }

    public function createdClasses()
    {
        return $this->hasMany(ClassRoom::class, ‘instructor_id’);
    }

    public function submissions()
    {
        return $this->hasMany(Submission::class, ‘user_id’);
    }

    public function reviewedAiFeedbacks()
    {
        return $this->hasMany(AiFeedback::class, ‘reviewed_by’);
    }


}