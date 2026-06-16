'use client';
import { motion } from 'framer-motion';
import { Home, Users, Star, Award } from 'lucide-react';

const stats = [
  { icon: Home,  value: '7',   label: 'Unique Rentals',  sub: 'New Lisbon, Wisconsin'        },
  { icon: Users, value: '4',   label: 'Rental Styles',   sub: 'Cabins · Loft · Luxe · Lodge' },
  { icon: Star,  value: '5.0', label: 'Guest Rating',    sub: 'Across all rentals'           },
  { icon: Award, value: '2',   label: 'Private Ponds',   sub: 'Beachside & wooded settings'  },
];

export default function StatsSection() {
  return (
    <section className="bg-stone-950 py-16 relative overflow-hidden">
      {/* Subtle ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-700/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-stone-700/60 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 divide-x divide-stone-800">
          {stats.map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center text-center px-6 py-8 group">
              <div className="p-2.5 bg-amber-600/15 border border-amber-600/20 rounded-xl mb-4 group-hover:bg-amber-600/25 transition-colors">
                <s.icon className="h-5 w-5 text-amber-500" />
              </div>
              <div className="text-4xl sm:text-5xl font-black text-white leading-none mb-2 tabular-nums tracking-tight
                bg-gradient-to-b from-white to-stone-300 bg-clip-text text-transparent">
                {s.value}
              </div>
              <div className="text-sm font-bold text-stone-300 mb-0.5">{s.label}</div>
              <div className="text-xs text-stone-600">{s.sub}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
