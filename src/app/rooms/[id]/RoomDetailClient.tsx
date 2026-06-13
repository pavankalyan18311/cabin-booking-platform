'use client';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  MapPin, Users, Bed, Bath, Star, Share2, ChevronLeft, ChevronRight, Maximize, Maximize2, X,
  Wifi, Flame, Droplets, TreePine, Dog, ChefHat, Car, Mountain, Check, Loader2, ArrowLeft,
  Tv, Coffee, Wind, Home, Thermometer, WashingMachine, UtensilsCrossed, Shirt, Hotel,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import BookingWidget from '@/components/booking/BookingWidget';
import StarRating from '@/components/shared/StarRating';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Room, Review } from '@/types';
import { toast } from 'sonner';
import { useAuthStore } from '@/store';
import { createReview } from '@/services/reviews.service';

const AMENITY_ICONS: Record<string, React.ElementType> = {
  WiFi: Wifi,
  Fireplace: Flame,
  'Hot Tub': Droplets,
  'Whirlpool Tub': Droplets,
  Bathtub: Bath,
  'Forest Setting': TreePine,
  'Pet Friendly': Dog,
  Kitchen: ChefHat,
  Parking: Car,
  'Mountain View': Mountain,
  'TV / Satellite TV': Tv,
  'Coffee Maker': Coffee,
  'Ceiling Fans': Wind,
  Heating: Thermometer,
  'Air Conditioning': Thermometer,
  Porch: Home,
  'Screened Porch': Home,
  Balcony: Home,
  Terrace: Home,
  'Washer/Dryer': WashingMachine,
  Dishwasher: UtensilsCrossed,
  Iron: Shirt,
};

interface Props { room: Room; bookedDates: string[]; reviews: Review[]; }

function ImageLightbox({ images, title, startIdx, onClose }: {
  images: string[]; title: string; startIdx: number; onClose: () => void;
}) {
  const [current, setCurrent] = useState(startIdx);
  const prev = (e: React.MouseEvent) => { e.stopPropagation(); setCurrent(i => (i - 1 + images.length) % images.length); };
  const next = (e: React.MouseEvent) => { e.stopPropagation(); setCurrent(i => (i + 1) % images.length); };
  return (
    <div className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center" onClick={onClose}>
      <button type="button" aria-label="Close" onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/15 text-white hover:bg-white/30 transition-colors">
        <X className="h-5 w-5" />
      </button>
      {images.length > 1 && <>
        <button type="button" aria-label="Previous" onClick={prev}
          className="absolute left-3 sm:left-6 z-10 p-2.5 rounded-full bg-white/15 text-white hover:bg-white/30 transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button type="button" aria-label="Next" onClick={next}
          className="absolute right-3 sm:right-6 z-10 p-2.5 rounded-full bg-white/15 text-white hover:bg-white/30 transition-colors">
          <ChevronRight className="h-5 w-5" />
        </button>
      </>}
      <div className="relative w-full h-full max-w-5xl max-h-[88vh] mx-16 sm:mx-20" onClick={e => e.stopPropagation()}>
        <Image src={images[current]} alt={`${title} — photo ${current + 1}`} fill className="object-contain" sizes="100vw" />
      </div>
      <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center gap-2">
        {images.length > 1 && (
          <div className="flex gap-1.5">
            {images.map((_, i) => (
              <button key={i} type="button" aria-label={`Photo ${i + 1}`}
                onClick={e => { e.stopPropagation(); setCurrent(i); }}
                className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-white scale-110' : 'bg-white/35'}`} />
            ))}
          </div>
        )}
        <span className="text-white/50 text-xs">{current + 1} / {images.length} · {title}</span>
      </div>
    </div>
  );
}

