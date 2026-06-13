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

export async function POST(request: NextRequest) {
  if (!await verifyAdmin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  try {
    const body = await request.json() as { src: string; label: string; sub: string; span: string; order: number };
    const { src, label, sub, span, order } = body;
    if (!src || !label || !sub || !span) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    const now = new Date().toISOString();
    const ref = await adminDb().collection(COLLECTIONS.GALLERY).add({ src, label, sub, span, order: order ?? 0, createdAt: now, updatedAt: now });
    return NextResponse.json({ id: ref.id });
  } catch (err) {
    console.error('[gallery POST]', err);
    return NextResponse.json({ error: 'Failed to add gallery item' }, { status: 500 });
  }
}
