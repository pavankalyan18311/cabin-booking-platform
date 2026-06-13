import Link from 'next/link';
import { Mountain, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex p-5 bg-amber-100 rounded-3xl mb-6">
          <Mountain className="h-12 w-12 text-amber-600" />
        </div>
        <h1 className="text-6xl font-bold text-stone-900 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-stone-700 mb-3">Page not found</h2>
        <p className="text-stone-500 mb-8 leading-relaxed">
          Looks like this trail doesn&apos;t exist. The page you&apos;re looking for may have moved or been removed.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button variant="premium" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Go Home
            </Button>
          </Link>
          <Link href="/rooms">
            <Button variant="outline" className="gap-2">
              <Search className="h-4 w-4" /> Browse Cabins
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
