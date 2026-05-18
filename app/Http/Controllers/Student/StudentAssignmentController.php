<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Classroom;
use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class StudentAssignmentController extends Controller
{
    protected function enrollmentColumns(): array
    {
        return [
            'class' => Schema::hasColumn('class_enrollments', 'class_id') ? 'class_id' : 'classroom_id',
            'user' => Schema::hasColumn('class_enrollments', 'user_id') ? 'user_id' : 'student_id',
        ];
    }

    protected function activeEnrollmentQuery(Request $request)
    {
        $cols = $this->enrollmentColumns();

        $query = DB::table('class_enrollments')
            ->where($cols['user'], $request->user()->id);

        if (Schema::hasColumn('class_enrollments', 'removed_at')) {
            $query->whereNull('removed_at');
        }

        if (Schema::hasColumn('class_enrollments', 'status')) {
            $query->where('status', 'active');
        }

        return $query;
    }

    protected function ensureStudentEnrolledInClass(Request $request, Classroom $classroom): void
    {
        $cols = $this->enrollmentColumns();

        $query = DB::table('class_enrollments')
            ->where($cols['class'], $classroom->id)
            ->where($cols['user'], $request->user()->id);

        if (Schema::hasColumn('class_enrollments', 'removed_at')) {
            $query->whereNull('removed_at');
        }

        if (Schema::hasColumn('class_enrollments', 'status')) {
            $query->where('status', 'active');
        }

        abort_unless($query->exists(), 403);
    }

    protected function ensureStudentCanAccessAssignment(Request $request, Assignment $assignment): void
    {
        abort_unless($assignment->status === Assignment::STATUS_PUBLISHED, 404);

        $classroom = Classroom::findOrFail($assignment->class_id);
        $this->ensureStudentEnrolledInClass($request, $classroom);
    }

    public function hub(Request $request)
    {
        $cols = $this->enrollmentColumns();

        $classIds = $this->activeEnrollmentQuery($request)
            ->pluck($cols['class'])
            ->unique()
            ->values();

        $classrooms = Classroom::whereIn('id', $classIds)
            ->withCount([
                'assignments as published_assignments_count' => function ($query) {
                    $query->where('status', Assignment::STATUS_PUBLISHED);
                },
            ])
            ->latest()
            ->get(['id', 'name', 'class_code']);

        $recentAssignments = Assignment::with([
                'classroom:id,name,class_code',
                'submissions' => function ($query) use ($request) {
                    $query->where('user_id', $request->user()->id)
                        ->select('id', 'assignment_id', 'status', 'submitted_at', 'final_score');
                },
            ])
            ->whereIn('class_id', $classIds)
            ->where('status', Assignment::STATUS_PUBLISHED)
            ->orderByRaw('due_at IS NULL, due_at ASC')
            ->limit(8)
            ->get()
            ->map(function ($assignment) {
                $mySubmission = $assignment->submissions->first();

                return [
                    'id' => $assignment->id,
                    'title' => $assignment->title,
                    'description' => $assignment->description,
                    'max_score' => $assignment->max_score,
                    'due_at' => $assignment->due_at,
                    'classroom' => $assignment->classroom,
                    'my_submission' => $mySubmission ? [
                        'id' => $mySubmission->id,
                        'status' => $mySubmission->status,
                        'submitted_at' => $mySubmission->submitted_at,
                        'final_score' => $mySubmission->final_score,
                    ] : null,
                ];
            });

        return Inertia::render('Student/Assignments/Hub', [
            'classrooms' => $classrooms,
            'recentAssignments' => $recentAssignments,
        ]);
    }

    public function index(Request $request, Classroom $classroom)
    {
        $this->ensureStudentEnrolledInClass($request, $classroom);

        $assignments = Assignment::with([
                'rubric:id,title',
                'submissions' => function ($query) use ($request) {
                    $query->where('user_id', $request->user()->id)
                        ->select('id', 'assignment_id', 'status', 'submitted_at', 'final_score');
                },
            ])
            ->where('class_id', $classroom->id)
            ->where('status', Assignment::STATUS_PUBLISHED)
            ->orderByRaw('due_at IS NULL, due_at ASC')
            ->get()
            ->map(function ($assignment) {
                $mySubmission = $assignment->submissions->first();

                return [
                    'id' => $assignment->id,
                    'title' => $assignment->title,
                    'description' => $assignment->description,
                    'status' => $assignment->status,
                    'max_score' => $assignment->max_score,
                    'due_at' => $assignment->due_at,
                    'rubric' => $assignment->rubric,
                    'my_submission' => $mySubmission ? [
                        'id' => $mySubmission->id,
                        'status' => $mySubmission->status,
                        'submitted_at' => $mySubmission->submitted_at,
                        'final_score' => $mySubmission->final_score,
                    ] : null,
                ];
            });

        return Inertia::render('Student/Assignments/Index', [
            'classroom' => $classroom,
            'assignments' => $assignments,
        ]);
    }

    public function show(Request $request, Assignment $assignment)
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

        return Inertia::render('Student/Assignments/Show', [
            'assignment' => $assignment,
            'mySubmission' => $submission,
        ]);
    }
}
