/**
 * Gallery seed — replaces all Firestore gallery items with real property photos.
 * Usage:
 *   npm run seed:gallery           — skips if gallery already has items
 *   npm run seed:gallery -- --force — clears and re-seeds
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
} catch { /* rely on env vars already set */ }

// ── Initialize Admin SDK ─────────────────────────────────────────────────────
if (!getApps().length) {
  const projectId   = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey  = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey || privateKey.includes('REPLACE_WITH')) {
    console.error('\n❌  Firebase Admin credentials not configured in .env.local\n');
    process.exit(1);
  }

  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

const db = getFirestore();

// ── Gallery items — pattern: Large, Small, Small repeating ───────────────────
// large = col-span-2 row-span-2 (full-height single card, 300px wide)
// small = col-span-1 row-span-1 (2 stacked per column, 220px wide)
const L = 'col-span-2 row-span-2';
const S = 'col-span-1 row-span-1';

const GALLERY = [
  // Group 1
  { src: '/gallery/gallery-1.jpg',  label: 'Relaxin Cabins',       sub: 'Your home away from home',        span: L },
  { src: '/gallery/gallery-2.jpg',  label: 'Cabin Life',           sub: 'Peace, quiet, and fresh air',     span: S },
  { src: '/gallery/gallery-3.jpg',  label: 'Little Pond',          sub: 'Waterfront views all day long',   span: S },
  // Group 2
  { src: '/gallery/gallery-4.jpg',  label: 'The Loft',             sub: 'Open-concept luxury living',      span: L },
  { src: '/gallery/gallery-5.jpg',  label: 'Cozy Interiors',       sub: 'Every detail thoughtfully done',  span: S },
  { src: '/gallery/gallery-6.jpg',  label: 'Kitchen & Dining',     sub: 'Fully stocked for your stay',     span: S },
  // Group 3
  { src: '/gallery/gallery-7.jpg',  label: 'The Fireplace',        sub: 'Warm up after a day outside',     span: L },
  { src: '/gallery/gallery-8.jpg',  label: 'Beachside Vibes',      sub: 'Sandy shores of the second pond', span: S },
  { src: '/gallery/gallery-9.jpg',  label: 'Morning Light',        sub: 'Wake up to golden hour',          span: S },
  // Group 4
  { src: '/gallery/gallery-10.jpg', label: 'The Lodge',            sub: 'Grand log home at the entrance',  span: L },
  { src: '/gallery/gallery-11.jpg', label: 'Campfire Nights',      sub: 'Gather around the fire pit',      span: S },
  { src: '/gallery/gallery-12.jpg', label: 'Nature Surrounds You', sub: 'Wisconsin woods at your door',    span: S },
  // Group 5
  { src: '/gallery/gallery-13.jpg', label: 'Swimming Pond',        sub: 'Two sandy beaches on property',   span: L },
  { src: '/gallery/gallery-14.jpg', label: 'The Lookout',          sub: 'Tucked into the trees',           span: S },
  { src: '/gallery/gallery-15.jpg', label: 'Outdoor Living',       sub: 'Porches made for relaxing',       span: S },
  // Group 6
  { src: '/gallery/gallery-16.jpg', label: 'The Luxe',             sub: 'Hickory floors & whirlpool tub',  span: L },
  { src: '/gallery/gallery-17.jpg', label: 'Granite Kitchen',      sub: 'Cook like you never left home',   span: S },
  { src: '/gallery/gallery-18.jpg', label: 'Screened Porch',       sub: 'Fresh air without the bugs',      span: S },
  // Group 7
  { src: '/gallery/gallery-19.jpg', label: 'The Landing',          sub: 'Classic log cabin character',     span: L },
  { src: '/gallery/gallery-20.jpg', label: 'BBQ & Grill',          sub: 'Every cabin has one',             span: S },
  { src: '/gallery/gallery-21.jpg', label: 'Pet Friendly',         sub: 'Your furry friends are welcome',  span: S },
  // Group 8
  { src: '/gallery/gallery-22.jpg', label: 'The Leisure',          sub: 'Peaceful and private',            span: L },
  { src: '/gallery/gallery-23.jpg', label: 'Sunset Views',         sub: 'End every day beautifully',       span: S },
  { src: '/gallery/gallery-24.jpg', label: 'The Loghouse',         sub: 'Rustic charm at its finest',      span: S },
  // Group 9
  { src: '/gallery/gallery-25.jpg', label: 'Four Seasons',         sub: 'Open year-round in Wisconsin',    span: L },
  { src: '/gallery/gallery-26.jpg', label: 'Bedroom Comfort',      sub: 'Rest easy every night',           span: S },
  { src: '/gallery/gallery-27.jpg', label: 'Local Art',            sub: 'Decorated by local artists',      span: S },
  // Group 10
  { src: '/gallery/gallery-28.jpg', label: 'Rock Fireplace',       sub: 'Floor-to-ceiling in The Lodge',   span: L },
  { src: '/gallery/gallery-29.jpg', label: 'Cobblestone Patio',    sub: 'Fire pit right off the porch',    span: S },
  { src: '/gallery/gallery-30.jpg', label: 'Castle Rock Lake',     sub: 'Minutes from the property',       span: S },
  // Group 11
  { src: '/gallery/gallery-31.jpg', label: 'Family Moments',       sub: 'Make memories that last',         span: L },
  { src: '/gallery/gallery-32.jpg', label: 'Group Gatherings',     sub: 'Rent all units for the family',   span: S },
  { src: '/gallery/gallery-33.jpg', label: 'Wisconsin Dells',      sub: 'Just 20 minutes away',            span: S },
  // Group 12
  { src: '/gallery/gallery-34.jpg', label: 'Winter Escape',        sub: 'Cozy cabins in the snow',         span: L },
  { src: '/gallery/gallery-35.jpg', label: 'Summer Fun',           sub: 'Swim, grill, and unwind',         span: S },
  { src: '/gallery/gallery-36.jpg', label: 'Fall Colors',          sub: 'Stunning autumn surroundings',    span: S },
  // Group 13
  { src: '/gallery/gallery-37.jpg', label: 'Private & Secluded',   sub: 'Your own slice of Wisconsin',     span: L },
  { src: '/gallery/gallery-38.jpg', label: 'Antique Touches',      sub: 'Unique finds from nearby stores', span: S },
  { src: '/gallery/gallery-39.jpg', label: 'The Bathroom',         sub: 'Clean, stocked, and ready',       span: S },
  // Group 14
  { src: '/gallery/gallery-40.jpg', label: 'Starlit Evenings',     sub: 'Unobstructed night sky views',    span: L },
  { src: '/gallery/gallery-41.jpg', label: 'Morning Coffee',       sub: 'Porch views with your brew',      span: S },
  { src: '/gallery/gallery-42.jpg', label: 'Kids Love It',         sub: 'Room to roam and explore',        span: S },
  // Group 15
  { src: '/gallery/gallery-43.jpg', label: 'Relaxin Cabins',       sub: 'N6768 WI-58, New Lisbon, WI',     span: L },
  { src: '/gallery/gallery-44.jpg', label: 'Come As You Are',      sub: 'Unplug and truly relax',          span: S },
  { src: '/gallery/gallery-45.jpg', label: 'Book Your Stay',       sub: 'Your next adventure awaits',      span: S },
];

