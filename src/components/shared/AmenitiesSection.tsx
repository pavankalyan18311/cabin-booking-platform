'use client';
import { motion } from 'framer-motion';
import { Wifi, Flame, Droplets, TreePine, Dog, ChefHat, Car, Mountain } from 'lucide-react';

const amenities = [
  { icon: Wifi,     title: 'High-Speed WiFi',  desc: 'Stay connected — or blissfully forget to',   bg: 'bg-sky-400',      text: 'text-sky-900'     },
  { icon: Flame,    title: 'Stone Fireplace',  desc: 'Crackling warmth on cool Wisconsin nights',  bg: 'bg-orange-400',   text: 'text-orange-900'  },
  { icon: Droplets, title: 'Private Hot Tub',  desc: 'Sink in. Stars above. The world can wait.',  bg: 'bg-teal-400',     text: 'text-teal-900'    },
  { icon: TreePine, title: 'Forest Setting',   desc: 'Ancient trees, fresh air, pure silence',     bg: 'bg-emerald-400',  text: 'text-emerald-900' },
  { icon: Dog,      title: 'Pet Friendly',     desc: 'Your furry family belongs here too',         bg: 'bg-amber-400',    text: 'text-amber-900'   },
  { icon: ChefHat,  title: 'Gourmet Kitchen',  desc: 'Cook together, eat well, linger longer',     bg: 'bg-rose-400',     text: 'text-rose-900'    },
  { icon: Car,      title: 'Free Parking',     desc: 'Pull right up — your spot is waiting',       bg: 'bg-slate-400',    text: 'text-slate-900'   },
  { icon: Mountain, title: 'Scenic Views',     desc: 'Every window frames something worth waking up for', bg: 'bg-violet-400', text: 'text-violet-900' },
];

export default function AmenitiesSection() {
  return (
    <section id="amenities" className="py-24 bg-emerald-900 relative overflow-hidden">
      {/* Decorative large text watermark */}
      <div className="absolute top-0 left-0 right-0 flex justify-center pointer-events-none select-none overflow-hidden">
        <span className="text-[160px] sm:text-[200px] font-black text-emerald-800 leading-none whitespace-nowrap opacity-60">
          AMENITIES
        </span>
      </div>

      {/* Bottom warm glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-amber-400/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
          className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-700 text-emerald-200 text-xs font-bold uppercase tracking-widest mb-4">
            What&apos;s included
          </span>
          <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
            World-Class
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-300">
              Amenities
            </span>
          </h2>
          <p className="text-emerald-300 mt-4 max-w-xl mx-auto text-base">
            Thoughtfully crafted for guests who refuse to compromise — the finest luxuries, hidden deep in the heart of nature.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {amenities.map((a, i) => (
            <motion.div key={a.title}
              initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }} transition={{ delay: i * 0.06 }}
              whileHover={{ y:-6, scale:1.03 }}
              className="group bg-white rounded-2xl p-5 sm:p-6 shadow-xl cursor-default transition-all duration-300">
              <div className={`inline-flex p-3 rounded-xl ${a.bg} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <a.icon className={`h-5 w-5 ${a.text}`} />
              </div>
              <h3 className="font-bold text-stone-900 text-sm mb-1.5">{a.title}</h3>
              <p className="text-stone-500 text-xs leading-relaxed">{a.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
