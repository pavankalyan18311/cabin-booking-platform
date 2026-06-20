import { sendEmail } from './email';
import {
  otpTemplate,
  bookingCreatedTemplate,
  bookingReservedTemplate,
  bookingConfirmedTemplate,
  bookingRejectedTemplate,
  bookingCompletedTemplate,
  bookingCancelledTemplate,
  adminBookingNotificationTemplate,
  type BookingEmailData,
  type OTPEmailData,
  type AdminBookingEmailData,
} from './templates';

export type { BookingEmailData, OTPEmailData, AdminBookingEmailData };

export const NotificationService = {
  async sendOTP(data: OTPEmailData) {
    return sendEmail({
      to: data.to,
      subject: `${data.otp} is your Relax Cabin verification code`,
      html: otpTemplate(data),
    });
  },

  async bookingCreated(data: BookingEmailData) {
    return sendEmail({
      to: data.to,
      subject: `Booking confirmed — ${data.roomTitle}`,
      html: bookingCreatedTemplate(data),
    });
  },

  async bookingReserved(data: BookingEmailData) {
    return sendEmail({
      to: data.to,
      subject: `Reservation confirmed — ${data.roomTitle}`,
      html: bookingReservedTemplate(data),
    });
  },

  async bookingConfirmed(data: BookingEmailData) {
    return sendEmail({
      to: data.to,
      subject: `You're confirmed! ${data.roomTitle} — ${new Date(data.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      html: bookingConfirmedTemplate(data),
    });
  },

  async bookingRejected(data: BookingEmailData) {
    return sendEmail({
      to: data.to,
      subject: `Booking update — ${data.roomTitle}`,
      html: bookingRejectedTemplate(data),
    });
  },

  async bookingCompleted(data: BookingEmailData) {
    return sendEmail({
      to: data.to,
      subject: `Thanks for staying at ${data.roomTitle}!`,
      html: bookingCompletedTemplate(data),
    });
  },

  async bookingCancelled(data: BookingEmailData) {
    return sendEmail({
      to: data.to,
      subject: `Booking cancelled — ${data.roomTitle}`,
      html: bookingCancelledTemplate(data),
    });
  },

  async adminBookingAlert(data: AdminBookingEmailData) {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) return { sent: false, reason: 'ADMIN_EMAIL not configured' };
    return sendEmail({
      to: adminEmail,
      subject: `New booking: ${data.guestName} → ${data.roomTitle}`,
      html: adminBookingNotificationTemplate(data),
    });
  },
};
