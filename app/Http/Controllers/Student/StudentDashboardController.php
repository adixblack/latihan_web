<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Services\DashboardMetricsService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StudentDashboardController extends Controller
{
    public function index(Request $request, DashboardMetricsService $metrics)
    {
        $user = $request->user();

        if (($user->role ?? null) === 'admin') {
            return redirect()->route('admin.dashboard');
        }

        if (($user->role ?? null) === 'instructor') {
            return redirect()->route('instructor.dashboard');
        }

        // status aplikasi instruktur berdasarkan ERD users
        $status = 'none';
        if (!empty($user->instructor_applied_at) && empty($user->instructor_reviewed_at)) {
            $status = 'pending';
        } elseif (!empty($user->instructor_reviewed_at)) {
            $st = strtolower((string) ($user->instructor_status ?? ''));
            $status = in_array($st, ['approved', 'rejected'], true) ? $st : 'rejected';
        }

        $application = [
            'status' => $status,
            'applied_at' => $user->instructor_applied_at,
            'reviewed_at' => $user->instructor_reviewed_at,
            'review_note' => $user->instructor_review_note,
        ];

        $data = $metrics->getStudentDashboard((int) $user->id);

        $activeClasses = DB::table('class_enrollments')
            ->join('classes', 'class_enrollments.class_id', '=', 'classes.id')
            ->where('class_enrollments.user_id', $user->id)
            ->where('class_enrollments.status', 'active')
            ->orderByDesc('class_enrollments.joined_at')
            ->get([
                'classes.id',
                'classes.name',
                'classes.subject_name',
                'classes.class_code',
                'class_enrollments.joined_at',
                'class_enrollments.joined_via',
            ])
            ->map(fn ($row) => [
                'id' => (int) $row->id,
                'name' => $row->name,
                'subject_name' => $row->subject_name,
                'class_code' => $row->class_code,
                'joined_at' => $this->toAppIso($row->joined_at),
                'joined_via' => $row->joined_via,
            ])
            ->values();

        $removedClasses = DB::table('class_enrollments')
            ->join('classes', 'class_enrollments.class_id', '=', 'classes.id')
            ->leftJoin('users as instructors', 'classes.instructor_id', '=', 'instructors.id')
            ->where('class_enrollments.user_id', $user->id)
            ->where('class_enrollments.status', 'removed')
            ->orderByDesc('class_enrollments.removed_at')
            ->get([
                'classes.id',
                'classes.name',
                'classes.subject_name',
                'classes.class_code',
                'class_enrollments.removed_at',
                'class_enrollments.removed_reason',
                'instructors.name as instructor_name',
            ])
            ->map(fn ($row) => [
                'id' => (int) $row->id,
                'name' => $row->name,
                'subject_name' => $row->subject_name,
                'class_code' => $row->class_code,
                'removed_at' => $this->toAppIso($row->removed_at),
                'removed_reason' => $row->removed_reason,
                'instructor_name' => $row->instructor_name,
            ])
            ->values();

        $stats = [
            ...($data['stats'] ?? []),
            'removed_classes_count' => $removedClasses->count(),
        ];

        return Inertia::render('Student/Dashboard', [
            'application' => $application,
            'stats' => $stats,
            'upcomingAssignments' => $data['upcoming_assignments'] ?? [],
            'latestFeedback' => $data['latest_feedback'] ?? [],
            'activeClasses' => $activeClasses,
            'removedClasses' => $removedClasses,
        ]);
    }

    private function toAppIso($value): ?string
    {
        if (!$value) {
            return null;
        }

        return Carbon::parse($value)
            ->setTimezone(config('app.timezone'))
            ->format('Y-m-d\TH:i:sP');
    }
}
