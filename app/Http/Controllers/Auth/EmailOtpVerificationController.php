<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\EmailOtpService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Inertia\Inertia;

class EmailOtpVerificationController extends Controller
{
    public function show(Request $request)
    {
        return Inertia::render('Auth/VerifyEmail', [
            'status' => session('status'),
            'email' => $request->user()->email,
            'expiresMinutes' => app(EmailOtpService::class)->expiresMinutes,
        ]);
    }

    public function verify(Request $request, EmailOtpService $otp)
    {
        $request->validate([
            'code' => ['required', 'digits:6'],
        ]);

        $user = $request->user();

        // throttle brute force (10 kali per 10 menit)
        $key = 'otp-verify:' . $user->id;
        if (RateLimiter::tooManyAttempts($key, 10)) {
            return back()->with('error', 'Terlalu banyak percobaan. Coba lagi beberapa menit.');
        }
        RateLimiter::hit($key, 600);

        $ok = $otp->verify($user, $request->string('code')->toString());

        if (!$ok) {
            return back()->with('error', 'Kode salah / sudah kedaluwarsa. Silakan coba lagi atau kirim ulang kode.');
        }

        // sukses: kembali ke dashboard (atau intended)
        return redirect()->intended(route('dashboard'));
    }

    public function resend(Request $request, EmailOtpService $otp)
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return redirect()->intended(route('dashboard'));
        }

        // cooldown resend 60 detik
        $cooldownKey = 'otp-resend:' . $user->id;
        if (RateLimiter::tooManyAttempts($cooldownKey, 1)) {
            return back()->with('error', 'Tunggu sebentar sebelum kirim ulang kode.');
        }
        RateLimiter::hit($cooldownKey, 60);

        $otp->send($user);

        return back()->with('success', 'Kode verifikasi baru sudah dikirim ke email Anda.');
    }
}
