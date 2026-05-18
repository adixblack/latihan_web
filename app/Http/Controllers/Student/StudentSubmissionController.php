<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use App\Jobs\GenerateAiReviewJob;

class StudentSubmissionController extends Controller
{
    protected function enrollmentColumns(): array
    {
        return [
            'class' => Schema::hasColumn('class_enrollments', 'class_id') ? 'class_id' : 'classroom_id',
            'user' => Schema::hasColumn('class_enrollments', 'user_id') ? 'user_id' : 'student_id',
        ];
    }

    protected function ensureStudentCanAccessAssignment(Request $request, Assignment $assignment): void
    {
        abort_unless($assignment->status === Assignment::STATUS_PUBLISHED, 404);

        $cols = $this->enrollmentColumns();

        $query = DB::table('class_enrollments')
            ->where($cols['class'], $assignment->class_id)
            ->where($cols['user'], $request->user()->id);

        if (Schema::hasColumn('class_enrollments', 'removed_at')) {
            $query->whereNull('removed_at');
        }

        if (Schema::hasColumn('class_enrollments', 'status')) {
            $query->where('status', 'active');
        }

        abort_unless($query->exists(), 403);
    }

    public function createOrEdit(Request $request, Assignment $assignment)
    {
        $this->ensureStudentCanAccessAssignment($request, $assignment);

        $assignment->load([
            'classroom:id,name,class_code',
            'rubric:id,title,scale_type,max_score',
            'rubric.criteria:id,rubric_id,title,description,weight,max_score,sort_order',
        ]);

        $submission = Submission::where('assignment_id', $assignment->id)
            ->where('user_id', $request->user()->id)
            ->first();

        // Jika sudah dipublish, arahkan langsung ke halaman hasil
        if ($submission && $submission->review_status === Submission::REVIEW_PUBLISHED) {
            return redirect()->route('student.submissions.show', $submission->id);
        }

        return Inertia::render('Student/Submissions/Form', [
            'assignment' => $assignment,
            'submission' => $submission,
        ]);
    }

    public function saveDraft(Request $request, Assignment $assignment)
    {
        $this->ensureStudentCanAccessAssignment($request, $assignment);

        $validated = $request->validate([
            'content' => ['nullable', 'string', 'max:50000'],
        ]);

        $existing = Submission::where('assignment_id', $assignment->id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (
            $existing &&
            in_array($existing->review_status, [
                Submission::REVIEW_FINALIZED,
                Submission::REVIEW_PUBLISHED,
            ], true)
        ) {
            return back()->with('error', 'Submission yang sudah difinalisasi atau dipublish tidak dapat diubah.');
        }

        Submission::updateOrCreate(
            [
                'assignment_id' => $assignment->id,
                'user_id' => $request->user()->id,
            ],
            [
                'content' => $validated['content'] ?? '',
                'status' => Submission::STATUS_DRAFT,
                'review_status' => $existing?->review_status ?? Submission::REVIEW_NOT_REVIEWED,
            ]
        );

        return back()->with('success', 'Draft berhasil disimpan.');
    }

    public function submit(Request $request, Assignment $assignment)
    {
        $this->ensureStudentCanAccessAssignment($request, $assignment);

        $validated = $request->validate([
            'content' => ['required', 'string', 'min:50', 'max:50000'],
        ]);

        $existing = Submission::where('assignment_id', $assignment->id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (
            $existing &&
            in_array($existing->review_status, [
                Submission::REVIEW_FINALIZED,
                Submission::REVIEW_PUBLISHED,
            ], true)
        ) {
            return back()->with('error', 'Submission yang sudah difinalisasi atau dipublish tidak dapat diubah.');
        }

        $isLate = $assignment->due_at ? now()->gt($assignment->due_at) : false;

        $submission = Submission::updateOrCreate(
            [
                'assignment_id' => $assignment->id,
                'user_id' => $request->user()->id,
            ],
            [
                'content' => $validated['content'],
                'status' => Submission::STATUS_SUBMITTED,
                'submitted_at' => now(),
                'is_late' => $isLate,
                'review_status' => $assignment->ai_review_enabled
                    ? Submission::REVIEW_QUEUED
                    : Submission::REVIEW_NOT_REVIEWED,
            ]
        );

        if (
            $assignment->ai_review_enabled &&
            $assignment->auto_generate_ai_review
        ) {
            GenerateAiReviewJob::dispatch($submission->id);
        }

        return redirect()
            ->route('student.assignments.show', $assignment->id)
            ->with('success', 'Tugas berhasil dikirim.');
    }

    public function show(Request $request, Submission $submission)
    {
        abort_unless((int) $submission->user_id === (int) $request->user()->id, 403);

        $submission->load([
            'assignment:id,class_id,rubric_id,title,description,due_at,max_score',
            'assignment.classroom:id,name,class_code',
        ]);

        $publishedFeedback = $submission->aiFeedbacks()
            ->whereNotNull('published_at')
            ->with([
                'items' => function ($query) {
                    $query->orderBy('sort_order_snapshot');
                },
            ])
            ->latest('id')
            ->first();

        return Inertia::render('Student/Submissions/Show', [
            'submission' => $submission,
            'publishedFeedback' => $publishedFeedback,
        ]);
    }

    public function feedbackHub(Request $request)
    {
        $submissions = Submission::with([
            'assignment:id,class_id,title,due_at,max_score',
            'assignment.classroom:id,name,class_code',
        ])
            ->where('user_id', $request->user()->id)
            ->where('review_status', Submission::REVIEW_PUBLISHED)
            ->latest('published_feedback_at')
            ->get();

        return Inertia::render('Student/Submissions/FeedbackHub', [
            'submissions' => $submissions,
        ]);
    }
}