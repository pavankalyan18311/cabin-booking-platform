import {
  collection,
  doc,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  updateDoc,
  increment,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { COLLECTIONS } from '@/lib/firebase/collections';
import type { Review } from '@/types';

export async function getRoomReviews(roomId: string): Promise<Review[]> {
  // Single where clause — no composite index needed. Sort client-side.
  const q = query(collection(db, COLLECTIONS.REVIEWS), where('roomId', '==', roomId));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as Review))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function createReview(
  data: Omit<Review, 'id' | 'createdAt'>
): Promise<void> {
  const review = { ...data, createdAt: new Date().toISOString() };
  await addDoc(collection(db, COLLECTIONS.REVIEWS), review);

  // Update room rating
  const reviews = await getRoomReviews(data.roomId);
  const allRatings = [...reviews.map((r) => r.rating), data.rating];
  const avgRating = allRatings.reduce((a, b) => a + b, 0) / allRatings.length;

  await updateDoc(doc(db, COLLECTIONS.ROOMS, data.roomId), {
    rating: Math.round(avgRating * 10) / 10,
    reviewCount: increment(1),
  });
}
