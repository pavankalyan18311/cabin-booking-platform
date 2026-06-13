// ─────────────────────────────────────────────────────────────────────────────
// Production-quality, mobile-responsive email templates.
// All templates share a common base layout (Relax Cabin brand, amber header,
// white body, footer). Individual builders return the inner content block.
// ─────────────────────────────────────────────────────────────────────────────

const RELAXIN_MAPS_URL = 'https://www.google.com/maps/place/Relaxin+Cabins/@43.8890419,-90.0712974,17z/data=!4m15!1m8!3m7!1s0x87fe038c5e671d5b:0xd51965f9fcc98de5!2sN6768+WI-58,+New+Lisbon,+WI+53950,+USA!3b1!8m2!3d43.8890419!4d-90.0687225!16s%2Fg%2F11f54w7cxr!3m5!1s0x87fe03364d789a2d:0x373f5f6016adcfce!8m2!3d43.8889845!4d-90.0687502!16s%2Fg%2F11fl794v0v?entry=ttu&g_ep=EgoyMDI2MDYwMS4wIKXMDSoASAFQAw%3D%3D';
const RELAXIN_ADDRESS = 'N6768 WI-58, New Lisbon, WI 53950';

const MAPS_BLOCK = `<div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:16px 20px;margin-bottom:20px;text-align:center;">
      <p style="margin:0 0 10px;font-size:14px;font-weight:700;color:#0369a1;">📍 Get Directions</p>
      <p style="margin:0 0 12px;font-size:13px;color:#0284c7;">${RELAXIN_ADDRESS}</p>
      <a href="${RELAXIN_MAPS_URL}" target="_blank" style="display:inline-block;background:#0369a1;color:#ffffff;font-size:13px;font-weight:600;text-decoration:none;padding:10px 24px;border-radius:8px;">Open in Google Maps</a>
    </div>`;

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

function base(content: string, previewText = ''): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta name="color-scheme" content="light"/>
  ${previewText ? `<meta name="description" content="${previewText}"/>` : ''}
  <title>Relax Cabin</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f4;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#d97706 0%,#92400e 100%);padding:28px 32px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;letter-spacing:-0.5px;">🏕️ Relax Cabin</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Premium Cabin Retreats</p>
          </td>
        </tr>
        <!-- Body -->
        ${content}
        <!-- Footer -->
        <tr>
          <td style="background:#fafaf9;border-top:1px solid #e7e5e4;padding:20px 32px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#a8a29e;">© ${new Date().getFullYear()} Relax Cabin · Premium Cabin Retreats</p>
            <p style="margin:4px 0 0;font-size:11px;color:#d4cfc9;">You received this email because of activity on your Relax Cabin account.</p>
            <p style="margin:8px 0 0;font-size:11px;color:#a8a29e;">Need help? <a href="mailto:support@relaxcabin.com" style="color:#d97706;text-decoration:none;">support@relaxcabin.com</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function statusBanner(color: string, icon: string, title: string, subtitle: string): string {
  return `<tr>
    <td style="background:${color};padding:20px 32px;border-bottom:1px solid rgba(0,0,0,0.06);">
      <table cellpadding="0" cellspacing="0"><tr>
        <td style="font-size:28px;padding-right:12px;">${icon}</td>
        <td>
          <p style="margin:0;font-weight:700;color:#1c1917;font-size:16px;">${title}</p>
          <p style="margin:4px 0 0;color:#57534e;font-size:13px;">${subtitle}</p>
        </td>
      </tr></table>
    </td>
  </tr>`;
}

