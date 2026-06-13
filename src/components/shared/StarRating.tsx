'use client';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export default function StarRating({ rating, max = 5, size = 'md', interactive = false, onChange }: StarRatingProps) {
  const sizes = { sm: 'h-3 w-3', md: 'h-4 w-4', lg: 'h-5 w-5' };

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.floor(rating);
        const partial = !filled && i < rating;

        return (
          <button
            key={i}
            type={interactive ? 'button' : undefined}
            onClick={interactive && onChange ? () => onChange(i + 1) : undefined}
            className={cn(interactive && 'cursor-pointer hover:scale-110 transition-transform')}
            disabled={!interactive}
          >
            <Star
              className={cn(
                sizes[size],
                filled || partial ? 'fill-amber-400 text-amber-400' : 'fill-stone-200 text-stone-200'
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
