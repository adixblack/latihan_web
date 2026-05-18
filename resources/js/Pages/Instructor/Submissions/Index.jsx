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

function badgeClass(status) {
  const map = {
    draft: "bg-slate-100 text-slate-700",
    submitted: "bg-blue-100 text-blue-700",
    queued: "bg-yellow-100 text-yellow-700",
    processing: "bg-amber-100 text-amber-700",
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
    draft: "Draft",
    submitted: "Submitted",
    queued: "Queued",
    processing: "Processing",
    ai_ready: "AI Ready",
    instructor_review: "Instructor Review",
    finalized: "Finalized",
    published: "Published",
    failed: "Failed",
  };

  return map[status] || status || "-";
}

export default function Index({ assignment, submissions }) {
  return (
    <AppLayout
      title="Submission Review"
      subtitle="Instructor Panel"
      panel="instructor"
    >
      <Head title={`Submission - ${assignment?.title ?? "Assignment"}`} />

      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm text-slate-500">Submission Review</p>
            <h1 className="text-2xl font-bold text-slate-900">
              {assignment?.title}
            </h1>
            <div className="mt-2 space-y-1 text-sm text-slate-600">
              <p>
                <span className="font-medium">Kelas:</span>{" "}
                {assignment?.classroom?.name ?? "-"}
              </p>
              <p>
                <span className="font-medium">Rubrik:</span>{" "}
                {assignment?.rubric?.title ?? "-"}
              </p>
              <p>
                <span className="font-medium">Deadline:</span>{" "}
                {formatDateTime(assignment?.due_at)}
              </p>
            </div>
          </div>

          <div>
            <Link
              href={route("instructor.assignments.show", assignment.id)}
              className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-100"
            >
              Kembali ke Tugas
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Daftar Submission
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Total: {submissions?.length ?? 0} submission
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
                    Submitted At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Submission Status
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
                {submissions?.length ? (
                  submissions.map((submission) => {
                    const latestAi = submission.latest_ai_feedback;

                    return (
                      <tr key={submission.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 align-top">
                          <div className="font-medium text-slate-900">
                            {submission.student?.name ?? "-"}
                          </div>
                          <div className="text-sm text-slate-500">
                            {submission.student?.email ?? "-"}
                          </div>
                        </td>

                        <td className="px-6 py-4 align-top text-sm text-slate-700">
                          <div>{formatDateTime(submission.submitted_at)}</div>
                          {submission.is_late ? (
                            <div className="mt-1 inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                              Late
                            </div>
                          ) : null}
                        </td>

                        <td className="px-6 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass(
                              submission.status
                            )}`}
                          >
                            {labelStatus(submission.status)}
                          </span>
                        </td>

                        <td className="px-6 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass(
                              submission.review_status
                            )}`}
                          >
                            {labelStatus(submission.review_status)}
                          </span>
                        </td>

                        <td className="px-6 py-4 align-top text-sm text-slate-700">
                          <div>
                            <span className="font-medium">AI:</span>{" "}
                            {latestAi?.overall_score ?? "-"}
                          </div>
                          <div>
                            <span className="font-medium">Final:</span>{" "}
                            {submission.final_score ??
                              latestAi?.final_overall_score ??
                              "-"}
                          </div>
                        </td>

                        <td className="px-6 py-4 align-top text-right">
                          <Link
                            href={route(
                              "instructor.submissions.show",
                              submission.id
                            )}
                            className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                          >
                            Lihat Review
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-10 text-center text-sm text-slate-500"
                    >
                      Belum ada submission untuk tugas ini.
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