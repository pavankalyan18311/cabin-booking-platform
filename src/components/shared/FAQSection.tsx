'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';

const faqs = [
  { q:'How do I make a reservation?',         a:"Browse our 7 rentals, pick your cabin, choose your dates, and complete the booking form. You'll receive instant confirmation via email." },
  { q:'What is your cancellation policy?',    a:'We work with Vacasa as our property management company. Cancellation terms are outlined in your rental agreement at the time of booking. Contact us at 608-350-0800 with any questions.' },
  { q:'Are pets allowed?',                    a:'Yes — all 7 rentals at Relaxin Cabins are pet-friendly. Just bring your furry family member and enjoy the property together.' },
  { q:'Is there a minimum stay requirement?', a:'Minimum stay requirements vary by rental and season. Check individual rental listings for specific stay requirements, or call us at 608-350-0800.' },
  { q:'What amenities are included?',         a:'Every rental includes a full kitchen, fire pit, fireplace or stove, private porch, and BBQ grill. The Luxe adds a whirlpool tub and screened porch. The Lodge features a floor-to-ceiling rock fireplace and granite kitchen.' },
  { q:'Where is the property located?',       a:'Relaxin Cabins is at N6768 WI-58, New Lisbon, WI 53950 — minutes from Castle Rock Lake and about 20 min from Wisconsin Dells. Open year-round.' },
];

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Bold left border accent */}
      <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-amber-400 via-orange-400 to-rose-400" />

      {/* Large background number — hidden on mobile to prevent overflow */}
      <div className="hidden sm:block absolute right-8 top-1/2 -translate-y-1/2 text-[220px] font-black text-stone-50 leading-none select-none pointer-events-none">
        FAQ
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
          className="mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-widest mb-4">
            Help center
          </span>
          <h2 className="text-4xl md:text-6xl font-black text-stone-900 leading-tight">
            Got
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500"> Questions?</span>
          </h2>
          <p className="text-stone-500 mt-3 text-base">Everything you need to know before you book.</p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div key={i}
              initial={{ opacity:0, x:-20 }} whileInView={{ opacity:1, x:0 }}
              viewport={{ once:true }} transition={{ delay: i * 0.06 }}
              className={`rounded-2xl overflow-hidden border-2 transition-all duration-200 ${open === i ? 'border-amber-400 shadow-lg shadow-amber-100' : 'border-stone-100 hover:border-stone-200'}`}>
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left group">
                <span className={`font-bold pr-4 text-sm sm:text-base transition-colors ${open === i ? 'text-amber-700' : 'text-stone-900'}`}>
                  {faq.q}
                </span>
                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${open === i ? 'bg-amber-500 rotate-0' : 'bg-stone-100 group-hover:bg-stone-200'}`}>
                  {open === i
                    ? <X className="h-4 w-4 text-white" />
                    : <Plus className="h-4 w-4 text-stone-600" />
                  }
                </div>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }}
                    exit={{ height:0, opacity:0 }} transition={{ duration:0.22 }}>
                    <div className="px-5 pb-5">
                      <div className="h-px bg-gradient-to-r from-amber-300 to-orange-200 mb-4" />
                      <p className="text-stone-600 text-sm leading-relaxed">{faq.a}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
