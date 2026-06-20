import type { Metadata } from 'next';
import {
  Trees, Waves, Home, Utensils, Flame, Wind, Star,
  MapPin, Phone, Mail, CalendarCheck, ShieldCheck, Sparkles,
  ChevronRight, AlertCircle,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us — Relaxin Cabins',
  description: 'Seven unique rentals in New Lisbon, WI — traditional log cabins, lakeside luxury suites, and a grand lodge. Open year-round near Castle Rock Lake.',
};

// ── Rental groups ─────────────────────────────────────────────────────────────
const rentalGroups = [
  {
    icon: Trees,
    label: 'The Cabins',
    count: '4 units',
    names: ['The Lookout', 'The Leisure', 'The Landing', 'The Loghouse'],
    tagline: 'Tucked into the woods around Little Pond',
    description:
      'Traditional log cabins nestled at the back of the property, each with its own secluded firepit gathering area. Surrounded by trees, these cabins offer the classic Wisconsin cabin feel — private, peaceful, and close to nature.',
    highlights: ['Secluded firept areas', 'Little Pond access', 'Deep-woods privacy', 'Traditional log construction'],
    accent: 'emerald',
    gradient: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-800',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-700',
  },
  {
    icon: Waves,
    label: 'The Luxe & Loft',
    count: '2 units',
    names: ['The Luxe', 'The Loft'],
    tagline: 'Beachside luxury on the shores of the second pond',
    description:
      'The upgraded version of the traditional cabin experience. Newer rentals with an open, beachy feel sitting right on the shores of the second pond. Every detail has been thoughtfully designed for comfort and style.',
    highlights: ['Screened porch', 'Custom wall fireplace', 'Whirlpool tub + separate shower', 'Hickory flooring'],
    accent: 'amber',
    gradient: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-800',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-700',
  },
  {
    icon: Home,
    label: 'The Lodge',
    count: '1 unit',
    names: ['The Lodge'],
    tagline: 'A grand log home with open sunset views',
    description:
      'Positioned at the entrance of the property with sweeping views of the sunset and night sky. A deluxe kitchen with granite countertops and stainless appliances, a floor-to-ceiling rock fireplace, and a cobblestone patio fire pit right off the front porch. The Loft is next door — ideal for larger groups taking over neighboring units.',
    highlights: ['Floor-to-ceiling rock fireplace', 'Deluxe granite kitchen', 'Cobblestone patio fire pit', 'Sunset & stargazing views'],
    accent: 'rose',
    gradient: 'from-rose-500 to-pink-600',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    badge: 'bg-rose-100 text-rose-800',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-700',
  },
];

// ── Universal amenities ───────────────────────────────────────────────────────
const universalAmenities = [
  { icon: Utensils, label: 'Full Kitchen' },
  { icon: Flame,    label: 'Fire Pit' },
  { icon: Sparkles, label: 'Fireplace / Stove' },
  { icon: Wind,     label: 'Private Porch' },
  { icon: Star,     label: 'BBQ Grill' },
];

// ── Location highlights ───────────────────────────────────────────────────────
const locationHighlights = [
  { icon: CalendarCheck, title: 'Open Year-Round',        desc: 'Every season is a great season at Relaxin Cabins.' },
  { icon: Waves,         title: 'Castle Rock Lake',       desc: 'Minutes away — Wisconsin\'s premier recreational lake.' },
  { icon: MapPin,        title: '20 min to Wisconsin Dells', desc: 'Dining, shopping, and entertainment just a short drive away.' },
];

// ── COVID policies ────────────────────────────────────────────────────────────
const covidMeasures = [
  {
    title: 'Contactless Check-In',
    desc: 'We encourage all guests to check in virtually to maintain social distancing guidelines.',
    icon: ShieldCheck,
  },
  {
    title: 'Enhanced Cleaning',
    desc: 'Extra sanitation measures are in place between every guest stay — all touch surfaces, door handles, appliances, faucets, and light switches are disinfected.',
    icon: Sparkles,
  },
  {
    title: 'Flexible Cancellation',
    desc: 'We currently offer a no-questions-asked cancellation policy until further notice. Review our Rental Agreement for full details.',
    icon: CalendarCheck,
  },
];

