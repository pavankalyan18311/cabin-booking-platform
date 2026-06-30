import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { format, eachDayOfInterval, parseISO } from 'date-fns';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const decoded = await adminAuth().verifyIdToken(authHeader.slice(7));
    const userId = decoded.uid;

    const { bookingId, reason } = await request.json() as { bookingId: string; reason?: string };
    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId is required' }, { status: 400 });
    }

    const db = adminDb();
    const bookingRef  = db.collection(COLLECTIONS.BOOKINGS).doc(bookingId);
    const bookingSnap = await bookingRef.get();

    if (!bookingSnap.exists) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    const bookingData = bookingSnap.data()!;

    if (bookingData.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (bookingData.status !== 'pending' && bookingData.status !== 'confirmed') {
      return NextResponse.json(
        { error: 'Only pending or confirmed bookings can be cancelled' },
        { status: 400 }
      );
    }

    const datesToFree = eachDayOfInterval({
      start: parseISO(bookingData.checkIn),
      end:   parseISO(bookingData.checkOut),
    })
      .slice(0, -1)
      .map((d) => format(d, 'yyyy-MM-dd'));

    const now      = new Date().toISOString();
    const availRef = db.collection(COLLECTIONS.AVAILABILITY).doc(bookingData.roomId);

    // Firestore transactions require ALL reads before ANY writes
    await db.runTransaction(async (tx) => {
      const [freshSnap, availSnap] = await Promise.all([
        tx.get(bookingRef),
        tx.get(availRef),
      ]);

      const fresh = freshSnap.data()!;
      if (fresh.status !== 'pending' && fresh.status !== 'confirmed') {
        throw new Error('Booking can no longer be cancelled');
      }

      // Writes — only after all reads are done
      tx.update(bookingRef, {
        status: 'cancelled',
        cancelledAt: now,
        updatedAt: now,
        ...(reason?.trim() ? { cancellationReason: reason.trim() } : {}),
      });

      if (availSnap.exists) {
        const existing: string[] = availSnap.data()!.bookedDates ?? [];
        tx.update(availRef, {
          bookedDates: existing.filter((d) => !datesToFree.includes(d)),
        });
      }
    });

    // Self-service cancellations are non-refundable per policy — no Stripe
    // refund is issued here. Refunds (room amount only) are only issued by
    // an admin via the admin bookings dashboard.
    return NextResponse.json({ success: true, refunded: false });
  } catch (err: unknown) {
    console.error('[cancel-booking]', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    const status =
      message === 'Forbidden'       ? 403
      : message === 'Booking not found' ? 404
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
