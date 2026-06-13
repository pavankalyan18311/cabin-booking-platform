/**
 * Seed script — populates the Firestore `rooms` collection with sample data.
 *
 * Usage (from project root):
 *   npm run seed
 *
 * Reads Firebase Admin credentials from .env.local automatically.
 * Safe to re-run — skips seeding if rooms already exist.
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
  // .env.local not found — rely on environment variables already set
}

// ── Initialize Admin SDK ─────────────────────────────────────────────────────
if (!getApps().length) {
  const projectId   = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey  = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey || privateKey.includes('REPLACE_WITH')) {
    console.error(
      '\n❌  Firebase Admin credentials are not configured.\n' +
      '   1. Go to Firebase Console → Project Settings → Service Accounts\n' +
      '   2. Click "Generate new private key" and download the JSON file\n' +
      '   3. Copy the three values into .env.local:\n' +
      '      FIREBASE_ADMIN_PROJECT_ID\n' +
      '      FIREBASE_ADMIN_CLIENT_EMAIL\n' +
      '      FIREBASE_ADMIN_PRIVATE_KEY\n'
    );
    process.exit(1);
  }

  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

const db = getFirestore();

// ── Real room data — Relaxin Cabins, N6768 WI-58, New Lisbon, WI 53950 ───────
// Images for The Loft are served from /public/rooms/the-loft/
// For rooms whose photos haven't been provided yet, add photos to
//   public/rooms/<slug>/ and update the images array below, then re-seed.
const ROOMS = [
  // ── THE LOFT (photos provided) ───────────────────────────────────────────
  {
    title: 'The Loft',
    slug: 'the-loft',
    description:
      'A newer, open-concept rental with a beachy feel sitting right on the shores of the second pond. Features a deluxe kitchen with granite countertops and stainless appliances, a custom floor-to-ceiling rock fireplace, and a cobblestone patio fire pit just steps from the front porch. The Lodge is right next door, making it ideal for larger groups taking over neighboring units.',
    shortDescription: 'Beachside luxury with granite kitchen, rock fireplace & cobblestone fire pit on the second pond.',
    price: 431,
    maxGuests: 8,
    bedrooms: 2,
    bathrooms: 2,
    location: 'New Lisbon, WI',
    images: [
      '/rooms/the-loft/Room1.jpg',
      '/rooms/the-loft/Room1.4.jpg',
      '/rooms/the-loft/Room1.5.jpg',
      '/rooms/the-loft/Room1.6.jpg',
      '/rooms/the-loft/Room1.7.jpg',
      '/rooms/the-loft/Room1.8.jpg',
      '/rooms/the-loft/Room1.9.jpg',
      '/rooms/the-loft/Room1.10.jpg',
      '/rooms/the-loft/Room1.11.jpg',
    ],
    amenities: [
      'Full Kitchen', 'Dishwasher', 'Fireplace', 'Air Conditioning', 'Central Heating',
      'WiFi', 'TV Satellite', 'BBQ Grill', 'Fire Pit', 'Balcony', 'Porch',
      'Parking', 'Pet Friendly', 'Towel Set',
    ],
    roomDetails: {
      bedTypes: ['2 Queen-size beds', '1 Fold-away bed', '1 Sofa bed'],
      spaces: ['1 Kitchen', '1 Dining Room', '1 Living Room', '1 Balcony'],
      toilets: 2,
    },
    category: 'loft',
    rating: 5.0,
    reviewCount: 8,
    isAvailable: true,
    isFeatured: true,
    tags: ['loft', 'beachside', 'large-groups', 'luxury'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // ── THE LUXE ─────────────────────────────────────────────────────────────
  {
    title: 'The Luxe',
    slug: 'the-luxe',
    description:
      'The Luxe is one of the two upgraded premium rentals with an open, beachy feel, sitting on the shores of the second pond. Every detail has been thoughtfully designed — a screened porch, custom wall fireplace, whirlpool tub with separate shower, and rich hickory flooring. A home away from home with serious attention to detail.',
    shortDescription: 'Premium beachside rental with screened porch, whirlpool tub & hickory floors.',
    price: 342,
    maxGuests: 2,
    bedrooms: 2,
    bathrooms: 2,
    location: 'New Lisbon, WI',
    images: [
      '/rooms/the-luxe/Room2.1.jpg',
      '/rooms/the-luxe/Room2.2.jpg',
      '/rooms/the-luxe/Room2.3.jpg',
    ],
    amenities: [
      'Full Kitchen', 'Whirlpool Tub', 'Fireplace', 'Screened Porch', 'WiFi',
      'BBQ Grill', 'Fire Pit', 'Parking', 'Pet Friendly', 'Air Conditioning',
    ],
    category: 'luxury',
    rating: 5.0,
    reviewCount: 5,
    isAvailable: true,
    isFeatured: true,
    tags: ['luxury', 'romantic', 'beachside', 'couples'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // ── THE LODGE (photos pending — add to public/rooms/the-lodge/) ──────────
  {
    title: 'The Lodge',
    slug: 'the-lodge',
    description:
      'A grand log home positioned at the entrance of the property, offering open views of the sunset and night sky. The Lodge features a deluxe kitchen with granite countertops and stainless appliances, a dramatic floor-to-ceiling rock fireplace, and a cobblestone patio fire pit just steps from the front porch. Perfect for larger groups — The Loft is right next door.',
    shortDescription: 'Grand log home with sunset views, granite kitchen & floor-to-ceiling rock fireplace.',
    price: 461,
    maxGuests: 12,
    bedrooms: 4,
    bathrooms: 3,
    location: 'New Lisbon, WI',
    images: [],
    amenities: [
      'Full Kitchen', 'Fireplace', 'BBQ Grill', 'Fire Pit', 'Porch',
      'WiFi', 'Parking', 'Pet Friendly', 'Air Conditioning', 'Central Heating',
    ],
    category: 'lodge',
    rating: 5.0,
    reviewCount: 6,
    isAvailable: true,
    isFeatured: true,
    tags: ['lodge', 'large-groups', 'romantic', 'sunset-views'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // ── THE LOOKOUT (photos pending — add to public/rooms/the-lookout/) ──────
  {
    title: 'The Lookout',
    slug: 'the-lookout',
    description:
      'A traditional log cabin tucked into the woods around Little Pond at the back of the property. The Lookout offers a secluded firepit gathering area, complete privacy, and that quintessential Wisconsin cabin feel. Decorated with unique items from local artists and antique stores. Every rental includes a full kitchen, fire pit, fireplace, porch, and BBQ grill.',
    shortDescription: 'Traditional log cabin in the woods with private firepit and Little Pond access.',
    price: 325,
    maxGuests: 5,
    bedrooms: 2,
    bathrooms: 1,
    location: 'New Lisbon, WI',
    images: [],
    amenities: [
      'Full Kitchen', 'Fireplace', 'Fire Pit', 'BBQ Grill', 'Porch',
      'WiFi', 'Parking', 'Pet Friendly',
    ],
    category: 'cabin',
    rating: 5.0,
    reviewCount: 4,
    isAvailable: true,
    isFeatured: false,
    tags: ['cabin', 'woods', 'nature', 'traditional'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // ── THE LEISURE (photos pending — add to public/rooms/the-leisure/) ──────
  {
    title: 'The Leisure',
    slug: 'the-leisure',
    description:
      'Nestled in the woods around Little Pond at the back of the property, The Leisure is a charming traditional log cabin with its own secluded firepit area. Perfect for those seeking peace, privacy, and a true connection to nature. Each cabin is uniquely decorated with local art and antiques.',
    shortDescription: 'Secluded log cabin in the woods with private firepit, porch & BBQ grill.',
    price: 325,
    maxGuests: 5,
    bedrooms: 2,
    bathrooms: 1,
    location: 'New Lisbon, WI',
    images: [],
    amenities: [
      'Full Kitchen', 'Fireplace', 'Fire Pit', 'BBQ Grill', 'Porch',
      'WiFi', 'Parking', 'Pet Friendly',
    ],
    category: 'cabin',
    rating: 5.0,
    reviewCount: 3,
    isAvailable: true,
    isFeatured: false,
    tags: ['cabin', 'woods', 'nature', 'peaceful'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // ── THE LANDING (photos pending — add to public/rooms/the-landing/) ──────
  {
    title: 'The Landing',
    slug: 'the-landing',
    description:
      "The Landing is a cozy traditional log cabin set among the trees around Little Pond. With a private firepit gathering area, porch, and BBQ grill included, it's the ideal retreat for a small group or family looking to unplug and enjoy the Wisconsin outdoors. Each cabin is one-of-a-kind, decorated with pieces from local artists and antique stores.",
    shortDescription: 'Classic log cabin by Little Pond with private firepit and wooded seclusion.',
    price: 325,
    maxGuests: 5,
    bedrooms: 2,
    bathrooms: 1,
    location: 'New Lisbon, WI',
    images: [],
    amenities: [
      'Full Kitchen', 'Fireplace', 'Fire Pit', 'BBQ Grill', 'Porch',
      'WiFi', 'Parking', 'Pet Friendly',
    ],
    category: 'cabin',
    rating: 5.0,
    reviewCount: 3,
    isAvailable: true,
    isFeatured: false,
    tags: ['cabin', 'woods', 'family', 'traditional'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // ── THE LOGHOUSE (photos pending — add to public/rooms/the-loghouse/) ────
  {
    title: 'The Loghouse',
    slug: 'the-loghouse',
    description:
      'The Loghouse is a traditional log cabin with deep character, tucked into the wooded surroundings of Little Pond. Its secluded firepit gathering area makes evening campfires unforgettable. Like all Relaxin Cabins rentals, it comes fully equipped with a kitchen, porch, BBQ grill, and fireplace, and is decorated with unique local finds.',
    shortDescription: 'Character-filled log cabin in the woods with campfire area and pond views.',
    price: 325,
    maxGuests: 5,
    bedrooms: 2,
    bathrooms: 1,
    location: 'New Lisbon, WI',
    images: [],
    amenities: [
      'Full Kitchen', 'Fireplace', 'Fire Pit', 'BBQ Grill', 'Porch',
      'WiFi', 'Parking', 'Pet Friendly',
    ],
    category: 'cabin',
    rating: 5.0,
    reviewCount: 4,
    isAvailable: true,
    isFeatured: false,
    tags: ['cabin', 'woods', 'nature', 'firepit'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
] as const;

// ── Main ─────────────────────────────────────────────────────────────────────
async function seed() {
  const force = process.argv.includes('--force');
  console.log('\n🌱  Starting seed for project:', process.env.FIREBASE_ADMIN_PROJECT_ID, '\n');

  const existing = await db.collection('rooms').limit(1).get();
  if (!existing.empty) {
    if (!force) {
      console.log('⚠️   Rooms collection already has data. Skipping seed to avoid duplicates.');
      console.log('    Run with --force to delete all rooms and re-seed:\n');
      console.log('      npm run seed -- --force\n');
      process.exit(0);
    }
    // Force mode: delete all existing rooms first
    console.log('🗑️   --force: deleting all existing rooms...');
    const all = await db.collection('rooms').get();
    const deleteBatch = db.batch();
    all.docs.forEach((d) => deleteBatch.delete(d.ref));
    await deleteBatch.commit();
    console.log(`    Deleted ${all.size} rooms.\n`);
  }

  const batch = db.batch();
  for (const room of ROOMS) {
    const ref = db.collection('rooms').doc();
    batch.set(ref, room);
    console.log(`  + ${room.title}`);
  }

  await batch.commit();
  console.log(`\n✅  Seeded ${ROOMS.length} rooms successfully.\n`);
}

seed().catch((err: Error) => {
  console.error('\n❌  Seed failed:', err.message, '\n');
  process.exit(1);
});
