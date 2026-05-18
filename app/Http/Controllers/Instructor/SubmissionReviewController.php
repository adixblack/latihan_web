<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Jobs\GenerateAiReviewJob;
use App\Models\AiFeedback;
use App\Models\Assignment;
use App\Models\Submission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SubmissionReviewController extends Controller
{
    public function index(Assignment $assignment): Response
    {
        $assignment->load([
            'classroom',
            'rubric',
            'submissions' => function ($query) {
                $query->with([
                    'student:id,name,email',
                    'latestAiFeedback' => function ($feedbackQuery) {
                        $feedbackQuery->select([
                            'ai_feedbacks.id',
                            'ai_feedbacks.submission_id',
                            'ai_feedbacks.attempt_no',
                            'ai_feedbacks.overall_score',
                            'ai_feedbacks.final_overall_score',
                            'ai_feedbacks.status',
                            'ai_feedbacks.generated_at',
                            'ai_feedbacks.finalized_at',
                            'ai_feedbacks.published_at',
                        ]);
                    },
                ])->latest('submitted_at');
            },
        ]);

        return Inertia::render('Instructor/Submissions/Index', [
            'assignment' => $assignment,
            'submissions' => $assignment->submissions,
        ]);
    }

    public function show(Submission $submission): Response
    {
        $submission->load([
            'student:id,name,email',
            'assignment.classroom',
            'assignment.rubric.criteria' => function ($query) {
                $query->orderBy('sort_order');
            },
            'latestAiFeedback' => function ($query) {
                $query->with([
                    'items' => function ($itemQuery) {
                        $itemQuery->orderBy('sort_order_snapshot');
                    },
                    'reviewer:id,name',
                    'finalizer:id,name',
                ]);
            },
            'aiFeedbacks' => function ($query) {
                $query->with([
                    'reviewer:id,name',
                    'finalizer:id,name',
                ])->latest('id');
            },
        ]);

        return Inertia::render('Instructor/Submissions/Review', [
            'submission' => $submission,
            'aiFeedback' => $submission->latestAiFeedback,
            'aiFeedbackHistory' => $submission->aiFeedbacks,
        ]);
    }

    public function regenerate(Submission $submission): RedirectResponse
    {
        $assignment = $submission->assignment;

        if (!$assignment || !$assignment->ai_review_enabled) {
            return back()->with('error', 'AI review belum diaktifkan untuk tugas ini.');
        }

        $submission->update([
            'review_status' => Submission::REVIEW_QUEUED,
        ]);

        GenerateAiReviewJob::dispatch($submission->id);

        return back()->with('success', 'Review AI dimasukkan ke antrean.');
    }

    public function saveDraft(Request $request, Submission $submission, AiFeedback $aiFeedback): RedirectResponse
    {
        $this->ensureFeedbackBelongsToSubmission($submission, $aiFeedback);

        $validated = $request->validate([
            'overall_feedback' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.id' => ['required', 'integer', 'exists:ai_feedback_items,id'],
            'items.*.score_final' => ['nullable', 'numeric', 'min:0'],
            'items.*.feedback_final' => ['nullable', 'string'],
            'items.*.override_note' => ['nullable', 'string'],
        ]);

        DB::transaction(function () use ($validated, $request, $submission, $aiFeedback) {
            foreach ($validated['items'] as $itemData) {
                $item = $aiFeedback->items()->findOrFail($itemData['id']);

                $scoreFinal = $itemData['score_final'] ?? $item->score_ai;
                $feedbackFinal = $itemData['feedback_final'] ?? $item->feedback_ai;

                $normalizedScore = min((float) $scoreFinal, (float) $item->max_score_snapshot);

                $isOverridden =
                    (float) $normalizedScore !== (float) ($item->score_ai ?? 0) ||
                    (string) $feedbackFinal !== (string) ($item->feedback_ai ?? '');

                $item->update([
                    'score_final' => $normalizedScore,
                    'feedback_final' => $feedbackFinal,
                    'is_overridden' => $isOverridden,
                    'override_note' => $itemData['override_note'] ?? null,
                ]);
            }

            $aiFeedback->update([
                'reviewed_by' => $request->user()->id,
                'reviewed_at' => now(),
                'review_note' => 'Draft review updated by instructor.',
                'final_feedback_text' => $validated['overall_feedback'] ?? $aiFeedback->final_feedback_text ?? $aiFeedback->feedback_text,
                'status' => 'reviewed',
            ]);

            $submission->update([
                'review_status' => Submission::REVIEW_INSTRUCTOR_REVIEW,
            ]);
        });

        return back()->with('success', 'Draft review berhasil disimpan.');
    }

    public function finalize(Request $request, Submission $submission, AiFeedback $aiFeedback): RedirectResponse
    {
        $this->ensureFeedbackBelongsToSubmission($submission, $aiFeedback);

        $validated = $request->validate([
            'final_feedback_text' => ['nullable', 'string'],
        ]);

        DB::transaction(function () use ($validated, $request, $submission, $aiFeedback) {
            $items = $aiFeedback->items()->get();

            foreach ($items as $item) {
                if ($item->score_final === null) {
                    $item->update([
                        'score_final' => $item->score_ai,
                    ]);
                }

                if ($item->feedback_final === null) {
                    $item->update([
                        'feedback_final' => $item->feedback_ai,
                    ]);
                }
            }

            $items = $aiFeedback->items()->get();

            $total = $items->sum(function ($item) {
                return (float) ($item->score_final ?? 0);
            });

            $finalFeedbackText = $validated['final_feedback_text']
                ?? $aiFeedback->final_feedback_text
                ?? $aiFeedback->feedback_text;

            $aiFeedback->update([
                'final_overall_score' => $total,
                'final_feedback_text' => $finalFeedbackText,
                'finalized_by' => $request->user()->id,
                'finalized_at' => now(),
                'status' => 'finalized',
            ]);

            $submission->update([
                'final_score' => $total,
                'finalized_by' => $request->user()->id,
                'finalized_at' => now(),
                'review_status' => Submission::REVIEW_FINALIZED,
            ]);
        });

        return back()->with('success', 'Review berhasil difinalisasi.');
    }

    public function publish(Submission $submission, AiFeedback $aiFeedback): RedirectResponse
    {
        $this->ensureFeedbackBelongsToSubmission($submission, $aiFeedback);

        if (!$aiFeedback->finalized_at) {
            return back()->with('error', 'Review belum difinalisasi.');
        }

        DB::transaction(function () use ($submission, $aiFeedback) {
            $aiFeedback->update([
                'published_at' => now(),
                'status' => 'published',
            ]);

            $submission->update([
                'review_status' => Submission::REVIEW_PUBLISHED,
                'published_feedback_at' => now(),
            ]);
        });

        return back()->with('success', 'Hasil review berhasil dipublikasikan ke student.');
    }

    protected function ensureFeedbackBelongsToSubmission(Submission $submission, AiFeedback $aiFeedback): void
    {
        abort_unless((int) $aiFeedback->submission_id === (int) $submission->id, 404);
    }

    public function hub(): \Inertia\Response
    {
        $submissions = \App\Models\Submission::with([
            'student:id,name,email',
            'assignment:id,title,class_id',
            'assignment.classroom:id,name',
            'latestAiFeedback' => function ($feedbackQuery) {
                $feedbackQuery->select([
                    'ai_feedbacks.id',
                    'ai_feedbacks.submission_id',
                    'ai_feedbacks.attempt_no',
                    'ai_feedbacks.overall_score',
                    'ai_feedbacks.final_overall_score',
                    'ai_feedbacks.status',
                    'ai_feedbacks.generated_at',
                    'ai_feedbacks.finalized_at',
                    'ai_feedbacks.published_at',
                ]);
            },
        ])
            ->whereIn('review_status', [
                \App\Models\Submission::REVIEW_AI_READY,
                \App\Models\Submission::REVIEW_INSTRUCTOR_REVIEW,
                \App\Models\Submission::REVIEW_FINALIZED,
                \App\Models\Submission::REVIEW_PUBLISHED,
            ])
            ->latest('submitted_at')
            ->get();

        return \Inertia\Inertia::render('Instructor/Submissions/Hub', [
            'submissions' => $submissions,
        ]);
    }
}
