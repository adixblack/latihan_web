<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\Classroom;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Illuminate\Support\Carbon;

class ClassroomController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $classes = Classroom::query()
            ->where('instructor_id', $user->id)
            ->withCount([
                'activeEnrollments as students_count',
                'assignments as assignments_count',
            ])
            ->orderByDesc('created_at')
            ->paginate(10)
            ->through(fn ($classroom) => [
                'id' => $classroom->id,
                'name' => $classroom->name,
                'subject_name' => $classroom->subject_name,
                'class_code' => $classroom->class_code,
                'join_code' => $classroom->join_code,
                'is_active' => $classroom->is_active,
                'allow_self_join' => $classroom->allow_self_join,
                'students_count' => $classroom->students_count,
                'assignments_count' => $classroom->assignments_count,
                'starts_at' => $this->toAppIso($classroom->starts_at),
                'ends_at' => $this->toAppIso($classroom->ends_at),
                'archived_at' => $this->toAppIso($classroom->archived_at),
            ]);

        return Inertia::render('Instructor/Classes/Index', [
            'classes' => $classes,
        ]);
    }

    public function create()
    {
        return Inertia::render('Instructor/Classes/Form', [
            'mode' => 'create',
            'classroom' => null,
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $data = $this->validateData($request);

        Classroom::create([
            'instructor_id' => $user->id,
            'name' => $data['name'],
            'subject_name' => $data['subject_name'],
            'description' => $data['description'] ?? null,
            'class_code' => $data['class_code'],
            'join_code' => $this->generateUniqueJoinCode(),
            'allow_self_join' => (bool) $data['allow_self_join'],
            'max_students' => $data['max_students'] ?? null,
            'visibility' => $data['visibility'],
            'join_opens_at' => $data['join_opens_at'] ?? null,
            'join_closes_at' => $data['join_closes_at'] ?? null,
            'starts_at' => $data['starts_at'] ?? null,
            'ends_at' => $data['ends_at'] ?? null,
            'is_active' => (bool) $data['is_active'],
        ]);

        return redirect()
            ->route('instructor.classes.index')
            ->with('success', 'Kelas berhasil dibuat.');
    }

    public function show(Request $request, Classroom $classroom)
    {
        $this->authorizeOwner($request, $classroom);

        $classroom->loadCount([
            'activeEnrollments as students_count',
            'removedEnrollments as removed_students_count',
            'assignments as assignments_count',
        ]);

        $activeStudents = $classroom->activeEnrollments()
            ->with('user:id,name,email,role')
            ->orderByDesc('joined_at')
            ->get()
            ->map(fn ($enrollment) => [
                'enrollment_id' => $enrollment->id,
                'user_id' => $enrollment->user_id,
                'name' => $enrollment->user?->name,
                'email' => $enrollment->user?->email,
                'role' => $enrollment->user?->role,
                'joined_at' => $this->toAppIso($enrollment->joined_at),
                'joined_via' => $enrollment->joined_via,
            ]);

        $removedStudents = $classroom->removedEnrollments()
            ->with(['user:id,name,email,role', 'remover:id,name'])
            ->orderByDesc('removed_at')
            ->limit(20)
            ->get()
            ->map(fn ($enrollment) => [
                'enrollment_id' => $enrollment->id,
                'user_id' => $enrollment->user_id,
                'name' => $enrollment->user?->name,
                'email' => $enrollment->user?->email,
                'role' => $enrollment->user?->role,
                'removed_at' => $this->toAppIso($enrollment->removed_at),
                'removed_reason' => $enrollment->removed_reason,
                'removed_by_name' => $enrollment->remover?->name,
            ]);

        return Inertia::render('Instructor/Classes/Show', [
            'classroom' => [
                'id' => $classroom->id,
                'name' => $classroom->name,
                'subject_name' => $classroom->subject_name,
                'description' => $classroom->description,
                'class_code' => $classroom->class_code,
                'join_code' => $classroom->join_code,
                'allow_self_join' => $classroom->allow_self_join,
                'max_students' => $classroom->max_students,
                'visibility' => $classroom->visibility,
                'join_opens_at' => $this->toAppIso($classroom->join_opens_at),
                'join_closes_at' => $this->toAppIso($classroom->join_closes_at),
                'starts_at' => $this->toAppIso($classroom->starts_at),
                'ends_at' => $this->toAppIso($classroom->ends_at),
                'is_active' => $classroom->is_active,
                'archived_at' => $this->toAppIso($classroom->archived_at),
                'students_count' => $classroom->students_count,
                'removed_students_count' => $classroom->removed_students_count,
                'assignments_count' => $classroom->assignments_count,
            ],
            'activeStudents' => $activeStudents,
            'removedStudents' => $removedStudents,
        ]);
    }

    public function edit(Request $request, Classroom $classroom)
    {
        $this->authorizeOwner($request, $classroom);

        return Inertia::render('Instructor/Classes/Form', [
            'mode' => 'edit',
            'classroom' => [
                'id' => $classroom->id,
                'name' => $classroom->name,
                'subject_name' => $classroom->subject_name,
                'description' => $classroom->description,
                'class_code' => $classroom->class_code,
                'allow_self_join' => $classroom->allow_self_join,
                'max_students' => $classroom->max_students,
                'visibility' => $classroom->visibility,
                'join_opens_at' => optional($classroom->join_opens_at)?->setTimezone(config('app.timezone'))->format('Y-m-d\TH:i'),
                'join_closes_at' => optional($classroom->join_closes_at)?->setTimezone(config('app.timezone'))->format('Y-m-d\TH:i'),
                'starts_at' => optional($classroom->starts_at)?->setTimezone(config('app.timezone'))->format('Y-m-d\TH:i'),
                'ends_at' => optional($classroom->ends_at)?->setTimezone(config('app.timezone'))->format('Y-m-d\TH:i'),
                'is_active' => $classroom->is_active,
            ],
        ]);
    }

    public function update(Request $request, Classroom $classroom)
    {
        $this->authorizeOwner($request, $classroom);

        $data = $this->validateData($request, $classroom->id);

        $classroom->update([
            'name' => $data['name'],
            'subject_name' => $data['subject_name'],
            'description' => $data['description'] ?? null,
            'class_code' => $data['class_code'],
            'allow_self_join' => (bool) $data['allow_self_join'],
            'max_students' => $data['max_students'] ?? null,
            'visibility' => $data['visibility'],
            'join_opens_at' => $data['join_opens_at'] ?? null,
            'join_closes_at' => $data['join_closes_at'] ?? null,
            'starts_at' => $data['starts_at'] ?? null,
            'ends_at' => $data['ends_at'] ?? null,
            'is_active' => (bool) $data['is_active'],
        ]);

        return redirect()
            ->route('instructor.classes.show', $classroom->id)
            ->with('success', 'Kelas berhasil diperbarui.');
    }

    public function regenerateJoinCode(Request $request, Classroom $classroom)
    {
        $this->authorizeOwner($request, $classroom);

        $classroom->update([
            'join_code' => $this->generateUniqueJoinCode(),
        ]);

        return back()->with('success', 'Join code berhasil diperbarui.');
    }

    public function archive(Request $request, Classroom $classroom)
    {
        $this->authorizeOwner($request, $classroom);

        $classroom->update([
            'is_active' => false,
            'archived_at' => now(),
        ]);

        return back()->with('success', 'Kelas berhasil diarsipkan.');
    }

    public function unarchive(Request $request, Classroom $classroom)
    {
        $this->authorizeOwner($request, $classroom);

        $classroom->update([
            'is_active' => true,
            'archived_at' => null,
        ]);

        return back()->with('success', 'Kelas berhasil diaktifkan kembali.');
    }

    private function validateData(Request $request, ?int $ignoreId = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'subject_name' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string'],
            'class_code' => [
                'required',
                'string',
                'max:30',
                'alpha_dash',
                Rule::unique('classes', 'class_code')->ignore($ignoreId),
            ],
            'allow_self_join' => ['required', 'boolean'],
            'max_students' => ['nullable', 'integer', 'min:1', 'max:100000'],
            'visibility' => ['required', Rule::in(['private', 'open'])],
            'join_opens_at' => ['nullable', 'date'],
            'join_closes_at' => ['nullable', 'date', 'after_or_equal:join_opens_at'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'is_active' => ['required', 'boolean'],
        ]);
    }

    private function authorizeOwner(Request $request, Classroom $classroom): void
    {
        abort_unless((int) $classroom->instructor_id === (int) $request->user()->id, 403);
    }

    private function generateUniqueJoinCode(): string
    {
        do {
            $code = strtoupper(Str::random(8));
        } while (Classroom::where('join_code', $code)->exists());

        return $code;
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