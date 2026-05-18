import React, { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { router } from "@inertiajs/react";

const cx = (...c) => c.filter(Boolean).join(" ");

function Pagination({ links }) {
  if (!links || links.length <= 3) return null;

  return (
    <div className="mt-5 flex flex-wrap gap-2">
      {links.map((l, idx) => (
        <button
          key={idx}
          disabled={!l.url}
          onClick={() => l.url && router.visit(l.url)}
          className={cx(
            "rounded-full px-4 py-2 text-sm font-bold transition",
            l.active
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900",
            !l.url && "opacity-50 cursor-not-allowed"
          )}
          dangerouslySetInnerHTML={{ __html: l.label }}
        />
      ))}
    </div>
  );
}

export default function UsersIndex({ filters, users }) {
  const [q, setQ] = useState(filters.q ?? "");
  const [role, setRole] = useState(filters.role ?? "");
  const [verified, setVerified] = useState(filters.verified ?? "");

  const apply = () => {
    router.get(
      route("admin.users.index"),
      { q, role, verified },
      { preserveState: true, replace: true }
    );
  };

  const clear = () => {
    setQ("");
    setRole("");
    setVerified("");
    router.get(route("admin.users.index"), {}, { preserveState: true, replace: true });
  };

  const fmt = (iso) => {
    if (!iso) return "-";
    try {
      return new Date(iso).toLocaleString("id-ID", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  return (
    <AdminLayout title="Manajemen User">
      <div className="space-y-5">
        {/* Filters */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <input
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none"
              placeholder="Cari nama/email..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && apply()}
            />

            <select
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="">Semua Role</option>
              <option value="student">student</option>
              <option value="instructor">instructor</option>
              <option value="admin">admin</option>
            </select>

            <select
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none"
              value={verified}
              onChange={(e) => setVerified(e.target.value)}
            >
              <option value="">Semua Verifikasi</option>
              <option value="yes">Verified</option>
              <option value="no">Not Verified</option>
            </select>

            <div className="flex gap-2">
              <button
                onClick={apply}
                className="flex-1 rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-700"
              >
                Terapkan
              </button>
              <button
                onClick={clear}
                className="rounded-full bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-900"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="mt-3 text-xs text-slate-500">
            Reset password tidak dikelola admin. User reset sendiri via email.
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="py-3 px-4 font-bold">Nama</th>
                <th className="py-3 px-4 font-bold">Email</th>
                <th className="py-3 px-4 font-bold">Role</th>
                <th className="py-3 px-4 font-bold">Instructor Status</th>
                <th className="py-3 px-4 font-bold">Email Verified</th>
                <th className="py-3 px-4 font-bold">Created</th>
              </tr>
            </thead>
            <tbody>
              {users.data.map((u) => (
                <tr key={u.id} className="border-b border-slate-100">
                  <td className="py-3 px-4 font-bold text-slate-900">{u.name}</td>
                  <td className="py-3 px-4 text-slate-600">{u.email}</td>
                  <td className="py-3 px-4">
                    <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700">{u.instructor_status ?? "-"}</td>
                  <td className="py-3 px-4">
                    {u.email_verified_at ? (
                      <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
                        Not Verified
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-500">{fmt(u.created_at)}</td>
                </tr>
              ))}

              {users.data.length === 0 && (
                <tr>
                  <td className="py-6 px-4 text-slate-600" colSpan="6">
                    Tidak ada user sesuai filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination links={users.links} />
      </div>
    </AdminLayout>
  );
}
