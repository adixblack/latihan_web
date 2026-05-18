<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\Rubric;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RubricController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $rubrics = Rubric::withCount('criteria')
            ->where('instructor_id', $user->id)
            ->latest()
            ->get();

        return Inertia::render('Instructor/Rubrics/Index', [
            'rubrics' => $rubrics,
        ]);
    }

    public function create()
    {
        return Inertia::render('Instructor/Rubrics/Form', [
            'mode' => 'create',
            'rubric' => null,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'scale_type' => ['required', 'string', 'max:30'],
            'max_score' => ['required', 'integer', 'min:1'],
            'is_template' => ['boolean'],
            'criteria' => ['required', 'array', 'min:1'],
            'criteria.*.title' => ['required', 'string', 'max:255'],
            'criteria.*.description' => ['nullable', 'string'],
            'criteria.*.weight' => ['required', 'numeric', 'min:0.01'],
            'criteria.*.max_score' => ['required', 'integer', 'min:1'],
            'criteria.*.sort_order' => ['required', 'integer', 'min:1'],
        ]);

        $rubric = Rubric::create([
            'instructor_id' => $request->user()->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'scale_type' => $validated['scale_type'],
            'max_score' => $validated['max_score'],
            'is_template' => $validated['is_template'] ?? false,
        ]);

        foreach ($validated['criteria'] as $criterion) {
            $rubric->criteria()->create($criterion);
        }

        return redirect()
            ->route('instructor.rubrics.index')
            ->with('success', 'Rubrik berhasil dibuat.');
    }

    public function edit(Request $request, Rubric $rubric)
    {
        abort_unless($rubric->instructor_id === $request->user()->id, 403);

        $rubric->load('criteria');

        return Inertia::render('Instructor/Rubrics/Form', [
            'mode' => 'edit',
            'rubric' => $rubric,
        ]);
    }

    public function update(Request $request, Rubric $rubric)
    {
        abort_unless($rubric->instructor_id === $request->user()->id, 403);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'scale_type' => ['required', 'string', 'max:30'],
            'max_score' => ['required', 'integer', 'min:1'],
            'is_template' => ['boolean'],
            'criteria' => ['required', 'array', 'min:1'],
            'criteria.*.title' => ['required', 'string', 'max:255'],
            'criteria.*.description' => ['nullable', 'string'],
            'criteria.*.weight' => ['required', 'numeric', 'min:0.01'],
            'criteria.*.max_score' => ['required', 'integer', 'min:1'],
            'criteria.*.sort_order' => ['required', 'integer', 'min:1'],
        ]);

        $rubric->update([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'scale_type' => $validated['scale_type'],
            'max_score' => $validated['max_score'],
            'is_template' => $validated['is_template'] ?? false,
        ]);

        $rubric->criteria()->delete();

        foreach ($validated['criteria'] as $criterion) {
            $rubric->criteria()->create($criterion);
        }

        return redirect()
            ->route('instructor.rubrics.index')
            ->with('success', 'Rubrik berhasil diperbarui.');
    }

    public function destroy(Request $request, Rubric $rubric)
    {
        abort_unless($rubric->instructor_id === $request->user()->id, 403);

        if ($rubric->assignments()->exists()) {
            return back()->with('error', 'Rubrik tidak bisa dihapus karena sudah dipakai assignment.');
        }

        $rubric->criteria()->delete();
        $rubric->delete();

        return redirect()
            ->route('instructor.rubrics.index')
            ->with('success', 'Rubrik berhasil dihapus.');
    }
}
