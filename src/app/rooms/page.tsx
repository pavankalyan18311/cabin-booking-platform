'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import RoomCard from '@/components/rooms/RoomCard';
import RoomCardSkeleton from '@/components/rooms/RoomCardSkeleton';
import FilterPanel from '@/components/rooms/FilterPanel';
import { useRooms } from '@/hooks/useRooms';
import { useSearchStore } from '@/store';
import { searchRooms } from '@/services/rooms.service';
import type { Room } from '@/types';
import { debounce } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function RoomsPage() {
  const { filters, clearFilters } = useSearchStore();
  const { rooms, loading, loadingMore, hasMore, loadMore, error } = useRooms(filters);
  const [searchQuery,   setSearchQuery]   = useState('');
  const [searchResults, setSearchResults] = useState<Room[] | null>(null);
  const [sortBy,        setSortBy]        = useState('default');
  const [searchFocused, setSearchFocused] = useState(false);
  const [openPopover, setOpenPopover] = useState<'sort' | 'filter' | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSearch = useCallback(
    debounce(async (q: string) => {
      if (!q.trim()) { setSearchResults(null); return; }
      const results = await searchRooms(q);
      setSearchResults(results);
    }, 400), []
  );

  useEffect(() => { handleSearch(searchQuery); }, [searchQuery, handleSearch]);

  const displayRooms = searchResults ?? rooms;
  const sortedRooms  = useMemo(() => [...displayRooms].sort((a, b) => {
    if (sortBy === 'price-asc')  return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'rating')     return b.rating - a.rating;
    return 0;
  }), [displayRooms, sortBy]);

  return (
    <div className="bg-dual-blend min-h-screen">

      {/* ── Header ── */}
      <div className="relative pt-20 sm:pt-24 pb-8 sm:pb-10">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="text-amber-400 text-xs font-bold uppercase tracking-[0.25em] mb-3">
              {sortedRooms.length > 0 && !loading ? `${sortedRooms.length} cabins available` : 'Handpicked retreats'}
            </p>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-none mb-3">
              Find Your
              <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 bg-clip-text text-transparent"> Perfect</span>
              <br />Cabin
            </h1>
            <p className="text-white/30 text-sm sm:text-base max-w-md mt-2">
              Every property is handpicked for luxury, comfort, and an unforgettable escape.
            </p>
          </motion.div>

          {/* Search + filter */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="mt-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"
          >
            <div className={`relative flex-1 max-w-lg transition-all duration-300 ${searchFocused ? 'ring-2 ring-amber-500/40 rounded-2xl' : ''}`}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25 pointer-events-none" />
              <input
                type="text" placeholder="Search cabins..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="input-glass w-full h-12 pl-11 pr-4 rounded-2xl text-sm outline-none text-white placeholder:text-white/25 transition-colors"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={sortBy}
                onValueChange={setSortBy}
                open={openPopover === 'sort'}
                onOpenChange={(o) => setOpenPopover(o ? 'sort' : null)}
              >
                <SelectTrigger className="input-glass h-12 w-44 rounded-2xl text-sm text-white/60 focus:ring-0 border-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0A1520] border-white/10 text-stone-200">
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="price-asc">Price: Low → High</SelectItem>
                  <SelectItem value="price-desc">Price: High → Low</SelectItem>
                  <SelectItem value="rating">Top Rated</SelectItem>
                </SelectContent>
              </Select>
              <FilterPanel
                open={openPopover === 'filter'}
                onOpenChange={(o) => setOpenPopover(o ? 'filter' : null)}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {Array.from({ length: 8 }).map((_, i) => <RoomCardSkeleton key={i} />)}
          </div>
        ) : error ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">⚠️</p>
            <h3 className="text-lg font-bold text-white mb-2">Could not load cabins</h3>
            <p className="text-sm text-red-400 mb-6 max-w-sm mx-auto">{error}</p>
            <Button onClick={clearFilters} className="bg-amber-600 hover:bg-amber-700 text-white">Clear filters & retry</Button>
          </div>
        ) : sortedRooms.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
            <p className="text-5xl mb-4">🏕️</p>
            <h3 className="text-lg font-bold text-white mb-2">No cabins found</h3>
            <p className="text-white/40 text-sm mb-6">Try adjusting your filters or search.</p>
            <Button onClick={clearFilters} variant="outline" className="border-white/20 text-white/60 hover:bg-white/10">
              Clear all filters
            </Button>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {sortedRooms.map((room, i) => (
                <motion.div key={room.id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.35) }}>
                  <RoomCard room={room} />
                </motion.div>
              ))}
            </div>
            {hasMore && !searchResults && (
              <div className="mt-12 text-center">
                <Button onClick={loadMore} disabled={loadingMore}
                  className="h-12 px-10 input-glass hover:bg-white/10 border-0 text-white/60 rounded-2xl font-semibold">
                  {loadingMore ? 'Loading...' : 'Load more cabins'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
