import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  query,
  orderBy,
  setDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { COLLECTIONS } from '@/lib/firebase/collections';
import type { User } from '@/types';

export async function getAllUsers(): Promise<User[]> {
  const q = query(collection(db, COLLECTIONS.USERS), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as User);
}

export async function updateUserRole(uid: string, role: 'user' | 'admin'): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.USERS, uid), {
    role,
    updatedAt: new Date().toISOString(),
  });
}

export async function blockUser(uid: string, isBlocked: boolean): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.USERS, uid), {
    isBlocked,
    updatedAt: new Date().toISOString(),
  });
}

export async function getFavorites(userId: string): Promise<string[]> {
  const snap = await getDoc(doc(db, COLLECTIONS.FAVORITES, userId));
  return snap.exists() ? (snap.data().roomIds as string[]) : [];
}

export async function toggleFavorite(userId: string, roomId: string): Promise<boolean> {
  const ref = doc(db, COLLECTIONS.FAVORITES, userId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, { userId, roomIds: [roomId] });
    return true;
  }

  const roomIds: string[] = snap.data().roomIds ?? [];
  const isFav = roomIds.includes(roomId);

  if (isFav) {
    await updateDoc(ref, { roomIds: arrayRemove(roomId) });
  } else {
    await updateDoc(ref, { roomIds: arrayUnion(roomId) });
  }

  return !isFav;
}
