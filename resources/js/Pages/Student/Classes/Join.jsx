import React from "react";
import { Head, useForm } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";

function formatDateTimeLocal(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("id-ID");
}

export default function Join({ myClasses = [], removedClasses = [] }) {
  const { data, setData, post, processing, errors } = useForm({
    join_code: "",
  });

  const navItems = [
    // {
    //   key: "dash",
    //   label: "Dashboard",
    //   href: route("student.dashboard"),
    //   activePath: "/student/dashboard",
    // },
    // {
    //   key: "join",
    //   label: "Gabung Kelas",
    //   href: route("student.classes.join"),
    //   activePath: "/student/classes/join",
    // },
  ];

  const submit = (e) => {
    e.preventDefault();
    post(route("student.classes.join.store"));
  };

  const inputClass =
    "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-orange-100";

  return (
    <AppLayout title="Gabung Kelas" subtitle="Student Panel" panel="student">
      <Head title="Gabung Kelas" />

      <div className="space-y-6">
        {removedClasses.length > 0 ? (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
            <div className="text-sm font-extrabold text-amber-900">
              Perhatian
            </div>
            <div className="mt-1 text-sm font-medium text-amber-800">
              Anda memiliki riwayat dikeluarkan dari kelas. Untuk kelas tersebut,
              Anda tidak dapat bergabung lagi menggunakan join code dan perlu
              meminta instruktur melakukan restore.
            </div>
          </div>
        ) : null}

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-lg font-extrabold text-slate-900">Masukkan Join Code</div>
          <div className="mt-1 text-sm font-medium text-slate-500">
            Gunakan join code yang diberikan instruktur.
          </div>

          <form onSubmit={submit} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <input
                value={data.join_code}
                onChange={(e) => setData("join_code", e.target.value.toUpperCase())}
                placeholder="Contoh: A1B2C3D4"
                className={inputClass}
              />
              {errors.join_code ? (
                <div className="mt-1 text-sm font-medium text-red-600">
                  {errors.join_code}
                </div>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={processing}
              className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {processing ? "Memproses..." : "Gabung"}
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-lg font-extrabold text-slate-900">Kelas Saya</div>

          {!myClasses.length ? (
            <div className="mt-4 rounded-2xl bg-slate-50 p-5 text-sm font-medium text-slate-600">
              Anda belum tergabung pada kelas mana pun.
            </div>
          ) : (
            <div className="mt-4 grid gap-3">
              {myClasses.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm"
                >
                  <div className="text-sm font-bold text-slate-900">{item.name}</div>
                  <div className="mt-1 text-xs font-medium text-slate-500">
                    {item.subject_name} • {item.class_code}
                  </div>
                  <div className="mt-2 text-xs font-medium text-slate-500">
                    Bergabung: {formatDateTimeLocal(item.joined_at)} • Via: {item.joined_via ?? "-"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-lg font-extrabold text-slate-900">
            Riwayat Dikeluarkan dari Kelas
          </div>

          {!removedClasses.length ? (
            <div className="mt-4 rounded-2xl bg-slate-50 p-5 text-sm font-medium text-slate-600">
              Tidak ada riwayat dikeluarkan dari kelas.
            </div>
          ) : (
            <div className="mt-4 grid gap-3">
              {removedClasses.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="text-sm font-bold text-slate-900">{item.name}</div>
                      <div className="mt-1 text-xs font-medium text-slate-600">
                        {item.subject_name} • {item.class_code}
                      </div>
                      <div className="mt-2 text-xs font-medium text-slate-600">
                        Dikeluarkan: {formatDateTimeLocal(item.removed_at)}
                      </div>
                      <div className="mt-1 text-xs font-medium text-slate-600">
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
    </AppLayout>
  );
}
