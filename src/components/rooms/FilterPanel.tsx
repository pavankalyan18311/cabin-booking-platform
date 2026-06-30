'use client';
import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSearchStore } from '@/store';
import type { RoomCategory } from '@/types';

const CATEGORIES: { value: RoomCategory; label: string }[] = [
  { value: 'cabin', label: 'Cabin' },
  { value: 'lodge', label: 'Lodge' },
  { value: 'cottage', label: 'Cottage' },
  { value: 'villa', label: 'Villa' },
  { value: 'chalet', label: 'Chalet' },
];

export default function FilterPanel({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { filters, setFilters, clearFilters } = useSearchStore();

  const activeFilterCount =
    (filters.category ? 1 : 0) +
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0);
  const hasActiveFilters = activeFilterCount > 0;

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => onOpenChange(!open)}
        className={`gap-2 ${hasActiveFilters ? 'border-amber-500 text-amber-700' : ''}`}
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
        {hasActiveFilters && (
          <span className="bg-amber-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-[55]" onClick={() => onOpenChange(false)} />
          <div className="absolute top-[calc(100%+0.5rem)] right-0 z-[56] bg-white rounded-2xl shadow-2xl border border-stone-100 p-5 w-72 max-w-[calc(100vw-2rem)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-stone-900">Filters</h3>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              title="Close filters"
              aria-label="Close filters"
              className="p-1 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <X className="h-4 w-4 text-stone-500" />
            </button>
          </div>

          {/* Category */}
          <div className="mb-4">
            <Label className="text-xs uppercase tracking-wide text-stone-500 mb-2 block">Category</Label>
            <Select
              value={filters.category ?? ''}
              onValueChange={(v) => setFilters({ category: v as RoomCategory })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price range */}
          <div className="mb-4">
            <Label className="text-xs uppercase tracking-wide text-stone-500 mb-2 block">Price per night</Label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice ?? ''}
                onChange={(e) => setFilters({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
                className="flex-1 min-w-0 h-9 rounded-xl border border-stone-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice ?? ''}
                onChange={(e) => setFilters({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
                className="flex-1 min-w-0 h-9 rounded-xl border border-stone-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { clearFilters(); onOpenChange(false); }}
              className="w-full text-amber-600 hover:text-amber-700 hover:bg-amber-50"
            >
              Clear all filters
            </Button>
          )}
          </div>
        </>
      )}
    </div>
  );
}
