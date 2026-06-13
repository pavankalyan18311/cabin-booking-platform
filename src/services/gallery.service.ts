import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { COLLECTIONS } from '@/lib/firebase/collections';
import type { GalleryItem } from '@/types';

async function getAuthToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  return user.getIdToken();
}

export async function getGalleryItems(): Promise<GalleryItem[]> {
  const q = query(collection(db, COLLECTIONS.GALLERY), orderBy('order'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as GalleryItem));
}

export async function addGalleryItem(
  data: Omit<GalleryItem, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<string> {
  const token = await getAuthToken();
  const res = await fetch('/api/admin/gallery', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? 'Failed to add gallery item');
  return json.id as string;
}

export async function updateGalleryItem(
  id: string,
  data: Partial<Omit<GalleryItem, 'id' | 'createdAt'>>,
): Promise<void> {
  const token = await getAuthToken();
  const res = await fetch(`/api/admin/gallery/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? 'Failed to update gallery item');
}

export async function deleteGalleryItem(id: string): Promise<void> {
  const token = await getAuthToken();
  const res = await fetch(`/api/admin/gallery/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? 'Failed to delete gallery item');
}
