'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronDown, ChevronUp } from 'lucide-react';

const testimonials = [
  {
    name: 'C. S. Favia',
    av: 'CF',
    title: 'Great Place to Vacation W/Dogs',
    text: "Couldn't ask for a better host then Chas! This will be our 3rd year vacationing with our Yorkies! They love it and so do we. Clean cabins, stocked with everything you need and beautiful views!",
    badge: 'Guests with pets',
    date: 'January 2021',
    bg: 'bg-amber-50', border: 'border-amber-200', quote: 'text-amber-400', badgeCls: 'bg-amber-100 text-amber-800',
  },
  {
    name: 'Liane Baranek',
    av: 'LB',
    title: 'Wisconsin',
    text: "Happily recommend vacationing at Relaxin' Cabins! Our large family rented all the different units, and it was beyond perfect. We spent a lot of time in the swimming pond during the day, and lounging around campfires in the evening. Chas is a wonderful and thoughtful host. The units are unique, clean, and very well equipped. They've thought of everything to make your stay complete. We are already booked again for next year!",
    badge: 'Group stay',
    date: 'July 2020',
    bg: 'bg-emerald-50', border: 'border-emerald-200', quote: 'text-emerald-400', badgeCls: 'bg-emerald-100 text-emerald-800',
  },
  {
    name: 'Brie',
    av: 'BR',
    title: 'So much fun!',
    text: "We had the best weekend at the Loft! We went as a group of friends, some from out of state, and our pup! The Loft had absolutely everything that we could have needed! It was clean, beautiful, and so much fun! Chas was so kind and helpful with any and all questions! It was the perfect weekend trip and we plan to come back!",
    badge: 'Group stay',
    date: 'June 2020',
    bg: 'bg-rose-50', border: 'border-rose-200', quote: 'text-rose-400', badgeCls: 'bg-rose-100 text-rose-800',
  },
  {
    name: 'Nicollette Boss',
    av: 'NB',
    title: 'Great place and great host! Highly recommend!!',
    text: "Great location and great place to stay! The host was very accommodating. Thank you so much!!",
    badge: 'Group stay',
    date: 'March 2020',
    bg: 'bg-violet-50', border: 'border-violet-200', quote: 'text-violet-400', badgeCls: 'bg-violet-100 text-violet-800',
  },
  {
    name: 'Roxanna Dunaway',
    av: 'RD',
    title: 'Wo-Zha-Wa Weekend 2019',
    text: "Stayed for Wo-Zha-Wa weekend with our extended family, and we could not have been more pleased with the property. Beautiful and well maintained, each cabin had it's own personality and charm. The campfire area was perfect to gather around. The children enjoyed playing in the soft sand on the banks of the pond. We can't wait for our visit next year!",
    badge: 'Group stay',
    date: 'September 2019',
    bg: 'bg-sky-50', border: 'border-sky-200', quote: 'text-sky-400', badgeCls: 'bg-sky-100 text-sky-800',
  },
  {
    name: 'Stephanie',
    av: 'ST',
    title: 'Great place to stay!',
    text: "This place was perfect for a family vacation! The loft was stocked with everything you could possibly need and so clean. The owners were very accommodating and only a phone call/text away if you needed anything! Great location if you are doing any Castle Rock lake activities as well. Thank you and I'll be back next year!",
    badge: 'Family stay',
    date: 'August 2019',
    bg: 'bg-orange-50', border: 'border-orange-200', quote: 'text-orange-400', badgeCls: 'bg-orange-100 text-orange-800',
  },
  {
    name: 'Wilkins',
    av: 'WI',
    title: 'Vacationer',
    text: "I booked this loft for my family we can never seem to get together even at xmas. There was 6 of us with my grandson whose 4. Cabin was beautiful, clean and had everything you need all the way down to coffee filters. Except for food and clothes that's all we needed to pack. Had toys and games for us all. Just amazing. The grounds are beautiful. Man made pond with 2 beaches. Also pet friendly. The best host Chas, Chrissy and their kids. Great hosts. Don't hesitate — book now, it's great!",
    badge: 'Family with young children',
    date: 'August 2019',
    bg: 'bg-amber-50', border: 'border-amber-200', quote: 'text-amber-400', badgeCls: 'bg-amber-100 text-amber-800',
  },
  {
    name: 'Laura & Chuck',
    av: 'LC',
    title: '1st Birthday Adventure',
    text: "We just returned from our weekend at Relaxin Cabins. It was just wonderful! We rented a majority of the units for a first birthday. Everyone was very happy with the accommodations. The lodge was beautiful, the kitchen had everything you needed, the beds were comfortable and the upgrades were lovely. We had most of our activities at castle rock lake and it was the perfect location. We would recommend it to everyone going to the area and look forward to staying there again.",
    badge: 'Group stay',
    date: 'July 2019',
    bg: 'bg-emerald-50', border: 'border-emerald-200', quote: 'text-emerald-400', badgeCls: 'bg-emerald-100 text-emerald-800',
  },
  {
    name: 'Calvin & Laura Morris',
    av: 'CM',
    title: 'Best place ever!',
    text: "Husband & I had a great time! Everything you could want & then more, the cabin was cute, clean & stocked with everything. The jacuzzi is awesome, and the big walk in shower is a big plus! The kitchen is darling & lots of space, the bed is nice & firm & very comfortable & the fireplace makes it even more cozy. Right outside is a beautiful little pond, with 2 ends of sand for your sunning pleasure. Trust me you won't regret your stay here & Chas makes sure your stay is comfortable.",
    badge: 'Mature couple',
    date: 'June 2019',
    bg: 'bg-rose-50', border: 'border-rose-200', quote: 'text-rose-400', badgeCls: 'bg-rose-100 text-rose-800',
  },
  {
    name: 'Alyssa Phelps',
    av: 'AP',
    title: 'Awesome Cabins with Attention to Detail!',
    text: "I would highly recommend a trip to the Relaxin Cabins Vacation Rentals! I stayed in Cabin #1 with family in January. We enjoyed cooking and grilling food that we picked up from a nice grocery store just down the road (Hwy 58). The cabin was SO clean and even had new kitchen appliances! The living room had a cozy gas fireplace and a comfy couch that could pull out into a bed, which the kids loved. The resort had so much attention to detail that it felt like a home away from home. Also, we drove to the Wisconsin Dells — only about 20 min away!",
    badge: 'Family with young children',
    date: 'January 2019',
    bg: 'bg-violet-50', border: 'border-violet-200', quote: 'text-violet-400', badgeCls: 'bg-violet-100 text-violet-800',
  },
  {
    name: 'Nate Proud',
    av: 'NP',
    title: 'Great Experience',
    text: "What a great place to take a group of friends and get away! Had an amazing time in the loft! Will be back again for the summer!",
    badge: 'Group stay',
    date: 'Summer stay',
    bg: 'bg-sky-50', border: 'border-sky-200', quote: 'text-sky-400', badgeCls: 'bg-sky-100 text-sky-800',
  },
  {
    name: 'Ken & Marie',
    av: 'KM',
    title: 'Amazing',
    text: "Very nice place and clean and friendly — would definitely stay there again.",
    badge: 'Family with older children',
    date: 'Family stay',
    bg: 'bg-orange-50', border: 'border-orange-200', quote: 'text-orange-400', badgeCls: 'bg-orange-100 text-orange-800',
  },
  {
    name: 'Justice Lawson',
    av: 'JL',
    title: 'Wonderful!',
    text: "My new hubby and I decided to book the Luxe cabin for a short honeymoon after our wedding and it was a great choice! The cabin was beautiful and very cozy for a week indoors for two. We also brought our chocolate lab with us and she loved it immediately! The owners, Chas and Chrissy, were both so helpful upon check in and were very nice and welcoming. They also gave us our space and left a contact number just in case. I highly recommend and will be planning another stay in the future!",
    badge: 'Young couple',
    date: 'Honeymoon stay',
    bg: 'bg-amber-50', border: 'border-amber-200', quote: 'text-amber-400', badgeCls: 'bg-amber-100 text-amber-800',
  },
];

