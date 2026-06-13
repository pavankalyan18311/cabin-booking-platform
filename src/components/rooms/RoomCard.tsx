'use client';
import { memo, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, MapPin, Star, Bed, Bath, Users, Wrench, Maximize2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuthStore, useFavoritesStore } from '@/store';
import { toggleFavorite } from '@/services/users.service';
import { formatCurrency } from '@/lib/utils';
import type { Room } from '@/types';
import { toast } from 'sonner';

function ImageLightbox({ images, title, onClose }: {
  images: string[];
  title: string;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(0);

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrent(i => (i - 1 + images.length) % images.length);
  };
  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrent(i => (i + 1) % images.length);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close */}
      <button
        type="button"
        aria-label="Close photo viewer"
        className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/15 text-white hover:bg-white/30 transition-colors"
        onClick={onClose}
      >
        <X className="h-5 w-5" />
      </button>

      {/* Prev / Next */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            className="absolute left-3 sm:left-6 z-10 p-2.5 rounded-full bg-white/15 text-white hover:bg-white/30 transition-colors"
            onClick={prev}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            className="absolute right-3 sm:right-6 z-10 p-2.5 rounded-full bg-white/15 text-white hover:bg-white/30 transition-colors"
            onClick={next}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Image */}
      <div
        className="relative w-full h-full max-w-4xl max-h-[85vh] mx-16 sm:mx-20"
        onClick={e => e.stopPropagation()}
      >
        <Image
          src={images[current]}
          alt={`${title} — photo ${current + 1}`}
          fill
          className="object-contain"
          sizes="100vw"
        />
      </div>

      {/* Counter + dots */}
      <div className="absolute bottom-5 left-0 right-0 flex flex-col items-center gap-3">
        {images.length > 1 && (
          <div className="flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to photo ${i + 1}`}
                onClick={e => { e.stopPropagation(); setCurrent(i); }}
                className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-white scale-110' : 'bg-white/35'}`}
              />
            ))}
          </div>
        )}
        <span className="text-white/50 text-xs font-medium">
          {current + 1} / {images.length} &nbsp;·&nbsp; {title}
        </span>
      </div>
    </div>
  );
}

function RoomCard({ room }: { room: Room }) {
  const { user } = useAuthStore();
  const { favorites, _hasHydrated, toggleFavorite: toggleFavStore } = useFavoritesStore();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
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

  const handleExpand = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (room.images.length > 0) setLightboxOpen(true);
  }, [room.images.length]);

  const card = (
    <motion.div
      whileHover={isMaintenance ? {} : { y: -4 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="group relative rounded-2xl overflow-hidden bg-stone-900 cursor-pointer shadow-md hover:shadow-xl transition-shadow duration-300"
    >
      {/* ── Image (4:3, clean — no text overlay) ── */}
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        {room.images[0] ? (
          <Image
            src={room.images[0]}
            alt={room.title}
            fill
            className={`object-cover transition-all duration-700 ${imgLoaded ? 'opacity-100' : 'opacity-0'}
              ${!isMaintenance ? 'group-hover:scale-105' : ''}`}
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

        {/* Maintenance overlay */}
        {isMaintenance && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
            <div className="bg-white/95 backdrop-blur-sm px-4 py-2.5 rounded-2xl flex items-center gap-2">
              <Wrench className="h-4 w-4 text-stone-600" />
              <span className="text-sm font-semibold text-stone-800">Temporarily Closed</span>
            </div>
          </div>
        )}

        {/* Badges top-left */}
        <div className="absolute top-2.5 left-2.5 flex gap-1 z-10">
          {room.isFeatured && !isMaintenance && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">Featured</span>
          )}
          {discountPct > 0 && !isMaintenance && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">-{discountPct}%</span>
          )}
        </div>

        {/* Top-right: expand + favorite */}
        <div className="absolute top-2.5 right-2.5 z-20 flex gap-1.5">
          {room.images.length > 0 && (
            <button
              type="button"
              aria-label="View all photos"
              onClick={handleExpand}
              className="p-2 rounded-xl bg-black/45 backdrop-blur-sm text-white hover:bg-black/65 transition-colors"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
            onClick={handleFavorite}
            className={`p-2 rounded-xl transition-all duration-200
              ${isFav
                ? 'bg-red-500 text-white shadow-lg shadow-red-900/30'
                : 'bg-black/45 backdrop-blur-sm text-white hover:bg-black/65'}`}
          >
            <Heart className={`h-3.5 w-3.5 ${isFav ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Photo count badge bottom-right */}
        {room.images.length > 1 && (
          <div className="absolute bottom-2 right-2 z-10 bg-black/50 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
            {room.images.length} photos
          </div>
        )}

        {/* Hover ring */}
        {!isMaintenance && (
          <div className="absolute inset-0 ring-0 group-hover:ring-2 group-hover:ring-amber-500/70 transition-all duration-300 pointer-events-none" />
        )}
      </div>

      {/* ── Info below image — consistent height, always aligned ── */}
      <div className="p-3 sm:p-4">
        {/* Title + rating */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-black text-white text-sm leading-tight line-clamp-1 group-hover:text-amber-300 transition-colors flex-1 min-w-0">
            {room.title}
          </h3>
          <span className="flex items-center gap-0.5 bg-amber-500/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-lg shrink-0">
            <Star className="h-2.5 w-2.5 fill-current" />
            {room.rating.toFixed(1)}
          </span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-white/45 text-xs mb-2.5">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{room.location}</span>
        </div>

        {/* Amenities + price */}
        <div className="flex items-end justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-0.5 text-white/45 text-xs">
              <Users className="h-3 w-3" />{room.maxGuests}
            </span>
            <span className="flex items-center gap-0.5 text-white/45 text-xs">
              <Bed className="h-3 w-3" />{room.bedrooms}
            </span>
            <span className="flex items-center gap-0.5 text-white/45 text-xs">
              <Bath className="h-3 w-3" />{room.bathrooms}
            </span>
          </div>
          <div className="text-right shrink-0">
            <div className="flex items-baseline gap-0.5 justify-end">
              <span className="text-white font-black text-base leading-none">{formatCurrency(effectivePrice)}</span>
              <span className="text-white/40 text-[10px]">/night</span>
            </div>
            {room.discountPrice && (
              <span className="text-white/35 text-[10px] line-through block">{formatCurrency(room.price)}</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <>
      {lightboxOpen && typeof document !== 'undefined' && createPortal(
        <ImageLightbox
          images={room.images}
          title={room.title}
          onClose={() => setLightboxOpen(false)}
        />,
        document.body
      )}
      {isMaintenance
        ? <div className="select-none">{card}</div>
        : <Link href={`/rooms/${room.id}`} className="block">{card}</Link>
      }
    </>
  );
}

export default memo(RoomCard, (prev, next) =>
  prev.room.id === next.room.id &&
  prev.room.price === next.room.price &&
  prev.room.discountPrice === next.room.discountPrice &&
  prev.room.isAvailable === next.room.isAvailable &&
  prev.room.isUnderMaintenance === next.room.isUnderMaintenance
);