export default function RoomDetailClient({ room, bookedDates, reviews }: Props) {
  const { user } = useAuthStore();
  const [imgIdx, setImgIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [localReviews, setLocalReviews] = useState<Review[]>(reviews);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const images = room.images ?? [];

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied!');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error('Sign in to leave a review'); return; }
    if (!reviewComment.trim()) { toast.error('Please write a comment'); return; }
    setSubmittingReview(true);
    try {
      await createReview({
        roomId: room.id, userId: user.uid, rating: reviewRating,
        comment: reviewComment.trim(),
        user: { displayName: user.displayName, ...(user.photoURL ? { photoURL: user.photoURL } : {}) },
      });
      setLocalReviews((prev) => [{
        id: Date.now().toString(), roomId: room.id, userId: user.uid,
        rating: reviewRating, comment: reviewComment.trim(),
        user: { displayName: user.displayName, photoURL: user.photoURL },
        createdAt: new Date().toISOString(),
      }, ...prev]);
      setReviewComment(''); setReviewRating(5);
      toast.success('Review submitted!');
    } catch { toast.error('Failed to submit review'); }
    finally { setSubmittingReview(false); }
  };

  const scrollToBooking = () => {
    document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-dual-blend">
      {lightboxOpen && typeof document !== 'undefined' && createPortal(
        <ImageLightbox images={images} title={room.title} startIdx={imgIdx} onClose={() => setLightboxOpen(false)} />,
        document.body
      )}

      {/* ── Hero image ── */}
      <div className="relative h-[55vh] sm:h-[65vh] overflow-hidden group">
        {images[imgIdx] ? (
          <Image src={images[imgIdx]} alt={room.title} fill className="object-cover transition-opacity duration-500" priority />
        ) : (
          <div className="w-full h-full bg-stone-800 flex flex-col items-center justify-center gap-3">
            <div className="w-20 h-20 rounded-full bg-stone-700 flex items-center justify-center">
              <svg className="w-9 h-9 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                <line x1="4" y1="4" x2="20" y2="20" strokeWidth={1.5} />
              </svg>
            </div>
            <p className="text-stone-400 text-sm font-medium">No Photo Available</p>
          </div>
        )}
        {/* Deep gradient overlay */}
        <div className="bg-detail-hero-fade absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

        {/* Nav arrows */}
        {images.length > 1 && (
          <>
            <button type="button" aria-label="Previous image"
              onClick={() => setImgIdx((i) => (i - 1 + images.length) % images.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 bg-black/40 backdrop-blur-sm
                rounded-xl text-white hover:bg-black/60 opacity-0 group-hover:opacity-100 transition-all">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" aria-label="Next image"
              onClick={() => setImgIdx((i) => (i + 1) % images.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 bg-black/40 backdrop-blur-sm
                rounded-xl text-white hover:bg-black/60 opacity-0 group-hover:opacity-100 transition-all">
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button key={i} type="button" aria-label={`Image ${i + 1}`} onClick={() => setImgIdx(i)}
                  className={`h-1.5 rounded-full transition-all ${i === imgIdx ? 'bg-amber-400 w-6' : 'bg-white/40 w-1.5'}`} />
              ))}
            </div>
          </>
        )}

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 pt-20">
          <Link href="/rooms">
            <button type="button" className="flex items-center gap-1.5 text-white/80 hover:text-white
              bg-black/30 backdrop-blur-sm px-3 py-2 rounded-xl text-sm transition-colors">
              <ArrowLeft className="h-4 w-4" /> All cabins
            </button>
          </Link>
          <div className="flex items-center gap-2">
            {images.length > 0 && (
              <button type="button" onClick={() => setLightboxOpen(true)} aria-label="View all photos fullscreen"
                className="flex items-center gap-1.5 bg-black/30 backdrop-blur-sm px-3 py-2 rounded-xl text-white/80 hover:text-white text-sm transition-colors">
                <Maximize2 className="h-4 w-4" />
                <span className="hidden sm:inline">{images.length} photos</span>
              </button>
            )}
            <button type="button" onClick={handleShare} aria-label="Share this cabin"
              className="p-2.5 bg-black/30 backdrop-blur-sm rounded-xl text-white/80 hover:text-white transition-colors">
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Bottom title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 pb-10">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge className="bg-amber-600 hover:bg-amber-600 text-white capitalize">{room.category}</Badge>
            {room.isFeatured && <Badge className="bg-white/20 backdrop-blur-sm text-white border-0">Featured</Badge>}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">{room.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5 bg-amber-500/90 text-white px-2.5 py-1 rounded-lg font-bold text-xs">
              <Star className="h-3 w-3 fill-current" />
              {room.rating.toFixed(1)} · {room.reviewCount} reviews
            </span>
            <span className="flex items-center gap-1 text-white/70">
              <MapPin className="h-3.5 w-3.5 text-amber-400" />
              {room.location}
            </span>
          </div>
        </div>
      </div>

      {/* ── Thumbnail strip ── */}
      {images.length > 1 && (
        <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-0 max-w-7xl mx-auto">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {images.map((img, i) => (
              <button key={i} type="button" aria-label={`Thumbnail ${i + 1}`} onClick={() => setImgIdx(i)}
                className={`relative shrink-0 w-16 h-12 rounded-xl overflow-hidden border-2 transition-all
                  ${i === imgIdx ? 'border-amber-500' : 'border-transparent opacity-50 hover:opacity-80'}`}>
                <Image src={img} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-10">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* ── Left: Details ── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Quick stats */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { icon: Users, label: 'Guests', value: room.maxGuests },
                { icon: Bed, label: 'Bedrooms', value: room.bedrooms },
                { icon: Bath, label: 'Bathrooms', value: room.bathrooms },
                { icon: Maximize, label: 'Sq ft', value: room.size ? room.size.toLocaleString() : '—' },
              ].map((s) => (
                <div key={s.label} className="text-center p-4 bg-[#132E1C] border border-[#1F4A2D] rounded-2xl">
                  <s.icon className="h-5 w-5 text-amber-500 mx-auto mb-2" />
                  <div className="text-xl font-black text-white">{s.value}</div>
                  <div className="text-xs text-stone-500 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            <Separator className="bg-stone-800" />

            {/* Description */}
            <div>
              <h2 className="text-xl font-bold text-white mb-3">About this property</h2>
              <p className="text-stone-400 leading-relaxed">{room.description}</p>
            </div>

            <Separator className="bg-stone-800" />

            {/* Amenities */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">What this place offers</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {room.amenities.map((amenity) => {
                  const Icon = AMENITY_ICONS[amenity] ?? Check;
                  return (
                    <div key={amenity} className="flex items-center gap-2.5 p-3 bg-[#132E1C] border border-[#1F4A2D]
                      rounded-xl hover:border-amber-600/40 hover:bg-[#1A3A22] transition-colors">
                      <Icon className="h-4 w-4 text-amber-500 shrink-0" />
                      <span className="text-sm text-stone-300 font-medium">{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <Separator className="bg-stone-800" />

            {/* Reviews */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-xl font-bold text-white">Reviews</h2>
                <div className="flex items-center gap-1.5 bg-amber-600/20 border border-amber-600/30 px-3 py-1 rounded-xl">
                  <StarRating rating={room.rating} />
                  <span className="font-bold text-amber-400 text-sm">{room.rating.toFixed(1)}</span>
                  <span className="text-stone-500 text-xs">({room.reviewCount})</span>
                </div>
              </div>

              {localReviews.length === 0 ? (
                <p className="text-stone-500 text-sm mb-6">No reviews yet. Be the first!</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  {localReviews.slice(0, 6).map((review) => (
                    <motion.div key={review.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-[#132E1C] border border-[#1F4A2D] rounded-2xl p-4">
                      <div className="flex items-center gap-2.5 mb-2">
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarFallback className="bg-amber-600/20 text-amber-400 text-sm font-bold">
                            {review.user?.displayName?.charAt(0) ?? 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-semibold text-white text-sm truncate">{review.user?.displayName ?? 'Guest'}</p>
                          <p className="text-stone-500 text-xs">{formatDate(review.createdAt)}</p>
                        </div>
                        <div className="ml-auto shrink-0"><StarRating rating={review.rating} size="sm" /></div>
                      </div>
                      <p className="text-stone-400 text-sm leading-relaxed line-clamp-4">{review.comment}</p>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Review form */}
              <div className="bg-[#132E1C] border border-[#1F4A2D] rounded-2xl p-5">
                <h3 className="text-base font-bold text-white mb-4">Leave a Review</h3>
                {user ? (
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div>
                      <p className="text-sm text-stone-500 mb-2">Your rating</p>
                      <StarRating rating={reviewRating} size="lg" interactive onChange={setReviewRating} />
                    </div>
                    <Textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your experience..." rows={3}
                      className="text-sm bg-[#091510] border-[#1F4A2D] text-white placeholder:text-stone-600" />
                    <Button type="submit" variant="premium" size="sm" disabled={submittingReview || !reviewComment.trim()}>
                      {submittingReview ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />Submitting...</> : 'Submit Review'}
                    </Button>
                  </form>
                ) : (
                  <p className="text-sm text-stone-500">
                    <a href="/login" className="text-amber-400 font-semibold hover:underline">Sign in</a> to leave a review.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── Right: Booking widget ── */}
          <div id="booking-section">
            <BookingWidget room={room} bookedDates={bookedDates} />
          </div>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      {!room.isUnderMaintenance && (
        <div className="fixed bottom-0 left-0 right-0 lg:hidden z-40
          bg-[#091510]/95 backdrop-blur-md border-t border-[#1F4A2D] px-4 py-3">
          <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-white">{formatCurrency(room.price)}</span>
                <span className="text-sm text-stone-500">/ night</span>
              </div>
              {room.rating > 0 && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs text-stone-500">{room.rating.toFixed(1)} · {room.reviewCount} reviews</span>
                </div>
              )}
            </div>
            <Button type="button" variant="premium" className="h-11 px-7 font-bold shrink-0" onClick={scrollToBooking}>
              Reserve
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
