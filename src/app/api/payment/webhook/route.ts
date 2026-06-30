import { NextRequest, NextResponse, after } from 'next/server';
import stripe from '@/lib/stripe/server';
import { adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { FieldValue } from 'firebase-admin/firestore';
import { format, eachDayOfInterval, parseISO } from 'date-fns';
import type { Booking, Payment } from '@/types';
import type Stripe from 'stripe';
import { NotificationService } from '@/lib/notifications';
import { signBalanceToken } from '@/lib/stripe/balanceToken';

// Disable body parsing — Stripe webhook needs the raw body for signature verification
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
  }

  // payment_intent.succeeded — safety net for when the client doesn't call create-booking
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    await handlePaymentSucceeded(paymentIntent);
  }

  // checkout.session.completed — fired when a guest pays their remaining
  // balance via the link emailed in the half-payment booking confirmation
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.metadata?.type === 'balance' && session.metadata.bookingId) {
      await handleBalancePaid(session);
    }
  }

  return NextResponse.json({ received: true });
}

async function handleBalancePaid(session: Stripe.Checkout.Session) {
  const db = adminDb();
  const bookingId = session.metadata!.bookingId;
  const bookingRef = db.collection(COLLECTIONS.BOOKINGS).doc(bookingId);

  const bookingSnap = await bookingRef.get();
  if (!bookingSnap.exists) {
    console.warn('[webhook] balance payment for unknown booking, skipping', bookingId);
    return;
  }
  const booking = bookingSnap.data() as Booking;
  if (booking.balancePaid) return; // already processed (webhook retry)

  const now = new Date().toISOString();
  const amountPaid = (session.amount_total ?? 0) / 100;
  await bookingRef.update({
    balancePaid: true,
    balancePaidAt: now,
    remainingBalance: 0,
    updatedAt: now,
  });

  const payment: Omit<Payment, 'id'> = {
    bookingId,
    paymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : (session.payment_intent?.id ?? session.id),
    amount: session.amount_total ?? 0,
    currency: session.currency ?? 'usd',
    status: 'succeeded',
    nightlyRate: booking.nightlyRate,
    nights: booking.nights,
    subtotal: amountPaid,
    serviceFee: 0,
    taxes: 0,
    discountAmount: 0,
    createdAt: now,
    updatedAt: now,
  };
  await db.collection(COLLECTIONS.PAYMENTS).add(payment);

  if (booking.userEmail) {
    await NotificationService.balancePaid({
      to: booking.userEmail,
      guestName: booking.userName ?? booking.userEmail,
      bookingId,
      roomTitle: booking.roomTitle ?? 'Cabin Booking',
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      nights: booking.nights,
      guests: booking.guests,
      nightlyRate: booking.nightlyRate,
      serviceFee: booking.serviceFee,
      taxes: booking.taxes,
      totalPrice: booking.totalPrice,
      depositAmount: amountPaid,
    }).catch((e) => console.error('[webhook] balance-paid email failed:', e));
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const db = adminDb();
  const m = paymentIntent.metadata;
  if (!m.roomId || !m.userId || !m.checkIn || !m.checkOut) {
    console.warn('[webhook] PaymentIntent missing required metadata, skipping', paymentIntent.id);
    return;
  }

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
    start: parseISO(m.checkIn),
    end: parseISO(m.checkOut),
  })
    .slice(0, -1)
    .map((d) => format(d, 'yyyy-MM-dd'));

  let bookingId = '';
  let wasCreated = false;

  try {
    // Pre-fetch coupon ref outside transaction so we can use it inside
    let couponRef: FirebaseFirestore.DocumentReference | null = null;
    if (m.couponCode) {
      const couponSnap = await db
        .collection(COLLECTIONS.COUPONS)
        .where('code', '==', m.couponCode)
        .limit(1)
        .get();
      if (!couponSnap.empty) couponRef = couponSnap.docs[0].ref;
    }

    await db.runTransaction(async (tx) => {
      // Same paymentLocks idempotency as create-booking route — prevents race condition
      const lockRef = db.collection('paymentLocks').doc(paymentIntent.id);
      const lockSnap = await tx.get(lockRef);
      if (lockSnap.exists) {
        bookingId = lockSnap.data()!.bookingId as string;
        return;
      }

      const availRef = db.collection(COLLECTIONS.AVAILABILITY).doc(m.roomId);
      const availSnap = await tx.get(availRef);

      const now = new Date().toISOString();
      const booking: Omit<Booking, 'id'> = {
        roomId: m.roomId,
        roomTitle: m.roomTitle,
        roomImage: m.roomImage ?? '',
        userId: m.userId,
        userEmail: m.userEmail,
        userName: m.userName,
        checkIn: m.checkIn,
        checkOut: m.checkOut,
        guests: Number(m.guests),
        status: 'confirmed',
        totalPrice: total,
        nightlyRate,
        nights,
        serviceFee,
        taxes,
        paymentIntentId: paymentIntent.id,
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
        tx.set(availRef, { roomId: m.roomId, bookedDates });
      }

      const payment: Omit<Payment, 'id'> = {
        bookingId: bookingRef.id,
        paymentIntentId: paymentIntent.id,
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

      // Atomically increment coupon usage so limits are never bypassed
      if (couponRef) {
        tx.update(couponRef, { usedCount: FieldValue.increment(1) });
      }
    });
  } catch (err) {
    console.error('[webhook] Failed to create booking:', err);
    return;
  }

  if (bookingId && wasCreated) {
    after(async () => {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';
      const balancePaymentUrl = paymentType === 'half' && remainingBalance > 0
        ? `${appUrl}/api/payment/balance-checkout/${bookingId}?token=${signBalanceToken(bookingId)}`
        : undefined;
      await Promise.allSettled([
        m.userEmail
          ? NotificationService.bookingCreated({
              to: m.userEmail,
              guestName: m.userName ?? m.userEmail,
              bookingId,
              roomTitle: m.roomTitle ?? 'Cabin Booking',
              checkIn: m.checkIn,
              checkOut: m.checkOut,
              nights,
              guests: Number(m.guests),
              nightlyRate,
              serviceFee,
              taxes,
              totalPrice: total,
              discountAmount,
              paymentIntentId: paymentIntent.id,
              paymentType,
              depositAmount,
              remainingBalance,
              balancePaymentUrl,
              ...(m.couponCode ? { couponCode: m.couponCode } : {}),
              ...(m.specialRequests ? { specialRequests: m.specialRequests } : {}),
            }).catch((e) => console.error('[webhook] guest email failed:', e))
          : Promise.resolve(),
        NotificationService.adminBookingAlert({
          bookingId,
          guestName: m.userName ?? m.userEmail ?? 'Guest',
          guestEmail: m.userEmail ?? '',
          roomTitle: m.roomTitle ?? 'Cabin Booking',
          checkIn: m.checkIn,
          checkOut: m.checkOut,
          nights,
          guests: Number(m.guests),
          nightlyRate,
          serviceFee,
          taxes,
          totalPrice: total,
          discountAmount,
          paymentIntentId: paymentIntent.id,
          paymentType,
          depositAmount,
          remainingBalance,
          ...(m.couponCode ? { couponCode: m.couponCode } : {}),
          ...(m.specialRequests ? { specialRequests: m.specialRequests } : {}),
          adminDashboardUrl: `${appUrl}/admin/bookings/${bookingId}`,
        }).catch((e) => console.error('[webhook] admin email failed:', e)),
      ]);
    });
  }
}
