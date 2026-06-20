import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/notifications/email';

export async function POST(request: NextRequest) {
  try {
    const { name, email, message, bookingId, roomTitle } = await request.json() as {
      name: string;
      email: string;
      message: string;
      bookingId?: string;
      roomTitle?: string;
    };

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Name, email and message are required' }, { status: 400 });
    }

    const adminEmail = process.env.ADMIN_EMAIL ?? 'relaxingatcabins@gmail.com';
    const subject = bookingId
      ? `Support request — Booking #${bookingId.slice(0, 8).toUpperCase()}${roomTitle ? ` (${roomTitle})` : ''}`
      : `Support request from ${name}`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f4;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
        <tr>
          <td style="background:linear-gradient(135deg,#d97706 0%,#92400e 100%);padding:28px 32px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;">🏕️ Relax Cabin — Support Request</h1>
          </td>
        </tr>
        <tr><td style="padding:28px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafaf9;border:1px solid #e7e5e4;border-radius:12px;margin-bottom:20px;">
            <tr><td style="padding:16px 20px;">
              <p style="margin:0 0 4px;font-size:10px;font-weight:700;color:#78716c;text-transform:uppercase;letter-spacing:0.5px;">From</p>
              <p style="margin:0;font-size:16px;font-weight:700;color:#1c1917;">${name}</p>
              <p style="margin:2px 0 0;font-size:13px;color:#78716c;">${email}</p>
            </td></tr>
          </table>
          ${bookingId ? `
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;margin-bottom:20px;">
            <tr><td style="padding:14px 20px;">
              <p style="margin:0 0 4px;font-size:10px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:0.5px;">Booking Reference</p>
              <p style="margin:0;font-size:14px;font-weight:700;color:#1c1917;font-family:monospace;">#${bookingId.slice(0, 8).toUpperCase()}</p>
              ${roomTitle ? `<p style="margin:2px 0 0;font-size:13px;color:#78716c;">${roomTitle}</p>` : ''}
            </td></tr>
          </table>` : ''}
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr><td style="padding:16px 20px;background:#fafaf9;border:1px solid #e7e5e4;border-radius:12px;">
              <p style="margin:0 0 8px;font-size:10px;font-weight:700;color:#78716c;text-transform:uppercase;letter-spacing:0.5px;">Message</p>
              <p style="margin:0;font-size:14px;color:#1c1917;line-height:1.6;white-space:pre-wrap;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
            </td></tr>
          </table>
          <div style="text-align:center;">
            <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}"
               style="display:inline-block;background:linear-gradient(135deg,#d97706 0%,#92400e 100%);color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:10px;">
              Reply to ${name}
            </a>
          </div>
        </td></tr>
        <tr>
          <td style="background:#fafaf9;border-top:1px solid #e7e5e4;padding:16px 32px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#a8a29e;">Relax Cabin · N6768 WI-58, New Lisbon, WI 53950</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    await sendEmail({ to: adminEmail, subject, html });

    // Confirmation to guest
    await sendEmail({
      to: email,
      subject: 'We received your message — Relax Cabin Support',
      html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f4;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
        <tr>
          <td style="background:linear-gradient(135deg,#d97706 0%,#92400e 100%);padding:28px 32px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;">🏕️ Relax Cabin</h1>
          </td>
        </tr>
        <tr><td style="padding:28px 32px;">
          <p style="margin:0 0 16px;font-size:16px;font-weight:600;color:#1c1917;">Hi ${name},</p>
          <p style="margin:0 0 20px;font-size:14px;color:#57534e;line-height:1.6;">
            Thanks for reaching out! We've received your message and will get back to you within <strong>24 hours</strong>.
          </p>
          <div style="background:#fafaf9;border:1px solid #e7e5e4;border-radius:12px;padding:16px 20px;margin-bottom:20px;">
            <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#78716c;text-transform:uppercase;letter-spacing:0.5px;">Your message</p>
            <p style="margin:0;font-size:13px;color:#44403c;line-height:1.6;white-space:pre-wrap;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
          </div>
          <p style="margin:0;font-size:13px;color:#78716c;">
            If urgent, email us directly at
            <a href="mailto:relaxingatcabins@gmail.com" style="color:#d97706;text-decoration:none;">relaxingatcabins@gmail.com</a>
          </p>
        </td></tr>
        <tr>
          <td style="background:#fafaf9;border-top:1px solid #e7e5e4;padding:16px 32px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#a8a29e;">Relax Cabin · N6768 WI-58, New Lisbon, WI 53950</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[support]', err);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