function bookingDetails(p: BookingEmailData): string {
  const subtotal = p.nightlyRate * p.nights;
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
    <tr>
      <td style="padding:4px 0;font-size:14px;color:#57534e;">${fmt(p.nightlyRate)} × ${p.nights} night${p.nights !== 1 ? 's' : ''}</td>
      <td align="right" style="padding:4px 0;font-size:14px;color:#57534e;">${fmt(subtotal)}</td>
    </tr>
    ${p.discountAmount && p.discountAmount > 0 ? `
    <tr>
      <td style="padding:4px 0;font-size:14px;color:#059669;">Coupon discount</td>
      <td align="right" style="padding:4px 0;font-size:14px;color:#059669;">−${fmt(p.discountAmount)}</td>
    </tr>` : ''}
    <tr>
      <td style="padding:4px 0;font-size:14px;color:#57534e;">Service fee</td>
      <td align="right" style="padding:4px 0;font-size:14px;color:#57534e;">${fmt(p.serviceFee)}</td>
    </tr>
    <tr>
      <td style="padding:4px 0;font-size:14px;color:#57534e;">Taxes</td>
      <td align="right" style="padding:4px 0;font-size:14px;color:#57534e;">${fmt(p.taxes)}</td>
    </tr>
    <tr style="border-top:2px solid #e7e5e4;">
      <td style="padding:10px 0 4px;font-size:16px;font-weight:700;color:#1c1917;">Total</td>
      <td align="right" style="padding:10px 0 4px;font-size:16px;font-weight:700;color:#d97706;">${fmt(p.totalPrice)}</td>
    </tr>
  </table>`;
}

// ─── Data shape ───────────────────────────────────────────────────────────────

export interface BookingEmailData {
  to: string;
  guestName: string;
  bookingId: string;
  roomTitle: string;
  roomLocation: string;
  mapsUrl?: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  nightlyRate: number;
  serviceFee: number;
  taxes: number;
  totalPrice: number;
  discountAmount?: number;
  couponCode?: string;
  paymentIntentId?: string;
  specialRequests?: string;
  rejectionReason?: string;
  cancellationReason?: string;
}

export interface OTPEmailData {
  to: string;
  guestName: string;
  otp: string;
  expiresInMinutes: number;
}

// ─── OTP Verification ─────────────────────────────────────────────────────────

export function otpTemplate(d: OTPEmailData): string {
  const content = `
  <tr><td style="padding:32px;">
    <p style="margin:0 0 8px;font-size:16px;font-weight:600;color:#1c1917;">Hi ${d.guestName},</p>
    <p style="margin:0 0 24px;font-size:14px;color:#57534e;line-height:1.6;">
      Use the verification code below to confirm your email address. The code expires in <strong>${d.expiresInMinutes} minutes</strong>.
    </p>

    <!-- OTP code block -->
    <div style="text-align:center;margin:32px 0;">
      <div style="display:inline-block;background:#fffbeb;border:2px solid #fde68a;border-radius:16px;padding:20px 40px;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#92400e;text-transform:uppercase;letter-spacing:1px;">Your verification code</p>
        <p style="margin:0;font-size:42px;font-weight:800;letter-spacing:10px;color:#d97706;font-family:monospace;">${d.otp}</p>
      </div>
    </div>

    <p style="margin:0 0 8px;font-size:13px;color:#78716c;text-align:center;">
      Never share this code with anyone. Relax Cabin will never ask for it.
    </p>
    <p style="margin:0;font-size:13px;color:#a8a29e;text-align:center;">
      If you didn't create a Relax Cabin account, you can safely ignore this email.
    </p>
  </td></tr>`;

  return base(
    statusBanner('#fefce8', '✉️', 'Verify your email address', 'Enter the code below to activate your account.') + content,
    `Your Relax Cabin verification code is ${d.otp}`
  );
}

// ─── Booking Created (paid online) ───────────────────────────────────────────

export function bookingCreatedTemplate(d: BookingEmailData): string {
  const content = `
  <tr><td style="padding:24px 32px 32px;">
    <p style="margin:0 0 4px;font-size:12px;color:#a8a29e;">
      Booking ID: <span style="font-family:monospace;font-weight:600;color:#44403c;">${d.bookingId}</span>
    </p>
    ${d.paymentIntentId ? `<p style="margin:0 0 20px;font-size:11px;color:#c4b5a5;">Transaction: <span style="font-family:monospace;">${d.paymentIntentId}</span></p>` : '<div style="margin-bottom:20px;"></div>'}

    <!-- Room card -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafaf9;border:1px solid #e7e5e4;border-radius:12px;margin-bottom:20px;">
      <tr><td style="padding:16px 20px;">
        <p style="margin:0 0 4px;font-size:17px;font-weight:700;color:#1c1917;">${d.roomTitle}</p>
        <p style="margin:0;font-size:13px;color:#78716c;">📍 ${d.roomLocation}</p>
      </td></tr>
    </table>

    <!-- Dates -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr>
        <td width="50%" style="padding-right:8px;">
          <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:14px 16px;">
            <p style="margin:0 0 3px;font-size:10px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:0.5px;">Check-in</p>
            <p style="margin:0;font-size:13px;font-weight:600;color:#1c1917;">${fmtDate(d.checkIn)}</p>
          </div>
        </td>
        <td width="50%" style="padding-left:8px;">
          <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:14px 16px;">
            <p style="margin:0 0 3px;font-size:10px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:0.5px;">Check-out</p>
            <p style="margin:0;font-size:13px;font-weight:600;color:#1c1917;">${fmtDate(d.checkOut)}</p>
          </div>
        </td>
      </tr>
    </table>

    <!-- Guests / Nights -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr>
        <td width="50%"><p style="margin:0 0 2px;font-size:12px;color:#78716c;">Guests</p><p style="margin:0;font-size:15px;font-weight:600;color:#1c1917;">${d.guests} guest${d.guests !== 1 ? 's' : ''}</p></td>
        <td width="50%"><p style="margin:0 0 2px;font-size:12px;color:#78716c;">Duration</p><p style="margin:0;font-size:15px;font-weight:600;color:#1c1917;">${d.nights} night${d.nights !== 1 ? 's' : ''}</p></td>
      </tr>
    </table>

    <!-- Price breakdown -->
    <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e7e5e4;padding-top:16px;margin-bottom:20px;">
      ${bookingDetails(d)}
    </table>

    ${d.specialRequests ? `<div style="background:#fafaf9;border-left:3px solid #d97706;padding:10px 14px;border-radius:0 8px 8px 0;margin-bottom:20px;"><p style="margin:0 0 3px;font-size:11px;font-weight:700;color:#78716c;text-transform:uppercase;">Special Requests</p><p style="margin:0;font-size:13px;color:#44403c;">${d.specialRequests}</p></div>` : ''}

    ${MAPS_BLOCK}

    <!-- Next steps -->
    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:18px 20px;">
      <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:#92400e;">You're all set! 🎉</p>
      <p style="margin:0;font-size:13px;color:#78716c;line-height:1.6;">Your cabin is booked and ready. Please arrive between 2–4 PM on your check-in date. You can view your booking details anytime from your dashboard.</p>
    </div>
  </td></tr>`;

  return base(
    statusBanner('#ecfdf5', '✅', 'Booking Confirmed!', `Hi ${d.guestName}, your reservation is confirmed.`) + content,
    `Booking confirmed for ${d.roomTitle}`
  );
}

// ─── Booking Created (pay at property) ───────────────────────────────────────

export function bookingReservedTemplate(d: BookingEmailData): string {
  const content = `
  <tr><td style="padding:24px 32px 32px;">
    <p style="margin:0 0 20px;font-size:12px;color:#a8a29e;">Booking ID: <span style="font-family:monospace;font-weight:600;color:#44403c;">${d.bookingId}</span></p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafaf9;border:1px solid #e7e5e4;border-radius:12px;margin-bottom:20px;">
      <tr><td style="padding:16px 20px;">
        <p style="margin:0 0 4px;font-size:17px;font-weight:700;color:#1c1917;">${d.roomTitle}</p>
        <p style="margin:0;font-size:13px;color:#78716c;">📍 ${d.roomLocation}</p>
      </td></tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr>
        <td width="50%" style="padding-right:8px;"><div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:14px 16px;"><p style="margin:0 0 3px;font-size:10px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:0.5px;">Check-in</p><p style="margin:0;font-size:13px;font-weight:600;color:#1c1917;">${fmtDate(d.checkIn)}</p></div></td>
        <td width="50%" style="padding-left:8px;"><div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:14px 16px;"><p style="margin:0 0 3px;font-size:10px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:0.5px;">Check-out</p><p style="margin:0;font-size:13px;font-weight:600;color:#1c1917;">${fmtDate(d.checkOut)}</p></div></td>
      </tr>
    </table>

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px 20px;margin-bottom:20px;">
      <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#166534;">💵 Pay at Property</p>
      <p style="margin:0;font-size:13px;color:#15803d;line-height:1.6;">Your dates are reserved. No payment was taken today. Please bring <strong>${fmt(d.totalPrice)}</strong> (cash or card) when you check in on <strong>${fmtDate(d.checkIn)}</strong>.</p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e7e5e4;padding-top:16px;margin-bottom:20px;">
      ${bookingDetails(d)}
    </table>

    ${MAPS_BLOCK}
  </td></tr>`;

  return base(
    statusBanner('#f0fdf4', '🏠', 'Reservation Confirmed!', `Hi ${d.guestName}, your dates are secured. Pay when you arrive.`) + content,
    `Your Relax Cabin reservation for ${d.roomTitle} is confirmed`
  );
}

// ─── Booking Confirmed by Admin ───────────────────────────────────────────────

export function bookingConfirmedTemplate(d: BookingEmailData): string {
  const content = `
  <tr><td style="padding:24px 32px 32px;">
    <p style="margin:0 0 20px;font-size:12px;color:#a8a29e;">Booking ID: <span style="font-family:monospace;font-weight:600;color:#44403c;">${d.bookingId}</span></p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafaf9;border:1px solid #e7e5e4;border-radius:12px;margin-bottom:20px;">
      <tr><td style="padding:16px 20px;">
        <p style="margin:0 0 4px;font-size:17px;font-weight:700;color:#1c1917;">${d.roomTitle}</p>
        <p style="margin:0;font-size:13px;color:#78716c;">📍 ${d.roomLocation}</p>
      </td></tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr>
        <td width="50%" style="padding-right:8px;"><div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:14px 16px;"><p style="margin:0 0 3px;font-size:10px;font-weight:700;color:#92400e;text-transform:uppercase;">Check-in</p><p style="margin:0;font-size:13px;font-weight:600;color:#1c1917;">${fmtDate(d.checkIn)}</p></div></td>
        <td width="50%" style="padding-left:8px;"><div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:14px 16px;"><p style="margin:0 0 3px;font-size:10px;font-weight:700;color:#92400e;text-transform:uppercase;">Check-out</p><p style="margin:0;font-size:13px;font-weight:600;color:#1c1917;">${fmtDate(d.checkOut)}</p></div></td>
      </tr>
    </table>

    <div style="background:#ecfdf5;border:1px solid #d1fae5;border-radius:12px;padding:16px 20px;margin-bottom:20px;">
      <p style="margin:0;font-size:14px;color:#065f46;line-height:1.6;">
        🎉 Your booking has been <strong>confirmed</strong> by our team. We look forward to welcoming you on <strong>${fmtDate(d.checkIn)}</strong>. Please arrive between 2–4 PM for check-in.
      </p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e7e5e4;padding-top:16px;margin-bottom:20px;">
      ${bookingDetails(d)}
    </table>
    ${d.paymentIntentId ? `<p style="margin:0 0 16px;font-size:11px;color:#a8a29e;">Transaction ID: <span style="font-family:monospace;">${d.paymentIntentId}</span></p>` : ''}

    ${MAPS_BLOCK}
  </td></tr>`;

  return base(
    statusBanner('#ecfdf5', '🎉', "You're Confirmed!", `Hi ${d.guestName}, your reservation at ${d.roomTitle} is all set.`) + content,
    `Booking confirmed — ${d.roomTitle}`
  );
}

// ─── Booking Rejected by Admin ────────────────────────────────────────────────

export function bookingRejectedTemplate(d: BookingEmailData): string {
  const content = `
  <tr><td style="padding:24px 32px 32px;">
    <p style="margin:0 0 20px;font-size:12px;color:#a8a29e;">Booking ID: <span style="font-family:monospace;font-weight:600;color:#44403c;">${d.bookingId}</span></p>

    <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:16px 20px;margin-bottom:20px;">
      <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:#9a3412;">Why was it declined?</p>
      <p style="margin:0;font-size:13px;color:#7c2d12;line-height:1.6;">${d.rejectionReason || 'Your booking was not approved at this time. Please contact support or try booking different dates.'}</p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafaf9;border:1px solid #e7e5e4;border-radius:12px;margin-bottom:20px;">
      <tr><td style="padding:14px 18px;">
        <p style="margin:0 0 2px;font-size:15px;font-weight:600;color:#1c1917;">${d.roomTitle}</p>
        <p style="margin:0;font-size:13px;color:#78716c;">${fmtDate(d.checkIn)} → ${fmtDate(d.checkOut)}</p>
      </td></tr>
    </table>

    <p style="margin:0;font-size:13px;color:#57534e;line-height:1.6;">
      If a payment was taken, our team will process a full refund within 3–5 business days.
      For assistance, please contact <a href="mailto:support@relaxcabin.com" style="color:#d97706;text-decoration:none;">support@relaxcabin.com</a>.
    </p>
  </td></tr>`;

  return base(
    statusBanner('#fff7ed', '😔', 'Booking Not Approved', `Hi ${d.guestName}, unfortunately we couldn't approve your request.`) + content,
    `Booking update for ${d.roomTitle}`
  );
}

