/**
 * POST /api/admin/promote
 * Promotes a user to admin role.
 * Protected by ADMIN_PROMOTION_SECRET env var — only callable server-side.
 *
 * Body: { uid: string; secret: string }
 */
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';

export async function POST(request: Request) {
  try {
    const { uid, secret } = (await request.json()) as { uid: string; secret: string };

    // Guard with a server-only secret (not exposed to client)
    const expectedSecret = process.env.ADMIN_PROMOTION_SECRET;
    if (!expectedSecret || secret !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!uid || typeof uid !== 'string') {
      return NextResponse.json({ error: 'uid required' }, { status: 400 });
    }

    const db = adminDb();
    const userRef = db.collection(COLLECTIONS.USERS).doc(uid);
    const snap = await userRef.get();

    if (!snap.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await userRef.update({
      role: 'admin',
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, message: `User ${uid} promoted to admin.` });
  } catch (err: unknown) {
    console.error('[promote-admin]', err);
    return NextResponse.json(
      { error: (err as Error).message ?? 'Internal error' },
      { status: 500 }
    );
  }
}
