import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';
import type { OTPRecord } from '@/types';

const MAX_ATTEMPTS = 5;

function hashOTP(otp: string, userId: string): string {
  return createHash('sha256').update(otp + userId).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const decoded = await adminAuth().verifyIdToken(authHeader.slice(7));
    const userId = decoded.uid;

    const { otp } = await request.json() as { otp: string };
    if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      return NextResponse.json({ error: 'Invalid OTP format' }, { status: 400 });
    }

    const db = adminDb();
    const otpRef = db.collection(COLLECTIONS.OTPS).doc(userId);
    const otpSnap = await otpRef.get();

    if (!otpSnap.exists) {
      return NextResponse.json({ error: 'No OTP found. Please request a new code.' }, { status: 400 });
    }

    const record = otpSnap.data() as OTPRecord;

    if (record.verified) {
      return NextResponse.json({ error: 'Email already verified' }, { status: 400 });
    }

    if (record.attempts >= MAX_ATTEMPTS) {
      return NextResponse.json(
        { error: 'Too many incorrect attempts. Please request a new code.' },
        { status: 400 }
      );
    }

    if (new Date() > new Date(record.expiresAt)) {
      return NextResponse.json({ error: 'Code has expired. Please request a new one.' }, { status: 400 });
    }

    const inputHash = hashOTP(otp, userId);
    if (inputHash !== record.otpHash) {
      // Increment failed attempt count
      await otpRef.update({ attempts: record.attempts + 1 });
      const remaining = MAX_ATTEMPTS - (record.attempts + 1);
      return NextResponse.json(
        { error: remaining > 0 ? `Incorrect code. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.` : 'Too many incorrect attempts. Please request a new code.' },
        { status: 400 }
      );
    }

    // Mark OTP as verified and update user profile atomically
    const batch = db.batch();
    batch.update(otpRef, { verified: true });
    batch.update(db.collection(COLLECTIONS.USERS).doc(userId), {
      isEmailVerified: true,
      updatedAt: new Date().toISOString(),
    });
    await batch.commit();

    return NextResponse.json({ verified: true });
  } catch (err: unknown) {
    console.error('[verify-otp]', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
