'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { getNearbyLocations } from '@/services/nearbyLocations.service';
import type { NearbyLocation } from '@/types';

export default function NearbyLocationsSection() {
  const [locations, setLocations] = useState<NearbyLocation[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    getNearbyLocations()
      .then(setLocations)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!loading && locations.length === 0) return null;

  return (
    <section className="bg-stone-950 py-24 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-700/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-stone-700/50 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mb-14">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none">
                The World Is Closer
                <span className="block bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Than You Think</span>
              </h2>
              <p className="text-stone-500 mt-3 text-sm max-w-md">
                Leave everything behind — but never too far. Adventure, dining, and hidden gems are just minutes from your door.
              </p>
            </div>
            <p className="text-xs text-stone-600">All distances from the cabin</p>
          </div>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-36 rounded-2xl bg-stone-900 animate-pulse border border-stone-800" />
              ))
            : locations.map((loc, i) => (
                <motion.div
                  key={loc.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -6, scale: 1.03, transition: { duration: 0.18, ease: 'easeOut' } }}
                  transition={{ delay: Math.min(i * 0.05, 0.35), duration: 0.5 }}
                  className="group relative flex flex-col rounded-2xl overflow-hidden cursor-default
                    bg-stone-900 border border-stone-800
                    hover:border-amber-500/60 hover:bg-stone-800
                    shadow-[0_0_0_0_rgba(217,119,6,0)]
                    hover:shadow-[0_8px_32px_rgba(217,119,6,0.18)]
                    transition-colors duration-300"
                >
                  {/* Inner amber radial glow on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
                    bg-[radial-gradient(ellipse_at_top_left,_rgba(251,191,36,0.08)_0%,_transparent_70%)]
                    pointer-events-none" />

                  {/* Distance number */}
                  <div className="relative flex-1 flex flex-col items-start justify-end p-4 pb-2">
                    <div className="flex items-baseline gap-1">
                      <motion.span
                        className="text-3xl font-black leading-none tabular-nums text-amber-400 group-hover:text-amber-300 transition-colors duration-300"
                      >
                        {loc.distance}
                      </motion.span>
                      <span className="text-xs font-bold text-amber-600 group-hover:text-amber-500 pb-0.5 transition-colors duration-300">
                        mi
                      </span>
                    </div>
                  </div>

                  {/* Name + time */}
                  <div className="relative px-4 pb-4">
                    <p className="font-bold text-stone-100 group-hover:text-white text-sm leading-tight line-clamp-2 mb-1 transition-colors duration-300">
                      {loc.name}
                    </p>
                    <p className="text-xs text-stone-600 group-hover:text-amber-600/80 transition-colors duration-300">
                      {/min|hr|hour|walk|drive/.test(loc.approxTime) ? loc.approxTime : `${loc.approxTime} min`}
                    </p>
                  </div>

                  {/* Bottom amber accent bar — slides in from left on hover */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5
                    bg-gradient-to-r from-amber-500 to-orange-500
                    scale-x-0 group-hover:scale-x-100
                    transition-transform duration-300 origin-left" />
                </motion.div>
              ))
          }
        </div>
      </div>
    </section>
  );
}
