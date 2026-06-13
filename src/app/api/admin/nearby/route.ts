import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';

async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const decoded = await adminAuth().verifyIdToken(authHeader.slice(7));
    const db = adminDb();
    const userSnap = await db.collection(COLLECTIONS.USERS).doc(decoded.uid).get();
    if (!userSnap.exists || userSnap.data()!.role !== 'admin') return null;
    return decoded.uid;
  } catch {
    return null;
  }
}

// POST /api/admin/nearby — add a nearby location
export async function POST(request: NextRequest) {
  const uid = await verifyAdmin(request);
  if (!uid) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = await request.json() as {
      name: string;
      distance: number;
      approxTime: string;
    };

    const { name, distance, approxTime } = body;
    if (!name || !distance || !approxTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const db = adminDb();
    const ref = await db.collection(COLLECTIONS.NEARBY_LOCATIONS).add({
      name, distance, approxTime,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ id: ref.id });
  } catch (err) {
    console.error('[nearby POST]', err);
    return NextResponse.json({ error: 'Failed to add location' }, { status: 500 });
  }
}
