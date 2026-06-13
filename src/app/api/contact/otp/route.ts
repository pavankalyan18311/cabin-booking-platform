import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { sendEmail } from '@/lib/notifications/email';

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes

function generateOTP(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function docId(email: string): string {
  return email.toLowerCase().replace(/[^a-z0-9]/g, '_');
}

// POST /api/contact/otp — send OTP to email
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json() as { email: string };
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    const otp     = generateOTP();
    const expires = Date.now() + OTP_TTL_MS;

    await adminDb().collection('contact_otps').doc(docId(email)).set({ otp, expires });

    await sendEmail({
      to: email,
      subject: 'Your verification code — Relaxin Cabins',
      html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.07);">
        <tr>
          <td style="background:linear-gradient(135deg,#1c1917,#292524);padding:28px 36px;">
            <span style="color:#d97706;font-size:18px;font-weight:800;">⛺ Relaxin Cabins</span>
            <p style="color:#d97706;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;margin:10px 0 0;">Email Verification</p>
          </td>
        </tr>
        <tr>
          <td style="padding:36px;">
            <p style="margin:0 0 16px;font-size:15px;color:#374151;">Enter this code to verify your email and send your message:</p>
            <div style="background:#fef3c7;border:2px dashed #d97706;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
              <span style="font-size:36px;font-weight:900;letter-spacing:10px;color:#92400e;">${otp}</span>
            </div>
            <p style="margin:0;font-size:13px;color:#9ca3af;">This code expires in <strong>5 minutes</strong>. If you didn't request this, you can safely ignore this email.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    });

    return NextResponse.json({ sent: true });
  } catch (err) {
    console.error('[contact/otp POST]', err);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}

// PUT /api/contact/otp — verify OTP
export async function PUT(request: NextRequest) {
  try {
    const { email, otp } = await request.json() as { email: string; otp: string };
    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP required' }, { status: 400 });
    }

    const ref  = adminDb().collection('contact_otps').doc(docId(email));
    const snap = await ref.get();

    if (!snap.exists) {
      return NextResponse.json({ error: 'OTP expired. Please request a new one.' }, { status: 400 });
    }

    const stored = snap.data() as { otp: string; expires: number };

    if (Date.now() > stored.expires) {
      await ref.delete();
      return NextResponse.json({ error: 'OTP expired. Please request a new one.' }, { status: 400 });
    }
    if (stored.otp !== otp.trim()) {
      return NextResponse.json({ error: 'Invalid code. Please try again.' }, { status: 400 });
    }

    await ref.delete();
    return NextResponse.json({ verified: true });
  } catch (err) {
    console.error('[contact/otp PUT]', err);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
