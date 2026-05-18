import React from "react";
import { Link } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";

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

function Badge({ status }) {
  const s = (status ?? "none").toLowerCase();
  const map = {
    none: "bg-slate-100 text-slate-700 border-slate-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
  };
  const cls = map[s] ?? map.none;
  const label =
    s === "pending"
      ? "Pending"
      : s === "approved"
      ? "Approved"
      : s === "rejected"
      ? "Rejected"
      : "Belum mengajukan";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-extrabold ${cls}`}
    >
      {label}
    </span>
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

function formatDateTimeLocal(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("id-ID");
}

export default function Dashboard({
  application,
  stats,
  upcomingAssignments,
  latestFeedback,
  activeClasses = [],
  removedClasses = [],
}) {
  const navItems = [
    // {
    //   key: "dash",
    //   label: "Dashboard",
    //   href: route("student.dashboard"),
    //   activePath: "/student/dashboard",
    //   icon: <span>🏠</span>,
    // },
    // {
    //   key: "join",
    //   label: "Join Kelas",
    //   href: route("student.classes.join"),
    //   activePath: "/student/classes/join",
    //   icon: <span>➕</span>,
    // },
    // { key: "tasks", label: "Tugas", disabled: true, hint: "coming", icon: <span>📝</span> },
    // { key: "feedback", label: "Feedback", disabled: true, hint: "coming", icon: <span>💬</span> },
  ];

  const status = (application?.status ?? "none").toLowerCase();
  const canApply = status !== "pending" && status !== "approved";

  return (
    <AppLayout title="Student Dashboard" subtitle="Student Panel" panel="student">
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-2xl font-extrabold tracking-tight text-slate-900">
                Progres Belajar Anda
              </div>
              <div className="mt-2 text-sm text-slate-600">
                Ringkasan kelas, tugas, feedback, dan status partisipasi Anda.
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Badge status={application?.status} />
              <Link
                href={route("dashboard")}
                className="rounded-full bg-white px-6 py-2.5 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-900"
              >
                Ke /dashboard →
              </Link>
            </div>
          </div>

          <div className="mt-5 h-1 w-full rounded-full bg-slate-100">
            <div className="h-1 w-1/2 rounded-full bg-gradient-to-r from-orange-500 via-pink-500 to-emerald-500" />
          </div>
        </div>

        {/* Warning removed classes */}
        {removedClasses.length > 0 ? (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
            <div className="text-sm font-extrabold text-amber-900">
              Perhatian
            </div>
            <div className="mt-1 text-sm text-amber-800">
              Anda memiliki riwayat dikeluarkan dari satu atau lebih kelas. Untuk kelas
              tersebut, Anda tidak dapat bergabung lagi sendiri menggunakan join code.
              Silakan hubungi instruktur apabila ada kekeliruan.
            </div>
          </div>
        ) : null}

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <StatCard label="Kelas Diikuti" value={stats?.classes_joined} />
          <StatCard label="Riwayat Dikeluarkan" value={stats?.removed_classes_count} hint="Kelas yang pernah mengeluarkan Anda" />
          <StatCard label="Tugas To Do" value={stats?.todo} hint="Belum disubmit" />
          <StatCard label="Terlambat" value={stats?.late} />
          <StatCard label="Feedback Terbaru" value={stats?.feedback_latest_count} hint="Published" />
          <StatCard label="Progress" value={`${stats?.progress_pct ?? 0}%`} hint="Submission / total tugas" />
        </div>

        {/* Status kelas */}
        <Section
          title="Status Kelas Anda"
          desc="Ringkasan kelas aktif dan riwayat kelas yang pernah mengeluarkan Anda."
          action={
            <Link
              href={route("student.classes.join")}
              className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700"
            >
              Kelola Join Kelas
            </Link>
          }
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <div className="text-sm font-extrabold text-slate-800">Kelas Aktif</div>

              {!activeClasses.length ? (
                <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  Anda belum tergabung pada kelas aktif mana pun.
                </div>
              ) : (
                <div className="mt-3 space-y-3">
                  {activeClasses.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="text-sm font-extrabold text-slate-900">{item.name}</div>
                      <div className="mt-1 text-xs text-slate-600">
                        {item.subject_name} • {item.class_code}
                      </div>
                      <div className="mt-2 text-xs text-slate-500">
                        Bergabung: {formatDateTimeLocal(item.joined_at)} • Via: {item.joined_via ?? "-"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="text-sm font-extrabold text-slate-800">
                Riwayat Dikeluarkan dari Kelas
              </div>

              {!removedClasses.length ? (
                <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  Tidak ada riwayat dikeluarkan dari kelas.
                </div>
              ) : (
                <div className="mt-3 space-y-3">
                  {removedClasses.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-red-200 bg-red-50 p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="text-sm font-extrabold text-slate-900">
                            {item.name}
                          </div>
                          <div className="mt-1 text-xs text-slate-600">
                            {item.subject_name} • {item.class_code}
                          </div>
                          <div className="mt-2 text-xs text-slate-600">
                            Dikeluarkan: {formatDateTimeLocal(item.removed_at)}
                          </div>
                          <div className="mt-1 text-xs text-slate-600">
                            Instruktur: {item.instructor_name || "-"}
                          </div>
                          <div className="mt-2 text-sm text-slate-700">
                            <span className="font-bold">Alasan:</span>{" "}
                            {item.removed_reason || "Tidak ada alasan yang dicatat."}
                          </div>
                        </div>

                        <div className="inline-flex rounded-2xl border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-700">
                          Tidak bisa join ulang via code
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Section>

        {/* Apply Instructor */}
        <Section
          title="Ajukan Menjadi Instruktur"
          desc="Jika Anda dosen/guru, ajukan verifikasi ke admin untuk membuka fitur Kelas & Tugas."
          action={
            <Link
              href={route("instructor.apply")}
              className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${
                canApply
                  ? "bg-slate-900 text-white hover:bg-slate-700"
                  : "cursor-not-allowed bg-slate-200 text-slate-500"
              }`}
              as={canApply ? undefined : "button"}
              disabled={!canApply}
            >
              {status === "pending"
                ? "Menunggu Review"
                : status === "approved"
                ? "Sudah Instruktur"
                : "Ajukan Sekarang"}
            </Link>
          }
        >
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <div>
              Status: <span className="font-bold text-slate-900">{status}</span>
              {application?.applied_at ? (
                <span className="text-slate-500"> • applied: {String(application.applied_at)}</span>
              ) : null}
              {application?.reviewed_at ? (
                <span className="text-slate-500"> • reviewed: {String(application.reviewed_at)}</span>
              ) : null}
            </div>

            {application?.review_note ? (
              <div className="mt-2 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-700">
                <div className="font-bold text-slate-900">Catatan Admin</div>
                <div className="mt-1">{application.review_note}</div>
              </div>
            ) : null}
          </div>
        </Section>

        {/* Upcoming assignments */}
        <Section
          title="Deadline Terdekat"
          desc="5 tugas terdekat dari kelas yang Anda ikuti."
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
              Belum ada tugas dengan due date yang bisa ditampilkan (atau Anda belum join kelas).
            </div>
          )}
        </Section>

        {/* Latest feedback */}
        <Section
          title="Feedback Terakhir"
          desc="Daftar 5 feedback terbaru yang sudah dipublish."
        >
          {latestFeedback?.length ? (
            <div className="space-y-2">
              {latestFeedback.map((f) => (
                <div key={f.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-extrabold text-slate-900">Feedback #{f.id}</div>
                    <div className="text-xs font-bold text-slate-500">
                      {f.published_at ? String(f.published_at) : "-"}
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-slate-600">
                    Submission ID: <span className="font-bold text-slate-900">{f.submission_id}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
              Belum ada feedback published yang bisa ditampilkan.
            </div>
          )}
        </Section>
      </div>
    </AppLayout>
  );
}
