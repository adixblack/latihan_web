import React, { useMemo } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
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
    generated: "bg-indigo-100 text-indigo-700",
    reviewed: "bg-purple-100 text-purple-700",
    finalized: "bg-emerald-100 text-emerald-700",
    published: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
    ai_ready: "bg-indigo-100 text-indigo-700",
    instructor_review: "bg-purple-100 text-purple-700",
  };

  return map[status] || "bg-slate-100 text-slate-700";
}

function labelStatus(status) {
  const map = {
    draft: "Draft",
    submitted: "Submitted",
    queued: "Queued",
    processing: "Processing",
    generated: "Generated",
    reviewed: "Reviewed",
    finalized: "Finalized",
    published: "Published",
    failed: "Failed",
    ai_ready: "AI Ready",
    instructor_review: "Instructor Review",
  };

  return map[status] || status || "-";
}

export default function Review({ submission, aiFeedback, aiFeedbackHistory }) {
  const initialItems = useMemo(() => {
    return (aiFeedback?.items ?? []).map((item) => ({
      id: item.id,
      score_final: item.score_final ?? item.score_ai ?? "",
      feedback_final: item.feedback_final ?? item.feedback_ai ?? "",
      override_note: item.override_note ?? "",
    }));
  }, [aiFeedback]);

  const draftForm = useForm({
    overall_feedback:
      aiFeedback?.final_feedback_text ?? aiFeedback?.feedback_text ?? "",
    items: initialItems,
  });

  const finalizeForm = useForm({
    final_feedback_text:
      aiFeedback?.final_feedback_text ?? aiFeedback?.feedback_text ?? "",
  });

  const handleItemChange = (index, field, value) => {
    const updated = [...draftForm.data.items];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    draftForm.setData("items", updated);
  };

  const handleSaveDraft = (e) => {
    e.preventDefault();
    if (!aiFeedback) return;

    draftForm.patch(
      route("instructor.submissions.review.saveDraft", [
        submission.id,
        aiFeedback.id,
      ]),
      { preserveScroll: true }
    );
  };

  const handleFinalize = (e) => {
    e.preventDefault();
    if (!aiFeedback) return;

    finalizeForm.patch(
      route("instructor.submissions.review.finalize", [
        submission.id,
        aiFeedback.id,
      ]),
      { preserveScroll: true }
    );
  };

  const handlePublish = () => {
    if (!aiFeedback) return;
    if (!window.confirm("Publikasikan hasil final ke student?")) return;

    finalizeForm.patch(
      route("instructor.submissions.review.publish", [
        submission.id,
        aiFeedback.id,
      ]),
      { preserveScroll: true }
    );
  };

  const handleRegenerate = () => {
    if (!window.confirm("Generate ulang review AI untuk submission ini?"))
      return;

    draftForm.post(
      route("instructor.submissions.review.regenerate", submission.id),
      { preserveScroll: true }
    );
  };

  return (
    <AppLayout title="Review Submission" subtitle="Instructor Panel" panel="instructor">
      <Head title={`Review Submission #${submission.id}`} />

      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm text-slate-500">Review Submission</p>
            <h1 className="text-2xl font-bold text-slate-900">
              {submission.assignment?.title ?? "Assignment"}
            </h1>
            <div className="mt-2 space-y-1 text-sm text-slate-600">
              <p>
                <span className="font-medium">Student:</span>{" "}
                {submission.student?.name ?? "-"} ({submission.student?.email ?? "-"})
              </p>
              <p>
                <span className="font-medium">Kelas:</span>{" "}
                {submission.assignment?.classroom?.name ?? "-"}
              </p>
              <p>
                <span className="font-medium">Submitted:</span>{" "}
                {formatDateTime(submission.submitted_at)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={route(
                "instructor.assignments.submissions.index",
                submission.assignment_id
              )}
              className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-100"
            >
              Kembali
            </Link>

            <button
              type="button"
              onClick={handleRegenerate}
              className="inline-flex items-center rounded-xl border border-indigo-300 bg-white px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
            >
              Regenerate AI
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-1">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Status</h2>

              <div className="mt-4 space-y-3 text-sm">
                <div>
                  <p className="mb-1 text-slate-500">Submission Status</p>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass(
                      submission.status
                    )}`}
                  >
                    {labelStatus(submission.status)}
                  </span>
                </div>

                <div>
                  <p className="mb-1 text-slate-500">Review Status</p>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass(
                      submission.review_status
                    )}`}
                  >
                    {labelStatus(submission.review_status)}
                  </span>
                </div>

                <div>
                  <p className="mb-1 text-slate-500">Nilai Final</p>
                  <p className="font-semibold text-slate-900">
                    {submission.final_score ?? "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">
                Riwayat AI Review
              </h2>

              <div className="mt-4 space-y-3">
                {aiFeedbackHistory?.length ? (
                  aiFeedbackHistory.map((history) => (
                    <div
                      key={history.id}
                      className={`rounded-xl border p-4 ${
                        aiFeedback?.id === history.id
                          ? "border-indigo-300 bg-indigo-50"
                          : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-slate-900">
                            Attempt #{history.attempt_no ?? history.id}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Generated: {formatDateTime(history.generated_at)}
                          </p>
                        </div>

                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass(
                            history.status
                          )}`}
                        >
                          {labelStatus(history.status)}
                        </span>
                      </div>

                      <div className="mt-3 text-sm text-slate-700">
                        <p>AI Score: {history.overall_score ?? "-"}</p>
                        <p>Final Score: {history.final_overall_score ?? "-"}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    Belum ada riwayat review AI.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6 xl:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">
                Isi Submission
              </h2>

              <div className="mt-4 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">
                {submission.content || "Tidak ada isi submission."}
              </div>
            </div>

            {!aiFeedback ? (
              <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-6 text-sm text-yellow-800 shadow-sm">
                Belum ada hasil review AI untuk submission ini.
              </div>
            ) : (
              <>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">
                        Ringkasan Review AI
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Model: {aiFeedback.ai_model ?? "-"} | Prompt:{" "}
                        {aiFeedback.prompt_version ?? "-"}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-slate-500">AI Score</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {aiFeedback.overall_score ?? "-"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-xl bg-emerald-50 p-4">
                      <h3 className="font-semibold text-emerald-800">Strengths</h3>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-emerald-900">
                        {(aiFeedback.strengths ?? []).length ? (
                          aiFeedback.strengths.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))
                        ) : (
                          <li>-</li>
                        )}
                      </ul>
                    </div>

                    <div className="rounded-xl bg-amber-50 p-4">
                      <h3 className="font-semibold text-amber-800">Weaknesses</h3>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-900">
                        {(aiFeedback.weaknesses ?? []).length ? (
                          aiFeedback.weaknesses.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))
                        ) : (
                          <li>-</li>
                        )}
                      </ul>
                    </div>

                    <div className="rounded-xl bg-blue-50 p-4">
                      <h3 className="font-semibold text-blue-800">Suggestions</h3>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-blue-900">
                        {(aiFeedback.suggestions ?? []).length ? (
                          aiFeedback.suggestions.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))
                        ) : (
                          <li>-</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                <form
                  onSubmit={handleSaveDraft}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <h2 className="text-lg font-semibold text-slate-900">
                    Revisi Instruktor per Kriteria
                  </h2>

                  <div className="mt-6 space-y-6">
                    {(aiFeedback.items ?? []).map((item, index) => (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-slate-200 p-5"
                      >
                        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <h3 className="text-base font-semibold text-slate-900">
                              {item.criterion_title_snapshot}
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                              Max Score: {item.max_score_snapshot} | Bobot:{" "}
                              {item.weight_snapshot}
                            </p>
                          </div>

                          <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
                            AI Score:{" "}
                            <span className="font-semibold">
                              {item.score_ai ?? "-"}
                            </span>
                          </div>
                        </div>

                        {item.feedback_ai && (
                          <div className="mb-4 rounded-xl bg-indigo-50 p-4 text-sm text-slate-700">
                            <p className="mb-1 font-medium text-indigo-800">
                              Feedback AI
                            </p>
                            <p className="whitespace-pre-wrap">
                              {item.feedback_ai}
                            </p>
                          </div>
                        )}

                        {(item.evidence_ai ?? []).length > 0 && (
                          <div className="mb-4 rounded-xl bg-slate-50 p-4">
                            <p className="mb-2 text-sm font-medium text-slate-800">
                              Evidence AI
                            </p>
                            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                              {item.evidence_ai.map((evidence, evIndex) => (
                                <li key={evIndex}>{evidence}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                              Score Final
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              max={item.max_score_snapshot}
                              value={draftForm.data.items[index]?.score_final ?? ""}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "score_final",
                                  e.target.value
                                )
                              }
                              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-slate-500 focus:outline-none focus:ring-0"
                            />
                            {draftForm.errors[`items.${index}.score_final`] && (
                              <p className="mt-1 text-xs text-red-600">
                                {draftForm.errors[`items.${index}.score_final`]}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                              Catatan Override
                            </label>
                            <input
                              type="text"
                              value={draftForm.data.items[index]?.override_note ?? ""}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "override_note",
                                  e.target.value
                                )
                              }
                              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-slate-500 focus:outline-none focus:ring-0"
                              placeholder="Opsional"
                            />
                          </div>
                        </div>

                        <div className="mt-4">
                          <label className="mb-2 block text-sm font-medium text-slate-700">
                            Feedback Final
                          </label>
                          <textarea
                            rows={4}
                            value={draftForm.data.items[index]?.feedback_final ?? ""}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "feedback_final",
                                e.target.value
                              )
                            }
                            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-slate-500 focus:outline-none focus:ring-0"
                          />
                          {draftForm.errors[`items.${index}.feedback_final`] && (
                            <p className="mt-1 text-xs text-red-600">
                              {draftForm.errors[`items.${index}.feedback_final`]}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6">
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Feedback Umum Final
                    </label>
                    <textarea
                      rows={5}
                      value={draftForm.data.overall_feedback}
                      onChange={(e) =>
                        draftForm.setData("overall_feedback", e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-slate-500 focus:outline-none focus:ring-0"
                    />
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="submit"
                      disabled={draftForm.processing}
                      className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                    >
                      {draftForm.processing
                        ? "Menyimpan..."
                        : "Simpan Draft Review"}
                    </button>
                  </div>
                </form>

                <form
                  onSubmit={handleFinalize}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <h2 className="text-lg font-semibold text-slate-900">
                    Finalisasi
                  </h2>

                  <div className="mt-4">
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Feedback Final untuk Student
                    </label>
                    <textarea
                      rows={5}
                      value={finalizeForm.data.final_feedback_text}
                      onChange={(e) =>
                        finalizeForm.setData(
                          "final_feedback_text",
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-slate-500 focus:outline-none focus:ring-0"
                    />
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="submit"
                      disabled={finalizeForm.processing}
                      className="inline-flex items-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {finalizeForm.processing
                        ? "Memfinalisasi..."
                        : "Finalisasi Review"}
                    </button>

                    <button
                      type="button"
                      onClick={handlePublish}
                      disabled={!aiFeedback.finalized_at || finalizeForm.processing}
                      className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Publish ke Student
                    </button>
                  </div>

                  <div className="mt-4 text-sm text-slate-500">
                    <p>Finalized at: {formatDateTime(aiFeedback.finalized_at)}</p>
                    <p>Published at: {formatDateTime(aiFeedback.published_at)}</p>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}