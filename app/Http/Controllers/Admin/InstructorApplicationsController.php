<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class InstructorApplicationsController extends Controller
{
    public function create()
    {
        $user = Auth::user();

        return Inertia::render('Instructor/Apply', [
            'currentRole' => $user->role,
            'instructorStatus' => $user->instructor_status,
            'application' => $user->instructor_application,
            'reviewNote' => $user->instructor_review_note,
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();

        // sudah jadi instructor approved? stop
        if ($user->role === 'instructor' && $user->instructor_status === 'approved') {
            return back()->with('error', 'Akun Anda sudah berstatus Guru/Dosen.');
        }

        // masih pending? stop
        if ($user->instructor_status === 'pending') {
            return back()->with('error', 'Pengajuan Anda masih diproses.');
        }

        $data = $request->validate([
            'institution' => ['required', 'string', 'max:120'],
            'position' => ['required', 'string', 'max:120'], // guru/dosen/lecturer dsb
            'proof_url' => ['nullable', 'url', 'max:255'],   // link profil / bukti
            'message' => ['required', 'string', 'max:1000'],
        ]);

        $user->update([
            'instructor_status' => 'pending',
            'instructor_application' => $data,
            'instructor_applied_at' => now(),

            // reset review fields
            'instructor_reviewed_at' => null,
            'instructor_reviewed_by' => null,
            'instructor_review_note' => null,
        ]);

        return back()->with('success', 'Pengajuan berhasil dikirim. Tunggu persetujuan Admin.');
    }
}