// ─── Booking Completed ────────────────────────────────────────────────────────

export function bookingCompletedTemplate(d: BookingEmailData): string {
  const content = `
  <tr><td style="padding:24px 32px 32px;">
    <p style="margin:0 0 20px;font-size:14px;color:#57534e;line-height:1.6;">
      We hope you had a wonderful stay at <strong>${d.roomTitle}</strong>. Thank you for choosing Relax Cabin — it was a pleasure hosting you.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafaf9;border:1px solid #e7e5e4;border-radius:12px;margin-bottom:20px;">
      <tr><td style="padding:16px 20px;">
        <p style="margin:0 0 4px;font-size:15px;font-weight:600;color:#1c1917;">${d.roomTitle}</p>
        <p style="margin:0;font-size:13px;color:#78716c;">📍 ${d.roomLocation} · ${d.nights} night${d.nights !== 1 ? 's' : ''}</p>
        <p style="margin:4px 0 0;font-size:12px;color:#a8a29e;">Booking: <span style="font-family:monospace;">${d.bookingId}</span></p>
      </td></tr>
    </table>

    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:16px 20px;text-align:center;">
      <p style="margin:0 0 8px;font-size:15px;font-weight:700;color:#92400e;">Leave a Review ⭐</p>
      <p style="margin:0;font-size:13px;color:#78716c;">Share your experience and help other travellers find their perfect retreat.</p>
    </div>
  </td></tr>`;

  return base(
    statusBanner('#eff6ff', '🌟', 'Stay Completed — Thank You!', `We hope you loved your stay at ${d.roomTitle}.`) + content,
    `Thanks for staying at ${d.roomTitle}`
  );
}

