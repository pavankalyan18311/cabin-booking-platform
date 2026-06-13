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

// PATCH /api/admin/nearby/[id] — update a nearby location
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const uid = await verifyAdmin(request);
  if (!uid) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const { id } = await params;
    const body = await request.json() as Partial<{
      name: string;
      distance: number;
      approxTime: string;
    }>;

    const db = adminDb();
    await db.collection(COLLECTIONS.NEARBY_LOCATIONS).doc(id).update({
      ...body,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[nearby PATCH]', err);
    return NextResponse.json({ error: 'Failed to update location' }, { status: 500 });
  }
}

// DELETE /api/admin/nearby/[id] — delete a nearby location
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const uid = await verifyAdmin(request);
  if (!uid) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const { id } = await params;
    const db = adminDb();
    await db.collection(COLLECTIONS.NEARBY_LOCATIONS).doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[nearby DELETE]', err);
    return NextResponse.json({ error: 'Failed to delete location' }, { status: 500 });
  }
}
