import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';
import type { Coupon } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // ── Auth ──────────────────────────────────────────────────────────────────
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await adminAuth().verifyIdToken(authHeader.slice(7));

    const { code, subtotal } = await request.json() as { code: string; subtotal: number };

    if (!code?.trim()) {
      return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 });
    }

    const db = adminDb();
    const upperCode = code.trim().toUpperCase();

    const q = await db
      .collection(COLLECTIONS.COUPONS)
      .where('code', '==', upperCode)
      .where('isActive', '==', true)
      .limit(1)
      .get();

    if (q.empty) {
      return NextResponse.json({ error: 'Invalid or inactive coupon code' }, { status: 404 });
    }

    const coupon = { id: q.docs[0].id, ...q.docs[0].data() } as Coupon;

    if (new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'This coupon has expired' }, { status: 400 });
    }
    if (coupon.maxUses !== undefined && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: 'This coupon has reached its usage limit' }, { status: 400 });
    }
    if (subtotal < coupon.minBookingAmount) {
      return NextResponse.json(
        { error: `Minimum booking amount of $${coupon.minBookingAmount} required` },
        { status: 400 }
      );
    }

    const discountAmount =
      coupon.type === 'percentage'
        ? Math.round(subtotal * (coupon.value / 100))
        : Math.min(coupon.value, subtotal);

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discountAmount,
      description: coupon.description,
    });
  } catch (err: unknown) {
    console.error('[validate-coupon]', err);
    return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 });
  }
}
