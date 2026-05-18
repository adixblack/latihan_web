import React from "react";
import { Head, Link, usePage } from "@inertiajs/react";

const cx = (...c) => c.filter(Boolean).join(" ");

function BrandMark() {
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 via-pink-500 to-emerald-500 text-white shadow-sm">
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
        <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" />
      </svg>
    </div>
  );
}

function NavItem({ href, active, label }) {
  return (
    <Link
      href={href}
      className={cx(
        "flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition",
        active
          ? "bg-slate-900 text-white shadow-sm"
          : "text-slate-700 hover:bg-white hover:text-slate-900"
      )}
    >
      <span>{label}</span>
      <span className={cx("text-xs", active ? "text-white/70" : "text-slate-400")}>{active ? "aktif" : ""}</span>
    </Link>
  );
}

function Flash() {
  const { flash } = usePage().props;

  if (!flash?.success && !flash?.error) return null;

  const isErr = !!flash?.error;
  const msg = flash?.error ?? flash?.success;

  return (
    <div
      className={cx(
        "mb-4 rounded-2xl border px-4 py-3 text-sm font-bold",
        isErr
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700"
      )}
    >
      {msg}
    </div>
  );
}

export default function AdminLayout({ title = "Admin", children }) {
  const { auth, ziggy } = usePage().props;
  const user = auth?.user;

  const currentUrl = ziggy?.location ?? "";

  const active = (path) => currentUrl.includes(path);

  return (
    <>
      <Head title={title} />

      {/* Animasi kecil sama seperti Welcome.jsx */}
      <style>{`
        @keyframes floaty { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }
        @keyframes floaty2 { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-8px) } }
        .floaty { animation: floaty 7s ease-in-out infinite; }
        .floaty2 { animation: floaty2 6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .floaty, .floaty2 { animation: none !important; } }
      `}</style>

      <div className="min-h-screen bg-slate-50 font-sans selection:bg-orange-100 selection:text-orange-900">
        {/* Background blobs ala landing */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-orange-200/50 blur-3xl floaty" />
          <div className="absolute top-10 -right-24 h-80 w-80 rounded-full bg-pink-200/50 blur-3xl floaty2" />
          <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-emerald-200/45 blur-3xl floaty" />
        </div>

        {/* TOP BAR (mirip navbar welcome: putih glassy) */}
        <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/90 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-3">
                <BrandMark />
                <div>
                  <div className="text-lg font-bold tracking-tight text-slate-900">RubriQ AI</div>
                  <div className="text-xs font-bold text-slate-500">Admin Panel</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden sm:block text-xs font-bold text-slate-500">
                  {user?.email}
                </span>

                <Link
                  href={route("profile.edit")}
                  className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-900"
                >
                  Profile
                </Link>

                <Link
                  href={route("logout")}
                  method="post"
                  as="button"
                  className="rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-700"
                >
                  Logout
                </Link>
              </div>
            </div>
          </div>

          {/* brand progress bar tipis (optional vibe landing) */}
          <div className="h-1 w-full bg-transparent">
            <div className="h-1 w-1/3 bg-gradient-to-r from-orange-500 via-pink-500 to-emerald-500" />
          </div>
        </header>

        {/* CONTENT GRID */}
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-12">
            {/* SIDEBAR */}
            <aside className="lg:col-span-3">
              <div className="rounded-3xl border border-slate-200 bg-white/70 p-4 shadow-sm backdrop-blur">
                <div className="mb-3">
                  <div className="text-sm font-extrabold text-slate-900">{title}</div>
                  <div className="text-xs font-bold text-slate-500">
                    Navigasi khusus Admin (tanpa menu Student/Instructor)
                  </div>
                </div>

                <div className="space-y-2">
                  <NavItem
                    href={route("admin.dashboard")}
                    active={active("/admin/dashboard")}
                    label="Dashboard"
                  />
                  <NavItem
                    href={route("admin.instructor_applications.index")}
                    active={active("/admin/instructor-applications")}
                    label="Pengajuan Guru/Dosen"
                  />
                  <NavItem
                    href={route("admin.users.index")}
                    active={active("/admin/users")}
                    label="Manajemen User"
                  />
                </div>

                <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-xs font-bold text-slate-500">Catatan</div>
                  <div className="mt-2 text-xs text-slate-600">
                    Reset password tidak dikelola Admin. User reset sendiri via email (Breeze).
                  </div>
                </div>
              </div>
            </aside>

            {/* MAIN */}
            <main className="lg:col-span-9">
              <Flash />

              <div className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
