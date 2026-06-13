import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const BUCKET   = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!;

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

    const ext           = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const path          = `rooms/${crypto.randomUUID()}.${ext}`;
    const downloadToken = crypto.randomUUID();
    const fileBuffer    = Buffer.from(await file.arrayBuffer());

    // ── Step 1: Simple media upload ───────────────────────────────────────────
    // Uses the user's Firebase ID token with Authorization: Firebase header —
    // same scheme as the client SDK. Calling from the server avoids CORS.
    // Simple upload (not multipart) keeps the request as small as possible.
    const uploadRes = await fetch(
      `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(BUCKET)}/o` +
      `?uploadType=media&name=${encodeURIComponent(path)}`,
      {
        method:  'POST',
        headers: {
          'Content-Type':  file.type,
          'Authorization': `Firebase ${idToken}`,
        },
        body: fileBuffer,
      },
    );

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      console.error('[upload] upload error:', uploadRes.status, errText);
      throw new Error(`Storage upload failed (${uploadRes.status}): ${errText}`);
    }

    // ── Step 2: Patch metadata to set the Firebase download token ─────────────
    // Without this, the object is only accessible via rules-enforced reads.
    // The token makes it directly accessible via ?alt=media&token=...
    const patchRes = await fetch(
      `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(BUCKET)}/o/${encodeURIComponent(path)}`,
      {
        method:  'PATCH',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Firebase ${idToken}`,
        },
        body: JSON.stringify({
          metadata: { firebaseStorageDownloadTokens: downloadToken },
        }),
      },
    );

    if (!patchRes.ok) {
      console.warn('[upload] metadata patch failed (non-fatal):', patchRes.status);
    }

    const downloadUrl =
      `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(BUCKET)}/o/` +
      `${encodeURIComponent(path)}?alt=media&token=${downloadToken}`;

    return NextResponse.json({ url: downloadUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[upload] error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
