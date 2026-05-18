<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\ClassEnrollment;
use App\Models\Classroom;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class ClassJoinController extends Controller
{
    public function create(Request $request)
    {
        $user = $request->user();

        abort_unless(($user->role ?? null) === 'student', 403);

        $myClasses = ClassEnrollment::query()
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

        $removedClasses = ClassEnrollment::query()
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

        return Inertia::render('Student/Classes/Join', [
            'myClasses' => $myClasses,
            'removedClasses' => $removedClasses,
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        abort_unless(($user->role ?? null) === 'student', 403);

        $data = $request->validate([
            'join_code' => ['required', 'string', 'max:20'],
        ]);

        $joinCode = strtoupper(trim($data['join_code']));

        $classroom = Classroom::whereRaw('UPPER(join_code) = ?', [$joinCode])->first();

        if (!$classroom) {
            return back()->withErrors([
                'join_code' => 'Join code tidak ditemukan.',
            ]);
        }

        $existingEnrollment = ClassEnrollment::where('class_id', $classroom->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existingEnrollment && $existingEnrollment->status === 'active') {
            return back()->with('info', 'Anda sudah tergabung di kelas ini.');
        }

        // Penting: kalau pernah dikeluarkan, student tidak boleh join sendiri lagi
        if ($existingEnrollment && $existingEnrollment->status === 'removed') {
            $message = 'Anda pernah dikeluarkan dari kelas ini dan tidak dapat bergabung lagi menggunakan join code.';

            if (!empty($existingEnrollment->removed_reason)) {
                $message .= ' Alasan: ' . $existingEnrollment->removed_reason;
            }

            return back()->withErrors([
                'join_code' => $message,
            ]);
        }

        if (!$classroom->isJoinAvailable()) {
            return back()->withErrors([
                'join_code' => 'Kelas tidak sedang dibuka untuk bergabung.',
            ]);
        }

        if ($classroom->hasReachedCapacity()) {
            return back()->withErrors([
                'join_code' => 'Kapasitas kelas sudah penuh.',
            ]);
        }

        $enrollment = $existingEnrollment ?: new ClassEnrollment();

        if (!$existingEnrollment) {
            $enrollment->class_id = $classroom->id;
            $enrollment->user_id = $user->id;
        }

        $enrollment->status = 'active';
        $enrollment->joined_at = now();
        $enrollment->joined_via = 'join_code';
        $enrollment->removed_at = null;
        $enrollment->removed_by = null;
        $enrollment->removed_reason = null;
        $enrollment->save();

        return redirect()
            ->route('student.classes.join')
            ->with('success', "Berhasil bergabung ke kelas {$classroom->name}.");
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
