import type { Metadata } from 'next';
import { Mail, MapPin, Heart, Star, Users, Mountain } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Careers',
  description: 'Join the Relaxin Cabins team. We\'re looking for people who love the outdoors, hospitality, and making guests feel at home.',
};

const perks = [
  { icon: Mountain, title: 'Work Where You Love',    desc: 'Our team is based in beautiful New Lisbon, WI — surrounded by lakes, forests, and fresh air.' },
  { icon: Heart,    title: 'Meaningful Work',        desc: 'Every booking you help with creates a memory for a family or couple. That matters.' },
  { icon: Star,     title: 'Grow With Us',           desc: 'We\'re a small, growing team. Your contributions have real impact from day one.' },
  { icon: Users,    title: 'Tight-Knit Team',        desc: 'No corporate red tape. Just a passionate group of people who love what they do.' },
];

const openings = [
  {
    title: 'Guest Experience Coordinator',
    type: 'Full-time',
    location: 'New Lisbon, WI',
    desc: 'Be the first point of contact for our guests — handling inquiries, reservations, and making sure every stay starts on the right foot.',
  },
  {
    title: 'Property Maintenance Technician',
    type: 'Full-time',
    location: 'New Lisbon, WI',
    desc: 'Keep our cabins in pristine condition. You\'ll handle routine maintenance, coordinate repairs, and ensure every property meets our quality standards.',
  },
  {
    title: 'Social Media & Content Creator',
    type: 'Part-time / Remote',
    location: 'Remote',
    desc: 'Share the beauty of Relaxin Cabins with the world. Create compelling content across Instagram, TikTok, and our blog to grow our community.',
  },
];

export default function CareersPage() {
  return (
    <div className="bg-white pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-stone-100 text-stone-500 text-xs font-semibold uppercase tracking-widest mb-4">
            Join Our Team
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-stone-900 mb-5">
            Come Work in
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-500"> Paradise</span>
          </h1>
          <p className="text-stone-500 text-lg max-w-xl mx-auto leading-relaxed">
            We're a small but mighty team on a mission to give every guest the best cabin experience of their life.
            If that excites you, we'd love to hear from you.
          </p>
        </div>

        {/* Perks */}
        <div className="grid sm:grid-cols-2 gap-5 mb-16">
          {perks.map((p) => (
            <div key={p.title} className="flex gap-4 p-5 bg-stone-50 rounded-2xl border border-stone-100">
              <div className="p-2.5 bg-amber-100 rounded-xl h-fit">
                <p.icon className="h-5 w-5 text-amber-700" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 mb-1">{p.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Open roles */}
        <div className="mb-16">
          <h2 className="text-2xl font-black text-stone-900 mb-7">Open Positions</h2>
          <div className="space-y-4">
            {openings.map((job) => (
              <div key={job.title} className="border border-stone-200 rounded-2xl p-6 hover:border-amber-300 hover:shadow-md transition-all">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <h3 className="font-bold text-stone-900 text-lg">{job.title}</h3>
                  <div className="flex gap-2 text-xs">
                    <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full font-semibold">{job.type}</span>
                    <span className="px-2.5 py-1 bg-stone-100 text-stone-600 rounded-full flex items-center gap-1 font-semibold">
                      <MapPin className="h-3 w-3" />{job.location}
                    </span>
                  </div>
                </div>
                <p className="text-stone-500 text-sm leading-relaxed mb-4">{job.desc}</p>
                <a href={`mailto:relaxingatcabins@gmail.com?subject=Application: ${encodeURIComponent(job.title)}`}
                  className="inline-flex items-center gap-2 text-sm font-bold text-amber-700 hover:text-amber-900 transition-colors">
                  <Mail className="h-4 w-4" /> Apply via email
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* General CTA */}
        <div className="bg-emerald-900 rounded-3xl p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-800 to-emerald-950 rounded-3xl" />
          <div className="relative">
            <h2 className="text-2xl font-black text-white mb-3">Don't See the Right Role?</h2>
            <p className="text-emerald-300 mb-6 text-sm max-w-md mx-auto">
              We're always open to meeting passionate people. Send us a note about yourself and how you'd like to contribute.
            </p>
            <a href="mailto:relaxingatcabins@gmail.com?subject=General Application"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold px-7 py-3 rounded-xl transition-colors shadow-lg shadow-amber-900/40">
              <Mail className="h-4 w-4" /> Send a General Application
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
