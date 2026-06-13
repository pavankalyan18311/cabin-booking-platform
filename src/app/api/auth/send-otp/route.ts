import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomInt } from 'crypto';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { NotificationService } from '@/lib/notifications';
import type { OTPRecord } from '@/types';

const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const RATE_LIMIT_MAX = 3;        // max OTP sends per window
const RATE_LIMIT_WINDOW_MS = 30 * 60 * 1000; // 30 minutes

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

    const db = adminDb();
    const otpRef = db.collection(COLLECTIONS.OTPS).doc(userId);
    const otpSnap = await otpRef.get();
    const now = new Date();

    // Rate limit: max RATE_LIMIT_MAX sends per 30-min window
    if (otpSnap.exists) {
      const existing = otpSnap.data() as OTPRecord;
      if (existing.verified) {
        return NextResponse.json({ error: 'Email already verified' }, { status: 400 });
      }

      const windowStart = new Date(existing.windowStart);
      const inWindow = (now.getTime() - windowStart.getTime()) < RATE_LIMIT_WINDOW_MS;

      if (inWindow && existing.requestCount >= RATE_LIMIT_MAX) {
        const windowEndsAt = new Date(windowStart.getTime() + RATE_LIMIT_WINDOW_MS);
        const minutesLeft = Math.ceil((windowEndsAt.getTime() - now.getTime()) / 60000);
        return NextResponse.json(
          { error: `Too many requests. Try again in ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}.` },
          { status: 429 }
        );
      }
    }

    // Fetch user info for the email
    const userSnap = await db.collection(COLLECTIONS.USERS).doc(userId).get();
    if (!userSnap.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const userData = userSnap.data()!;
    const email: string = userData.email ?? decoded.email ?? '';
    const displayName: string = userData.displayName ?? 'there';

    if (!email) {
      return NextResponse.json({ error: 'No email address on file' }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otp = String(randomInt(100000, 1000000));
    const otpHash = hashOTP(otp, userId);
    const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();

    // Determine rate limit window values
    let requestCount = 1;
    let windowStart = now.toISOString();

    if (otpSnap.exists) {
      const existing = otpSnap.data() as OTPRecord;
      const prevWindowStart = new Date(existing.windowStart);
      const inWindow = (now.getTime() - prevWindowStart.getTime()) < RATE_LIMIT_WINDOW_MS;
      if (inWindow) {
        requestCount = existing.requestCount + 1;
        windowStart = existing.windowStart;
      }
    }

    const record: OTPRecord = {
      userId,
      email,
      otpHash,
      expiresAt,
      attempts: 0,
      verified: false,
      requestCount,
      windowStart,
      createdAt: now.toISOString(),
    };

    await otpRef.set(record);

    // Fire-and-forget — never block the response on email delivery
    void NotificationService.sendOTP({
      to: email,
      guestName: displayName,
      otp,
      expiresInMinutes: OTP_EXPIRY_MINUTES,
    }).catch((e) => console.error('[send-otp] email failed:', e));

    return NextResponse.json({ sent: true });
  } catch (err: unknown) {
    console.error('[send-otp]', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
