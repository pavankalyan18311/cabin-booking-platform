import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { calculateBookingTotal, calculateNights } from '@/lib/utils';
import type { Coupon, PaymentType } from '@/types';
import { parseISO } from 'date-fns';

const HALF_RATE = 0.50;

function buildMapsUrl(coordinates: { lat: number; lng: number } | undefined, location: string): string {
  if (coordinates?.lat && coordinates?.lng) {
    return `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}

function calcChargeAmount(total: number, paymentType: PaymentType): number {
  if (paymentType === 'half') return Math.round(total * HALF_RATE * 100) / 100;
  return total;
}

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

    // ── Body ──────────────────────────────────────────────────────────────────
    const body = await request.json() as {
      roomId: string;
      checkIn: string;
      checkOut: string;
      guests: number;
      specialRequests?: string;
      couponCode?: string;
      paymentType?: PaymentType;
    };

    const { roomId, checkIn, checkOut, guests, specialRequests, couponCode } = body;
    const paymentType: PaymentType = body.paymentType ?? 'full';

    if (!roomId || !checkIn || !checkOut || !guests) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // ── Room lookup (server-side) ─────────────────────────────────────────────
    const db = adminDb();
    const roomSnap = await db.collection(COLLECTIONS.ROOMS).doc(roomId).get();
    if (!roomSnap.exists) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }
    const room = roomSnap.data()!;
    if (room.isUnderMaintenance) {
      return NextResponse.json({ error: 'This property is temporarily closed for maintenance' }, { status: 400 });
    }
    if (room.isAvailable === false) {
      return NextResponse.json({ error: 'This property is not available' }, { status: 400 });
    }

    // ── Pricing (always server-side — never trust client amounts) ─────────────
    const nightlyRate: number = room.discountPrice ?? room.price;
    const nights = calculateNights(parseISO(checkIn), parseISO(checkOut));
    const { subtotal, serviceFee, taxes } = calculateBookingTotal(nightlyRate, nights);

    // ── Coupon validation ─────────────────────────────────────────────────────
    let discountAmount = 0;
    let validatedCouponCode: string | undefined;

    if (couponCode?.trim()) {
      const code = couponCode.trim().toUpperCase();
      const couponQuery = await db
        .collection(COLLECTIONS.COUPONS)
        .where('code', '==', code)
        .where('isActive', '==', true)
        .limit(1)
        .get();

      if (!couponQuery.empty) {
        const couponData = { id: couponQuery.docs[0].id, ...couponQuery.docs[0].data() } as Coupon;
        const now = new Date();

        if (new Date(couponData.expiresAt) < now) {
          return NextResponse.json({ error: 'Coupon has expired' }, { status: 400 });
        }
        if (couponData.maxUses !== undefined && couponData.usedCount >= couponData.maxUses) {
          return NextResponse.json({ error: 'Coupon usage limit reached' }, { status: 400 });
        }
        if (subtotal < couponData.minBookingAmount) {
          return NextResponse.json(
            { error: `Coupon requires a minimum booking of $${couponData.minBookingAmount}` },
            { status: 400 }
          );
        }

        if (couponData.type === 'percentage') {
          discountAmount = Math.round(subtotal * (couponData.value / 100));
        } else {
          discountAmount = Math.min(couponData.value, subtotal);
        }
        validatedCouponCode = code;
      } else {
        return NextResponse.json({ error: 'Invalid or inactive coupon code' }, { status: 400 });
      }
    }

    const total = Math.max(0, subtotal + serviceFee + taxes - discountAmount);
    const chargeAmount = calcChargeAmount(total, paymentType);
    const remainingBalance = Math.round((total - chargeAmount) * 100) / 100;

    // Stripe requires amounts in cents
    const amountInCents = Math.round(chargeAmount * 100);
    if (amountInCents < 50) {
      return NextResponse.json({ error: 'Amount too small to process' }, { status: 400 });
    }

    // ── Fetch user info ────────────────────────────────────────────────────────
    const userSnap = await db.collection(COLLECTIONS.USERS).doc(userId).get();
    const userData = userSnap.data();

    // ── Create PaymentIntent ──────────────────────────────────────────────────
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        roomId,
        roomTitle: room.title as string,
        roomLocation: (room.location as string) ?? '',
        roomImage: (room.images as string[])?.[0] ?? '',
        roomMapsUrl: buildMapsUrl(room.coordinates as { lat: number; lng: number } | undefined, room.location as string),
        userId,
        userEmail: userData?.email ?? decoded.email ?? '',
        userName: userData?.displayName ?? decoded.name ?? '',
        checkIn,
        checkOut,
        guests: String(guests),
        nights: String(nights),
        nightlyRate: String(nightlyRate),
        subtotal: String(subtotal),
        serviceFee: String(serviceFee),
        taxes: String(taxes),
        discountAmount: String(discountAmount),
        paymentType,
        chargeAmount: String(chargeAmount),
        remainingBalance: String(remainingBalance),
        ...(validatedCouponCode ? { couponCode: validatedCouponCode } : {}),
        ...(specialRequests ? { specialRequests } : {}),
      },
      description: `Relax Cabin booking — ${room.title}`,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      breakdown: {
        nightlyRate,
        nights,
        subtotal,
        discountAmount,
        serviceFee,
        taxes,
        total,
        chargeAmount,
        remainingBalance,
        paymentType,
      },
    });
  } catch (err: unknown) {
    console.error('[create-intent]', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
