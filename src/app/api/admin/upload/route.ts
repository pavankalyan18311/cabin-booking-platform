import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb, adminStorage } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(request: NextRequest) {
  try {
    // ── Auth: admin only ──────────────────────────────────────────────────────
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const idToken = authHeader.slice(7);
    const decoded = await adminAuth().verifyIdToken(idToken);

    const db = adminDb();
    const userSnap = await db.collection(COLLECTIONS.USERS).doc(decoded.uid).get();
    if (!userSnap.exists || userSnap.data()!.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // ── Parse and validate file ───────────────────────────────────────────────
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file)                           return NextResponse.json({ error: 'No file provided' },              { status: 400 });
    if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    if (file.size > MAX_SIZE)            return NextResponse.json({ error: 'File exceeds the 10 MB limit' }, { status: 400 });

    const ext        = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const path       = `rooms/${crypto.randomUUID()}.${ext}`;
    const token      = crypto.randomUUID();
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // ── Upload via Admin SDK — sets download token atomically ─────────────────
    const bucket  = adminStorage().bucket();
    const fileRef = bucket.file(path);
    await fileRef.save(fileBuffer, {
      metadata: {
        contentType: file.type,
        metadata: { firebaseStorageDownloadTokens: token },
      },
    });

    const downloadUrl =
      `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(bucket.name)}/o/` +
      `${encodeURIComponent(path)}?alt=media&token=${token}`;

    return NextResponse.json({ url: downloadUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[upload] error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
