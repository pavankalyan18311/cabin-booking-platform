import nodemailer from 'nodemailer';

function getTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS?.replace(/\s+/g, '');
  if (!user || !pass || pass.includes('your-') || user.includes('your-')) return null;
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST ?? 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT ?? 587),
    secure: Number(process.env.EMAIL_PORT ?? 587) === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });
}

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(payload: EmailPayload): Promise<{ sent: boolean; reason?: string }> {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('[email] Not configured — skipping send to:', payload.to);
    return { sent: false, reason: 'not_configured' };
  }
  try {
    await transporter.sendMail({
      from: `"Relaxin Cabins" <${process.env.EMAIL_USER}>`,
      replyTo: process.env.EMAIL_USER,
      ...payload,
    });
    return { sent: true };
  } catch (err) {
    console.error('[email] Send error:', err);
    return { sent: false, reason: String(err) };
  }
}