const AVATAR_GRADS = [
  'from-amber-500 to-orange-500', 'from-emerald-500 to-teal-500',
  'from-rose-500 to-pink-500',    'from-violet-500 to-purple-500',
  'from-sky-500 to-blue-500',     'from-orange-500 to-red-500',
];

const INITIAL_COUNT = 6;

export default function TestimonialsSection() {
  const [showAll, setShowAll] = useState(false);

  const visible = showAll ? testimonials : testimonials.slice(0, INITIAL_COUNT);
  const hidden = testimonials.length - INITIAL_COUNT;

  return (
    <section id="testimonials" className="py-24 bg-[#FFFDF5] relative overflow-hidden">
      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-[200px] font-black text-amber-100 leading-none select-none pointer-events-none">
        &ldquo;
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-widest mb-4">
            Guest stories
          </span>
          <h2 className="text-4xl md:text-6xl font-black text-stone-900 leading-tight">
            Real People,
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-rose-500">
              Real Magic
            </span>
          </h2>
          <div className="flex items-center justify-center gap-1 mt-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
            ))}
            <span className="ml-2 font-bold text-stone-900">5.0</span>
            <span className="text-stone-400 text-sm ml-1">({testimonials.length} verified reviews)</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence initial={false}>
            {visible.map((t, i) => (
              <motion.div key={t.name}
                initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
                transition={{ delay: i < INITIAL_COUNT ? i * 0.08 : (i - INITIAL_COUNT) * 0.06 }}
                whileHover={{ y: -5 }}
                className={`${t.bg} border-2 ${t.border} rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300`}>
                <Quote className={`h-8 w-8 ${t.quote} mb-3 opacity-60`} />
                <h3 className="text-sm font-bold text-stone-900 mb-2">{t.title}</h3>
                <p className="text-stone-700 text-sm leading-relaxed mb-4 line-clamp-4">
                  &ldquo;{t.text}&rdquo;
                </p>
                <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${t.badgeCls} mb-5`}>
                  {t.badge}
                </span>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${AVATAR_GRADS[i % AVATAR_GRADS.length]} flex items-center justify-center text-xs font-black text-white shadow-md`}>
                      {t.av}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-stone-900">{t.name}</div>
                      <div className="text-xs text-stone-400">{t.date}</div>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className="h-3 w-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Show More / Show Less */}
        <div className="flex justify-center mt-10">
          <button
            type="button"
            onClick={() => setShowAll(v => !v)}
            className="flex items-center gap-2 px-8 py-3 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
          >
            {showAll ? (
              <>Show Less <ChevronUp className="h-4 w-4" /></>
            ) : (
              <>Show {hidden} More Reviews <ChevronDown className="h-4 w-4" /></>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
