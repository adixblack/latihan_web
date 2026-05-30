<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class InstructorApplicationsController extends Controller
{
    public function index()
    {
        $pending = User::query()
            ->where('instructor_status', 'pending')
            ->orderByDesc('instructor_applied_at')
            ->get([
                'id',
                'name',
                'email',
                'instructor_application',
                'instructor_applied_at',
            ]);

        return Inertia::render('Admin/InstructorApplications', [
            'pending' => $pending,
        ]);
    }

    public function approve(User $user, Request $request)
    {
        $data = $request->validate([
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        $user->update([
            'role' => 'instructor',
            'instructor_status' => 'approved',
            'instructor_reviewed_at' => now(),
            'instructor_reviewed_by' => Auth::id(),
            'instructor_review_note' => $data['note'] ?? null,
        ]);

        return back()->with('success', 'Pengajuan instructor disetujui.');
    }

    public function reject(User $user, Request $request)
    {
        $data = $request->validate([
            'note' => ['required', 'string', 'max:1000'],
        ]);

        $user->update([
            'role' => 'student',
            'instructor_status' => 'rejected',
            'instructor_reviewed_at' => now(),
            'instructor_reviewed_by' => Auth::id(),
            'instructor_review_note' => $data['note'],
        ]);

        return back()->with('success', 'Pengajuan instructor ditolak.');
    }
}
