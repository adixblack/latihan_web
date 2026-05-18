import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

function StatCard({ title, value, hint }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="mt-1 text-3xl font-semibold text-gray-900">{value}</div>
      {hint ? <div className="mt-2 text-xs text-gray-500">{hint}</div> : null}
    </div>
  );
}

export default function Dashboard({ auth, counts, latestPending }) {
  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Admin Dashboard</h2>}
    >
      <Head title="Admin Dashboard" />

      <div className="py-8">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
          {/* Quick actions */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div>
              <div className="text-lg font-semibold text-gray-900">Kontrol Admin RubriQ AI</div>
              <div className="text-sm text-gray-600">
                Kelola permohonan Guru/Dosen dan ringkasan user.
              </div>
            </div>

            <div className="flex gap-2">
              <Link
                href={route('admin.instructor_applications.index')}
                className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Pengajuan Guru/Dosen
              </Link>

              {/* Placeholder untuk fitur berikutnya */}
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                onClick={() => alert('Menu ini akan kita isi pada tahap berikutnya.')}
              >
                Manajemen User (Next)
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard title="Total User" value={counts.users_total} />
            <StatCard title="Student" value={counts.students_total} hint="Default setelah register" />
            <StatCard title="Instructor" value={counts.instructors_total} hint="Sudah disetujui Admin" />
            <StatCard title="Admin" value={counts.admins_total} />
            <StatCard
              title="Pending Instructor"
              value={counts.pending_instructor_applications}
              hint="Menunggu approval"
            />
          </div>

          {/* Latest pending applications */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold text-gray-900">Pengajuan Guru/Dosen Terbaru</div>
                <div className="text-sm text-gray-600">Maks. 7 data terbaru (status pending).</div>
              </div>

              <Link
                href={route('admin.instructor_applications.index')}
                className="text-sm font-semibold text-indigo-600 hover:underline"
              >
                Lihat semua →
              </Link>
            </div>

            <div className="mt-4 overflow-x-auto">
              {latestPending.length === 0 ? (
                <div className="rounded-lg bg-gray-50 p-5 text-sm text-gray-600">
                  Tidak ada pengajuan yang pending.
                </div>
              ) : (
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600 border-b">
                      <th className="py-3 pr-4">Nama</th>
                      <th className="py-3 pr-4">Email</th>
                      <th className="py-3 pr-4">Institusi</th>
                      <th className="py-3 pr-4">Posisi</th>
                      <th className="py-3 pr-4">Applied At</th>
                      <th className="py-3">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestPending.map((u) => (
                      <tr key={u.id} className="border-b align-top">
                        <td className="py-3 pr-4 font-semibold text-gray-900">{u.name}</td>
                        <td className="py-3 pr-4 text-gray-700">{u.email}</td>
                        <td className="py-3 pr-4 text-gray-700">
                          {u.instructor_application?.institution ?? '-'}
                        </td>
                        <td className="py-3 pr-4 text-gray-700">
                          {u.instructor_application?.position ?? '-'}
                        </td>
                        <td className="py-3 pr-4 text-gray-500">
                          {u.instructor_applied_at ?? '-'}
                        </td>
                        <td className="py-3">
                          <Link
                            href={route('admin.instructor_applications.index')}
                            className="inline-flex items-center rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white hover:bg-black"
                          >
                            Review
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="mt-4 text-xs text-gray-500">
              Catatan: tombol “Review” mengarah ke halaman approval lengkap.
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}