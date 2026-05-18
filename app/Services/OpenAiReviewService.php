<?php

namespace App\Services;

use App\Models\Submission;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class OpenAiReviewService
{
    public function reviewSubmission(Submission $submission): array
    {
        $submission->load([
            'student:id,name,email',
            'assignment.rubric.criteria',
        ]);

        $assignment = $submission->assignment;
        $rubric = $assignment->rubric;
        $criteria = $rubric->criteria;

        if (!$assignment || !$rubric || $criteria->isEmpty()) {
            throw new RuntimeException('Assignment atau rubric criteria belum lengkap.');
        }

        $schema = $this->buildJsonSchema();

        $developerPrompt = $this->buildDeveloperPrompt();
        $userPrompt = $this->buildUserPrompt($submission);

        $payload = [
            'model' => $assignment->ai_model ?: config('services.openai.model'),
            'store' => false,
            'input' => [
                [
                    'role' => 'developer',
                    'content' => $developerPrompt,
                ],
                [
                    'role' => 'user',
                    'content' => $userPrompt,
                ],
            ],
            'text' => [
                'format' => [
                    'type' => 'json_schema',
                    'name' => 'rubriq_ai_review',
                    'strict' => true,
                    'schema' => $schema,
                ],
            ],
        ];

        $response = Http::baseUrl(config('services.openai.base_url'))
            ->withToken(config('services.openai.api_key'))
            ->timeout((int) config('services.openai.timeout', 120))
            ->acceptJson()
            ->post('/responses', $payload)
            ->throw()
            ->json();

        $jsonText = $this->extractOutputText($response);

        $decoded = json_decode($jsonText, true);

        if (!is_array($decoded)) {
            throw new RuntimeException('Structured output OpenAI tidak valid.');
        }

        return [
            'request_payload' => $payload,
            'response_payload' => $response,
            'review' => $decoded,
        ];
    }

    protected function buildDeveloperPrompt(): string
    {
        return <<<PROMPT
You are an academic assignment reviewer.

Your task is to evaluate a student submission strictly based on the provided rubric criteria.

Rules:
1. Only use the provided rubric criteria.
2. Do not invent new criteria.
3. Be fair, evidence-based, and specific.
4. For each criterion, assign a score between 0 and the criterion max score.
5. Provide concise but actionable feedback per criterion.
6. Provide evidence items taken from the student's response content.
7. Return only data that matches the JSON schema exactly.
8. Use the same rubric_criterion_id values provided in the input.
PROMPT;
    }

    protected function buildUserPrompt(Submission $submission): string
    {
        $assignment = $submission->assignment;
        $rubric = $assignment->rubric;
        $criteria = $rubric->criteria->map(function ($item) {
            return [
                'rubric_criterion_id' => $item->id,
                'title' => $item->title,
                'description' => $item->description,
                'weight' => (float) $item->weight,
                'max_score' => (float) $item->max_score,
                'sort_order' => $item->sort_order,
            ];
        })->values()->all();

        $data = [
            'assignment' => [
                'id' => $assignment->id,
                'title' => $assignment->title,
                'description' => $assignment->description,
                'max_score' => $assignment->max_score,
            ],
            'student' => [
                'id' => $submission->student->id,
                'name' => $submission->student->name,
                'email' => $submission->student->email,
            ],
            'submission' => [
                'id' => $submission->id,
                'content' => $submission->content,
                'submitted_at' => optional($submission->submitted_at)?->toDateTimeString(),
                'is_late' => (bool) $submission->is_late,
            ],
            'rubric' => [
                'id' => $rubric->id,
                'title' => $rubric->title,
                'description' => $rubric->description,
                'scale_type' => $rubric->scale_type,
                'max_score' => $rubric->max_score,
                'criteria' => $criteria,
            ],
        ];

        return json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    }

    protected function buildJsonSchema(): array
    {
        return [
            'type' => 'object',
            'properties' => [
                'overall_score' => [
                    'type' => 'number',
                ],
                'overall_feedback' => [
                    'type' => 'string',
                ],
                'strengths' => [
                    'type' => 'array',
                    'items' => ['type' => 'string'],
                ],
                'weaknesses' => [
                    'type' => 'array',
                    'items' => ['type' => 'string'],
                ],
                'suggestions' => [
                    'type' => 'array',
                    'items' => ['type' => 'string'],
                ],
                'criteria' => [
                    'type' => 'array',
                    'items' => [
                        'type' => 'object',
                        'properties' => [
                            'rubric_criterion_id' => ['type' => 'integer'],
                            'title' => ['type' => 'string'],
                            'score' => ['type' => 'number'],
                            'feedback' => ['type' => 'string'],
                            'evidence' => [
                                'type' => 'array',
                                'items' => ['type' => 'string'],
                            ],
                        ],
                        'required' => [
                            'rubric_criterion_id',
                            'title',
                            'score',
                            'feedback',
                            'evidence',
                        ],
                        'additionalProperties' => false,
                    ],
                ],
            ],
            'required' => [
                'overall_score',
                'overall_feedback',
                'strengths',
                'weaknesses',
                'suggestions',
                'criteria',
            ],
            'additionalProperties' => false,
        ];
    }

    protected function extractOutputText(array $response): string
    {
        $output = data_get($response, 'output', []);

        foreach ($output as $item) {
            if (($item['type'] ?? null) !== 'message') {
                continue;
            }

            foreach (($item['content'] ?? []) as $content) {
                if (($content['type'] ?? null) === 'output_text') {
                    return $content['text'] ?? '';
                }
            }
        }

        throw new RuntimeException('Tidak menemukan output_text dari Responses API.');
    }
}