// ── Main ─────────────────────────────────────────────────────────────────────
async function seed() {
  const force = process.argv.includes('--force');
  const colRef = db.collection('gallery');

  console.log('\n🖼️   Gallery seed starting...\n');

  const existing = await colRef.limit(1).get();
  if (!existing.empty) {
    if (!force) {
      console.log('⚠️   Gallery already has items. Run with --force to replace:\n');
      console.log('      npm run seed:gallery -- --force\n');
      process.exit(0);
    }
    console.log('🗑️   --force: deleting existing gallery items...');
    const all = await colRef.get();
    const delBatch = db.batch();
    all.docs.forEach((d) => delBatch.delete(d.ref));
    await delBatch.commit();
    console.log(`    Deleted ${all.size} items.\n`);
  }

  const now = new Date().toISOString();
  // Firestore batch limit is 500, our 45 items are well within that
  const batch = db.batch();
  GALLERY.forEach((item, i) => {
    batch.set(colRef.doc(), { ...item, order: i, createdAt: now, updatedAt: now });
  });

  await batch.commit();
  const large = GALLERY.filter((g) => g.span === L).length;
  const small = GALLERY.filter((g) => g.span === S).length;
  console.log(`✅  Seeded ${GALLERY.length} gallery items (${large} large, ${small} small).\n`);
}

seed().catch((err) => { console.error('❌  Gallery seed failed:', err); process.exit(1); });
