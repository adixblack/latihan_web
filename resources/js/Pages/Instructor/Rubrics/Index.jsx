import React from "react";
import { Link } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";

function Section({ title, desc, children, action }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-lg font-extrabold text-slate-900">{title}</div>
          {desc ? <div className="mt-1 text-sm text-slate-600">{desc}</div> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="text-xs font-bold text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-extrabold text-slate-900 tabular-nums">
        {value ?? 0}
      </div>
      {hint ? <div className="mt-2 text-xs text-slate-500">{hint}</div> : null}
    </div>
  );
}

export default function Index({ rubrics = [] }) {
  const totalRubrics = rubrics.length;
  const totalTemplates = rubrics.filter((r) => !!r.is_template).length;
  const totalCriteria = rubrics.reduce((sum, r) => sum + (r.criteria_count ?? 0), 0);

  return (
    <AppLayout title="Rubrics" subtitle="Instructor Panel" panel="instructor">
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-2xl font-extrabold tracking-tight text-slate-900">
                Rubrik Penilaian
              </div>
              <div className="mt-2 text-sm text-slate-600">
                Buat dan kelola rubrik penilaian yang nanti dapat dipakai ulang pada banyak tugas.
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href={route("instructor.rubrics.create")}
                className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700"
              >
                + Buat Rubrik
              </Link>
            </div>
          </div>

          <div className="mt-5 h-1 w-full rounded-full bg-slate-100">
            <div className="h-1 w-1/2 rounded-full bg-gradient-to-r from-orange-500 via-pink-500 to-emerald-500" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Total Rubrik" value={totalRubrics} />
          <StatCard label="Template" value={totalTemplates} hint="Siap dipakai ulang" />
          <StatCard label="Total Kriteria" value={totalCriteria} hint="Akumulasi semua rubrik" />
        </div>

        <Section
          title="Daftar Rubrik"
          desc="Klik Edit untuk memperbarui rubrik atau kriteria penilaiannya."
          action={
            rubrics.length > 0 ? (
              <Link
                href={route("instructor.rubrics.create")}
                className="rounded-full bg-white px-5 py-2 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-900"
              >
                Rubrik Baru
              </Link>
            ) : null
          }
        >
          {rubrics.length ? (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr className="text-left text-slate-500">
                    <th className="px-4 py-3 font-bold">Judul</th>
                    <th className="px-4 py-3 font-bold">Tipe</th>
                    <th className="px-4 py-3 font-bold">Max Score</th>
                    <th className="px-4 py-3 font-bold">Kriteria</th>
                    <th className="px-4 py-3 font-bold">Template</th>
                    <th className="px-4 py-3 text-right font-bold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {rubrics.map((rubric) => (
                    <tr key={rubric.id} className="border-t border-slate-100 bg-white">
                      <td className="px-4 py-4">
                        <div className="font-extrabold text-slate-900">{rubric.title}</div>
                        {rubric.description ? (
                          <div className="mt-1 line-clamp-2 text-xs text-slate-500">
                            {rubric.description}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                          {rubric.scale_type}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-bold text-slate-800 tabular-nums">
                        {rubric.max_score}
                      </td>
                      <td className="px-4 py-4 text-slate-700 tabular-nums">
                        {rubric.criteria_count ?? 0}
                      </td>
                      <td className="px-4 py-4">
                        {rubric.is_template ? (
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                            Ya
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                            Tidak
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Link
                          href={route("instructor.rubrics.edit", rubric.id)}
                          className="rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-900"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
              Belum ada rubrik. Buat rubrik pertama Anda untuk mulai menyusun penilaian tugas.
            </div>
          )}
        </Section>
      </div>
    </AppLayout>
  );
}