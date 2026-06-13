'use client';
import { memo, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, MapPin, Star, Bed, Bath, Users, Wrench } from 'lucide-react';
import { useAuthStore, useFavoritesStore } from '@/store';
import { toggleFavorite } from '@/services/users.service';
import { formatCurrency } from '@/lib/utils';
import type { Room } from '@/types';
import { toast } from 'sonner';

function RoomCard({ room }: { room: Room }) {
  const { user } = useAuthStore();
  const { favorites, _hasHydrated, toggleFavorite: toggleFavStore } = useFavoritesStore();
  const [imgLoaded, setImgLoaded] = useState(false);
  const isFav = _hasHydrated && favorites.includes(room.id);
  const isMaintenance = !!room.isUnderMaintenance;

  const discountPct = room.discountPrice
    ? Math.round(((room.price - room.discountPrice) / room.price) * 100) : 0;
  const effectivePrice = room.discountPrice ?? room.price;

  const handleFavorite = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) { toast.error('Sign in to save favorites'); return; }
    toggleFavStore(room.id);
    try { await toggleFavorite(user.uid, room.id); }
    catch { toggleFavStore(room.id); }
  }, [user, room.id, toggleFavStore]);

  const handleImgLoad = useCallback(() => setImgLoaded(true), []);

  const card = (
    <motion.div
      whileHover={isMaintenance ? {} : { y: -6 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="group relative rounded-2xl overflow-hidden cursor-pointer"
      style={{ aspectRatio: '3/4' }}
    >
      {/* Image */}
      {room.images[0] ? (
        <Image
          src={room.images[0]}
          alt={room.title}
          fill
          className={`object-cover transition-all duration-700 ${imgLoaded ? 'opacity-100' : 'opacity-0'}
            ${!isMaintenance ? 'group-hover:scale-110' : ''}`}
          onLoad={handleImgLoad}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      ) : (
        <div className="absolute inset-0 bg-stone-800 flex flex-col items-center justify-center gap-2">
          <div className="w-14 h-14 rounded-full bg-stone-700 flex items-center justify-center">
            <svg className="w-7 h-7 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
              <line x1="4" y1="4" x2="20" y2="20" strokeWidth={1.5} />
            </svg>
          </div>
          <span className="text-stone-400 text-xs font-medium">No Photo</span>
        </div>
      )}
      {!imgLoaded && room.images[0] && (
        <div className="absolute inset-0 bg-stone-800 animate-pulse" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/10" />

      {!isMaintenance && (
        <div className="absolute inset-0 rounded-2xl ring-0 group-hover:ring-2 group-hover:ring-amber-500/70
          transition-all duration-300 pointer-events-none" />
      )}

      {isMaintenance && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
          <div className="bg-white/95 backdrop-blur-sm px-4 py-2.5 rounded-2xl flex items-center gap-2">
            <Wrench className="h-4 w-4 text-stone-600" />
            <span className="text-sm font-semibold text-stone-800">Temporarily Closed</span>
          </div>
        </div>
      )}

      <div className="absolute top-3 left-3 flex gap-1.5 z-10">
        {room.isFeatured && !isMaintenance && (
          <span className="bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
            Featured
          </span>
        )}
        {discountPct > 0 && !isMaintenance && (
          <span className="bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
            -{discountPct}%
          </span>
        )}
      </div>

      <button
        type="button"
        aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
        onClick={handleFavorite}
        className={`absolute top-3 right-3 z-20 p-2.5 rounded-xl transition-all duration-200
          ${isFav ? 'bg-red-500 text-white shadow-lg shadow-red-900/30'
            : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/40'}`}
      >
        <Heart className={`h-4 w-4 ${isFav ? 'fill-current' : ''}`} />
      </button>

      <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="flex items-center gap-1 text-white/60 text-xs">
            <Users className="h-3 w-3" />{room.maxGuests}
          </span>
          <span className="flex items-center gap-1 text-white/60 text-xs">
            <Bed className="h-3 w-3" />{room.bedrooms}
          </span>
          <span className="flex items-center gap-1 text-white/60 text-xs">
            <Bath className="h-3 w-3" />{room.bathrooms}
          </span>
          <span className="ml-auto flex items-center gap-1 bg-amber-500/90 backdrop-blur-sm
            text-white text-xs font-bold px-2 py-0.5 rounded-lg">
            <Star className="h-3 w-3 fill-current" />
            {room.rating.toFixed(1)}
          </span>
        </div>

        <h3 className="font-black text-white text-base leading-tight line-clamp-1 mb-1
          group-hover:text-amber-300 transition-colors duration-300">
          {room.title}
        </h3>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-white/60 text-xs">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate max-w-[140px]">{room.location}</span>
          </span>
          <div className="flex items-baseline gap-1 shrink-0">
            <span className="text-white font-black text-lg leading-none">
              {formatCurrency(effectivePrice)}
            </span>
            <span className="text-white/50 text-xs">/night</span>
          </div>
        </div>

        {room.discountPrice && (
          <div className="text-right mt-0.5">
            <span className="text-white/40 text-xs line-through">{formatCurrency(room.price)}</span>
          </div>
        )}
      </div>
    </motion.div>
  );

  return isMaintenance
    ? <div className="select-none">{card}</div>
    : <Link href={`/rooms/${room.id}`} className="block">{card}</Link>;
}

// Only re-render if the room data actually changed
export default memo(RoomCard, (prev, next) =>
  prev.room.id === next.room.id &&
  prev.room.price === next.room.price &&
  prev.room.discountPrice === next.room.discountPrice &&
  prev.room.isAvailable === next.room.isAvailable &&
  prev.room.isUnderMaintenance === next.room.isUnderMaintenance
);
