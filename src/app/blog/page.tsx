import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Tips, guides, and stories about cabin life, Wisconsin travel, and making the most of your Relaxin Cabins escape.',
};

const posts = [
  {
    slug: '#',
    tag: 'Travel Tips',
    title: '10 Things to Pack for Your Wisconsin Cabin Getaway',
    excerpt: 'From bug spray to board games — here\'s our definitive packing list so you can focus on relaxing from the moment you arrive.',
    date: 'May 20, 2026',
    readTime: '4 min read',
    tagColor: 'bg-amber-100 text-amber-700',
  },
  {
    slug: '#',
    tag: 'Local Guide',
    title: 'Exploring Castle Rock Lake: Wisconsin\'s Hidden Gem',
    excerpt: 'Just minutes from our cabins, Castle Rock Lake offers world-class fishing, kayaking, and some of the most stunning sunsets in the Midwest.',
    date: 'May 5, 2026',
    readTime: '6 min read',
    tagColor: 'bg-emerald-100 text-emerald-700',
  },
  {
    slug: '#',
    tag: 'Cabin Life',
    title: 'How to Have the Perfect Campfire Night',
    excerpt: 'The ultimate guide to building the perfect fire, choosing the right firewood, and making s\'mores that will impress even the most seasoned campers.',
    date: 'April 18, 2026',
    readTime: '3 min read',
    tagColor: 'bg-orange-100 text-orange-700',
  },
  {
    slug: '#',
    tag: 'Seasonal',
    title: 'Why Fall is the Best Time to Visit New Lisbon',
    excerpt: 'Crisp air, fiery foliage, and no crowds. We make the case for why autumn is the season you\'ve been missing out on.',
    date: 'April 1, 2026',
    readTime: '5 min read',
    tagColor: 'bg-rose-100 text-rose-700',
  },
  {
    slug: '#',
    tag: 'Family',
    title: 'Kid-Friendly Activities Near Our Cabins',
    excerpt: 'Traveling with kids? Here\'s our guide to the best family-friendly attractions, hiking trails, and rainy-day activities within 30 minutes of your cabin.',
    date: 'March 14, 2026',
    readTime: '7 min read',
    tagColor: 'bg-sky-100 text-sky-700',
  },
  {
    slug: '#',
    tag: 'Wellness',
    title: 'The Science of Why Nature Makes You Feel Better',
    excerpt: 'Research shows that just 20 minutes in nature lowers stress hormones. Here\'s why your cabin weekend is actually good medicine.',
    date: 'March 2, 2026',
    readTime: '5 min read',
    tagColor: 'bg-violet-100 text-violet-700',
  },
];

export default function BlogPage() {
  return (
    <div className="bg-white pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-14">
          <span className="inline-block px-3 py-1 rounded-full bg-stone-100 text-stone-500 text-xs font-semibold uppercase tracking-widest mb-4">
            Stories & Guides
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-stone-900 mb-4">
            The Relaxin Cabin
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-500"> Blog</span>
          </h1>
          <p className="text-stone-500 text-lg max-w-xl">
            Tips, local guides, and cabin stories to inspire your next escape into nature.
          </p>
        </div>

        {/* Featured post */}
        <div className="bg-emerald-900 rounded-3xl overflow-hidden mb-10 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-800 to-emerald-950" />
          <div className="relative p-8 sm:p-12">
            <span className="inline-block px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-bold uppercase tracking-widest mb-4">
              Featured
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3 max-w-xl">
              Your Complete Guide to the Northwoods of Wisconsin
            </h2>
            <p className="text-emerald-300 mb-6 max-w-lg text-sm leading-relaxed">
              Everything you need to know about planning the perfect Wisconsin cabin trip — from the best
              seasons to visit, what to pack, and the top hidden spots only locals know about.
            </p>
            <div className="flex items-center gap-4 text-sm text-emerald-400">
              <span>June 1, 2026</span>
              <span>·</span>
              <span>10 min read</span>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link key={post.title} href={post.slug}
              className="group bg-white border border-stone-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mb-3 ${post.tagColor}`}>
                {post.tag}
              </span>
              <h3 className="font-bold text-stone-900 mb-2 leading-snug group-hover:text-amber-700 transition-colors">
                {post.title}
              </h3>
              <p className="text-stone-500 text-sm leading-relaxed mb-4 line-clamp-3">{post.excerpt}</p>
              <div className="flex items-center justify-between text-xs text-stone-400">
                <span>{post.date}</span>
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />{post.readTime}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-14">
          <p className="text-stone-400 text-sm mb-4">Ready to plan your trip?</p>
          <Link href="/rooms"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-amber-200">
            Browse Cabins <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
