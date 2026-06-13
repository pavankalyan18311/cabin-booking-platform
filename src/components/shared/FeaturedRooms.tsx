'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RoomCard from '@/components/rooms/RoomCard';
import RoomCardSkeleton from '@/components/rooms/RoomCardSkeleton';
import { useFeaturedRooms } from '@/hooks/useRooms';

export default function FeaturedRooms() {
  const { rooms, loading } = useFeaturedRooms();

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Subtle warm background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-50/60 via-transparent to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-amber-100">
                <Sparkles className="h-4 w-4 text-amber-700" />
              </div>
              <span className="text-amber-700 text-xs font-bold uppercase tracking-widest">Handpicked for you</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-stone-900 leading-[1.0] tracking-tight">
              Featured
              <span className="block bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
                Retreats
              </span>
            </h2>
            <p className="text-stone-500 mt-3 max-w-lg text-base leading-relaxed">
              Our most sought-after cabins — curated for an unforgettable escape from the everyday.
            </p>
          </div>
          <Link href="/rooms">
            <Button variant="outline"
              className="gap-2 shrink-0 h-12 px-6 border-2 border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-500 font-bold text-sm rounded-xl">
              Browse all cabins <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <RoomCardSkeleton key={i} />)
            : rooms.map((room, i) => (
                <motion.div key={room.id}
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
                  <RoomCard room={room} />
                </motion.div>
              ))
          }
        </div>

        {!loading && rooms.length === 0 && (
          <p className="text-center text-stone-400 py-16 text-lg">No featured rooms yet — check back soon!</p>
        )}

        {!loading && rooms.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mt-14">
            <Link href="/rooms">
              <Button size="lg" className="h-14 px-10 text-base font-bold rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-xl shadow-amber-200 border-0 gap-2">
                Explore all properties <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
