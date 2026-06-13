import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/notifications/email';

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, subject, message } = await request.json() as {
      firstName: string;
      lastName: string;
      email: string;
      subject: string;
      message: string;
    };

    if (!firstName || !email || !subject || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>New Contact Message</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f4;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1c1917 0%,#292524 100%);padding:36px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <div style="display:inline-flex;align-items:center;gap:10px;">
                    <span style="background:#d97706;padding:8px 10px;border-radius:10px;font-size:18px;">⛺</span>
                    <span style="color:#ffffff;font-size:20px;font-weight:800;letter-spacing:-0.3px;">Relax Cabin</span>
                  </div>
                  <p style="color:#d97706;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;margin:12px 0 0;">New Contact Message</p>
                </td>
                <td align="right">
                  <span style="background:#d97706;color:#fff;padding:6px 14px;border-radius:20px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Inquiry</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Subject banner -->
        <tr>
          <td style="background:#fef3c7;padding:16px 40px;border-bottom:1px solid #fde68a;">
            <p style="margin:0;font-size:16px;font-weight:700;color:#92400e;">📌 ${subject}</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">

            <!-- Sender info -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:12px;margin-bottom:28px;overflow:hidden;border:1px solid #f0f0ee;">
              <tr>
                <td style="padding:20px 24px;">
                  <p style="margin:0 0 14px;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1.5px;">From</p>
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="background:#d97706;color:#fff;font-size:20px;font-weight:800;width:48px;height:48px;text-align:center;border-radius:12px;vertical-align:middle;">
                        ${firstName.charAt(0).toUpperCase()}
                      </td>
                      <td style="padding-left:14px;vertical-align:middle;">
                        <p style="margin:0;font-size:16px;font-weight:700;color:#111827;">${firstName} ${lastName}</p>
                        <a href="mailto:${email}" style="color:#d97706;font-size:13px;text-decoration:none;">${email}</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Message -->
            <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1.5px;">Message</p>
            <div style="background:#ffffff;border:1px solid #e5e7eb;border-left:4px solid #d97706;border-radius:0 12px 12px 0;padding:20px 24px;margin-bottom:32px;">
              <p style="margin:0;font-size:15px;color:#374151;line-height:1.7;white-space:pre-wrap;">${message}</p>
            </div>

            <!-- Reply CTA -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center">
                  <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}"
                    style="display:inline-block;background:linear-gradient(135deg,#d97706,#ea580c);color:#ffffff;font-size:14px;font-weight:700;padding:14px 32px;border-radius:12px;text-decoration:none;letter-spacing:0.3px;">
                    ↩ Reply to ${firstName}
                  </a>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #f0f0ee;">
            <p style="margin:0;font-size:11px;color:#9ca3af;text-align:center;">
              Sent via the contact form on <strong style="color:#6b7280;">relaxcabin.com</strong> · ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

    await sendEmail({
      to: 'relaxingatcabins@gmail.com',
      subject: `[Relax Cabin] ${subject} — from ${firstName} ${lastName}`,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[contact]', err);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
