import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function InstructorApplications({ auth, pending }) {
  const [noteByUserId, setNoteByUserId] = useState({});

  const approve = (userId) => {
    router.post(route('admin.instructor_applications.approve', userId), {
      note: noteByUserId[userId] ?? '',
    });
  };

  const reject = (userId) => {
    const note = noteByUserId[userId] ?? '';
    if (!note.trim()) {
      alert('Catatan penolakan wajib diisi.');
      return;
    }
    router.post(route('admin.instructor_applications.reject', userId), {
      note,
    });
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Pengajuan Guru/Dosen</h2>}
    >
      <Head title="Pengajuan Guru/Dosen" />

      <div className="py-8">
        <div className="max-w-6xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white shadow-sm sm:rounded-lg p-6">
            <div className="mb-4 text-sm text-gray-600">
              Total pending: <span className="font-semibold">{pending.length}</span>
            </div>

            {pending.length === 0 ? (
              <div className="p-6 rounded-lg bg-gray-50 text-gray-600">
                Tidak ada pengajuan yang menunggu persetujuan.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600 border-b">
                      <th className="py-3 pr-4">User</th>
                      <th className="py-3 pr-4">Institusi</th>
                      <th className="py-3 pr-4">Posisi</th>
                      <th className="py-3 pr-4">Pesan</th>
                      <th className="py-3 pr-4">Bukti</th>
                      <th className="py-3 pr-4">Catatan Admin</th>
                      <th className="py-3">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pending.map((u) => (
                      <tr key={u.id} className="border-b align-top">
                        <td className="py-3 pr-4">
                          <div className="font-semibold">{u.name}</div>
                          <div className="text-gray-500">{u.email}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            Applied: {u.instructor_applied_at ?? '-'}
                          </div>
                        </td>

                        <td className="py-3 pr-4">{u.instructor_application?.institution ?? '-'}</td>
                        <td className="py-3 pr-4">{u.instructor_application?.position ?? '-'}</td>

                        <td className="py-3 pr-4 max-w-sm">
                          <div className="text-gray-800 whitespace-pre-wrap">
                            {u.instructor_application?.message ?? '-'}
                          </div>
                        </td>

                        <td className="py-3 pr-4">
                          {u.instructor_application?.proof_url ? (
                            <a
                              href={u.instructor_application.proof_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-600 hover:underline"
                            >
                              Lihat
                            </a>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>

                        <td className="py-3 pr-4">
                          <textarea
                            rows="3"
                            className="w-64 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="Opsional untuk approve, wajib untuk reject"
                            value={noteByUserId[u.id] ?? ''}
                            onChange={(e) =>
                              setNoteByUserId((prev) => ({ ...prev, [u.id]: e.target.value }))
                            }
                          />
                        </td>

                        <td className="py-3">
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => approve(u.id)}
                              className="px-3 py-2 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700"
                            >
                              Approve
                            </button>

                            <button
                              onClick={() => reject(u.id)}
                              className="px-3 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="text-xs text-gray-500 mt-6">
              Approve: role user menjadi <span className="font-semibold">instructor</span>. Reject: user tetap <span className="font-semibold">student</span> dan status menjadi <span className="font-semibold">rejected</span>.
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
