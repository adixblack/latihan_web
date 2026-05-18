<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\ClassEnrollment;
use App\Models\Classroom;
use App\Models\User;
use Illuminate\Http\Request;

class ClassroomEnrollmentController extends Controller
{
    public function remove(Request $request, Classroom $classroom, User $student)
    {
        $this->authorizeOwner($request, $classroom);

        $enrollment = ClassEnrollment::where('class_id', $classroom->id)
            ->where('user_id', $student->id)
            ->firstOrFail();

        if ($enrollment->status === 'removed') {
            return back()->with('info', 'Student tersebut sudah tidak aktif di kelas ini.');
        }

        $enrollment->update([
            'status' => 'removed',
            'removed_at' => now(),
            'removed_by' => $request->user()->id,
            'removed_reason' => $request->input('reason'),
        ]);

        return back()->with('success', 'Student berhasil dikeluarkan dari kelas.');
    }

    public function restore(Request $request, Classroom $classroom, User $student)
    {
        $this->authorizeOwner($request, $classroom);

        $enrollment = ClassEnrollment::where('class_id', $classroom->id)
            ->where('user_id', $student->id)
            ->firstOrFail();

        if ($enrollment->status === 'active') {
            return back()->with('info', 'Student tersebut sudah aktif di kelas ini.');
        }

        if ($classroom->hasReachedCapacity()) {
            return back()->with('error', 'Kapasitas kelas sudah penuh, student tidak dapat direstore.');
        }

        $enrollment->update([
            'status' => 'active',
            'joined_at' => now(),
            'joined_via' => 'restore',
            'removed_at' => null,
            'removed_by' => null,
            'removed_reason' => null,
        ]);

        return back()->with('success', 'Student berhasil direstore ke kelas.');
    }

    private function authorizeOwner(Request $request, Classroom $classroom): void
    {
        abort_unless((int) $classroom->instructor_id === (int) $request->user()->id, 403);
    }
}
