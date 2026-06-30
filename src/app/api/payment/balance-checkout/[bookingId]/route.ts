import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe/server';
import { verifyBalanceToken } from '@/lib/stripe/balanceToken';
import { adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';
import type { Booking } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const { bookingId } = await params;
  const token = request.nextUrl.searchParams.get('token') ?? '';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;

  if (!verifyBalanceToken(bookingId, token)) {
    return NextResponse.redirect(`${appUrl}/dashboard/bookings?balanceError=invalid-link`);
  }

  const db = adminDb();
  const snap = await db.collection(COLLECTIONS.BOOKINGS).doc(bookingId).get();
  if (!snap.exists) {
    return NextResponse.redirect(`${appUrl}/dashboard/bookings?balanceError=not-found`);
  }

  const booking = snap.data() as Booking;
  if (booking.paymentType !== 'half' || booking.balancePaid || !booking.remainingBalance) {
    return NextResponse.redirect(`${appUrl}/dashboard/bookings?balanceInfo=already-settled`);
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        unit_amount: Math.round(booking.remainingBalance * 100),
        product_data: { name: `Remaining balance — ${booking.roomTitle ?? 'Cabin Booking'}` },
      },
      quantity: 1,
    }],
    metadata: { bookingId, type: 'balance' },
    ...(booking.userEmail ? { customer_email: booking.userEmail } : {}),
    success_url: `${appUrl}/dashboard/bookings?balance=paid`,
    cancel_url: `${appUrl}/dashboard/bookings?balance=cancelled`,
  });

  return NextResponse.redirect(session.url!, { status: 303 });
}
