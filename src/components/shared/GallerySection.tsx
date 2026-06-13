'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { getGalleryItems } from '@/services/gallery.service';
import type { GalleryItem } from '@/types';

const FALLBACK: GalleryItem[] = [
  { id:'1', label:'Mountain Views',  sub:'Wake up to breathtaking peaks',       src:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', span:'col-span-2 row-span-2', order:0, createdAt:'', updatedAt:'' },
  { id:'2', label:'Cozy Interiors',  sub:'Every comfort, thoughtfully crafted', src:'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=600&q=80', span:'col-span-1 row-span-1', order:1, createdAt:'', updatedAt:'' },
  { id:'3', label:'Forest Trails',   sub:'Miles of paths at your door',          src:'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80', span:'col-span-1 row-span-1', order:2, createdAt:'', updatedAt:'' },
  { id:'4', label:'Lake Mornings',   sub:'Still water, still mind',              src:'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=600&q=80', span:'col-span-1 row-span-1', order:3, createdAt:'', updatedAt:'' },
  { id:'5', label:'Starlit Nights',  sub:'A sky full of stars, just for you',    src:'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=600&q=80', span:'col-span-1 row-span-1', order:4, createdAt:'', updatedAt:'' },
];

type Column =
  | { type: 'large'; item: GalleryItem }
  | { type: 'small'; items: [GalleryItem] | [GalleryItem, GalleryItem] };

function groupIntoColumns(items: GalleryItem[]): Column[] {
  const cols: Column[] = [];
  let i = 0;
  while (i < items.length) {
    const cur = items[i];
    if (cur.span === 'col-span-2 row-span-2') {
      cols.push({ type: 'large', item: cur });
      i++;
    } else {
      const nxt = items[i + 1];
      if (nxt && nxt.span === 'col-span-1 row-span-1') {
        cols.push({ type: 'small', items: [cur, nxt] });
        i += 2;
      } else {
        cols.push({ type: 'small', items: [cur] });
        i++;
      }
    }
  }
  return cols;
}

function GalleryCard({ item, className }: { item: GalleryItem; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl group shadow-xl cursor-pointer shrink-0 ${className}`}>
      <Image src={item.src} alt={item.label} fill
        className="object-cover transition-transform duration-700 group-hover:scale-110"
        sizes="(max-width: 768px) 260px, 320px" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
      <div className="absolute inset-0 rounded-2xl ring-0 group-hover:ring-2 group-hover:ring-amber-400/70 transition-all duration-300" />
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
        <p className="text-white font-bold text-sm md:text-base leading-tight">{item.label}</p>
        <p className="text-white/60 text-xs mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">{item.sub}</p>
      </div>
    </div>
  );
}

// Zone thresholds — outer 25% triggers scroll, speed ramps up toward the edge
const EDGE_ZONE = 0.25;
const MAX_SPEED = 12; // px per frame at the very edge

export default function GallerySection() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const scrollRef  = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const rafRef     = useRef<number | null>(null);
  const zoneRef    = useRef<'left' | 'right' | 'none'>('none');

  // zone indicators (desktop only)
  const [zone, setZone] = useState<'left' | 'right' | 'none'>('none');

  useEffect(() => {
    getGalleryItems()
      .then((data) => setItems(data.length > 0 ? data : FALLBACK))
      .catch(() => setItems(FALLBACK));
  }, []);

  const stopScroll = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const startScroll = useCallback((direction: 'left' | 'right', speed: number) => {
    stopScroll();
    const tick = () => {
      const el = scrollRef.current;
      if (!el) return;
      el.scrollLeft += direction === 'right' ? speed : -speed;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [stopScroll]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const { left, width } = wrapper.getBoundingClientRect();
    const relX = (e.clientX - left) / width; // 0..1

    let newZone: 'left' | 'right' | 'none' = 'none';
    let speed = 0;

    if (relX < EDGE_ZONE) {
      newZone = 'left';
      // ramp: 0 at boundary (0.25), MAX_SPEED at edge (0)
      speed = Math.round(MAX_SPEED * (1 - relX / EDGE_ZONE));
    } else if (relX > 1 - EDGE_ZONE) {
      newZone = 'right';
      speed = Math.round(MAX_SPEED * ((relX - (1 - EDGE_ZONE)) / EDGE_ZONE));
    }

    if (newZone !== zoneRef.current) {
      zoneRef.current = newZone;
      setZone(newZone);
      if (newZone === 'none') {
        stopScroll();
      } else {
        startScroll(newZone, Math.max(speed, 2));
      }
    }
  }, [startScroll, stopScroll]);

  const handleMouseLeave = useCallback(() => {
    zoneRef.current = 'none';
    setZone('none');
    stopScroll();
  }, [stopScroll]);

  useEffect(() => () => stopScroll(), [stopScroll]);

  const display = items.length > 0 ? items : FALLBACK;
  const columns = groupIntoColumns(display);

  return (
    <section className="py-24 bg-orange-950 overflow-hidden relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-amber-400/15 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-orange-800 text-orange-200 text-xs font-bold uppercase tracking-widest mb-3">
              Gallery
            </span>
            <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
              Life at
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-rose-300">
                Relaxin Cabins
              </span>
            </h2>
            <p className="text-orange-300 mt-2 text-sm sm:text-base max-w-sm">
              Every moment is picture-perfect.
            </p>
          </div>
          <Link href="/rooms"
            className="inline-flex items-center gap-2 text-sm font-bold text-amber-300 hover:text-amber-200 transition-colors group shrink-0 bg-orange-800/50 px-5 py-3 rounded-xl hover:bg-orange-800">
            Browse all <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* ── Scroll wrapper with hover zones ── */}
        <div
          ref={wrapperRef}
          className="relative select-none"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Left hover zone indicator — desktop only */}
          <div className={`
            pointer-events-none absolute left-0 top-0 bottom-0 w-[25%] z-10
            hidden sm:flex items-center justify-start pl-4
            transition-opacity duration-200
            ${zone === 'left' ? 'opacity-100' : 'opacity-0'}
          `}>
            <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-3 py-2 rounded-full">
              <ChevronLeft className="h-4 w-4" /> Scroll
            </div>
            {/* Gradient fade */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent rounded-l-2xl" />
          </div>

          {/* Right hover zone indicator — desktop only */}
          <div className={`
            pointer-events-none absolute right-0 top-0 bottom-0 w-[25%] z-10
            hidden sm:flex items-center justify-end pr-4
            transition-opacity duration-200
            ${zone === 'right' ? 'opacity-100' : 'opacity-0'}
          `}>
            <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-3 py-2 rounded-full">
              Scroll <ChevronRight className="h-4 w-4" />
            </div>
            {/* Gradient fade */}
            <div className="absolute inset-0 bg-gradient-to-l from-black/30 to-transparent rounded-r-2xl" />
          </div>

          {/* Scroll strip */}
          <div
            ref={scrollRef}
            className={`gallery-scroll flex gap-3 overflow-x-auto no-scrollbar pb-2 ${
              zone === 'left' ? 'cursor-w-resize' : zone === 'right' ? 'cursor-e-resize' : 'cursor-default'
            }`}
          >
            {columns.map((col, ci) => (
              <motion.div
                key={ci}
                initial={{ opacity:0, x: 40 }} whileInView={{ opacity:1, x:0 }}
                viewport={{ once:true }} transition={{ delay: ci * 0.05 }}
                className="gallery-col shrink-0"
              >
                {col.type === 'large' ? (
                  <GalleryCard item={col.item} className="w-[300px] sm:w-[340px] h-[440px]" />
                ) : (
                  <div className="flex flex-col gap-3 w-[220px] sm:w-[250px] h-[440px]">
                    {col.items.map((item) => (
                      <GalleryCard key={item.id} item={item} className="flex-1 w-full" />
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile hint */}
        <p className="sm:hidden text-center text-orange-600 text-xs mt-4 tracking-wide">
          Swipe to explore →
        </p>

      </div>
    </section>
  );
}
