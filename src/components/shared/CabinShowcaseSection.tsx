'use client';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, MapPin, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';


export default function CabinShowcaseSection() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="bg-dual-blend py-20 sm:py-28 px-4 sm:px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-4">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-amber-400" />
            <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">
              N6768 WI-58, New Lisbon, WI
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
            The Full{' '}
            <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-orange-300 bg-clip-text text-transparent">
              Relaxin Experience
            </span>
          </h2>
          <p className="text-white/55 mt-3 text-base sm:text-lg max-w-xl mx-auto">
            Premium amenities, private grounds &amp; one-of-a-kind entertainment — all included with your stay.
          </p>
        </motion.div>

        {/* Hero row: exterior + gaming video — equal size, maximum impact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Waterfront exterior */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative rounded-2xl overflow-hidden h-72 sm:h-96 lg:h-[420px] group"
          >
            <Image
              src="/rooms/the-loft/Room1.jpg"
              fill
              priority
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              alt="Relaxin Cabins waterfront exterior"
              sizes="(max-width: 640px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5">
              <p className="text-amber-300 text-[10px] font-bold uppercase tracking-widest mb-1">Private Property</p>
              <p className="text-white font-black text-xl sm:text-2xl leading-snug">
                Waterfront Retreat<br />
                <span className="text-white/70 font-normal text-sm">Sandy beach · Open grounds · Pure nature</span>
              </p>
            </div>
          </motion.div>

          {/* Slot gaming video — unique selling point */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative rounded-2xl overflow-hidden h-72 sm:h-96 lg:h-[420px]"
          >
            <video
              src="/cabin/cabin-tour.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

            {/* Badge */}
            <div className="absolute top-4 right-4">
              <span className="flex items-center gap-1.5 bg-amber-400/20 border border-amber-400/40
                               backdrop-blur-sm text-amber-300 text-[10px] font-bold uppercase
                               tracking-widest px-3 py-1.5 rounded-full">
                <Gamepad2 className="h-3 w-3" />
                Exclusive Feature
              </span>
            </div>

            <div className="absolute bottom-5 left-5 right-5">
              <p className="text-amber-300 text-[10px] font-bold uppercase tracking-widest mb-1">Entertainment</p>
              <p className="text-white font-black text-xl sm:text-2xl leading-snug">
                Slot Gaming Lounge<br />
                <span className="text-white/70 font-normal text-sm">Vegas-style fun right inside your cabin</span>
              </p>
            </div>
          </motion.div>
        </div>


        {/* CTA strip with welcome sign shown in full portrait ratio */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center gap-6
                     bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-5 sm:p-6"
        >
          {/* Welcome sign — portrait ratio so the full sign shows */}
          <div className="relative w-36 sm:w-40 shrink-0 aspect-[3/4] rounded-xl overflow-hidden shadow-xl">
            <Image
              src="/cabin/entry/entry-2.jpg"
              fill
              className="object-cover object-center"
              alt="Relaxin Cabins welcome sign"
              sizes="160px"
            />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <p className="text-amber-300 text-xs font-bold uppercase tracking-widest mb-1">You&apos;re Almost There</p>
            <p className="text-white font-black text-xl">Ready to experience it yourself?</p>
            <p className="text-white/50 text-sm mt-1">Book your stay and arrive to your perfect retreat in Wisconsin.</p>
          </div>

          <div className="shrink-0">
            <Link href="/rooms">
              <Button variant="premium" className="gap-2 px-7">
                Browse Cabins <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
