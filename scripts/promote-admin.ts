/**
 * Promote a user to admin role.
 *
 * Usage (from project root):
 *   npm run promote-admin -- <user-uid>
 *
 * Reads Firebase Admin credentials from .env.local automatically.
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// ── Load .env.local ──────────────────────────────────────────────────────────
const envPath = resolve(process.cwd(), '.env.local');
try {
  const raw = readFileSync(envPath, 'utf8');
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (key && !process.env[key]) process.env[key] = val;
  }
} catch {
  // rely on pre-set environment variables
}

// ── Initialize Admin SDK ─────────────────────────────────────────────────────
if (!getApps().length) {
  const projectId   = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey  = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey || privateKey.includes('REPLACE_WITH')) {
    console.error(
      '\n❌  Firebase Admin credentials not configured.\n' +
      '   Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and\n' +
      '   FIREBASE_ADMIN_PRIVATE_KEY in .env.local (see Firebase Console → Service Accounts).\n'
    );
    process.exit(1);
  }

  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

const db = getFirestore();

// ── Promote ──────────────────────────────────────────────────────────────────
const uid = process.argv[2];

if (!uid) {
  console.error('\nUsage: npm run promote-admin -- <user-uid>\n');
  process.exit(1);
}

async function promoteAdmin(targetUid: string) {
  const ref  = db.collection('users').doc(targetUid);
  const snap = await ref.get();

  if (!snap.exists) {
    console.error(`\n❌  User ${targetUid} not found. Make sure they have signed in at least once.\n`);
    process.exit(1);
  }

  const user = snap.data()!;
  console.log(`\nFound:  ${user.displayName ?? 'Unknown'} <${user.email}>`);
  console.log(`Role:   ${user.role} → admin`);

  await ref.update({ role: 'admin', updatedAt: new Date().toISOString() });
  console.log(`\n✅  ${user.displayName ?? targetUid} is now an admin.\n`);
}

promoteAdmin(uid).catch((err: Error) => {
  console.error('\n❌  Failed:', err.message, '\n');
  process.exit(1);
});
