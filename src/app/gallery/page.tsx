'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { getGalleryItems } from '@/services/gallery.service';
import type { GalleryItem } from '@/types';

const FALLBACK: GalleryItem[] = [
  { id:'1',  label:'Mountain Views',    sub:'', src:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=85', span:'col-span-2 row-span-2', order:0,  createdAt:'', updatedAt:'' },
  { id:'2',  label:'Cozy Interiors',    sub:'', src:'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800&q=80',  span:'col-span-1 row-span-1', order:1,  createdAt:'', updatedAt:'' },
  { id:'3',  label:'Forest Trails',     sub:'', src:'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80',  span:'col-span-1 row-span-1', order:2,  createdAt:'', updatedAt:'' },
  { id:'4',  label:'Lake Mornings',     sub:'', src:'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80',  span:'col-span-1 row-span-1', order:3,  createdAt:'', updatedAt:'' },
  { id:'5',  label:'Starlit Nights',    sub:'', src:'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80',  span:'col-span-1 row-span-1', order:4,  createdAt:'', updatedAt:'' },
  { id:'6',  label:'Lakeside View',     sub:'', src:'https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=800&q=80',  span:'col-span-2 row-span-2', order:5,  createdAt:'', updatedAt:'' },
  { id:'7',  label:'The Cabin',         sub:'', src:'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80',  span:'col-span-1 row-span-1', order:6,  createdAt:'', updatedAt:'' },
  { id:'8',  label:'Winter Escape',     sub:'', src:'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&q=80',    span:'col-span-1 row-span-1', order:7,  createdAt:'', updatedAt:'' },
  { id:'9',  label:'Morning Mist',      sub:'', src:'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80',  span:'col-span-1 row-span-1', order:8,  createdAt:'', updatedAt:'' },
  { id:'10', label:'Deep Forest',       sub:'', src:'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80',  span:'col-span-1 row-span-1', order:9,  createdAt:'', updatedAt:'' },
  { id:'11', label:'Fireplace',         sub:'', src:'https://images.unsplash.com/photo-1533090368676-1fd25485db88?w=800&q=80',  span:'col-span-2 row-span-2', order:10, createdAt:'', updatedAt:'' },
  { id:'12', label:'Pond Reflections',  sub:'', src:'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&q=80',  span:'col-span-1 row-span-1', order:11, createdAt:'', updatedAt:'' },
];

export default function GalleryPage() {
  const [items,   setItems]   = useState<GalleryItem[]>([]);
  const [lb,      setLb]      = useState<number | null>(null);
  const [loaded,  setLoaded]  = useState(false);

  useEffect(() => {
    getGalleryItems()
      .then((d) => { setItems(d.length > 0 ? d : FALLBACK); setLoaded(true); })
      .catch(()  => { setItems(FALLBACK);                    setLoaded(true); });
  }, []);

  const open  = useCallback((i: number) => setLb(i), []);
  const close = useCallback(() => setLb(null), []);
  const prev  = useCallback(() => setLb((i) => i === null ? null : (i - 1 + items.length) % items.length), [items.length]);
  const next  = useCallback(() => setLb((i) => i === null ? null : (i + 1) % items.length), [items.length]);

  useEffect(() => {
    if (lb === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape')      close();
      if (e.key === 'ArrowLeft')   prev();
      if (e.key === 'ArrowRight')  next();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [lb, close, prev, next]);

  const hero    = items.find((it) => it.span === 'col-span-2 row-span-2') ?? items[0];
  const heroIdx = items.indexOf(hero);

  return (
    <>
      <main className="bg-black min-h-screen">

        {/* ── Editorial Header ── */}
        <section className="relative pt-24 sm:pt-28 pb-8 sm:pb-10 px-6 md:px-16 bg-black overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-amber-400/30" />
          <div className="absolute top-16 right-0 w-[40vw] h-px bg-gradient-to-l from-amber-400/10 to-transparent" />

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="flex items-center gap-4 mb-5">
              <span className="block w-12 h-[1px] bg-amber-400" />
              <span className="text-amber-400 text-[10px] font-bold uppercase tracking-[0.4em]">Visual archive</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 max-w-7xl">
              <h1 className="font-display text-[clamp(2.25rem,5vw,4rem)] text-white leading-[0.95] tracking-tight">
                Every <em className="text-amber-300 not-italic">Frame.</em> Unfiltered.
              </h1>
              <div className="shrink-0 text-right">
                {loaded && (
                  <p className="font-display text-3xl text-white/15 leading-none select-none">{items.length}</p>
                )}
                <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.35em] mt-1">photographs</p>
                <p className="text-white/15 text-[10px] uppercase tracking-widest mt-3 max-w-[180px] ml-auto leading-relaxed">
                  No filters. No fibs.<br />Just really good light.
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── Hero Image (first large) ── */}
        {hero && (
          <motion.div
            initial={{ opacity: 0, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="relative w-full cursor-pointer group overflow-hidden"
            style={{ height: 'clamp(260px, 38vh, 460px)' }}
            onClick={() => open(heroIdx)}
          >
            <Image src={hero.src} alt={hero.label} fill priority
              className="object-cover transition-transform duration-1000 group-hover:scale-[1.02]"
              sizes="100vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
            <div className="absolute bottom-6 left-6 md:left-16 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <ZoomIn className="h-4 w-4 text-white" />
              <span className="text-white/70 text-xs font-bold uppercase tracking-[0.25em]">{hero.label}</span>
            </div>
          </motion.div>
        )}

        {/* ── Full Grid ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[2px] bg-stone-900">
          {items.map((item, i) => {
            const isLarge = item.span === 'col-span-2 row-span-2';
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 8) * 0.04 }}
                className={`relative overflow-hidden cursor-pointer group bg-stone-950${isLarge ? ' col-span-2 row-span-2' : ''}`}
                style={{ height: isLarge ? '480px' : '240px' }}
                onClick={() => open(i)}
              >
                <Image src={item.src} alt={item.label} fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes={isLarge ? '50vw' : '25vw'} />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

                <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-between">
                  <span className="text-white text-[11px] font-bold uppercase tracking-[0.2em] truncate">{item.label}</span>
                  <ZoomIn className="h-3.5 w-3.5 text-white/60 shrink-0 ml-2" />
                </div>

                <div className="absolute top-2 left-2 text-white/15 text-[10px] font-bold tabular-nums select-none">
                  {String(i + 1).padStart(2, '0')}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Footer ── */}
        <div className="py-12 px-6 text-center border-t border-stone-900">
          <p className="text-stone-700 text-[11px] uppercase tracking-[0.4em]">
            {loaded ? items.length : '—'} photographs · Relaxin Cabins · Wisconsin
          </p>
          <div className="mt-4 flex justify-center">
            <span className="block w-12 h-[1px] bg-amber-900/50" />
          </div>
        </div>
      </main>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lb !== null && items[lb] && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[9999] bg-black/97 flex items-center justify-center"
            onClick={close}
          >
            {/* Close */}
            <button type="button" aria-label="Close lightbox" onClick={close}
              className="absolute top-4 right-4 z-10 p-2.5 bg-white/10 hover:bg-white/20 text-white transition-colors">
              <X className="h-5 w-5" />
            </button>

            {/* Counter */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 z-10 text-white/35 text-[10px] font-bold uppercase tracking-[0.35em] select-none">
              {lb + 1}<span className="mx-2 text-white/15">of</span>{items.length}
            </div>

            {/* Prev / Next */}
            <button type="button" onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-3 md:left-6 z-10 p-3 bg-white/10 hover:bg-white/20 text-white transition-colors">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button type="button" onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-3 md:right-6 z-10 p-3 bg-white/10 hover:bg-white/20 text-white transition-colors">
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Main image */}
            <motion.div
              key={lb}
              initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.18 }}
              className="relative w-full h-full max-w-5xl max-h-[78vh] mx-16 md:mx-24 my-24"
              onClick={(e) => e.stopPropagation()}
            >
              <Image src={items[lb].src} alt={items[lb].label} fill
                className="object-contain" sizes="100vw" />
              <div className="absolute -bottom-8 left-0 right-0 text-center">
                <p className="text-white/35 text-[10px] font-bold uppercase tracking-[0.3em]">
                  {items[lb].label}
                </p>
              </div>
            </motion.div>

            {/* Thumbnail strip */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent pt-10 pb-3 px-4 flex justify-center gap-[2px] overflow-x-auto no-scrollbar">
              {items.map((t, i) => (
                <button key={t.id} type="button" aria-label={`View photo ${i + 1}: ${t.label}`}
                  onClick={(e) => { e.stopPropagation(); setLb(i); }}
                  className={`shrink-0 w-12 h-8 relative overflow-hidden transition-all duration-150 border
                    ${i === lb
                      ? 'border-amber-400 opacity-100 scale-105'
                      : 'border-transparent opacity-25 hover:opacity-60'
                    }`}
                >
                  <Image src={t.src} alt={t.label} fill className="object-cover" sizes="48px" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
