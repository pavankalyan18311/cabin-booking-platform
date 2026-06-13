'use client';
import { use, useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { getRoomById } from '@/services/rooms.service';
import { getRoomAvailability } from '@/services/bookings.service';
import { getRoomReviews } from '@/services/reviews.service';
import RoomDetailClient from './RoomDetailClient';
import type { Room, Review } from '@/types';

export default function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [room, setRoom] = useState<Room | null>(null);
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    Promise.all([getRoomById(id), getRoomAvailability(id), getRoomReviews(id)])
      .then(([r, dates, revs]) => {
        if (!r) { setMissing(true); return; }
        setRoom(r);
        setBookedDates(dates);
        setReviews(revs);
      })
      .catch(() => setMissing(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-pulse text-stone-400 text-lg">Loading cabin details...</div>
      </div>
    );
  }

  if (missing || !room) return notFound();

  return <RoomDetailClient room={room} bookedDates={bookedDates} reviews={reviews} />;
}