export default function AboutPage() {
  return (
    <div className="bg-white">

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="bg-emerald-900 pt-28 pb-24 relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-emerald-800 rounded-full opacity-40 pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[200px] bg-amber-400/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-700 text-emerald-200 text-xs font-bold uppercase tracking-widest mb-5">
            New Lisbon, Wisconsin
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight mb-6">
            7 Rentals.
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-300">
              4 Styles. One Property.
            </span>
          </h1>
          <p className="text-emerald-200 text-lg max-w-2xl mx-auto leading-relaxed">
            Traditional log cabins, beachside luxury suites, and a grand lodge — all on one beautiful
            property along WI-58. Open year-round, pet-friendly, and minutes from Castle Rock Lake.
          </p>
          {/* Quick stat row */}
          <div className="mt-10 flex flex-wrap justify-center gap-8">
            {[
              { value: '7', label: 'Total Rentals' },
              { value: '4', label: 'Unique Styles' },
              { value: '2', label: 'Private Ponds' },
              { value: '5★', label: 'Avg. Guest Rating' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-black text-amber-300">{s.value}</div>
                <div className="text-emerald-300 text-xs mt-1 uppercase tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Rental type cards ─────────────────────────────────────────────────── */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-widest mb-4">
            The Rentals
          </span>
          <h2 className="text-4xl font-black text-stone-900">
            Find Your Perfect Stay
          </h2>
          <p className="text-stone-500 mt-3 max-w-2xl mx-auto">
            Every rental is decorated with unique items from local artists, antique stores, and nearby
            places — no two are alike.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {rentalGroups.map((g) => (
            <div key={g.label}
              className={`${g.bg} border-2 ${g.border} rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300`}>

              {/* Card header */}
              <div className={`bg-gradient-to-br ${g.gradient} p-8 text-white relative overflow-hidden`}>
                <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full" />
                <div className="absolute -bottom-10 -left-6 w-40 h-40 bg-black/10 rounded-full" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                      <g.icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                      {g.count}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black mb-1">{g.label}</h3>
                  <p className="text-white/80 text-sm">{g.tagline}</p>
                </div>
              </div>

              {/* Unit names */}
              <div className="px-6 pt-5 pb-2 flex flex-wrap gap-2">
                {g.names.map((n) => (
                  <span key={n} className={`text-xs font-semibold px-3 py-1 rounded-full ${g.badge}`}>
                    {n}
                  </span>
                ))}
              </div>

              {/* Description */}
              <div className="px-6 py-4">
                <p className="text-stone-600 text-sm leading-relaxed">{g.description}</p>
              </div>

              {/* Highlights */}
              <div className="px-6 pb-7">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Highlights</p>
                <ul className="space-y-2">
                  {g.highlights.map((h) => (
                    <li key={h} className="flex items-center gap-2 text-sm text-stone-700">
                      <ChevronRight className={`h-4 w-4 flex-shrink-0 text-${g.accent}-500`} />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Universal amenities ───────────────────────────────────────────────── */}
      <section className="bg-stone-900 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-3">Included in Every Rental</p>
          <h2 className="text-2xl font-black text-white mb-10">Everything You Need, Already There</h2>
          <div className="flex flex-wrap justify-center gap-6">
            {universalAmenities.map((a) => (
              <div key={a.label} className="flex flex-col items-center gap-3 bg-white/5 hover:bg-white/10 transition-colors rounded-2xl px-8 py-6 w-36">
                <div className="p-3 bg-amber-400/20 rounded-xl">
                  <a.icon className="h-6 w-6 text-amber-400" />
                </div>
                <span className="text-white text-sm font-semibold text-center">{a.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Location highlights ───────────────────────────────────────────────── */}
      <section className="py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-sky-100 text-sky-700 text-xs font-bold uppercase tracking-widest mb-4">
            Location
          </span>
          <h2 className="text-4xl font-black text-stone-900">The Perfect Base Camp</h2>
          <p className="text-stone-500 mt-3">N6768 WI-58, New Lisbon, WI 53950</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {locationHighlights.map((l) => (
            <div key={l.title} className="bg-sky-50 border-2 border-sky-100 rounded-2xl p-7 text-center hover:shadow-lg transition-shadow">
              <div className="p-3 bg-sky-100 rounded-2xl inline-block mb-4">
                <l.icon className="h-6 w-6 text-sky-700" />
              </div>
              <h3 className="font-bold text-stone-900 mb-2">{l.title}</h3>
              <p className="text-stone-500 text-sm leading-relaxed">{l.desc}</p>
            </div>
          ))}
        </div>

      </section>

      {/* ── COVID Policies ────────────────────────────────────────────────────── */}
      <section className="bg-stone-50 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-teal-100 text-teal-700 text-xs font-bold uppercase tracking-widest mb-4">
              Health & Safety
            </span>
            <h2 className="text-3xl font-black text-stone-900">COVID-19 Policies</h2>
            <p className="text-stone-500 mt-3 max-w-xl mx-auto">
              Our guests are our #1 priority. Here's what we've implemented to keep every stay safe and worry-free.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {covidMeasures.map((m) => (
              <div key={m.title} className="bg-white border border-stone-200 rounded-2xl p-7 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-3 bg-teal-100 rounded-xl inline-block mb-4">
                  <m.icon className="h-5 w-5 text-teal-700" />
                </div>
                <h3 className="font-bold text-stone-900 mb-2">{m.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>

          {/* Liability notice */}
          <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-stone-600 leading-relaxed">
              <strong className="text-stone-800">Please note:</strong> Travel is at your own risk. There are inherent risks involved,
              and Relaxin Cabins is not liable should you become ill during your stay. We appreciate your understanding
              and look forward to welcoming you safely.
            </p>
          </div>
        </div>
      </section>

      {/* ── Contact strip ─────────────────────────────────────────────────────── */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-emerald-900 rounded-3xl p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-800 to-emerald-950 rounded-3xl" />
          <div className="relative">
            <h2 className="text-2xl font-black text-white mb-2">Come Say Hello</h2>
            <p className="text-emerald-300 mb-8 text-sm">We'd love to help you plan your perfect Wisconsin getaway.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
              <a href="tel:6083500800"
                className="flex items-center gap-2 text-white bg-white/10 hover:bg-white/20 px-5 py-3 rounded-xl transition-colors">
                <Phone className="h-4 w-4 text-amber-400" /> 608-350-0800
              </a>
              <a href="mailto:relaxingatcabins@gmail.com"
                className="flex items-center gap-2 text-white bg-white/10 hover:bg-white/20 px-5 py-3 rounded-xl transition-colors">
                <Mail className="h-4 w-4 text-amber-400" /> relaxingatcabins@gmail.com
              </a>
              <div className="flex items-center gap-2 text-white bg-white/10 px-5 py-3 rounded-xl">
                <MapPin className="h-4 w-4 text-amber-400" /> N6768 WI-58, New Lisbon, WI
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
