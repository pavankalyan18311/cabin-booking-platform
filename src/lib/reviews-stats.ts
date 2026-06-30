import { adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';

export async function getReviewsAggregate(): Promise<{ avgRating: number; reviewCount: number }> {
  try {
    const snap = await adminDb().collection(COLLECTIONS.REVIEWS).get();
    if (snap.empty) return { avgRating: 5.0, reviewCount: 0 };
    const ratings = snap.docs.map((d) => (d.data().rating as number) ?? 5);
    const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    return {
      avgRating: Math.round(avg * 10) / 10,
      reviewCount: snap.size,
    };
  } catch {
    return { avgRating: 5.0, reviewCount: 0 };
  }
}
