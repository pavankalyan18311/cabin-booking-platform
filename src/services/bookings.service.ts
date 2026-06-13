import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/config';
import { COLLECTIONS } from '@/lib/firebase/collections';
import type { Booking, BookingStatus, PaymentStatus } from '@/types';

async function getAuthToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  return user.getIdToken();
}

export async function getUserBookings(userId: string): Promise<Booking[]> {
  const q = query(collection(db, COLLECTIONS.BOOKINGS), where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as Booking))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getBookingById(id: string): Promise<Booking | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.BOOKINGS, id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Booking) : null;
}

export async function getAllBookingsAdmin(): Promise<Booking[]> {
  const q = query(collection(db, COLLECTIONS.BOOKINGS), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Booking));
}

// Admin: update booking status via server-side API (validates role, sends notification, frees dates).
export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
  reason?: string
): Promise<void> {
  const token = await getAuthToken();
  const res = await fetch('/api/admin/booking/status', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ bookingId, status, reason }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Failed to update booking status');
}

export async function getRoomAvailability(roomId: string): Promise<string[]> {
  const snap = await getDoc(doc(db, COLLECTIONS.AVAILABILITY, roomId));
  return snap.exists() ? (snap.data().bookedDates as string[]) : [];
}

// Cancels a booking via the server-side API so that:
//  - Ownership is verified server-side
//  - Availability is freed atomically inside a Firestore transaction
//  - Regular users cannot bypass Firestore security rules
export async function cancelBooking(bookingId: string, reason?: string): Promise<void> {
  const token = await getAuthToken();
  const res = await fetch('/api/booking/cancel', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ bookingId, reason }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Failed to cancel booking');
}

export async function markBookingRefunded(bookingId: string): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.BOOKINGS, bookingId), {
    paymentStatus: 'refunded' as PaymentStatus,
    updatedAt: new Date().toISOString(),
  });
}

export async function getActiveBookingsForRoom(roomId: string): Promise<Booking[]> {
  const q = query(collection(db, COLLECTIONS.BOOKINGS), where('roomId', '==', roomId));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as Booking))
    .filter((b) => b.status === 'pending' || b.status === 'confirmed');
}
