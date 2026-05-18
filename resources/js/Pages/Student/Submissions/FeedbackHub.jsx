import React from "react";
import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";

function formatDateTime(value) {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return value;
  }
}

export default function FeedbackHub({ submissions = [] }) {
  return (
    <AppLayout title="Feedback Saya" subtitle="Student Panel" panel="student">
      <Head title="Feedback Saya" />

      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-2xl font-extrabold text-slate-900">
            Feedback yang Sudah Dipublish
          </div>
          <div className="mt-2 text-sm text-slate-600">
            Daftar hasil penilaian yang sudah dipublish oleh instruktur.
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {submissions.length ? (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="rounded-2xl border border-slate-200 p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="text-lg font-bold text-slate-900">
                        {submission.assignment?.title ?? "Tugas"}
                      </div>
                      <div className="mt-1 text-sm text-slate-600">
                        {submission.assignment?.classroom?.name ?? "-"}
                      </div>
                      <div className="mt-2 text-sm text-slate-500">
                        Dipublish: {formatDateTime(submission.published_feedback_at)}
                      </div>
                    </div>

                    <div className="text-left md:text-right">
                      <div className="text-sm text-slate-500">Nilai Final</div>
                      <div className="text-2xl font-extrabold text-slate-900">
                        {submission.final_score ?? "-"}
                      </div>

                      <Link
                        href={route("student.submissions.show", submission.id)}
                        className="mt-3 inline-flex rounded-full bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-700"
                      >
                        Lihat Feedback
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
              Belum ada feedback yang dipublish.
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}