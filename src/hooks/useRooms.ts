'use client';
import { useState, useEffect, useCallback } from 'react';
import { getRooms, getFeaturedRooms, getRoomById } from '@/services/rooms.service';
import type { Room, SearchFilters } from '@/types';
import type { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';

export function useFeaturedRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getFeaturedRooms()
      .then(setRooms)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { rooms, loading, error };
}

export function useRooms(filters?: SearchFilters) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | undefined>();

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getRooms(filters);
      setRooms(result.rooms);
      setLastDoc(result.lastVisible);
      setHasMore(result.hasMore);
    } catch (e: unknown) {
      const msg = (e as Error).message ?? String(e);
      console.error('[useRooms] fetch failed:', msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadMore = async () => {
    if (!lastDoc || loadingMore) return;
    setLoadingMore(true);
    try {
      const result = await getRooms(filters, lastDoc);
      setRooms((prev) => [...prev, ...result.rooms]);
      setLastDoc(result.lastVisible);
      setHasMore(result.hasMore);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  return { rooms, loading, loadingMore, error, hasMore, loadMore, refetch: fetchRooms };
}

export function useRoom(id: string) {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getRoomById(id)
      .then(setRoom)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { room, loading, error };
}
