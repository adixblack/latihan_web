import React from "react";
import { Link } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";

const cx = (...c) => c.filter(Boolean).join(" ");

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

function TinyBars({ data }) {
  const max = Math.max(1, ...data.map((d) => d.count ?? 0));
  return (
    <div className="mt-3 flex items-end gap-1">
      {data.map((d) => (
        <div
          key={d.date}
          className="w-2 rounded-md bg-slate-200"
          style={{ height: `${Math.round(((d.count ?? 0) / max) * 44) + 6}px` }}
          title={`${d.date}: ${d.count ?? 0}`}
        />
      ))}
    </div>
  );
}

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

export default function Dashboard({ stats, trend14d, classes, upcomingAssignments }) {
  const navItems = [
    // {
    //   key: "dash",
    //   label: "Dashboard",
    //   href: route("instructor.dashboard"),
    //   activePath: "/instructor/dashboard",
    //   icon: <span>🏠</span>,
    // },
    // {
    //   key: "classes",
    //   label: "Kelas",
    //   href: route("instructor.classes.index"),
    //   activePath: "/instructor/classes",
    //   icon: <span>🏫</span>,
    // },
    // { key: "assign", label: "Tugas", disabled: true, hint: "coming", icon: <span>📝</span> },
    // { key: "review", label: "Review AI", disabled: true, hint: "coming", icon: <span>🤖</span> },
  ];

  const hasAny =
    (stats?.classes_total ?? 0) > 0 ||
    (stats?.assignments_published ?? 0) > 0 ||
    (stats?.submissions_7d ?? 0) > 0;

  return (
    <AppLayout title="Instructor Dashboard" subtitle="Instructor Panel" panel="instructor">
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-2xl font-extrabold tracking-tight text-slate-900">
                Ringkasan Aktivitas Instruktur
              </div>
              <div className="mt-2 text-sm text-slate-600">
                Fokus MVP: completion rate, keterlambatan, tren submission, dan antrian review feedback AI.
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {/* Link aman: hanya pakai route yang sudah ada */}
              <Link
                href={route("dashboard")}
                className="rounded-full bg-white px-6 py-2.5 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-900"
              >
                Ke /dashboard →
              </Link>
            </div>
          </div>

          <div className="mt-5 h-1 w-full rounded-full bg-slate-100">
            <div className="h-1 w-2/3 rounded-full bg-gradient-to-r from-orange-500 via-pink-500 to-emerald-500" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="Kelas" value={stats?.classes_total} />
          <StatCard label="Tugas Published" value={stats?.assignments_published} hint="Tugas siap dinilai" />
          <StatCard label="Submission 7 hari" value={stats?.submissions_7d} />
          <StatCard label="Terlambat 7 hari" value={stats?.late_7d} />
          <StatCard label="Perlu Review" value={stats?.pending_review} hint="AI draft belum publish" />
        </div>

        {/* Trend */}
        <Section
          title="Tren Submission (14 Hari)"
          desc="Grafik mini untuk melihat pola pengumpulan tugas dari waktu ke waktu."
        >
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Hari ke hari</span>
              <span>{trend14d?.length ?? 0} titik</span>
            </div>
            <TinyBars data={trend14d ?? []} />
          </div>
        </Section>

        {/* Classes */}
        <Section
          title="Ringkasan Kelas"
          desc="5 kelas terbaru milik Anda (jumlah peserta & jumlah tugas published)."
        >
          {!hasAny ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
              Belum ada data kelas/tugas/submission. Setelah Anda membuat kelas dan tugas published, ringkasan akan muncul di sini.
            </div>
          ) : classes?.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="py-3 pr-4 font-bold">Kelas</th>
                    <th className="py-3 pr-4 font-bold">Kode</th>
                    <th className="py-3 pr-4 font-bold">Peserta</th>
                    <th className="py-3 font-bold">Tugas Published</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map((c) => (
                    <tr key={c.id} className="border-b border-slate-100">
                      <td className="py-3 pr-4 font-bold text-slate-900">{c.name}</td>
                      <td className="py-3 pr-4 text-slate-600">{c.code ?? "-"}</td>
                      <td className="py-3 pr-4 text-slate-700 tabular-nums">{c.enrollments ?? 0}</td>
                      <td className="py-3 text-slate-700 tabular-nums">{c.assignments_published ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
              Belum ada kelas yang terdeteksi.
            </div>
          )}
        </Section>

        {/* Upcoming assignments */}
        <Section
          title="Deadline Terdekat"
          desc="5 tugas terdekat berdasarkan due date (jika kolom due_at/deadline tersedia)."
        >
          {upcomingAssignments?.length ? (
            <div className="space-y-2">
              {upcomingAssignments.map((a) => (
                <div
                  key={a.id}
                  className="flex flex-col gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="text-sm font-extrabold text-slate-900">{a.title}</div>
                    <div className="text-xs text-slate-600">
                      {a.class?.name ?? "Kelas"} {a.class?.code ? `• ${a.class.code}` : ""}
                    </div>
                  </div>
                  <div className="text-xs font-bold text-slate-700">
                    Due: <span className="text-slate-900">{String(a.due_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
              Belum ada tugas dengan due date yang bisa ditampilkan (atau tabel/kolom due_at belum dibuat).
            </div>
          )}
        </Section>

        {/* Note */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-lg font-extrabold text-slate-900">Catatan MVP</div>
          <div className="mt-2 text-sm text-slate-600">
            Feedback AI harus ditinjau dan dipublish oleh instruktur (human-in-the-loop). Dashboard ini menyiapkan metrik minimum sesuai PRD: completion/keterlambatan/tren/summary.
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
