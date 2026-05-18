<!doctype html>
<html>
  <body style="font-family: Arial, sans-serif; background:#f8fafc; padding:24px;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:20px;">
      <h2 style="margin:0 0 12px;color:#0f172a;">Verifikasi Email RubriQ AI</h2>

      <p style="margin:0 0 14px;color:#334155;line-height:1.5;">
        Berikut adalah kode verifikasi 6 digit untuk email: <b>{{ $email }}</b>
      </p>

      <div style="font-size:28px; letter-spacing:8px; font-weight:800; color:#0f172a; background:#f1f5f9; border-radius:12px; padding:14px; text-align:center;">
        {{ $code }}
      </div>

      <p style="margin:14px 0 0;color:#475569;font-size:13px;line-height:1.5;">
        Kode ini berlaku <b>{{ $expiresMinutes }} menit</b>. Jika Anda tidak merasa mendaftar RubriQ AI, abaikan email ini.
      </p>
    </div>

    <p style="max-width:560px;margin:12px auto 0;color:#94a3b8;font-size:12px;text-align:center;">
      © 2026 RubriQ AI
    </p>
  </body>
</html>
