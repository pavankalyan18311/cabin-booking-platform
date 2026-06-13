import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { format, eachDayOfInterval, parseISO } from 'date-fns';
import { NotificationService, type BookingEmailData } from '@/lib/notifications';
import type { Booking, BookingStatus } from '@/types';

function buildMapsUrl(coordinates: { lat: number; lng: number } | undefined, location: string): string {
  if (coordinates?.lat && coordinates?.lng) {
    return `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}

const FREES_DATES: BookingStatus[] = ['cancelled', 'rejected'];

export async function POST(request: NextRequest) {
  try {
    // ── Auth: admin only ──────────────────────────────────────────────────────
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const decoded = await adminAuth().verifyIdToken(authHeader.slice(7));

    const db = adminDb();
    const adminUserSnap = await db.collection(COLLECTIONS.USERS).doc(decoded.uid).get();
    if (!adminUserSnap.exists || adminUserSnap.data()!.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { bookingId, status, reason } = await request.json() as {
      bookingId: string;
      status: BookingStatus;
      reason?: string;
    };

    if (!bookingId || !status) {
      return NextResponse.json({ error: 'bookingId and status are required' }, { status: 400 });
    }

    const validStatuses: BookingStatus[] = ['confirmed', 'rejected', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: `Invalid status: ${status}` }, { status: 400 });
    }

    const bookingRef = db.collection(COLLECTIONS.BOOKINGS).doc(bookingId);
    const bookingSnap = await bookingRef.get();
    if (!bookingSnap.exists) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    const booking = { id: bookingSnap.id, ...bookingSnap.data() } as Booking;

    const now = new Date().toISOString();
    const statusUpdates: Record<string, unknown> = {
      status,
      updatedAt: now,
    };

    if (status === 'confirmed') statusUpdates.confirmedAt = now;
    if (status === 'cancelled') {
      statusUpdates.cancelledAt = now;
      if (reason?.trim()) statusUpdates.cancellationReason = reason.trim();
    }
    if (status === 'rejected') {
      statusUpdates.rejectedAt = now;
      if (reason?.trim()) statusUpdates.rejectionReason = reason.trim();
    }

    // For cancel/reject: free dates atomically inside a transaction
    if (FREES_DATES.includes(status)) {
      const datesToFree = eachDayOfInterval({
        start: parseISO(booking.checkIn as string),
        end: parseISO(booking.checkOut as string),
      })
        .slice(0, -1)
        .map((d) => format(d, 'yyyy-MM-dd'));

      const availRef = db.collection(COLLECTIONS.AVAILABILITY).doc(booking.roomId as string);

      await db.runTransaction(async (tx) => {
        // ALL reads must come before any writes in a Firestore transaction
        const freshSnap = await tx.get(bookingRef);
        const availSnap = await tx.get(availRef);

        const fresh = freshSnap.data()!;
        if (fresh.status === status) return; // already done (idempotent)

        tx.update(bookingRef, statusUpdates);

        if (availSnap.exists) {
          const existing: string[] = availSnap.data()!.bookedDates ?? [];
          tx.update(availRef, {
            bookedDates: existing.filter((d) => !datesToFree.includes(d)),
          });
        }
      });
    } else {
      await bookingRef.update(statusUpdates);
    }

    // ── Fire-and-forget notification email ────────────────────────────────────
    const userEmail = booking.userEmail as string | undefined;
    if (userEmail) {
      const roomSnap = await db.collection(COLLECTIONS.ROOMS).doc(booking.roomId as string).get();
      const roomData = roomSnap.data();
      const roomLocation = (roomData?.location as string) ?? '';
      const mapsUrl = buildMapsUrl(roomData?.coordinates as { lat: number; lng: number } | undefined, roomLocation);

      const emailData: BookingEmailData = {
        to: userEmail,
        guestName: (booking.userName as string) || userEmail,
        bookingId: booking.id,
        roomTitle: (booking.roomTitle as string) ?? 'Cabin Booking',
        roomLocation,
        mapsUrl,
        checkIn: booking.checkIn as string,
        checkOut: booking.checkOut as string,
        nights: booking.nights as number,
        guests: booking.guests as number,
        nightlyRate: booking.nightlyRate as number,
        serviceFee: booking.serviceFee as number,
        taxes: booking.taxes as number,
        totalPrice: booking.totalPrice as number,
        discountAmount: (booking.discountAmount as number) ?? 0,
        paymentIntentId: booking.paymentIntentId as string | undefined,
        rejectionReason: reason,
        cancellationReason: reason,
      };

      const notifyFn =
        status === 'confirmed' ? NotificationService.bookingConfirmed :
        status === 'rejected'  ? NotificationService.bookingRejected  :
        status === 'completed' ? NotificationService.bookingCompleted :
        status === 'cancelled' ? NotificationService.bookingCancelled :
        null;

      if (notifyFn) {
        void notifyFn(emailData).catch((e) => console.error('[admin/booking/status] email failed:', e));
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('[admin/booking/status]', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
