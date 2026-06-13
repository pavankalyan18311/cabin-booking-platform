'use client';
import { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSearchStore } from '@/store';
import type { RoomCategory } from '@/types';

const AMENITIES = [
  'WiFi', 'Fireplace', 'Kitchen', 'Air Conditioning', 'Heating', 'Fire Pit', 'BBQ Grill',
  'Porch', 'Screened Porch', 'Hot Tub', 'Whirlpool Tub', 'Bathtub',
  'TV / Satellite TV', 'Coffee Maker', 'Ceiling Fans',
  'Washer/Dryer', 'Parking', 'Pet Friendly', 'Pool', 'Mountain View', 'Lakefront',
  'Game Room', 'Kayaks', 'Fishing Access',
];

const CATEGORIES: { value: RoomCategory; label: string }[] = [
  { value: 'cabin', label: 'Cabin' },
  { value: 'lodge', label: 'Lodge' },
  { value: 'cottage', label: 'Cottage' },
  { value: 'villa', label: 'Villa' },
  { value: 'chalet', label: 'Chalet' },
];

export default function FilterPanel() {
  const { filters, setFilters, clearFilters } = useSearchStore();
  const [isOpen, setIsOpen] = useState(false);

  const toggleAmenity = (amenity: string) => {
    const current = filters.amenities ?? [];
    const updated = current.includes(amenity)
      ? current.filter((a) => a !== amenity)
      : [...current, amenity];
    setFilters({ amenities: updated });
  };

  const hasActiveFilters =
    filters.category || filters.minPrice || filters.maxPrice || (filters.amenities?.length ?? 0) > 0;

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className={`gap-2 ${hasActiveFilters ? 'border-amber-500 text-amber-700' : ''}`}
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
        {hasActiveFilters && (
          <span className="bg-amber-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            {(filters.amenities?.length ?? 0) + (filters.category ? 1 : 0)}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute top-12 left-0 z-40 bg-white rounded-2xl shadow-2xl border border-stone-100 p-5 w-80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-stone-900">Filters</h3>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-stone-100 rounded-lg transition-colors">
              <X className="h-4 w-4 text-stone-500" />
            </button>
          </div>

          {/* Category */}
          <div className="mb-4">
            <Label className="text-xs uppercase tracking-wide text-stone-500 mb-2 block">Category</Label>
            <Select
              value={filters.category}
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
                className="flex-1 h-9 rounded-xl border border-stone-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice ?? ''}
                onChange={(e) => setFilters({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
                className="flex-1 h-9 rounded-xl border border-stone-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Amenities */}
          <div className="mb-4">
            <Label className="text-xs uppercase tracking-wide text-stone-500 mb-2 block">Amenities</Label>
            <div className="grid grid-cols-2 gap-2">
              {AMENITIES.map((amenity) => (
                <label key={amenity} className="flex items-center gap-2 cursor-pointer group">
                  <Checkbox
                    checked={filters.amenities?.includes(amenity)}
                    onCheckedChange={() => toggleAmenity(amenity)}
                  />
                  <span className="text-sm text-stone-700 group-hover:text-amber-700 transition-colors">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { clearFilters(); setIsOpen(false); }}
              className="w-full text-amber-600 hover:text-amber-700 hover:bg-amber-50"
            >
              Clear all filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
