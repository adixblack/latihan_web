import React from "react";
import { Link, router, usePage } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";

function Badge({ children, active = true }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
        active
          ? "bg-emerald-500/10 text-emerald-200 ring-emerald-500/20"
          : "bg-zinc-500/10 text-zinc-200 ring-zinc-500/20"
      }`}
    >
      {children}
    </span>
  );
}

export default function Index({ classes }) {
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

  const archiveClass = (id) => {
    if (!confirm("Arsipkan kelas ini?")) return;
    router.post(route("instructor.classes.archive", id));
  };

  const unarchiveClass = (id) => {
    if (!confirm("Aktifkan kembali kelas ini?")) return;
    router.post(route("instructor.classes.unarchive", id));
  };

  return (
    <AppLayout title="Kelas Ajar" subtitle="Instructor Panel" panel="instructor">
      <div className="space-y-6">
        {flash?.success ? (
          <div className="rounded-2xl bg-emerald-500/10 p-4 text-sm text-emerald-100 ring-1 ring-emerald-500/20">
            {flash.success}
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-2xl font-semibold text-white">Kelas Ajar</div>
            <div className="mt-1 text-sm text-white/60">
              Kelola ruang belajar untuk satu mata pelajaran atau mata kuliah.
            </div>
          </div>

          <Link
            href={route("instructor.classes.create")}
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-zinc-950 hover:opacity-90"
          >
            + Buat Kelas
          </Link>
        </div>

        {!classes?.data?.length ? (
          <div className="rounded-2xl bg-white/5 p-6 text-sm text-white/70 ring-1 ring-white/10">
            Belum ada kelas. Silakan buat kelas pertama Anda.
          </div>
        ) : (
          <div className="grid gap-4">
            {classes.data.map((item) => (
              <div key={item.id} className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="text-lg font-semibold text-white">{item.name}</div>
                    <div className="text-sm text-white/60">{item.subject_name}</div>
                    <div className="flex flex-wrap gap-2 text-xs text-white/60">
                      <span>Kode: {item.class_code}</span>
                      <span>•</span>
                      <span>Join code: {item.join_code}</span>
                      <span>•</span>
                      <span>Student: {item.students_count ?? 0}</span>
                      <span>•</span>
                      <span>Tugas: {item.assignments_count ?? 0}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge active={item.is_active && !item.archived_at}>
                      {item.archived_at ? "Archived" : item.is_active ? "Aktif" : "Nonaktif"}
                    </Badge>

                    <Link
                      href={route("instructor.classes.show", item.id)}
                      className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white ring-1 ring-white/10 hover:bg-white/20"
                    >
                      Detail
                    </Link>

                    <Link
                      href={route("instructor.classes.edit", item.id)}
                      className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white ring-1 ring-white/10 hover:bg-white/20"
                    >
                      Edit
                    </Link>

                    {item.archived_at ? (
                      <button
                        onClick={() => unarchiveClass(item.id)}
                        className="rounded-xl bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-100 ring-1 ring-emerald-500/20"
                      >
                        Aktifkan
                      </button>
                    ) : (
                      <button
                        onClick={() => archiveClass(item.id)}
                        className="rounded-xl bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-100 ring-1 ring-red-500/20"
                      >
                        Arsipkan
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}