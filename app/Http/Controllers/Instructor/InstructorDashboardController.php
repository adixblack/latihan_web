<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Services\DashboardMetricsService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InstructorDashboardController extends Controller
{
    public function index(Request $request, DashboardMetricsService $metrics)
    {
        $user = $request->user();

        if (($user->role ?? null) === 'admin') {
            return redirect()->route('admin.dashboard');
        }

        if (($user->role ?? null) !== 'instructor') {
            abort(403, 'Akses khusus instruktur.');
        }

        $data = $metrics->getInstructorDashboard((int) $user->id);

        return Inertia::render('Instructor/Dashboard', [
            'stats' => $data['stats'],
            'trend14d' => $data['trend_14d'],
            'classes' => $data['classes'],
            'upcomingAssignments' => $data['upcoming_assignments'],
        ]);
    }
}
