<?php

namespace App\Services;

use App\Mail\VerifyEmailOtpMail;
use App\Models\EmailVerificationToken;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

class EmailOtpService
{
    public int $expiresMinutes = 10;

    public function send(User $user): void
    {
        // Hanya kirim jika belum verified
        if ($user->hasVerifiedEmail()) {
            return;
        }

        // Hapus token lama yang belum dipakai (biar 1 token aktif saja)
        EmailVerificationToken::query()
            ->where('user_id', $user->id)
            ->whereNull('consumed_at')
            ->delete();

        $code = $this->generateCode(); // 6 digit string
        $hash = $this->hashCode($code);

        $token = EmailVerificationToken::create([
            'user_id' => $user->id,
            'email' => $user->email,
            'token_hash' => $hash,
            'attempts' => 0,
            'expires_at' => now()->addMinutes($this->expiresMinutes),
            'sent_at' => now(),
        ]);

        Mail::to($user->email)->send(
            new VerifyEmailOtpMail($code, $this->expiresMinutes, $user->email)
        );
    }

    public function verify(User $user, string $code): bool
    {
        if ($user->hasVerifiedEmail()) {
            return true;
        }

        $token = EmailVerificationToken::query()
            ->where('user_id', $user->id)
            ->whereNull('consumed_at')
            ->latest('id')
            ->first();

        if (!$token) return false;

        if ($token->expires_at->isPast()) {
            return false;
        }

        $ok = hash_equals($token->token_hash, $this->hashCode($code));

        if (!$ok) {
            $token->increment('attempts');
            return false;
        }

        // sukses
        $token->update(['consumed_at' => now()]);

        $user->markEmailAsVerified(); // isi email_verified_at

        // bersihkan token lain
        EmailVerificationToken::query()
            ->where('user_id', $user->id)
            ->whereNull('consumed_at')
            ->delete();

        return true;
    }

    private function generateCode(): string
    {
        // 000000 - 999999 (leading zero tetap)
        return str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    private function hashCode(string $code): string
    {
        // hash dengan app key biar tidak mudah ditebak
        return hash_hmac('sha256', $code, (string) config('app.key'));
    }
}
