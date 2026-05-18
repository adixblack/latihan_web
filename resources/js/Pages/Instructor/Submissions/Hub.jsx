import React from "react";
import { Head, Link, usePage } from "@inertiajs/react";
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

function badgeClass(status) {
  const map = {
    ai_ready: "bg-indigo-100 text-indigo-700",
    instructor_review: "bg-purple-100 text-purple-700",
    finalized: "bg-emerald-100 text-emerald-700",
    published: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
  };

  return map[status] || "bg-slate-100 text-slate-700";
}

function labelStatus(status) {
  const map = {
    ai_ready: "AI Ready",
    instructor_review: "Instructor Review",
    finalized: "Finalized",
    published: "Published",
    failed: "Failed",
  };

  return map[status] || status || "-";
}

export default function Hub({ submissions = [] }) {
  const { flash = {} } = usePage().props;

  return (
    <AppLayout title="Review AI" subtitle="Instructor Panel" panel="instructor">
      <Head title="Review AI" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hub Review AI</h1>
          <p className="mt-1 text-sm text-slate-600">
            Daftar submission yang perlu dicek, difinalisasi, atau dipublish.
          </p>
        </div>

        {flash.success && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {flash.success}
          </div>
        )}

        {flash.error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {flash.error}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Daftar Submission</h2>
            <p className="mt-1 text-sm text-slate-500">
              Total: {submissions.length} submission
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Tugas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Kelas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Review Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    AI / Final Score
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 bg-white">
                {submissions.length ? (
                  submissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">
                          {submission.student?.name ?? "-"}
                        </div>
                        <div className="text-sm text-slate-500">
                          {submission.student?.email ?? "-"}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-700">
                        {submission.assignment?.title ?? "-"}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-700">
                        {submission.assignment?.classroom?.name ?? "-"}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-700">
                        {formatDateTime(submission.submitted_at)}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass(
                            submission.review_status
                          )}`}
                        >
                          {labelStatus(submission.review_status)}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-700">
                        <div>
                          AI: {submission.latest_ai_feedback?.overall_score ?? "-"}
                        </div>
                        <div>
                          Final:{" "}
                          {submission.final_score ??
                            submission.latest_ai_feedback?.final_overall_score ??
                            "-"}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Link
                          href={route("instructor.submissions.show", submission.id)}
                          className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                        >
                          Buka Review
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-10 text-center text-sm text-slate-500"
                    >
                      Belum ada submission untuk direview.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}