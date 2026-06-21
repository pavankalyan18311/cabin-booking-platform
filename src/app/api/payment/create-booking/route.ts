import { NextRequest, NextResponse, after } from 'next/server';
import stripe from '@/lib/stripe/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { FieldValue } from 'firebase-admin/firestore';
import { format, eachDayOfInterval, parseISO } from 'date-fns';
import type { Booking, Payment } from '@/types';
import { NotificationService } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    // ── Auth ──────────────────────────────────────────────────────────────────
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.slice(7);
    const decoded = await adminAuth().verifyIdToken(token);
    const userId = decoded.uid;

    const { paymentIntentId } = await request.json() as { paymentIntentId: string };
    if (!paymentIntentId) {
      return NextResponse.json({ error: 'paymentIntentId is required' }, { status: 400 });
    }

    // ── Verify payment with Stripe — never trust the client ───────────────────
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json({ error: 'Payment has not succeeded' }, { status: 400 });
    }

    // Ensure this PaymentIntent belongs to the authenticated user
    if (paymentIntent.metadata.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const db = adminDb();

    // ── Extract all values from Stripe metadata (server-validated at intent creation) ──
    const m = paymentIntent.metadata;
    const roomId = m.roomId;
    const checkIn = m.checkIn;
    const checkOut = m.checkOut;
    const nights = Number(m.nights);
    const nightlyRate = Number(m.nightlyRate);
    const subtotal = Number(m.subtotal);
    const serviceFee = Number(m.serviceFee);
    const taxes = Number(m.taxes);
    const discountAmount = Number(m.discountAmount ?? '0');
    const total = Math.max(0, subtotal + serviceFee + taxes - discountAmount);
    const paymentType = (m.paymentType ?? 'full') as 'token' | 'half' | 'full';
    const depositAmount = Number(m.chargeAmount ?? String(total));
    const remainingBalance = Number(m.remainingBalance ?? '0');

    const bookedDates = eachDayOfInterval({
      start: parseISO(checkIn),
      end: parseISO(checkOut),
    })
      .slice(0, -1)
      .map((d) => format(d, 'yyyy-MM-dd'));

    // Pre-fetch coupon ref outside transaction for the atomic increment
    let couponRef: FirebaseFirestore.DocumentReference | null = null;
    if (m.couponCode) {
      const couponSnap = await db
        .collection(COLLECTIONS.COUPONS)
        .where('code', '==', m.couponCode)
        .limit(1)
        .get();
      if (!couponSnap.empty) couponRef = couponSnap.docs[0].ref;
    }

    let bookingId = '';
    let wasCreated = false;

    // ── Firestore transaction: idempotency + room guard + booking create + availability update ──
    // The lock doc (paymentIntentId as key) makes idempotency atomic — no race condition possible.
    await db.runTransaction(async (tx) => {
      const lockRef = db.collection('paymentLocks').doc(paymentIntentId);
      const lockSnap = await tx.get(lockRef);
      if (lockSnap.exists) {
        bookingId = lockSnap.data()!.bookingId as string;
        return; // already processed — skip all writes
      }

      const roomRef = db.collection(COLLECTIONS.ROOMS).doc(roomId);
      const roomSnap = await tx.get(roomRef);
      if (roomSnap.exists) {
        const roomData = roomSnap.data()!;
        if (roomData.isUnderMaintenance) {
          throw new Error('This property is temporarily closed for maintenance');
        }
        if (roomData.isAvailable === false) {
          throw new Error('This property is no longer available');
        }
      }

      const availRef = db.collection(COLLECTIONS.AVAILABILITY).doc(roomId);
      const availSnap = await tx.get(availRef);
      if (availSnap.exists) {
        const existing: string[] = availSnap.data()!.bookedDates ?? [];
        if (bookedDates.some((d) => existing.includes(d))) {
          throw new Error('Selected dates are no longer available');
        }
      }

      const now = new Date().toISOString();
      const booking: Omit<Booking, 'id'> = {
        roomId,
        roomTitle: m.roomTitle,
        roomImage: m.roomImage ?? '',
        userId: m.userId,
        userEmail: m.userEmail,
        userName: m.userName,
        checkIn,
        checkOut,
        guests: Number(m.guests),
        status: 'confirmed',
        totalPrice: total,
        nightlyRate,
        nights,
        serviceFee,
        taxes,
        paymentIntentId,
        paymentStatus: 'succeeded',
        paymentType,
        depositAmount,
        remainingBalance,
        discountAmount,
        ...(m.couponCode ? { couponCode: m.couponCode } : {}),
        ...(m.specialRequests ? { specialRequests: m.specialRequests } : {}),
        createdAt: now,
        updatedAt: now,
      };

      const bookingRef = db.collection(COLLECTIONS.BOOKINGS).doc();
      bookingId = bookingRef.id;
      wasCreated = true;
      tx.set(bookingRef, booking);
      tx.set(lockRef, { bookingId, createdAt: now });

      if (availSnap.exists) {
        tx.update(availRef, {
          bookedDates: [...(availSnap.data()!.bookedDates ?? []), ...bookedDates],
        });
      } else {
        tx.set(availRef, { roomId, bookedDates });
      }

      const payment: Omit<Payment, 'id'> = {
        bookingId,
        paymentIntentId,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: 'succeeded',
        nightlyRate,
        nights,
        subtotal,
        serviceFee,
        taxes,
        discountAmount,
        ...(m.couponCode ? { couponCode: m.couponCode } : {}),
        createdAt: now,
        updatedAt: now,
      };
      tx.set(db.collection(COLLECTIONS.PAYMENTS).doc(), payment);

      // Atomically increment coupon usage so limits can never be bypassed
      if (couponRef) {
        tx.update(couponRef, { usedCount: FieldValue.increment(1) });
      }
    });

    // Only send emails when this route actually created the booking.
    // If the lock already existed (webhook was faster), the webhook already sent emails.
    after(async () => {
      if (!wasCreated) return;
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';
      await Promise.allSettled([
        m.userEmail
          ? NotificationService.bookingCreated({
              to: m.userEmail,
              guestName: m.userName ?? m.userEmail,
              bookingId,
              roomTitle: m.roomTitle ?? 'Cabin Booking',
              checkIn,
              checkOut,
              nights,
              guests: Number(m.guests),
              nightlyRate,
              serviceFee,
              taxes,
              totalPrice: total,
              discountAmount,
              paymentIntentId,
              paymentType,
              depositAmount,
              remainingBalance,
              ...(m.couponCode ? { couponCode: m.couponCode } : {}),
              ...(m.specialRequests ? { specialRequests: m.specialRequests } : {}),
            }).catch((e) => console.error('[create-booking] guest email failed:', e))
          : Promise.resolve(),
        NotificationService.adminBookingAlert({
          bookingId,
          guestName: m.userName ?? m.userEmail ?? 'Guest',
          guestEmail: m.userEmail ?? '',
          roomTitle: m.roomTitle ?? 'Cabin Booking',
          checkIn,
          checkOut,
          nights,
          guests: Number(m.guests),
          nightlyRate,
          serviceFee,
          taxes,
          totalPrice: total,
          discountAmount,
          paymentIntentId,
          paymentType,
          depositAmount,
          remainingBalance,
          ...(m.couponCode ? { couponCode: m.couponCode } : {}),
          ...(m.specialRequests ? { specialRequests: m.specialRequests } : {}),
          adminDashboardUrl: `${appUrl}/admin/bookings/${bookingId}`,
        }).catch((e) => console.error('[create-booking] admin email failed:', e)),
      ]);
    });

    return NextResponse.json({ bookingId });
  } catch (err: unknown) {
    console.error('[create-booking]', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
