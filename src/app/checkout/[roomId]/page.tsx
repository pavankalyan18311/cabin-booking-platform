'use client';
import { use, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getRoomById } from '@/services/rooms.service';
import CheckoutClient from './CheckoutClient';
import type { Room } from '@/types';

export default function CheckoutPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();

  const checkIn = searchParams.get('checkIn') ?? '';
  const checkOut = searchParams.get('checkOut') ?? '';
  const guestsStr = searchParams.get('guests') ?? '';
  const specialRequests = searchParams.get('specialRequests') ?? undefined;

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!checkIn || !checkOut || !guestsStr) {
      router.replace(`/rooms/${roomId}`);
      return;
    }

    getRoomById(roomId)
      .then((r) => {
        if (!r) { router.replace('/rooms'); return; }
        if (r.isUnderMaintenance || r.isAvailable === false) {
          router.replace(`/rooms/${roomId}`);
          return;
        }
        setRoom(r);
      })
      .catch(() => router.replace('/rooms'))
      .finally(() => setLoading(false));
  }, [roomId, checkIn, checkOut, guestsStr, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-stone-400 text-lg">Loading checkout...</div>
      </div>
    );
  }

  if (!room) return null;

  return (
    <CheckoutClient
      room={room}
      checkIn={checkIn}
      checkOut={checkOut}
      guests={Number(guestsStr)}
      specialRequests={specialRequests || undefined}
    />
  );
}
