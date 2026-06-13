import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc,
  query, orderBy, Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { COLLECTIONS } from '@/lib/firebase/collections';
import type { Coupon } from '@/types';

export async function getAllCoupons(): Promise<Coupon[]> {
  const q = query(collection(db, COLLECTIONS.COUPONS), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Coupon));
}

export async function createCoupon(data: Omit<Coupon, 'id' | 'usedCount' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const now = new Date().toISOString();
  const ref = await addDoc(collection(db, COLLECTIONS.COUPONS), {
    ...data,
    code: data.code.toUpperCase().trim(),
    usedCount: 0,
    createdAt: now,
    updatedAt: now,
  });
  return ref.id;
}

export async function updateCoupon(id: string, data: Partial<Omit<Coupon, 'id' | 'createdAt'>>): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.COUPONS, id), {
    ...data,
    ...(data.code ? { code: data.code.toUpperCase().trim() } : {}),
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteCoupon(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.COUPONS, id));
}

export async function toggleCouponActive(id: string, isActive: boolean): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.COUPONS, id), {
    isActive,
    updatedAt: new Date().toISOString(),
  });
}
