<?php

namespace App\Jobs;

use App\Models\AiFeedback;
use App\Models\AiFeedbackItem;
use App\Models\Submission;
use App\Services\OpenAiReviewService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Throwable;

class GenerateAiReviewJob implements ShouldQueue
{
    use Queueable;

    public function __construct(public int $submissionId)
    {
    }

    public function handle(OpenAiReviewService $service): void
    {
        $submission = Submission::with([
            'assignment.rubric.criteria',
            'student',
        ])->findOrFail($this->submissionId);

        if (!$submission->assignment?->ai_review_enabled) {
            return;
        }

        $attemptNo = (int) ($submission->aiFeedbacks()->max('attempt_no') ?? 0) + 1;

        $aiFeedback = AiFeedback::create([
            'submission_id' => $submission->id,
            'attempt_no' => $attemptNo,
            'ai_model' => $submission->assignment->ai_model ?: config('services.openai.model'),
            'prompt_version' => $submission->assignment->ai_prompt_version ?: 'rubriq_review_v1',
            'status' => 'processing',
            'processing_started_at' => now(),
            'generated_at' => now(),
        ]);

        $submission->update([
            'review_status' => 'processing',
        ]);

        try {
            $result = $service->reviewSubmission($submission);
            $review = $result['review'];

            DB::transaction(function () use ($submission, $aiFeedback, $result, $review) {
                $criteriaMap = $submission->assignment->rubric->criteria->keyBy('id');

                $aiFeedback->update([
                    'feedback_text' => $review['overall_feedback'] ?? null,
                    'overall_score' => $review['overall_score'] ?? null,
                    'strengths' => $review['strengths'] ?? [],
                    'weaknesses' => $review['weaknesses'] ?? [],
                    'suggestions' => $review['suggestions'] ?? [],
                    'rubric_scores' => $review['criteria'] ?? [],
                    'raw_response' => json_encode($result['response_payload'], JSON_UNESCAPED_UNICODE),
                    'status' => 'generated',
                    'processing_finished_at' => now(),
                ]);

                foreach ($review['criteria'] as $item) {
                    $criterion = $criteriaMap->get($item['rubric_criterion_id'] ?? null);

                    if (!$criterion) {
                        continue;
                    }

                    AiFeedbackItem::updateOrCreate(
                        [
                            'ai_feedback_id' => $aiFeedback->id,
                            'rubric_criterion_id' => $criterion->id,
                        ],
                        [
                            'criterion_title_snapshot' => $criterion->title,
                            'criterion_description_snapshot' => $criterion->description,
                            'weight_snapshot' => $criterion->weight,
                            'max_score_snapshot' => $criterion->max_score,
                            'sort_order_snapshot' => $criterion->sort_order,
                            'score_ai' => min((float) $item['score'], (float) $criterion->max_score),
                            'feedback_ai' => $item['feedback'] ?? null,
                            'evidence_ai' => $item['evidence'] ?? [],
                            'score_final' => min((float) $item['score'], (float) $criterion->max_score),
                            'feedback_final' => $item['feedback'] ?? null,
                            'is_overridden' => false,
                        ]
                    );
                }

                $submission->update([
                    'review_status' => 'ai_ready',
                ]);
            });
        } catch (Throwable $e) {
            $aiFeedback->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
                'processing_finished_at' => now(),
            ]);

            $submission->update([
                'review_status' => 'failed',
            ]);

            throw $e;
        }
    }
}