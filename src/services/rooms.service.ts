import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/config';
import { COLLECTIONS } from '@/lib/firebase/collections';
import type { Room, SearchFilters } from '@/types';
import { generateSlug } from '@/lib/utils';

const PAGE_SIZE = 9;

export async function getRooms(filters?: SearchFilters, lastDoc?: QueryDocumentSnapshot<DocumentData>) {
  // Use the same base query as admin (orderBy createdAt desc) — known to work.
  // All filtering (including isAvailable) is done client-side to avoid
  // composite index requirements.
  let q = query(
    collection(db, COLLECTIONS.ROOMS),
    orderBy('createdAt', 'desc'),
    limit(200),
  );

  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

  const snap = await getDocs(q);
  let rooms = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Room));

  // Always exclude unavailable rooms for the user-facing listing
  rooms = rooms.filter((r) => r.isAvailable !== false);

  // Client-side filters
  if (filters?.category) rooms = rooms.filter((r) => r.category === filters.category);
  if (filters?.minPrice !== undefined) rooms = rooms.filter((r) => r.price >= filters.minPrice!);
  if (filters?.maxPrice !== undefined) rooms = rooms.filter((r) => r.price <= filters.maxPrice!);
  if (filters?.guests) rooms = rooms.filter((r) => r.maxGuests >= filters.guests!);

  const pageRooms = rooms.slice(0, PAGE_SIZE);
  const lastVisible = snap.docs[snap.docs.length - 1];

  return { rooms: pageRooms, lastVisible, hasMore: rooms.length > PAGE_SIZE };
}

export async function getFeaturedRooms(): Promise<Room[]> {
  const q = query(
    collection(db, COLLECTIONS.ROOMS),
    where('isFeatured', '==', true),
    limit(12),
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as Room))
    .filter((r) => r.isAvailable !== false)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);
}

export async function getRoomById(id: string): Promise<Room | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.ROOMS, id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Room) : null;
}

export async function getAllRoomsAdmin(): Promise<Room[]> {
  const q = query(collection(db, COLLECTIONS.ROOMS), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Room));
}

export async function createRoom(
  data: Omit<Room, 'id' | 'slug' | 'rating' | 'reviewCount' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const now = new Date().toISOString();
  const raw = {
    ...data,
    slug: generateSlug(data.title),
    rating: 0,
    reviewCount: 0,
    createdAt: now,
    updatedAt: now,
  };
  // Firestore rejects undefined and NaN — drop optional fields that weren't set
  const room = Object.fromEntries(
    Object.entries(raw).filter(
      ([, v]) => v !== undefined && !(typeof v === 'number' && isNaN(v))
    )
  );
  const docRef = await addDoc(collection(db, COLLECTIONS.ROOMS), room);
  return docRef.id;
}

export async function updateRoom(id: string, data: Partial<Room>): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  const token = await user.getIdToken();

  const res = await fetch(`/api/admin/rooms/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? 'Failed to update room');
  }
}

export async function deleteRoom(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.ROOMS, id));
}

export async function searchRooms(searchQuery: string): Promise<Room[]> {
  const snap = await getDocs(
    query(collection(db, COLLECTIONS.ROOMS), orderBy('createdAt', 'desc'))
  );
  const lower = searchQuery.toLowerCase();
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as Room))
    .filter(
      (r) =>
        r.isAvailable !== false && (
          r.title.toLowerCase().includes(lower) ||
          r.description.toLowerCase().includes(lower)
        )
    );
}
