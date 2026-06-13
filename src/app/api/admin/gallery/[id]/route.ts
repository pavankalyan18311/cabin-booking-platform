import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';

async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const decoded = await adminAuth().verifyIdToken(authHeader.slice(7));
    const userSnap = await adminDb().collection(COLLECTIONS.USERS).doc(decoded.uid).get();
    if (!userSnap.exists || userSnap.data()!.role !== 'admin') return null;
    return decoded.uid;
  } catch { return null; }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await verifyAdmin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  try {
    const body = await request.json();
    await adminDb().collection(COLLECTIONS.GALLERY).doc(id).update({ ...body, updatedAt: new Date().toISOString() });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[gallery PATCH]', err);
    return NextResponse.json({ error: 'Failed to update gallery item' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await verifyAdmin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  try {
    await adminDb().collection(COLLECTIONS.GALLERY).doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[gallery DELETE]', err);
    return NextResponse.json({ error: 'Failed to delete gallery item' }, { status: 500 });
  }
}
