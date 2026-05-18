<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class VerifyEmailOtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $code,
        public int $expiresMinutes,
        public string $email
    ) {}

    public function build()
    {
        return $this->subject('Kode Verifikasi Email RubriQ AI')
            ->view('emails.verify-email-otp');
    }
}
