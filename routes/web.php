<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\InstructorApplicationsController;
use App\Http\Controllers\Admin\InstructorApplicationsController as AdminInstructorApplicationsController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\UserController;

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Instructor\InstructorDashboardController;
use App\Http\Controllers\Student\StudentDashboardController;

use App\Http\Controllers\Instructor\ClassroomController;
use App\Http\Controllers\Instructor\ClassroomEnrollmentController;
use App\Http\Controllers\Student\ClassJoinController;

use App\Http\Controllers\Instructor\RubricController;
use App\Http\Controllers\Instructor\AssignmentController;
use App\Http\Controllers\Instructor\SubmissionReviewController;
use App\Http\Controllers\Student\StudentAssignmentController;
use App\Http\Controllers\Student\StudentSubmissionController;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

/*
|--------------------------------------------------------------------------
| Authenticated + Verified
|--------------------------------------------------------------------------
| Hanya smart redirect umum.
| Dashboard instructor/student spesifik diletakkan di group role masing-masing
| agar tidak dobel route.
*/
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');
});

/*
|--------------------------------------------------------------------------
| Profile
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

/*
|--------------------------------------------------------------------------
| Instructor Application
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/instructor/apply', [InstructorApplicationsController::class, 'create'])
        ->name('instructor.apply');

    Route::post('/instructor/apply', [InstructorApplicationsController::class, 'store'])
        ->name('instructor.apply.store');
});

/*
|--------------------------------------------------------------------------
| Admin Area
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified', 'role:admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])
            ->name('dashboard');

        Route::get('/instructor-applications', [AdminInstructorApplicationsController::class, 'index'])
            ->name('instructor_applications.index');

        Route::post('/instructor-applications/{user}/approve', [AdminInstructorApplicationsController::class, 'approve'])
            ->name('instructor_applications.approve');

        Route::post('/instructor-applications/{user}/reject', [AdminInstructorApplicationsController::class, 'reject'])
            ->name('instructor_applications.reject');

        Route::get('/users', [UserController::class, 'index'])
            ->name('users.index');
    });

/*
|--------------------------------------------------------------------------
| Instructor Area
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified', 'role:instructor'])
    ->prefix('instructor')
    ->name('instructor.')
    ->group(function () {
        Route::get('/dashboard', [InstructorDashboardController::class, 'index'])
            ->name('dashboard');

        /*
        |--------------------------------------------------------------------------
        | Classrooms
        |--------------------------------------------------------------------------
        */
        Route::get('/classes', [ClassroomController::class, 'index'])->name('classes.index');
        Route::get('/classes/create', [ClassroomController::class, 'create'])->name('classes.create');
        Route::post('/classes', [ClassroomController::class, 'store'])->name('classes.store');
        Route::get('/classes/{classroom}', [ClassroomController::class, 'show'])->name('classes.show');
        Route::get('/classes/{classroom}/edit', [ClassroomController::class, 'edit'])->name('classes.edit');
        Route::put('/classes/{classroom}', [ClassroomController::class, 'update'])->name('classes.update');

        Route::post('/classes/{classroom}/regenerate-join-code', [ClassroomController::class, 'regenerateJoinCode'])
            ->name('classes.regenerate_join_code');

        Route::post('/classes/{classroom}/archive', [ClassroomController::class, 'archive'])
            ->name('classes.archive');

        Route::post('/classes/{classroom}/unarchive', [ClassroomController::class, 'unarchive'])
            ->name('classes.unarchive');

        Route::post('/classes/{classroom}/students/{student}/remove', [ClassroomEnrollmentController::class, 'remove'])
            ->name('classes.students.remove');

        Route::post('/classes/{classroom}/students/{student}/restore', [ClassroomEnrollmentController::class, 'restore'])
            ->name('classes.students.restore');

        /*
        |--------------------------------------------------------------------------
        | Rubrics
        |--------------------------------------------------------------------------
        */
        Route::get('/rubrics', [RubricController::class, 'index'])->name('rubrics.index');
        Route::get('/rubrics/create', [RubricController::class, 'create'])->name('rubrics.create');
        Route::post('/rubrics', [RubricController::class, 'store'])->name('rubrics.store');
        Route::get('/rubrics/{rubric}/edit', [RubricController::class, 'edit'])->name('rubrics.edit');
        Route::put('/rubrics/{rubric}', [RubricController::class, 'update'])->name('rubrics.update');
        Route::delete('/rubrics/{rubric}', [RubricController::class, 'destroy'])->name('rubrics.destroy');

        /*
        |--------------------------------------------------------------------------
        | Assignments
        |--------------------------------------------------------------------------
        */
        Route::get('/classes/{classroom}/assignments', [AssignmentController::class, 'index'])
            ->name('classes.assignments.index');

        Route::get('/classes/{classroom}/assignments/create', [AssignmentController::class, 'create'])
            ->name('classes.assignments.create');

        Route::post('/classes/{classroom}/assignments', [AssignmentController::class, 'store'])
            ->name('classes.assignments.store');

        Route::get('/assignments/{assignment}', [AssignmentController::class, 'show'])
            ->name('assignments.show');

        Route::get('/assignments/{assignment}/edit', [AssignmentController::class, 'edit'])
            ->name('assignments.edit');

        Route::put('/assignments/{assignment}', [AssignmentController::class, 'update'])
            ->name('assignments.update');

        Route::post('/assignments/{assignment}/publish', [AssignmentController::class, 'publish'])
            ->name('assignments.publish');

        /*
        |--------------------------------------------------------------------------
        | Submission Review
        |--------------------------------------------------------------------------
        */
        Route::get('/assignments/{assignment}/submissions', [SubmissionReviewController::class, 'index'])
            ->name('assignments.submissions.index');

        Route::get('/submissions/{submission}', [SubmissionReviewController::class, 'show'])
            ->name('submissions.show');

        Route::post('/submissions/{submission}/review/regenerate', [SubmissionReviewController::class, 'regenerate'])
            ->name('submissions.review.regenerate');

        Route::patch('/submissions/{submission}/review/{aiFeedback}/draft', [SubmissionReviewController::class, 'saveDraft'])
            ->name('submissions.review.saveDraft');

        Route::patch('/submissions/{submission}/review/{aiFeedback}/finalize', [SubmissionReviewController::class, 'finalize'])
            ->name('submissions.review.finalize');

        Route::patch('/submissions/{submission}/review/{aiFeedback}/publish', [SubmissionReviewController::class, 'publish'])
            ->name('submissions.review.publish');

        Route::get('/reviews', [SubmissionReviewController::class, 'hub'])
            ->name('reviews.hub');

    });

