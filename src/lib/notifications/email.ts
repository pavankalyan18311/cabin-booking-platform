import { Resend } from 'resend';
import nodemailer from 'nodemailer';

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(payload: EmailPayload): Promise<{ sent: boolean; reason?: string }> {
  // Resend: reliable inbox delivery with proper SPF/DKIM — preferred over Gmail SMTP
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey && !resendKey.includes('your-')) {
    const resend = new Resend(resendKey);
    const from = process.env.RESEND_FROM ?? 'Relaxin Cabins <onboarding@resend.dev>';
    const { error } = await resend.emails.send({ from, to: payload.to, subject: payload.subject, html: payload.html });
    if (error) {
      console.error('[email] Resend error:', error);
      return { sent: false, reason: String(error) };
    }
    return { sent: true };
  }

  // Nodemailer fallback (Gmail SMTP — may land in spam without domain verification)
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS?.replace(/\s+/g, '');
  if (!user || !pass || pass.includes('your-') || user.includes('your-')) {
    console.warn('[email] Not configured — skipping send to:', payload.to);
    return { sent: false, reason: 'not_configured' };
  }
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST ?? 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT ?? 587),
    secure: Number(process.env.EMAIL_PORT ?? 587) === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });
  try {
    await transporter.sendMail({
      from: `"Relaxin Cabins" <${user}>`,
      replyTo: user,
      ...payload,
    });
    return { sent: true };
  } catch (err) {
    console.error('[email] Send error:', err);
    return { sent: false, reason: String(err) };
  }
}
