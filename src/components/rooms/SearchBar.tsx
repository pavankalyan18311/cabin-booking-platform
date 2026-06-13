'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, Search, Minus, Plus } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import type { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { useSearchStore } from '@/store';
import { cn } from '@/lib/utils';

type Panel = 'dates' | 'guests' | null;

export default function SearchBar() {
  const router = useRouter();
  const { setFilters } = useSearchStore();
  const containerRef = useRef<HTMLDivElement>(null);

  const [range, setRange]   = useState<DateRange | undefined>();
  const [guests, setGuests] = useState(2);
  const [panel, setPanel]   = useState<Panel>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setPanel(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const togglePanel = useCallback((p: Panel) => setPanel((prev) => (prev === p ? null : p)), []);

  const checkInLabel  = range?.from ? format(range.from, 'MMM d') : null;
  const checkOutLabel = range?.to   ? format(range.to,   'MMM d') : null;
  const dateLabel     = checkInLabel && checkOutLabel
    ? `${checkInLabel} – ${checkOutLabel}`
    : checkInLabel ? `${checkInLabel} – Checkout` : 'Add dates';

  const handleSearch = () => {
    setFilters({
      checkIn:  range?.from,
      checkOut: range?.to,
      guests:   guests > 0 ? guests : undefined,
    });
    setPanel(null);
    router.push('/rooms');
  };

  const divider = <div className="w-px h-8 bg-white/20 shrink-0" />;
  const sectionBase = 'flex items-center gap-3 px-5 py-3.5 rounded-full text-left transition-all duration-200 cursor-pointer select-none';

  return (
    <div ref={containerRef} className="relative w-full max-w-3xl mx-auto">

      {/* ── PILL BAR ── */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center bg-white/15 backdrop-blur-xl rounded-full p-1.5 shadow-[0_8px_40px_rgba(0,0,0,0.4)] border border-white/25"
      >
        {/* WHEN */}
        <button type="button" onClick={() => togglePanel('dates')}
          className={cn(sectionBase, 'flex-1',
            panel === 'dates' ? 'bg-white shadow-lg' : 'text-white hover:bg-white/10')}>
          <Calendar className={cn('h-4 w-4 shrink-0', panel === 'dates' ? 'text-amber-600' : 'text-white/70')} />
          <div className="min-w-0">
            <p className={cn('text-[10px] font-bold uppercase tracking-widest', panel === 'dates' ? 'text-stone-400' : 'text-white/60')}>When</p>
            <p className={cn('text-sm font-semibold truncate',
              (checkInLabel || checkOutLabel)
                ? (panel === 'dates' ? 'text-stone-900' : 'text-white')
                : (panel === 'dates' ? 'text-stone-400' : 'text-white/60'))}>
              {dateLabel}
            </p>
          </div>
        </button>

        {divider}

        {/* WHO */}
        <button type="button" onClick={() => togglePanel('guests')}
          className={cn(sectionBase,
            panel === 'guests' ? 'bg-white shadow-lg' : 'text-white hover:bg-white/10')}>
          <Users className={cn('h-4 w-4 shrink-0', panel === 'guests' ? 'text-amber-600' : 'text-white/70')} />
          <div>
            <p className={cn('text-[10px] font-bold uppercase tracking-widest', panel === 'guests' ? 'text-stone-400' : 'text-white/60')}>Who</p>
            <p className={cn('text-sm font-semibold', panel === 'guests' ? 'text-stone-900' : 'text-white')}>
              {guests} guest{guests !== 1 ? 's' : ''}
            </p>
          </div>
        </button>

        {/* SEARCH */}
        <button type="button" onClick={handleSearch}
          className="ml-1.5 h-12 px-7 rounded-full bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-900/40 transition-all duration-150 shrink-0">
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search</span>
        </button>
      </motion.div>

      {/* ── DROPDOWNS ── */}
      <AnimatePresence>

        {/* DATES */}
        {panel === 'dates' && (
          <motion.div key="dates"
            initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }} transition={{ duration: 0.18 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-white rounded-3xl shadow-2xl shadow-black/20 border border-stone-100 p-6 z-50 w-max">
            <style>{`.search-rdp { --rdp-accent-color: #d97706 !important; --rdp-accent-background-color: #fef3c7 !important; }`}</style>
            <DayPicker
              className="search-rdp text-sm"
              mode="range"
              selected={range}
              onSelect={(r) => {
                setRange(r);
                if (r?.from && r?.to && r.from.getTime() !== r.to.getTime()) {
                  setTimeout(() => setPanel('guests'), 280);
                }
              }}
              numberOfMonths={2}
              disabled={{ before: new Date() }}
            />
            <div className="flex items-center justify-between pt-4 border-t border-stone-100">
              <button type="button" onClick={() => setRange(undefined)}
                className="text-sm font-semibold text-stone-400 hover:text-stone-700 underline underline-offset-2 transition-colors">
                Clear dates
              </button>
              <button type="button" onClick={() => setPanel('guests')}
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-full text-sm font-bold shadow-md transition-all">
                Next — Who&rsquo;s coming?
              </button>
            </div>
          </motion.div>
        )}

        {/* GUESTS */}
        {panel === 'guests' && (
          <motion.div key="guests"
            initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }} transition={{ duration: 0.18 }}
            className="absolute top-full right-0 mt-3 w-72 bg-white rounded-3xl shadow-2xl shadow-black/20 border border-stone-100 p-5 z-50">
            <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">Guests</p>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-semibold text-stone-900">Adults</p>
                <p className="text-xs text-stone-400">Ages 13 or above</p>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" aria-label="Remove guest" onClick={() => setGuests(Math.max(1, guests - 1))}
                  disabled={guests <= 1}
                  className="w-9 h-9 rounded-full border-2 border-stone-200 hover:border-amber-500 disabled:opacity-30 flex items-center justify-center transition-colors">
                  <Minus className="h-3.5 w-3.5 text-stone-600" />
                </button>
                <span className="text-base font-bold w-5 text-center tabular-nums">{guests}</span>
                <button type="button" aria-label="Add guest" onClick={() => setGuests(Math.min(20, guests + 1))}
                  disabled={guests >= 20}
                  className="w-9 h-9 rounded-full border-2 border-stone-200 hover:border-amber-500 disabled:opacity-30 flex items-center justify-center transition-colors">
                  <Plus className="h-3.5 w-3.5 text-stone-600" />
                </button>
              </div>
            </div>
            <button type="button" onClick={handleSearch}
              className="mt-3 w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all">
              <Search className="h-4 w-4" />
              Search cabins
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
