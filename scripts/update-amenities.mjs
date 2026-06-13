/**
 * One-time script: sets amenities on each of the 7 Relaxin Cabins rooms in Firestore.
 * Run with: node scripts/update-amenities.mjs
 */
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const AMENITIES_BY_TITLE = {
  'The Lodge': [
    'WiFi', 'Fireplace', 'Kitchen', 'Dishwasher', 'Air Conditioning', 'Heating',
    'Ceiling Fans', 'Fire Pit', 'BBQ Grill', 'Parking', 'Porch',
    'TV / Satellite TV', 'Coffee Maker', 'Bathtub',
  ],
  'The Loft': [
    'WiFi', 'Fireplace', 'Kitchen', 'Dishwasher', 'Air Conditioning', 'Heating',
    'Fire Pit', 'BBQ Grill', 'Parking', 'Porch', 'Balcony', 'TV / Satellite TV',
  ],
  'The Luxe': [
    'WiFi', 'Fireplace', 'Kitchen', 'Dishwasher', 'Coffee Maker',
    'Fire Pit', 'BBQ Grill', 'Porch', 'Screened Porch', 'Terrace', 'Whirlpool Tub',
  ],
  'The Lookout': [
    'WiFi', 'Fireplace', 'Kitchen', 'Dishwasher', 'Coffee Maker',
    'Fire Pit', 'BBQ Grill', 'Porch', 'TV / Satellite TV',
  ],
  'The Leisure': [
    'WiFi', 'Fireplace', 'Kitchen', 'Dishwasher', 'Air Conditioning', 'Heating',
    'Ceiling Fans', 'Fire Pit', 'BBQ Grill', 'Porch',
    'TV / Satellite TV', 'Coffee Maker', 'Bathtub', 'Iron',
  ],
  'The Landing': [
    'WiFi', 'Fireplace', 'Kitchen', 'Dishwasher', 'Coffee Maker',
    'Fire Pit', 'BBQ Grill', 'Porch', 'Iron',
  ],
  'The Loghouse': [
    'WiFi', 'Fireplace', 'Kitchen', 'Air Conditioning', 'Heating',
    'Ceiling Fans', 'Fire Pit', 'BBQ Grill', 'Porch', 'Iron',
  ],
};

initializeApp({
  credential: cert({
    projectId: 'relaxingatcabin',
    clientEmail: 'firebase-adminsdk-fbsvc@relaxingatcabin.iam.gserviceaccount.com',
    privateKey: `-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCujhhNxm8pfyb6\nE89hJPwf4JlDFt3WBrrwiLiMH7y87SObFvLIqoczW+Y7oYCVMveUhPf7+5Y1clJ6\nzihLQwD68lBHMMz/kXnOj62wqoT9fNq+fDN24/dmXrubHmESygP+Briq5Yi+JUtz\nO/YpDHw+yHtK1jEtfiOks2DYxR0CIPJLbN/+Spsw5ieTCObkHkooyYodhBoDHegg\nd4ZSxO8TaI8d5BsH1KAsm8LhmuyQodT2MZsJliUdr2p/jWCuMhdxW06nKj1tdh/C\nW4FzLg/+3uvaVdw4OT24u8xzMTIB0I0d7cmRDLHtm1zwgyfFejn33arHICNHUj1d\nTuGDo2l/AgMBAAECggEAVfpOlUyG54kmUSpdzMszVp5Bz25dcTTacmzdfcOKKwKh\nNZxtlJKOSqla84c+tv6mPSTrotXOrF+1qaCO71c/Ddw51379kmp89VYG5wxuug78\nDbROgyKRcv55aNPjW6Zepgp4flDV9FaZXdasjpaEQkZsmDV9fptxgggKzWr1uVxg\n9cMTFLfk3QycDYxJNiW9KNwH9Qm/VEWJyRYCm0ybWEpATj9d8lEqGOD3J4o1d5zt\nZxDt8vIxAZRuXht5QZjntp9nV3iPKtUXiySgTuQ8AYPfKpMhIJEEagW2rl6emFjs\nd3OgfkPUKBWhj+0kVsq2x9qnlCigafoM6rt8M0icyQKBgQDnQgPC8ORLKQEuYH1b\n5uRCpwxAKivG5kXIUHRgQAkkBKAaXJg2bFmcC5NJUEyQq4wT369sjfjuO+Nm7kzf\nFtGti4M/luBJ8qmM/J+v0L8rSBp3wtAarNAogf28BlhO1vdzF09D/pszkXTHEIBU\nS64lZMvtP0Z+pv6dyjkL4PIi2QKBgQDBOwgHnSnmySwlDkSzqkc2GPzzyQnJQcUF\n80PR/uXR1MlhFFzqC9Os9/0G5pNjyoPFD6dpPqnL5ctdMooaKU/mYeZNYeLrzcgZ\n/T/q12aKGipDe37sHSXZLwhyT3x2OgDIh3sd1pRaR+nvl5ealDuoYd+AUx1iezNL\nqfAQ7PeIFwKBgFTRhJmqSsE6X+GHqFLdw5iitj6OeRHxgWSwBY8LzY51V9dzYKyN\nXux53mKEXiCtmqnrX+b7x3Jxar1k57LnJq51PgVDrC3TH9bDDTqp4IPaZULJpBQ0\nkABbdRnSZe88rvN6eCsjJf9q+R7N8ZN5Un0KlDUHAS8QxtBOzE+MCKM5AoGBAJHZ\nd88fbrA3Km3x3iNqpIONyuhL12okjY1XN9q6tkdygGoZT6SNNsH5EPBze8633kwQ\n68EBvnIbyitXaWwjwJ5ZSNchyoFH+wC66dLdsRUOeNYk0gFwYtASsyJtIrmuQEcc\nE+7Kt4GJhGcHGjRgLMOE1IlssuJRsb8rzvtHkfMTAoGAcnb8yjXZqt11Hdm/v6kZ\n4mdOgauEl4i9pmJjMLQ+zE4rAawwV2qAWGfw7l8l3a7/pZN4UaDHX8Q5At2xKo7s\nnxbTahldZMWTgC9vpdhEw/X6DulQXLsssU+RbO2B1kiRjT7AiiUeFH+i3OfuwVHQ\nhuRDi4qy7xcGBbwYyZm/sow=\n-----END PRIVATE KEY-----\n`,
  }),
});

const db = getFirestore();

async function run() {
  const snap = await db.collection('rooms').get();
  if (snap.empty) { console.log('No rooms found.'); return; }

  for (const doc of snap.docs) {
    const title = doc.data().title;
    const amenities = AMENITIES_BY_TITLE[title];
    if (!amenities) {
      console.log(`⚠  No mapping for "${title}" — skipped`);
      continue;
    }
    await doc.ref.update({ amenities, updatedAt: new Date().toISOString() });
    console.log(`✓  ${title} → [${amenities.join(', ')}]`);
  }
  console.log('\nDone.');
}

run().catch(err => { console.error(err); process.exit(1); });
