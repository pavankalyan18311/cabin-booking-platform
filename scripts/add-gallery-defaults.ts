import { readFileSync } from 'fs';
import { resolve } from 'path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const envPath = resolve(process.cwd(), '.env.local');
try {
  const raw = readFileSync(envPath, 'utf8');
  for (const line of raw.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (k && !process.env[k]) process.env[k] = v;
  }
} catch { /* ignore */ }

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

const DEFAULTS = [
  { label: 'Mountain Views', sub: 'Wake up to breathtaking peaks',        src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', span: 'col-span-2 row-span-2', order: 0 },
  { label: 'Cozy Interiors', sub: 'Every comfort, thoughtfully crafted',  src: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=600&q=80', span: 'col-span-1 row-span-1', order: 1 },
  { label: 'Forest Trails',  sub: 'Miles of paths at your door',           src: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80', span: 'col-span-1 row-span-1', order: 2 },
  { label: 'Lake Mornings',  sub: 'Still water, still mind',               src: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=600&q=80', span: 'col-span-1 row-span-1', order: 3 },
  { label: 'Starlit Nights', sub: 'A sky full of stars, just for you',     src: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=600&q=80', span: 'col-span-1 row-span-1', order: 4 },
];

async function run() {
  const col = db.collection('gallery');
  const now = new Date().toISOString();
  const batch = db.batch();
  for (const item of DEFAULTS) {
    batch.set(col.doc(), { ...item, createdAt: now, updatedAt: now });
  }
  await batch.commit();
  console.log(`✅  Added ${DEFAULTS.length} default gallery items to Firestore.`);
}

run().catch((err) => { console.error('❌  Failed:', err); process.exit(1); });
