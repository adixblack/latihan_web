<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return redirect()->route('login');
        }

        // Admin tetap masuk admin panel
        if (($user->role ?? null) === 'admin') {
            return redirect()->route('admin.dashboard');
        }

        // Instructor masuk instructor dashboard
        if (($user->role ?? null) === 'instructor') {
            return redirect()->route('instructor.dashboard');
        }

        // Default: student
        return redirect()->route('student.dashboard');
    }
}
