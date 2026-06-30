import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { format } from 'date-fns';
import type { Booking } from '@/types';
import { NotificationService, type BookingEmailData } from '@/lib/notifications';

export const runtime = 'nodejs';
export const maxDuration = 60;

// GET /api/cron/complete-bookings
// Called by Vercel Cron at 16:00 UTC (≈11 AM CDT) every day.
// Marks all confirmed bookings whose checkOut date ≤ today as completed and emails the guest.
export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = adminDb();
  const today = format(new Date(), 'yyyy-MM-dd');

  const snap = await db
    .collection(COLLECTIONS.BOOKINGS)
    .where('status', '==', 'confirmed')
    .get();

  const toComplete = snap.docs.filter((doc) => {
    const checkOut = doc.data().checkOut as string | undefined;
    return checkOut && checkOut <= today;
  });

  if (toComplete.length === 0) {
    return NextResponse.json({ completed: 0 });
  }

  const now = new Date().toISOString();
  const batch = db.batch();
  toComplete.forEach((doc) => {
    batch.update(doc.ref, { status: 'completed', completedAt: now, updatedAt: now });
  });
  await batch.commit();

  await Promise.allSettled(
    toComplete.map(async (doc) => {
      const booking = { id: doc.id, ...doc.data() } as Booking;
      if (!booking.userEmail) return;
      const emailData: BookingEmailData = {
        to: booking.userEmail,
        guestName: booking.userName || booking.userEmail,
        bookingId: booking.id,
        roomTitle: booking.roomTitle ?? 'Cabin Booking',
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        nights: booking.nights,
        guests: booking.guests,
        nightlyRate: booking.nightlyRate,
        serviceFee: booking.serviceFee,
        taxes: booking.taxes,
        totalPrice: booking.totalPrice,
        discountAmount: booking.discountAmount ?? 0,
        paymentIntentId: booking.paymentIntentId,
      };
      await NotificationService.bookingCompleted(emailData).catch((e) =>
        console.error('[cron/complete-bookings] email failed:', booking.id, e)
      );
    })
  );

  console.log(`[cron/complete-bookings] Completed ${toComplete.length} booking(s) on ${today}`);
  return NextResponse.json({ completed: toComplete.length });
}
