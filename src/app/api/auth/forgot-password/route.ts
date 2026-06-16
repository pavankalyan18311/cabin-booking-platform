import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomBytes } from 'crypto';
import { adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { sendEmail } from '@/lib/notifications/email';

const TOKEN_EXPIRY_MINUTES = 30;

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json() as { email: string };
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    const db = adminDb();

    // Find user by email
    const usersSnap = await db.collection(COLLECTIONS.USERS)
      .where('email', '==', email.toLowerCase().trim())
      .limit(1)
      .get();

    // Always return success to avoid leaking whether the email exists
    if (usersSnap.empty) {
      return NextResponse.json({ sent: true });
    }

    const userDoc = usersSnap.docs[0];
    const userData = userDoc.data();
    const displayName: string = userData.displayName ?? 'there';

    // Generate a secure token
    const token = randomBytes(32).toString('hex');
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000).toISOString();

    await db.collection(COLLECTIONS.PASSWORD_RESETS).doc(tokenHash).set({
      userId: userDoc.id,
      email: email.toLowerCase().trim(),
      tokenHash,
      expiresAt,
      used: false,
      createdAt: new Date().toISOString(),
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/reset-password?token=${token}`;

    await sendEmail({
      to: email,
      subject: 'Reset your Relaxin Cabins password',
      html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Reset Password</title></head>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f4;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
        <tr>
          <td style="background:linear-gradient(135deg,#d97706 0%,#92400e 100%);padding:28px 32px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;">🏕️ Relaxin Cabins</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">New Lisbon, WI · Open Year-Round</p>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 32px;">
            <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1c1917;">Reset your password</h2>
            <p style="margin:0 0 24px;color:#78716c;font-size:15px;line-height:1.6;">
              Hi ${displayName}, we received a request to reset your Relaxin Cabins account password.
              Click the button below to choose a new password. This link expires in ${TOKEN_EXPIRY_MINUTES} minutes.
            </p>
            <div style="text-align:center;margin:28px 0;">
              <a href="${resetUrl}" style="display:inline-block;background:#d97706;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:10px;letter-spacing:0.2px;">
                Reset My Password
              </a>
            </div>
            <p style="margin:24px 0 0;color:#a8a29e;font-size:12px;line-height:1.6;">
              If the button doesn't work, copy and paste this link into your browser:<br/>
              <a href="${resetUrl}" style="color:#d97706;word-break:break-all;">${resetUrl}</a>
            </p>
            <hr style="margin:28px 0;border:none;border-top:1px solid #e7e5e4;"/>
            <p style="margin:0;color:#a8a29e;font-size:12px;">
              If you didn't request a password reset, you can safely ignore this email. Your password won't change.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#fafaf9;border-top:1px solid #e7e5e4;padding:16px 32px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#a8a29e;">© ${new Date().getFullYear()} Relaxin Cabins · N6768 WI-58, New Lisbon, WI 53950</p>
            <p style="margin:4px 0 0;font-size:11px;color:#d4cfc9;">Need help? <a href="mailto:relaxingatcabins@gmail.com" style="color:#d97706;text-decoration:none;">relaxingatcabins@gmail.com</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    });

    return NextResponse.json({ sent: true });
  } catch (err: unknown) {
    console.error('[forgot-password]', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
