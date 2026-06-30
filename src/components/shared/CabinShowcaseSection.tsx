'use client';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, MapPin, Gamepad2, Banknote, Waves, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FEATURES = [
  { Icon: Banknote, label: 'ATM On-Site', sub: 'Cash, always close'       },
  { Icon: Waves,    label: 'Sandy Beach', sub: 'Your private shoreline'   },
  { Icon: Flame,    label: 'Fire Pits',   sub: 'Evenings under the stars' },
];

const SHOWCASE_CARDS = [
  {
    image: '/cabin/AI room.jpeg',
    eyebrow: 'Private Property',
    title: 'Waterfront Retreat',
    sub: 'Private shore · Open sky · Untouched wilderness',
  },
  {
    image: '/cabin/entry/entry-3.jpg',
    eyebrow: 'Your Arrival',
    title: 'Welcome to Relaxin',
    sub: 'A warm, private entrance — your getaway starts here',
  },
];

export default function CabinShowcaseSection() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="bg-gradient-to-b from-[#F6EFE0] via-[#F1E7D2] to-[#EAD9B8] py-20 sm:py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header — left-aligned with description on right */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10"
        >
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <MapPin className="h-3.5 w-3.5 text-amber-700" />
              <span className="text-amber-700 text-xs font-bold uppercase tracking-widest">
                N6768 WI-58, New Lisbon, WI
              </span>
            </div>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-stone-900 leading-[1.05] tracking-tight">
              The Full{' '}
              <span className="bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
                Relaxin Experience
              </span>
            </h2>
          </div>
          <p className="text-stone-600 text-sm max-w-xs leading-relaxed shrink-0 sm:text-right">
            Private grounds, secret entertainment,<br className="hidden sm:block" /> and every comfort — all yours.
          </p>
        </motion.div>

        {/* Three equal showcase cards: two photos + the gaming video */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

          {SHOWCASE_CARDS.map(({ image, eyebrow, title, sub }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.1 }}
              className="relative overflow-hidden rounded-2xl shadow-lg ring-1 ring-stone-900/5 h-72 sm:h-80 group"
            >
              <Image
                src={image}
                fill priority={i === 0}
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                alt={title}
                sizes="(max-width: 1024px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                <p className="text-amber-300 text-[10px] font-bold uppercase tracking-widest mb-1.5">{eyebrow}</p>
                <p className="font-display text-white font-semibold text-xl sm:text-2xl leading-tight">{title}</p>
                <p className="text-white/60 text-xs sm:text-sm mt-1">{sub}</p>
              </div>
            </motion.div>
          ))}

          {/* Gaming video */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative overflow-hidden rounded-2xl shadow-lg ring-1 ring-stone-900/5 h-72 sm:h-80"
          >
            <video
              src="/cabin/cabin-tour.mp4"
              autoPlay loop muted playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
            <div className="absolute top-4 right-4">
              <span className="flex items-center gap-1 bg-black/60 border border-amber-400/30
                               backdrop-blur-sm text-amber-300 text-[9px] font-bold uppercase
                               tracking-widest px-2.5 py-1 rounded-full">
                <Gamepad2 className="h-2.5 w-2.5" /> Exclusive
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
              <p className="text-amber-300 text-[10px] font-bold uppercase tracking-widest mb-1.5">Entertainment</p>
              <p className="font-display text-white font-semibold text-xl sm:text-2xl leading-tight">Slot Gaming Lounge</p>
              <p className="text-white/60 text-xs sm:text-sm mt-1">Where the night comes alive</p>
            </div>
          </motion.div>
        </div>

        {/* 3-up feature tiles */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5"
        >
          {FEATURES.map(({ Icon, label, sub }) => (
            <div key={label}
              className="bg-[#FBF5E8] border border-amber-900/10 rounded-xl shadow-sm hover:shadow-md hover:border-amber-700/30
                         transition-all duration-200 flex flex-col gap-3 p-5">
              <div className="p-2 rounded-lg bg-amber-700/10 w-fit">
                <Icon className="h-5 w-5 text-amber-800" />
              </div>
              <div>
                <p className="text-stone-900 text-sm font-bold leading-tight">{label}</p>
                <p className="text-stone-600 text-xs mt-0.5 leading-tight">{sub}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* CTA banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="mt-6 bg-stone-900 rounded-2xl shadow-lg p-5 sm:p-6"
        >
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative h-20 w-16 sm:h-44 sm:w-36 shrink-0 rounded-xl overflow-hidden ring-1 ring-white/10">
              <Image
                src="/cabin/entry/entry-2.jpg"
                fill
                className="object-cover"
                alt="Relaxin Cabins entrance sign"
                sizes="144px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-amber-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-1 sm:mb-1.5">You&apos;re Almost There</p>
              <p className="font-display text-white font-semibold text-lg sm:text-2xl leading-tight">
                Ready to experience it yourself?
              </p>
              <p className="text-white/50 text-sm mt-1 hidden sm:block">Book your stay and arrive to your perfect retreat in Wisconsin.</p>
            </div>
            <Link href="/rooms" className="shrink-0 hidden sm:block">
              <Button variant="premium" className="gap-2 px-7">
                Browse Cabins <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Mobile: subtext + full-width button below the row */}
          <p className="text-white/50 text-sm mt-3 sm:hidden">Book your stay and arrive to your perfect retreat in Wisconsin.</p>
          <Link href="/rooms" className="block mt-4 sm:hidden">
            <Button variant="premium" className="gap-2 w-full">
              Browse Cabins <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
