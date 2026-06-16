import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json() as { token: string; password: string };

    if (!token || typeof token !== 'string' || token.length !== 64) {
      return NextResponse.json({ error: 'Invalid reset link.' }, { status: 400 });
    }
    if (!password || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    const tokenHash = hashToken(token);
    const db = adminDb();
    const resetRef = db.collection(COLLECTIONS.PASSWORD_RESETS).doc(tokenHash);
    const resetSnap = await resetRef.get();

    if (!resetSnap.exists) {
      return NextResponse.json({ error: 'Reset link is invalid or has already been used.' }, { status: 400 });
    }

    const resetData = resetSnap.data()!;

    if (resetData.used) {
      return NextResponse.json({ error: 'This reset link has already been used.' }, { status: 400 });
    }

    if (new Date() > new Date(resetData.expiresAt)) {
      return NextResponse.json({ error: 'This reset link has expired. Please request a new one.' }, { status: 400 });
    }

    // Update the password using Admin SDK (no sign-in required)
    await adminAuth().updateUser(resetData.userId, { password });

    // Mark token as used
    await resetRef.update({ used: true, usedAt: new Date().toISOString() });

    return NextResponse.json({ reset: true });
  } catch (err: unknown) {
    console.error('[reset-password]', err);
    const message = err instanceof Error ? err.message : 'Something went wrong.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
