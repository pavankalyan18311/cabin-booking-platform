'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Heart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RoomCard from '@/components/rooms/RoomCard';
import RoomCardSkeleton from '@/components/rooms/RoomCardSkeleton';
import { useFavoritesStore } from '@/store';
import { getRoomById } from '@/services/rooms.service';
import type { Room } from '@/types';

export default function FavoritesPage() {
  const { favorites } = useFavoritesStore();
  const [rooms,   setRooms]   = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (favorites.length === 0) { setLoading(false); return; }
    Promise.all(favorites.map((id) => getRoomById(id)))
      .then((results) => setRooms(results.filter(Boolean) as Room[]))
      .finally(() => setLoading(false));
  }, [favorites]);

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-0.5">
          <Heart className="h-4 w-4 text-rose-400 fill-rose-400" />
          <p className="text-rose-600 text-xs font-bold uppercase tracking-widest">Saved</p>
        </div>
        <h1 className="text-2xl font-black text-slate-800">Saved Favorites</h1>
        <p className="text-slate-500 mt-1 text-sm">Your wishlist of dream cabins.</p>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[1, 2, 3].map((i) => <RoomCardSkeleton key={i} />)}
        </div>
      ) : rooms.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="dash-card rounded-2xl py-16 text-center">
          <div className="inline-flex p-4 rounded-full bg-rose-500/15 border border-rose-500/25 mb-4">
            <Heart className="h-8 w-8 text-rose-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No saved cabins yet</h3>
          <p className="text-white/35 text-sm mb-6 max-w-xs mx-auto">
            Heart any cabin while browsing and it&apos;ll appear here.
          </p>
          <Link href="/rooms">
            <Button className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 font-bold">
              <Sparkles className="h-4 w-4" /> Explore Cabins
            </Button>
          </Link>
        </motion.div>
      ) : (
        <>
          <p className="text-slate-400 text-xs">{rooms.length} saved cabin{rooms.length !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {rooms.map((room, i) => (
              <motion.div key={room.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <RoomCard room={room} />
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
