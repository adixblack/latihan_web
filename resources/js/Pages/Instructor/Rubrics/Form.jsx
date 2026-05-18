import React from "react";
import { Link, router, useForm } from "@inertiajs/react";
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

function InputError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-sm font-medium text-red-600">{message}</p>;
}

export default function Form({ mode = "create", rubric = null }) {
  const isEdit = mode === "edit";

  const { data, setData, errors, processing } = useForm({
    title: rubric?.title ?? "",
    description: rubric?.description ?? "",
    scale_type: rubric?.scale_type ?? "analytic",
    max_score: rubric?.max_score ?? 100,
    is_template: rubric?.is_template ?? false,
    criteria:
      rubric?.criteria?.map((item, index) => ({
        title: item.title ?? "",
        description: item.description ?? "",
        weight: item.weight ?? 1,
        max_score: item.max_score ?? 10,
        sort_order: item.sort_order ?? index + 1,
      })) ?? [
        {
          title: "",
          description: "",
          weight: 1,
          max_score: 10,
          sort_order: 1,
        },
      ],
  });

  const updateCriterion = (index, field, value) => {
    const updated = [...data.criteria];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setData("criteria", updated);
  };

  const addCriterion = () => {
    setData("criteria", [
      ...data.criteria,
      {
        title: "",
        description: "",
        weight: 1,
        max_score: 10,
        sort_order: data.criteria.length + 1,
      },
    ]);
  };

  const removeCriterion = (index) => {
    const updated = data.criteria
      .filter((_, i) => i !== index)
      .map((item, i) => ({
        ...item,
        sort_order: i + 1,
      }));

    setData("criteria", updated);
  };

  const submit = (e) => {
    e.preventDefault();

    const payload = {
      ...data,
      criteria: data.criteria.map((item, index) => ({
        ...item,
        sort_order: index + 1,
      })),
    };

    if (isEdit) {
      router.put(route("instructor.rubrics.update", rubric.id), payload);
    } else {
      router.post(route("instructor.rubrics.store"), payload);
    }
  };

  return (
    <AppLayout title="Buat Rubrik" subtitle="Instructor Panel" panel="instructor">
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-2xl font-extrabold tracking-tight text-slate-900">
                {isEdit ? "Edit Rubrik Penilaian" : "Buat Rubrik Penilaian"}
              </div>
              <div className="mt-2 text-sm text-slate-600">
                Susun rubrik dan kriteria yang akan dipakai AI serta instruktur saat menilai tugas.
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href={route("instructor.rubrics.index")}
                className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-900"
              >
                ← Kembali ke Rubrik
              </Link>
            </div>
          </div>

          <div className="mt-5 h-1 w-full rounded-full bg-slate-100">
            <div className="h-1 w-2/3 rounded-full bg-gradient-to-r from-orange-500 via-pink-500 to-emerald-500" />
          </div>
        </div>

        <form onSubmit={submit} className="space-y-6">
          <Section title="Informasi Utama" desc="Data dasar rubrik penilaian.">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-bold text-slate-700">
                  Judul Rubrik
                </label>
                <input
                  type="text"
                  value={data.title}
                  onChange={(e) => setData("title", e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-orange-100"
                  placeholder="Contoh: Rubrik Esai Argumentatif"
                />
                <InputError message={errors.title} />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-bold text-slate-700">
                  Deskripsi
                </label>
                <textarea
                  value={data.description}
                  onChange={(e) => setData("description", e.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-orange-100"
                  placeholder="Jelaskan tujuan atau konteks penggunaan rubrik ini"
                />
                <InputError message={errors.description} />
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold text-slate-700">
                  Tipe Skala
                </label>
                <select
                  value={data.scale_type}
                  onChange={(e) => setData("scale_type", e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-orange-100"
                >
                  <option value="analytic">Analytic</option>
                  <option value="holistic">Holistic</option>
                </select>
                <InputError message={errors.scale_type} />
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold text-slate-700">
                  Nilai Maksimal Akhir
                </label>
                <input
                  type="number"
                  min="1"
                  value={data.max_score}
                  onChange={(e) => setData("max_score", e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-orange-100"
                />
                <InputError message={errors.max_score} />
              </div>

              <div className="md:col-span-2">
                <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={!!data.is_template}
                    onChange={(e) => setData("is_template", e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-orange-200"
                  />
                  <span className="text-sm font-bold text-slate-700">
                    Simpan sebagai template
                  </span>
                </label>
              </div>
            </div>
          </Section>

          <Section
            title="Kriteria Rubrik"
            desc="Tambahkan beberapa kriteria yang akan dinilai."
            action={
              <button
                type="button"
                onClick={addCriterion}
                className="rounded-full bg-slate-900 px-5 py-2 text-sm font-bold text-white transition hover:bg-slate-700"
              >
                + Tambah Kriteria
              </button>
            }
          >
            <div className="space-y-4">
              {data.criteria.map((criterion, index) => (
                <div
                  key={index}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-base font-extrabold text-slate-900">
                        Kriteria #{index + 1}
                      </div>
                      <div className="text-xs text-slate-500">
                        Urutan akan disimpan otomatis saat submit
                      </div>
                    </div>

                    {data.criteria.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeCriterion(index)}
                        className="rounded-full bg-white px-4 py-2 text-xs font-bold text-red-600 shadow-sm ring-1 ring-red-200 transition hover:bg-red-50"
                      >
                        Hapus
                      </button>
                    ) : null}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label className="mb-1 block text-sm font-bold text-slate-700">
                        Judul Kriteria
                      </label>
                      <input
                        type="text"
                        value={criterion.title}
                        onChange={(e) => updateCriterion(index, "title", e.target.value)}
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-orange-100"
                        placeholder="Contoh: Kejelasan argumen"
                      />
                      <InputError message={errors[`criteria.${index}.title`]} />
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-1 block text-sm font-bold text-slate-700">
                        Deskripsi Kriteria
                      </label>
                      <textarea
                        rows={3}
                        value={criterion.description}
                        onChange={(e) =>
                          updateCriterion(index, "description", e.target.value)
                        }
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-orange-100"
                        placeholder="Jelaskan apa yang dinilai pada kriteria ini"
                      />
                      <InputError message={errors[`criteria.${index}.description`]} />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-bold text-slate-700">
                        Bobot
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={criterion.weight}
                        onChange={(e) => updateCriterion(index, "weight", e.target.value)}
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-orange-100"
                      />
                      <InputError message={errors[`criteria.${index}.weight`]} />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-bold text-slate-700">
                        Max Score Kriteria
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={criterion.max_score}
                        onChange={(e) =>
                          updateCriterion(index, "max_score", e.target.value)
                        }
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-orange-100"
                      />
                      <InputError message={errors[`criteria.${index}.max_score`]} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <InputError message={errors.criteria} />
          </Section>

          <div className="flex flex-wrap justify-end gap-3">
            <Link
              href={route("instructor.rubrics.index")}
              className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-900"
            >
              Batal
            </Link>

            <button
              type="submit"
              disabled={processing}
              className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {processing
                ? "Menyimpan..."
                : isEdit
                ? "Simpan Perubahan"
                : "Simpan Rubrik"}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}

