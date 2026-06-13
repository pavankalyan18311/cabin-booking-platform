import {
  collection,
  getDocs,
  orderBy,
  query,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { COLLECTIONS } from '@/lib/firebase/collections';
import type { NearbyLocation } from '@/types';

async function getAuthToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  return user.getIdToken();
}

// Public read — no auth required, goes directly through Firestore client SDK.
export async function getNearbyLocations(): Promise<NearbyLocation[]> {
  const q = query(collection(db, COLLECTIONS.NEARBY_LOCATIONS), orderBy('distance'));
  const snap = await getDocs(q);
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as NearbyLocation));
  return items.sort((a, b) => a.distance - b.distance);
}

// Admin writes go through server-side API routes (Admin SDK bypasses Firestore rules).
export async function addNearbyLocation(
  data: Omit<NearbyLocation, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<string> {
  const token = await getAuthToken();
  const res = await fetch('/api/admin/nearby', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? 'Failed to add location');
  return json.id as string;
}

export async function updateNearbyLocation(
  id: string,
  data: Partial<Omit<NearbyLocation, 'id' | 'createdAt'>>,
): Promise<void> {
  const token = await getAuthToken();
  const res = await fetch(`/api/admin/nearby/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? 'Failed to update location');
}

export async function deleteNearbyLocation(id: string): Promise<void> {
  const token = await getAuthToken();
  const res = await fetch(`/api/admin/nearby/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? 'Failed to delete location');
}
