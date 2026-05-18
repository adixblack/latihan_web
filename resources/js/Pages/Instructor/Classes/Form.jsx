import React from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";

function Field({ label, error, children, hint }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-medium text-white/80">{label}</label>
        {hint ? <span className="text-xs text-white/40">{hint}</span> : null}
      </div>
      {children}
      {error ? <div className="text-sm text-red-200">{error}</div> : null}
    </div>
  );
}

export default function Form({ mode, classroom }) {
  const editing = mode === "edit";

  const { data, setData, post, put, processing, errors } = useForm({
    name: classroom?.name ?? "",
    subject_name: classroom?.subject_name ?? "",
    description: classroom?.description ?? "",
    class_code: classroom?.class_code ?? "",
    allow_self_join: classroom?.allow_self_join ?? true,
    max_students: classroom?.max_students ?? "",
    visibility: classroom?.visibility ?? "private",
    join_opens_at: classroom?.join_opens_at ?? "",
    join_closes_at: classroom?.join_closes_at ?? "",
    starts_at: classroom?.starts_at ?? "",
    ends_at: classroom?.ends_at ?? "",
    is_active: classroom?.is_active ?? true,
  });

  const submit = (e) => {
    e.preventDefault();

    if (editing) {
      put(route("instructor.classes.update", classroom.id));
    } else {
      post(route("instructor.classes.store"));
    }
  };

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

  return (
    <AppLayout
      title={editing ? "Edit Kelas" : "Buat Kelas"}
      subtitle="Instructor Panel"
      panel='instructor'
    >
      <Head title={editing ? "Edit Kelas" : "Buat Kelas"} />

      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-2xl font-semibold text-black">
              {editing ? "Edit Kelas Ajar" : "Buat Kelas Ajar"}
            </div>

            <div className="mt-1 text-sm text-gray-600">
              Satu kelas untuk satu mata pelajaran / mata kuliah.
            </div>
          </div>

          <Link
            href={route("instructor.classes.index")}
            className="rounded-xl bg-gray-200 px-4 py-2 text-sm font-semibold text-black ring-1 ring-gray-300 hover:bg-gray-300"
          >
            ← Kembali
          </Link>
        </div>

        <form
          onSubmit={submit}
          className="space-y-4 rounded-2xl bg-white p-6 ring-1 ring-gray-200"
        >
          <Field
            label="Nama Kelas"
            error={errors.name}
            hint="Contoh: Pemrograman Web - TI A"
          >
            <input
              value={data.name}
              onChange={(e) => setData("name", e.target.value)}
              className="w-full rounded-xl bg-gray-100 px-3 py-2 text-sm text-black ring-1 ring-gray-300"
            />
          </Field>

          <Field
            label="Mata Pelajaran / Mata Kuliah"
            error={errors.subject_name}
          >
            <input
              value={data.subject_name}
              onChange={(e) => setData("subject_name", e.target.value)}
              className="w-full rounded-xl bg-gray-100 px-3 py-2 text-sm text-black ring-1 ring-gray-300"
            />
          </Field>

          <Field
            label="Kode Kelas"
            error={errors.class_code}
            hint="Unik, mis. PW-TIA-2026"
          >
            <input
              value={data.class_code}
              onChange={(e) => setData("class_code", e.target.value)}
              className="w-full rounded-xl bg-gray-100 px-3 py-2 text-sm text-black ring-1 ring-gray-300"
            />
          </Field>

          <Field label="Deskripsi" error={errors.description}>
            <textarea
              rows={4}
              value={data.description}
              onChange={(e) => setData("description", e.target.value)}
              className="w-full rounded-xl bg-gray-100 px-3 py-2 text-sm text-black ring-1 ring-gray-300"
            />
          </Field>

          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Maksimal Student"
              error={errors.max_students}
              hint="Kosongkan jika tanpa batas"
            >
              <input
                type="number"
                min="1"
                value={data.max_students}
                onChange={(e) => setData("max_students", e.target.value)}
                className="w-full rounded-xl bg-gray-100 px-3 py-2 text-sm text-black ring-1 ring-gray-300"
              />
            </Field>

            <Field label="Visibility" error={errors.visibility}>
              <select
                value={data.visibility}
                onChange={(e) => setData("visibility", e.target.value)}
                className="w-full rounded-xl bg-gray-100 px-3 py-2 text-sm text-black ring-1 ring-gray-300"
              >
                <option value="private">Private</option>
                <option value="open">Open</option>
              </select>
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Join Dibuka" error={errors.join_opens_at}>
              <input
                type="datetime-local"
                value={data.join_opens_at}
                onChange={(e) => setData("join_opens_at", e.target.value)}
                className="w-full rounded-xl bg-gray-100 px-3 py-2 text-sm text-black ring-1 ring-gray-300"
              />
            </Field>

            <Field label="Join Ditutup" error={errors.join_closes_at}>
              <input
                type="datetime-local"
                value={data.join_closes_at}
                onChange={(e) => setData("join_closes_at", e.target.value)}
                className="w-full rounded-xl bg-gray-100 px-3 py-2 text-sm text-black ring-1 ring-gray-300"
              />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Mulai Kelas" error={errors.starts_at}>
              <input
                type="datetime-local"
                value={data.starts_at}
                onChange={(e) => setData("starts_at", e.target.value)}
                className="w-full rounded-xl bg-gray-100 px-3 py-2 text-sm text-black ring-1 ring-gray-300"
              />
            </Field>

            <Field label="Akhir Kelas" error={errors.ends_at}>
              <input
                type="datetime-local"
                value={data.ends_at}
                onChange={(e) => setData("ends_at", e.target.value)}
                className="w-full rounded-xl bg-gray-100 px-3 py-2 text-sm text-black ring-1 ring-gray-300"
              />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex items-center gap-3 rounded-xl bg-gray-100 px-4 py-3 ring-1 ring-gray-300">
              <input
                type="checkbox"
                checked={data.allow_self_join}
                onChange={(e) =>
                  setData("allow_self_join", e.target.checked)
                }
              />

              <span className="text-sm text-black">
                Izinkan student bergabung sendiri dengan join code
              </span>
            </label>

            <label className="flex items-center gap-3 rounded-xl bg-gray-100 px-4 py-3 ring-1 ring-gray-300">
              <input
                type="checkbox"
                checked={data.is_active}
                onChange={(e) => setData("is_active", e.target.checked)}
              />

              <span className="text-sm text-black">
                Kelas aktif
              </span>
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={processing}
              className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              {processing
                ? "Menyimpan..."
                : editing
                  ? "Simpan Perubahan"
                  : "Buat Kelas"}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}