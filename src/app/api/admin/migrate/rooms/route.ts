import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { FieldValue } from 'firebase-admin/firestore';

// POST /api/admin/migrate/rooms
// One-shot migration: removes `location` and `size` fields from every room document.
// Safe to call multiple times — FieldValue.delete() is a no-op on missing fields.
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const decoded = await adminAuth().verifyIdToken(authHeader.slice(7));

    const db = adminDb();
    const userSnap = await db.collection(COLLECTIONS.USERS).doc(decoded.uid).get();
    if (!userSnap.exists || userSnap.data()!.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const snap = await db.collection(COLLECTIONS.ROOMS).get();
    const batch = db.batch();

    snap.docs.forEach((doc) => {
      batch.update(doc.ref, {
        location: FieldValue.delete(),
        size:     FieldValue.delete(),
      });
    });

    await batch.commit();

    return NextResponse.json({ success: true, updated: snap.size });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[migrate/rooms]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
