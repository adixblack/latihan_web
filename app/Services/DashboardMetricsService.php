<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class DashboardMetricsService
{
    public function getInstructorDashboard(int $userId): array
    {
        $classIds = DB::table('classes')
            ->where('instructor_id', $userId)
            ->pluck('id')
            ->all();

        $classesTotal = count($classIds);

        $assignmentIds = DB::table('assignments')
            ->whereIn('class_id', $classIds)
            ->where('status', 'published')
            ->pluck('id')
            ->all();

        $assignmentsPublished = count($assignmentIds);

        $submissions7d = DB::table('submissions')
            ->whereIn('assignment_id', $assignmentIds)
            ->where('submitted_at', '>=', now()->subDays(7))
            ->count();

        $late7d = DB::table('submissions')
            ->whereIn('assignment_id', $assignmentIds)
            ->where('submitted_at', '>=', now()->subDays(7))
            ->where('is_late', 1)
            ->count();

        // Trend 14 hari
        $trendBase = [];
        $start = now()->subDays(13)->startOfDay();
        for ($i = 0; $i < 14; $i++) {
            $d = $start->copy()->addDays($i)->toDateString();
            $trendBase[$d] = 0;
        }

        $trendRows = DB::table('submissions')
            ->whereIn('assignment_id', $assignmentIds)
            ->where('submitted_at', '>=', $start)
            ->selectRaw('DATE(submitted_at) as d, COUNT(*) as c')
            ->groupBy('d')
            ->orderBy('d')
            ->get();

        foreach ($trendRows as $r) {
            $trendBase[$r->d] = (int) $r->c;
        }

        $trend14d = [];
        foreach ($trendBase as $date => $count) {
            $trend14d[] = ['date' => $date, 'count' => $count];
        }

        // Pending review = feedback draft
        $pendingReview = DB::table('ai_feedbacks')
            ->join('submissions', 'ai_feedbacks.submission_id', '=', 'submissions.id')
            ->whereIn('submissions.assignment_id', $assignmentIds)
            ->where('ai_feedbacks.status', 'draft')
            ->count();

        // Ringkasan kelas (5 terbaru)
        $classes = DB::table('classes')
            ->where('instructor_id', $userId)
            ->orderByDesc('id')
            ->limit(5)
            ->get()
            ->map(function ($c) {
                $enrollments = DB::table('class_enrollments')->where('class_id', $c->id)->count();
                $published = DB::table('assignments')
                    ->where('class_id', $c->id)
                    ->where('status', 'published')
                    ->count();

                return [
                    'id' => $c->id,
                    'name' => $c->name,
                    'code' => $c->class_code,
                    'enrollments' => $enrollments,
                    'assignments_published' => $published,
                ];
            })
            ->values()
            ->all();

        // Deadline terdekat (5)
        $upcoming = DB::table('assignments')
            ->join('classes', 'assignments.class_id', '=', 'classes.id')
            ->whereIn('assignments.class_id', $classIds)
            ->where('assignments.status', 'published')
            ->whereNotNull('assignments.due_at')
            ->where('assignments.due_at', '>=', now())
            ->orderBy('assignments.due_at')
            ->limit(5)
            ->get([
                'assignments.id',
                'assignments.title',
                'assignments.due_at',
                'classes.id as class_id',
                'classes.name as class_name',
                'classes.class_code as class_code',
            ])
            ->map(fn($a) => [
                'id' => $a->id,
                'title' => $a->title,
                'due_at' => $a->due_at,
                'class' => [
                    'id' => $a->class_id,
                    'name' => $a->class_name,
                    'code' => $a->class_code,
                ],
            ])
            ->values()
            ->all();

        return [
            'stats' => [
                'classes_total' => $classesTotal,
                'assignments_published' => $assignmentsPublished,
                'submissions_7d' => $submissions7d,
                'late_7d' => $late7d,
                'pending_review' => $pendingReview,
            ],
            'trend_14d' => $trend14d,
            'classes' => $classes,
            'upcoming_assignments' => $upcoming,
        ];
    }

    public function getStudentDashboard(int $userId): array
    {
        $classIds = DB::table('class_enrollments')
            ->where('user_id', $userId)
            ->pluck('class_id')
            ->unique()
            ->values()
            ->all();

        $classesJoined = count($classIds);

        $assignments = DB::table('assignments')
            ->whereIn('class_id', $classIds)
            ->where('status', 'published')
            ->get(['id', 'class_id', 'title', 'due_at']);

        $assignmentIds = $assignments->pluck('id')->all();
        $totalAssignments = count($assignmentIds);

        $submissions = DB::table('submissions')
            ->whereIn('assignment_id', $assignmentIds)
            ->where('user_id', $userId)
            ->get(['assignment_id', 'is_late']);

        $submittedIds = $submissions->pluck('assignment_id')->unique()->all();
        $submittedCount = count($submittedIds);

        $todo = max(0, $totalAssignments - $submittedCount);

        $lateSubmitted = $submissions->where('is_late', 1)->count();

        // late missing = due sudah lewat tapi belum submit
        $lateMissing = $assignments
            ->filter(fn($a) => $a->due_at && now()->gt($a->due_at) && !in_array($a->id, $submittedIds))
            ->count();

        $late = $lateSubmitted + $lateMissing;

        // upcoming assignments (5)
        $upcoming = DB::table('assignments')
            ->join('classes', 'assignments.class_id', '=', 'classes.id')
            ->whereIn('assignments.class_id', $classIds)
            ->where('assignments.status', 'published')
            ->whereNotNull('assignments.due_at')
            ->where('assignments.due_at', '>=', now())
            ->orderBy('assignments.due_at')
            ->limit(5)
            ->get([
                'assignments.id',
                'assignments.title',
                'assignments.due_at',
                'classes.id as class_id',
                'classes.name as class_name',
                'classes.class_code as class_code',
            ])
            ->map(fn($a) => [
                'id' => $a->id,
                'title' => $a->title,
                'due_at' => $a->due_at,
                'class' => [
                    'id' => $a->class_id,
                    'name' => $a->class_name,
                    'code' => $a->class_code,
                ],
            ])
            ->values()
            ->all();

        // latest feedback published (5)
        $latestFeedback = DB::table('ai_feedbacks')
            ->join('submissions', 'ai_feedbacks.submission_id', '=', 'submissions.id')
            ->where('submissions.user_id', $userId)
            ->where('ai_feedbacks.status', 'published')
            ->orderByDesc('ai_feedbacks.published_at')
            ->limit(5)
            ->get([
                'ai_feedbacks.id',
                'ai_feedbacks.submission_id',
                'ai_feedbacks.published_at',
            ])
            ->map(fn($f) => [
                'id' => $f->id,
                'submission_id' => $f->submission_id,
                'published_at' => $f->published_at,
            ])
            ->values()
            ->all();

        $progressPct = $totalAssignments > 0 ? round(($submittedCount / $totalAssignments) * 100) : 0;

        return [
            'stats' => [
                'classes_joined' => $classesJoined,
                'todo' => $todo,
                'late' => $late,
                'feedback_latest_count' => count($latestFeedback),
                'progress_pct' => $progressPct,
            ],
            'upcoming_assignments' => $upcoming,
            'latest_feedback' => $latestFeedback,
        ];
    }
}
