'use client';
import Image from 'next/image';
import { motion } from 'framer-motion';
import SearchBar from '@/components/rooms/SearchBar';
import { ChevronDown, Star } from 'lucide-react';

const BG = 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1920&q=85';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center">

      <div className="absolute inset-0 overflow-hidden">
        <Image src={BG} alt="" aria-hidden fill priority
          className="object-cover object-center scale-105"
          sizes="100vw" quality={85} />

        <div className="absolute inset-0 bg-gradient-to-br from-stone-950/92 via-stone-900/78 to-amber-950/85" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/25" />

        <motion.div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-amber-600/12 blur-[140px] pointer-events-none"
          animate={{ x: [0, 50, 0], y: [0, -35, 0] }} transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute bottom-0 right-0 w-[700px] h-[700px] rounded-full bg-orange-700/10 blur-[160px] pointer-events-none"
          animate={{ x: [0, -45, 0], y: [0, 35, 0] }} transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-amber-500/6 blur-[120px] pointer-events-none"
          animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} />
      </div>

      <div className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto pt-20 sm:pt-24">

        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.12 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-black text-white tracking-tight leading-[1.0] mb-6">
          Escape Into
          <br />
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-orange-300 bg-clip-text text-transparent">
              Pure Luxury
            </span>
            <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.9, delay: 0.65 }}
              className="absolute -bottom-2 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full origin-left" />
          </span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.28 }}
          className="text-white/70 text-lg sm:text-xl max-w-2xl mx-auto mb-4 leading-relaxed font-light">
          Handpicked luxury cabins, mountain retreats &amp; lakeside escapes.
          <strong className="font-semibold text-white/95"> Your perfect hideaway awaits.</strong>
        </motion.p>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-1 mb-9">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
          ))}
          <span className="text-white/55 text-sm ml-2">4.9 · Trusted by 50,000+ guests</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.42 }}>
          <SearchBar />
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {['No booking fees', 'Free cancellation', 'Instant confirmation', '24/7 support'].map((label) => (
            <span key={label} className="flex items-center gap-1.5 text-white/45 text-xs sm:text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              {label}
            </span>
          ))}
        </motion.div>
      </div>

      <motion.button type="button"
        onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/35 hover:text-white/65 transition-colors"
        animate={{ y: [0, 8, 0] }} transition={{ duration: 2.2, repeat: Infinity }}>
        <span className="text-[10px] font-medium tracking-[0.2em] uppercase">Explore</span>
        <ChevronDown className="h-5 w-5" />
      </motion.button>
    </section>
  );
}
