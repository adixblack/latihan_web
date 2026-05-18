import React from "react";
import { Link, router, usePage } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";

function formatDateTimeLocal(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("id-ID");
}

export default function Show({ classroom, activeStudents, removedStudents }) {
  const { flash } = usePage().props;

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
  ];

  const regenerateJoinCode = () => {
    if (!confirm("Generate join code baru? Join code lama akan tidak dipakai lagi.")) return;
    router.post(route("instructor.classes.regenerate_join_code", classroom.id));
  };

  const removeStudent = (student) => {
    const reason = window.prompt(`Alasan mengeluarkan ${student.name} dari kelas ini? (opsional)`) ?? "";
    if (!confirm(`Keluarkan ${student.name} dari kelas ini?`)) return;

    router.post(route("instructor.classes.students.remove", [classroom.id, student.user_id]), {
      reason,
    });
  };

  const restoreStudent = (student) => {
    if (!confirm(`Restore ${student.name} ke kelas ini?`)) return;
    router.post(route("instructor.classes.students.restore", [classroom.id, student.user_id]));
  };

  return (
    <AppLayout title="Detail Kelas" subtitle="Instructor Panel" panel="instructor">
      <div className="space-y-6">
        {flash?.success ? (
          <div className="rounded-2xl bg-emerald-500/10 p-4 text-sm text-emerald-100 ring-1 ring-emerald-500/20">
            {flash.success}
          </div>
        ) : null}

        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <Link
              href={route("instructor.classes.index")}
              className="mb-3 inline-flex rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/10"
            >
              ← Kembali
            </Link>

            <div className="text-2xl font-semibold text-white">{classroom.name}</div>
            <div className="mt-1 text-sm text-white/60">{classroom.subject_name}</div>
            <div className="mt-3 text-sm text-white/70">{classroom.description || "-"}</div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={route("instructor.classes.edit", classroom.id)}
              className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/10"
            >
              Edit Kelas
            </Link>

            <button
              onClick={regenerateJoinCode}
              className="rounded-xl bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-100 ring-1 ring-amber-500/20"
            >
              Regenerate Join Code
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
            <div className="text-xs text-white/60">Kode Kelas</div>
            <div className="mt-2 text-lg font-bold text-white">{classroom.class_code}</div>
          </div>
          <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
            <div className="text-xs text-white/60">Join Code</div>
            <div className="mt-2 text-lg font-bold text-white">{classroom.join_code}</div>
          </div>
          <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
            <div className="text-xs text-white/60">Student Aktif</div>
            <div className="mt-2 text-lg font-bold text-white">{classroom.students_count ?? 0}</div>
          </div>
          <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
            <div className="text-xs text-white/60">Tugas</div>
            <div className="mt-2 text-lg font-bold text-white">{classroom.assignments_count ?? 0}</div>
          </div>
        </div>

        <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
          <div className="text-lg font-semibold text-white">Pengaturan Kelas</div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 text-sm text-white/70">
            <div>Self Join: {classroom.allow_self_join ? "Ya" : "Tidak"}</div>
            <div>Max Student: {classroom.max_students ?? "Tidak dibatasi"}</div>
            <div>Join Dibuka: {formatDateTimeLocal(classroom.join_opens_at)}</div>
            <div>Join Ditutup: {formatDateTimeLocal(classroom.join_closes_at)}</div>
            <div>Mulai Kelas: {formatDateTimeLocal(classroom.starts_at)}</div>
            <div>Akhir Kelas: {formatDateTimeLocal(classroom.ends_at)}</div>
          </div>
        </div>

        <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
          <div className="text-lg font-semibold text-white">Student Aktif</div>

          {!activeStudents?.length ? (
            <div className="mt-4 text-sm text-white/60">Belum ada student di kelas ini.</div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-white/60">
                  <tr className="border-b border-white/10 text-left">
                    <th className="px-4 py-3">Nama</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Bergabung</th>
                    <th className="px-4 py-3">Via</th>
                    <th className="px-4 py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {activeStudents.map((student) => (
                    <tr key={student.user_id} className="border-b border-white/10">
                      <td className="px-4 py-3 text-white">{student.name}</td>
                      <td className="px-4 py-3 text-white/70">{student.email}</td>
                      <td className="px-4 py-3 text-white/70">
                        {formatDateTimeLocal(student.joined_at)}
                      </td>
                      <td className="px-4 py-3 text-white/70">{student.joined_via ?? "-"}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => removeStudent(student)}
                          className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-100 ring-1 ring-red-500/20"
                        >
                          Keluarkan
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
          <div className="text-lg font-semibold text-white">Riwayat Student Dikeluarkan</div>

          {!removedStudents?.length ? (
            <div className="mt-4 text-sm text-white/60">Belum ada student yang dikeluarkan.</div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-white/60">
                  <tr className="border-b border-white/10 text-left">
                    <th className="px-4 py-3">Nama</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Dikeluarkan</th>
                    <th className="px-4 py-3">Alasan</th>
                    <th className="px-4 py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {removedStudents.map((student) => (
                    <tr key={student.user_id} className="border-b border-white/10">
                      <td className="px-4 py-3 text-white">{student.name}</td>
                      <td className="px-4 py-3 text-white/70">{student.email}</td>
                      <td className="px-4 py-3 text-white/70">
                        {formatDateTimeLocal(student.removed_at)}
                      </td>
                      <td className="px-4 py-3 text-white/70">{student.removed_reason || "-"}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => restoreStudent(student)}
                          className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-100 ring-1 ring-emerald-500/20"
                        >
                          Restore
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}