<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Classroom;
use App\Models\Rubric;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AssignmentController extends Controller
{
    protected function ensureInstructorOwnsClass(Request $request, Classroom $classroom): void
    {
        abort_unless((int) $classroom->instructor_id === (int) $request->user()->id, 403);
    }

    protected function ensureInstructorOwnsAssignment(Request $request, Assignment $assignment): void
    {
        $assignment->loadMissing('classroom');
        abort_unless((int) $assignment->classroom->instructor_id === (int) $request->user()->id, 403);
    }

    public function index(Request $request, Classroom $classroom)
    {
        $this->ensureInstructorOwnsClass($request, $classroom);

        $assignments = Assignment::with('rubric:id,title')
            ->withCount('submissions')
            ->where('class_id', $classroom->id)
            ->latest()
            ->get();

        return Inertia::render('Instructor/Assignments/Index', [
            'classroom' => $classroom,
            'assignments' => $assignments,
        ]);
    }

    public function create(Request $request, Classroom $classroom)
    {
        $this->ensureInstructorOwnsClass($request, $classroom);

        $rubrics = Rubric::withCount('criteria')
            ->where('instructor_id', $request->user()->id)
            ->latest()
            ->get(['id', 'title', 'max_score', 'scale_type', 'is_template']);

        return Inertia::render('Instructor/Assignments/Form', [
            'mode' => 'create',
            'classroom' => $classroom,
            'assignment' => null,
            'rubrics' => $rubrics,
        ]);
    }

    public function store(Request $request, Classroom $classroom)
    {
        $this->ensureInstructorOwnsClass($request, $classroom);

        $validated = $request->validate([
            'rubric_id' => [
                'required',
                Rule::exists('rubrics', 'id')->where(function ($query) use ($request) {
                    $query->where('instructor_id', $request->user()->id);
                }),
            ],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'max_score' => ['required', 'numeric', 'min:1'],
            'due_at' => ['nullable', 'date'],
        ]);

        Assignment::create([
            'class_id' => $classroom->id,
            'rubric_id' => $validated['rubric_id'],
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'status' => Assignment::STATUS_DRAFT,
            'max_score' => $validated['max_score'],
            'due_at' => $validated['due_at'] ?? null,
            'published_at' => null,
        ]);

        return redirect()
            ->route('instructor.classes.assignments.index', $classroom->id)
            ->with('success', 'Tugas berhasil dibuat sebagai draft.');
    }

    public function show(Request $request, Assignment $assignment)
    {
        $this->ensureInstructorOwnsAssignment($request, $assignment);

        $assignment->load([
            'classroom:id,name,class_code',
            'rubric:id,title,scale_type,max_score',
            'rubric.criteria:id,rubric_id,title,description,weight,max_score,sort_order',
        ]);

        return Inertia::render('Instructor/Assignments/Show', [
            'assignment' => $assignment,
        ]);
    }

    public function edit(Request $request, Assignment $assignment)
    {
        $this->ensureInstructorOwnsAssignment($request, $assignment);

        $assignment->load('classroom:id,name,class_code');

        $rubrics = Rubric::withCount('criteria')
            ->where('instructor_id', $request->user()->id)
            ->latest()
            ->get(['id', 'title', 'max_score', 'scale_type', 'is_template']);

        return Inertia::render('Instructor/Assignments/Form', [
            'mode' => 'edit',
            'classroom' => $assignment->classroom,
            'assignment' => $assignment,
            'rubrics' => $rubrics,
        ]);
    }

    public function update(Request $request, Assignment $assignment)
    {
        $this->ensureInstructorOwnsAssignment($request, $assignment);

        $validated = $request->validate([
            'rubric_id' => [
                'required',
                Rule::exists('rubrics', 'id')->where(function ($query) use ($request) {
                    $query->where('instructor_id', $request->user()->id);
                }),
            ],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'max_score' => ['required', 'numeric', 'min:1'],
            'due_at' => ['nullable', 'date'],
        ]);

        $assignment->update([
            'rubric_id' => $validated['rubric_id'],
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'max_score' => $validated['max_score'],
            'due_at' => $validated['due_at'] ?? null,
        ]);

        return redirect()
            ->route('instructor.classes.assignments.index', $assignment->class_id)
            ->with('success', 'Tugas berhasil diperbarui.');
    }

    public function publish(Request $request, Assignment $assignment)
    {
        $this->ensureInstructorOwnsAssignment($request, $assignment);

        $assignment->update([
            'status' => Assignment::STATUS_PUBLISHED,
            'published_at' => now(),
        ]);

        return back()->with('success', 'Tugas berhasil dipublish.');
    }

    public function hub(Request $request)
    {
        $classrooms = Classroom::where('instructor_id', $request->user()->id)
            ->withCount('assignments')
            ->latest()
            ->get(['id', 'name', 'class_code']);

        return Inertia::render('Instructor/Assignments/Hub', [
            'classrooms' => $classrooms,
        ]);
    }
}