// ─── Booking Cancelled ────────────────────────────────────────────────────────

export function bookingCancelledTemplate(d: BookingEmailData): string {
  const content = `
  <tr><td style="padding:24px 32px 32px;">
    <p style="margin:0 0 20px;font-size:12px;color:#a8a29e;">Booking ID: <span style="font-family:monospace;font-weight:600;color:#44403c;">${d.bookingId}</span></p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafaf9;border:1px solid #e7e5e4;border-radius:12px;margin-bottom:20px;">
      <tr><td style="padding:14px 18px;">
        <p style="margin:0 0 2px;font-size:15px;font-weight:600;color:#1c1917;">${d.roomTitle}</p>
        <p style="margin:0;font-size:13px;color:#78716c;">${fmtDate(d.checkIn)} → ${fmtDate(d.checkOut)}</p>
      </td></tr>
    </table>

    ${d.cancellationReason ? `<div style="background:#f9fafb;border-left:3px solid #9ca3af;padding:10px 14px;border-radius:0 8px 8px 0;margin-bottom:20px;"><p style="margin:0;font-size:13px;color:#374151;">${d.cancellationReason}</p></div>` : ''}

    <p style="margin:0;font-size:13px;color:#57534e;line-height:1.6;">
      The dates have been freed and are available for new bookings.
      If a payment was taken, a refund will be processed within 3–5 business days.
      Questions? <a href="mailto:support@relaxcabin.com" style="color:#d97706;text-decoration:none;">Contact us</a>.
    </p>
  </td></tr>`;

  return base(
    statusBanner('#f9fafb', '❌', 'Booking Cancelled', `Hi ${d.guestName}, your booking has been cancelled.`) + content,
    `Booking cancelled — ${d.roomTitle}`
  );
}
