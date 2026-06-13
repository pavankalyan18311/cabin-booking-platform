import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { calculateBookingTotal, calculateNights } from '@/lib/utils';
import { format, eachDayOfInterval, parseISO } from 'date-fns';
import type { Booking } from '@/types';
import { NotificationService } from '@/lib/notifications';

function buildMapsUrl(coordinates: { lat: number; lng: number } | undefined, location: string): string {
  if (coordinates?.lat && coordinates?.lng) {
    return `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}

export async function POST(request: NextRequest) {
  try {
    // ── Auth ──────────────────────────────────────────────────────────────────
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const decoded = await adminAuth().verifyIdToken(authHeader.slice(7));
    const userId = decoded.uid;

    const body = await request.json() as {
      roomId: string;
      checkIn: string;
      checkOut: string;
      guests: number;
      specialRequests?: string;
    };

    const { roomId, checkIn, checkOut, guests, specialRequests } = body;
    if (!roomId || !checkIn || !checkOut || !guests) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = adminDb();

    // ── Room validation — all server-side, never trust client ─────────────────
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

    // ── Pricing — always computed server-side from live room data ─────────────
    const nightlyRate: number = room.discountPrice ?? room.price;
    const nights = calculateNights(parseISO(checkIn), parseISO(checkOut));
    const { subtotal, serviceFee, taxes, total } = calculateBookingTotal(nightlyRate, nights);

    const bookedDates = eachDayOfInterval({
      start: parseISO(checkIn),
      end: parseISO(checkOut),
    })
      .slice(0, -1)
      .map((d) => format(d, 'yyyy-MM-dd'));

    // ── User info ─────────────────────────────────────────────────────────────
    const userSnap = await db.collection(COLLECTIONS.USERS).doc(userId).get();
    const userData = userSnap.data();
    const userEmail = userData?.email ?? decoded.email ?? '';
    const userName = userData?.displayName ?? decoded.name ?? '';

    let bookingId = '';

    // ── Atomic transaction: validate + create booking + block dates ───────────
    await db.runTransaction(async (tx) => {
      // Re-validate room inside transaction to prevent TOCTOU race
      const roomRef = db.collection(COLLECTIONS.ROOMS).doc(roomId);
      const freshRoom = await tx.get(roomRef);
      if (freshRoom.exists) {
        if (freshRoom.data()!.isUnderMaintenance) throw new Error('Property is temporarily closed');
        if (freshRoom.data()!.isAvailable === false) throw new Error('Property is no longer available');
      }

      // Date conflict guard
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
        roomTitle: room.title as string,
        roomImage: (room.images as string[])?.[0] ?? '',
        userId,
        userEmail,
        userName,
        checkIn,
        checkOut,
        guests,
        status: 'pending',
        // paymentStatus 'pending' = "pay at property" — no online payment taken
        paymentStatus: 'pending',
        totalPrice: total,
        nightlyRate,
        nights,
        serviceFee,
        taxes,
        discountAmount: 0,
        ...(specialRequests?.trim() ? { specialRequests: specialRequests.trim() } : {}),
        createdAt: now,
        updatedAt: now,
      };

      const bookingRef = db.collection(COLLECTIONS.BOOKINGS).doc();
      bookingId = bookingRef.id;
      tx.set(bookingRef, booking);

      // Block the dates so no other booking can overlap
      if (availSnap.exists) {
        tx.update(availRef, {
          bookedDates: [...(availSnap.data()!.bookedDates ?? []), ...bookedDates],
        });
      } else {
        tx.set(availRef, { roomId, bookedDates });
      }
    });

    // ── Fire-and-forget email confirmation ────────────────────────────────────
    if (userEmail) {
      void NotificationService.bookingReserved({
        to: userEmail,
        guestName: userName || userEmail,
        bookingId,
        roomTitle: room.title as string,
        roomLocation: (room.location as string) ?? '',
        mapsUrl: buildMapsUrl(room.coordinates as { lat: number; lng: number } | undefined, room.location as string),
        checkIn,
        checkOut,
        nights,
        guests,
        nightlyRate,
        serviceFee,
        taxes,
        totalPrice: total,
        discountAmount: 0,
        ...(specialRequests?.trim() ? { specialRequests: specialRequests.trim() } : {}),
      }).catch((e) => console.error('[reserve] email notify failed:', e));
    }

    return NextResponse.json({
      bookingId,
      breakdown: { nightlyRate, nights, subtotal, serviceFee, taxes, total, discountAmount: 0 },
    });
  } catch (err: unknown) {
    console.error('[reserve-booking]', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
