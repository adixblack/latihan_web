import React from "react";
import { Link, router, useForm } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";

function InputError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-sm font-medium text-red-600">{message}</p>;
}

export default function Form({ assignment, submission }) {
  const { data, setData, processing, errors } = useForm({
    content: submission?.content ?? "",
  });

  const contentLength = data.content?.length ?? 0;

  const isLocked =
    submission &&
    ["finalized", "published"].includes(submission.review_status);

  const isPublished = submission?.review_status === "published";
  const isFinalized = submission?.review_status === "finalized";

  const saveDraft = (e) => {
    e.preventDefault();
    if (isLocked) return;

    router.post(route("student.assignments.submission.saveDraft", assignment.id), data);
  };

  const submitFinal = (e) => {
    e.preventDefault();
    if (isLocked) return;

    router.post(route("student.assignments.submission.submit", assignment.id), data);
  };

  return (
    <AppLayout title="Kerjakan Tugas" subtitle="Student Panel" panel="student">
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-2xl font-extrabold text-slate-900">
                {assignment.title}
              </div>
              <div className="mt-2 text-sm text-slate-600">
                {isLocked
                  ? "Tugas ini sudah dikunci karena telah difinalisasi atau dipublish oleh instruktur."
                  : "Kerjakan tugas langsung pada editor di bawah ini."}
              </div>
            </div>

            <Link
              href={route("student.assignments.show", assignment.id)}
              className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              ← Kembali ke Detail
            </Link>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
            <span className="rounded-full bg-slate-100 px-3 py-1 font-bold text-slate-700">
              Deadline: {assignment.due_at ? String(assignment.due_at) : "-"}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 font-bold text-slate-700">
              Max score: {assignment.max_score}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 font-bold text-slate-700">
              Status submission: {submission?.status ?? "belum ada"}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 font-bold text-slate-700">
              Status review: {submission?.review_status ?? "belum ada"}
            </span>
          </div>
        </div>

        {isLocked && (
          <div
            className={`rounded-3xl border p-6 shadow-sm text-sm ${
              isPublished
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-yellow-200 bg-yellow-50 text-yellow-800"
            }`}
          >
            {isPublished
              ? "Tugas ini sudah dipublish oleh instruktur. Anda tidak dapat mengubah jawaban lagi. Silakan lihat hasil penilaian pada halaman feedback."
              : isFinalized
              ? "Tugas ini sudah difinalisasi oleh instruktur dan sementara dikunci. Anda tidak dapat mengubah jawaban lagi."
              : "Tugas ini sedang dikunci."}
          </div>
        )}

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-lg font-extrabold text-slate-900">Instruksi</div>
          <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">
            {assignment.description || "Tidak ada instruksi tambahan."}
          </div>
        </div>

        <form className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-lg font-extrabold text-slate-900">
                Jawaban Anda
              </label>
              <div className="text-xs font-bold text-slate-500">
                {contentLength} karakter
              </div>
            </div>

            <textarea
              rows={18}
              value={data.content}
              onChange={(e) => setData("content", e.target.value)}
              disabled={isLocked}
              readOnly={isLocked}
              className={`w-full rounded-2xl border px-4 py-4 text-sm leading-7 text-slate-900 outline-none transition ${
                isLocked
                  ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500"
                  : "border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-orange-100"
              }`}
              placeholder="Tulis atau paste jawaban Anda di sini..."
            />

            <InputError message={errors.content} />

            <div className="mt-3 text-xs text-slate-500">
              {isLocked
                ? "Editor dinonaktifkan karena submission sudah dikunci."
                : "Saran: tulis jawaban sejelas mungkin karena nanti akan direview berdasarkan rubrik."}
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <Link
              href={route("student.assignments.show", assignment.id)}
              className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-700 ring-1 ring-slate-200"
            >
              Kembali
            </Link>

            {!isLocked && (
              <>
                <button
                  type="button"
                  onClick={saveDraft}
                  disabled={processing}
                  className="rounded-full bg-slate-200 px-5 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-300 disabled:opacity-60"
                >
                  Simpan Draft
                </button>

                <button
                  type="button"
                  onClick={submitFinal}
                  disabled={processing}
                  className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-slate-700 disabled:opacity-60"
                >
                  Submit Tugas
                </button>
              </>
            )}

            {isPublished && submission?.id && (
              <Link
                href={route("student.submissions.show", submission.id)}
                className="rounded-full bg-green-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-green-700"
              >
                Lihat Hasil
              </Link>
            )}
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
