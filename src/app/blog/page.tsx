import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Tips, guides, and stories from Relaxin Cabins.',
};

export default function BlogPage() {
  return (
    <div className="bg-white pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

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

        <div className="py-20 text-center text-stone-400">
          <p className="text-lg font-medium">Posts coming soon.</p>
          <p className="text-sm mt-2">Check back later for stories and guides from Relaxin Cabins.</p>
        </div>

        <div className="text-center mt-6">
          <Link href="/rooms"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-amber-200">
            Browse Cabins <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