/*
|--------------------------------------------------------------------------
| Student Area
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified', 'role:student'])
    ->prefix('student')
    ->name('student.')
    ->group(function () {
        Route::get('/dashboard', [StudentDashboardController::class, 'index'])
            ->name('dashboard');

        /*
        |--------------------------------------------------------------------------
        | Join Class
        |--------------------------------------------------------------------------
        */
        Route::get('/classes/join', [ClassJoinController::class, 'create'])
            ->name('classes.join');

        Route::post('/classes/join', [ClassJoinController::class, 'store'])
            ->name('classes.join.store');

        /*
        |--------------------------------------------------------------------------
        | Assignments
        |--------------------------------------------------------------------------
        */
        Route::get('/classes/{classroom}/assignments', [StudentAssignmentController::class, 'index'])
            ->name('classes.assignments.index');

        Route::get('/assignments/{assignment}', [StudentAssignmentController::class, 'show'])
            ->name('assignments.show');

        /*
        |--------------------------------------------------------------------------
        | Submission
        |--------------------------------------------------------------------------
        */
        Route::get('/assignments/{assignment}/submission', [StudentSubmissionController::class, 'createOrEdit'])
            ->name('assignments.submission');

        Route::post('/assignments/{assignment}/submission/save-draft', [StudentSubmissionController::class, 'saveDraft'])
            ->name('assignments.submission.saveDraft');

        Route::post('/assignments/{assignment}/submission/submit', [StudentSubmissionController::class, 'submit'])
            ->name('assignments.submission.submit');

        Route::get('/submissions/{submission}', [StudentSubmissionController::class, 'show'])
            ->name('submissions.show');

        /*
        |--------------------------------------------------------------------------
        | Feedback
        |--------------------------------------------------------------------------
        */
        Route::get('/feedback', [StudentSubmissionController::class, 'feedbackHub'])
            ->name('feedback.hub');

    });

require __DIR__ . '/auth.php';