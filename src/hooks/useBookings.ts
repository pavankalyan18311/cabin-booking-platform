'use client';
import { useState, useEffect, useCallback } from 'react';
import { getUserBookings, getBookingById } from '@/services/bookings.service';
import type { Booking } from '@/types';

export function useUserBookings(userId: string | undefined) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    try {
      const data = await getUserBookings(userId);
      setBookings(data);
      setError(null);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { refetch(); }, [refetch]);

  // Apply a partial update to a single booking in local state (optimistic update)
  const updateBooking = useCallback((id: string, patch: Partial<Booking>) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }, []);

  return { bookings, loading, error, refetch, updateBooking };
}

export function useBooking(id: string | undefined) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    getBookingById(id)
      .then(setBooking)
      .finally(() => setLoading(false));
  }, [id]);

  return { booking, loading };
}
