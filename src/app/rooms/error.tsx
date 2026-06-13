'use client';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export default function RoomsError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-stone-50 pt-20 flex items-center justify-center">
      <div className="text-center">
        <p className="text-stone-500 mb-4">Failed to load rooms. Please try again.</p>
        <Button onClick={reset} variant="premium" className="gap-2">
          <RefreshCw className="h-4 w-4" /> Retry
        </Button>
      </div>
    </div>
  );
}
