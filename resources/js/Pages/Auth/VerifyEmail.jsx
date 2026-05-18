import React, { useEffect, useState } from "react";
import { Head, Link, useForm, usePage } from "@inertiajs/react";

const cx = (...c) => c.filter(Boolean).join(" ");

export default function VerifyEmail({ status, email, expiresMinutes }) {
  const { flash } = usePage().props;

  const { data, setData, post, processing, errors } = useForm({
    code: "",
  });

  const submit = (e) => {
    e.preventDefault();
    post(route("verification.otp.verify"));
  };

  const resend = () => {
    post(route("verification.send"));
  };

  return (
    <>
      <Head title="Verifikasi Email" />

      <div className="min-h-screen bg-slate-50 font-sans selection:bg-orange-100 selection:text-orange-900">
        {/* blobs ala Welcome */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-orange-200/50 blur-3xl" />
          <div className="absolute top-10 -right-24 h-80 w-80 rounded-full bg-pink-200/50 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-emerald-200/45 blur-3xl" />
        </div>

        {/* top mini navbar */}
        <div className="relative border-b border-slate-200/90 bg-white/90 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 via-pink-500 to-emerald-500 text-white">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                    <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11z" />
                  </svg>
                </div>
                <span className="text-lg font-bold tracking-tight text-slate-900">RubriQ AI</span>
              </div>

              <Link
                href={route("logout")}
                method="post"
                as="button"
                className="rounded-full bg-slate-900 px-5 py-2 text-sm font-bold text-white transition hover:bg-slate-700"
              >
                Logout
              </Link>
            </div>
          </div>
          <div className="h-1 w-full bg-transparent">
            <div className="h-1 w-2/3 bg-gradient-to-r from-orange-500 via-pink-500 to-emerald-500" />
          </div>
        </div>

        <div className="relative mx-auto max-w-xl px-4 py-14">
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-sm backdrop-blur">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Verifikasi Email Anda
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Kami sudah mengirim <b>kode 6 digit</b> ke email: <b>{email}</b>.
              Kode berlaku <b>{expiresMinutes} menit</b>.
            </p>

            {flash?.error && (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {flash.error}
              </div>
            )}

            {flash?.success && (
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                {flash.success}
              </div>
            )}

            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500">Kode Verifikasi (6 digit)</label>
                <input
                  inputMode="numeric"
                  maxLength={6}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-lg font-extrabold tracking-[0.35em] text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
                  value={data.code}
                  onChange={(e) => setData("code", e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="••••••"
                />
                {errors.code && <div className="mt-2 text-sm font-bold text-red-600">{errors.code}</div>}
              </div>

              <button
                type="submit"
                disabled={processing || data.code.length !== 6}
                className={cx(
                  "w-full rounded-full px-6 py-3.5 text-sm font-bold text-white transition",
                  processing || data.code.length !== 6 ? "bg-slate-400 cursor-not-allowed" : "bg-slate-900 hover:bg-slate-700"
                )}
              >
                {processing ? "Memverifikasi..." : "Verifikasi"}
              </button>

              <button
                type="button"
                onClick={resend}
                className="w-full rounded-full bg-white px-6 py-3.5 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-900"
              >
                Kirim Ulang Kode
              </button>

              <div className="text-xs text-slate-500">
                Jika Anda tidak menerima email, cek folder Spam/Promotions.
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
