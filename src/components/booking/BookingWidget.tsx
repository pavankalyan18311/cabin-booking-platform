'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, differenceInDays } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import { Loader2, ChevronDown, ChevronUp, Info, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { bookingSchema, type BookingInput } from '@/lib/validations';
import { useAuthStore } from '@/store';
import { formatCurrency, calculateBookingTotal } from '@/lib/utils';
import type { Room } from '@/types';
import { toast } from 'sonner';
import 'react-day-picker/dist/style.css';

interface Props {
  room: Room;
  bookedDates: string[];
}

export default function BookingWidget({ room, bookedDates }: Props) {
  const { user } = useAuthStore();
  const router = useRouter();
  const [showCalendar, setShowCalendar] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(true);
  const [adults,   setAdults]   = useState(1);
  const [children, setChildren] = useState(0);
  const [infants,  setInfants]  = useState(0);
  const [pets,     setPets]     = useState(0);

  const maxGuests = room.maxGuests; // room capacity (adults + children combined)

  const { control, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { guests: 1 },
  });

  const checkIn = watch('checkIn');
  const checkOut = watch('checkOut');

  useEffect(() => {
    setValue('guests', Math.max(1, adults + children));
  }, [adults, children, setValue]);

  const nights = checkIn && checkOut ? Math.max(1, differenceInDays(checkOut, checkIn)) : 0;
  const effectivePrice = room.discountPrice ?? room.price;
  const breakdown = nights > 0 ? calculateBookingTotal(effectivePrice, nights) : null;

  const disabledDays = useMemo(() => bookedDates.map((d) => new Date(d)), [bookedDates]);

  const onSubmit = (data: BookingInput) => {
    if (!user) {
      toast.error('Please sign in to continue your booking');
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    const params = new URLSearchParams({
      checkIn: data.checkIn.toISOString(),
      checkOut: data.checkOut.toISOString(),
      guests: String(data.guests),
      ...(infants > 0 ? { infants: String(infants) } : {}),
      ...(pets > 0 ? { pets: String(pets) } : {}),
      ...(data.specialRequests?.trim() ? { specialRequests: data.specialRequests.trim() } : {}),
    });
    router.push(`/checkout/${room.id}?${params.toString()}`);
  };

  if (room.isUnderMaintenance) {
    return (
      <div className="bg-white rounded-2xl border border-amber-200 shadow-xl p-6 sticky top-24 text-center">
        <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Wrench className="h-7 w-7 text-amber-600" />
        </div>
        <h3 className="font-semibold text-stone-900 mb-2">Temporarily Closed</h3>
        <p className="text-sm text-stone-500">This property is currently under maintenance and is not available for booking. Please check back later.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xl p-6 sticky top-24">
      {/* Price */}
      <div className="flex items-baseline justify-between mb-5">
        <div>
          <span className="text-2xl font-bold text-stone-900 dark:text-stone-100">{formatCurrency(effectivePrice)}</span>
          <span className="text-stone-500 dark:text-stone-400 text-sm"> / night</span>
        </div>
        {room.discountPrice && (
          <span className="text-stone-400 line-through text-sm">{formatCurrency(room.price)}</span>
        )}
      </div>

      {/* Date selector trigger — separated from the calendar so overflow-hidden doesn't clip it */}
      <div
        className="border border-stone-200 dark:border-stone-700 rounded-xl cursor-pointer mb-0 hover:border-amber-400 transition-colors"
        onClick={() => setShowCalendar(!showCalendar)}
      >
        <div className="grid grid-cols-2 divide-x divide-stone-200">
          <div className="p-3">
            <Label className="text-xs uppercase tracking-wide text-stone-400 cursor-pointer">Check-in</Label>
            <p className={`text-sm font-medium mt-0.5 ${checkIn ? 'text-stone-900' : 'text-stone-400'}`}>
              {checkIn ? format(checkIn, 'MMM d, yyyy') : 'Select date'}
            </p>
          </div>
          <div className="p-3">
            <Label className="text-xs uppercase tracking-wide text-stone-400 cursor-pointer">Check-out</Label>
            <p className={`text-sm font-medium mt-0.5 ${checkOut ? 'text-stone-900' : 'text-stone-400'}`}>
              {checkOut ? format(checkOut, 'MMM d, yyyy') : 'Select date'}
            </p>
          </div>
        </div>
      </div>

      {/* Calendar — rendered OUTSIDE the overflow-hidden container to prevent clipping */}
      {showCalendar && (
        <div
          className="mt-1 border border-stone-200 rounded-xl p-3 mb-3 bg-white"
          onClick={(e) => e.stopPropagation()}
        >
          <Controller
            name="checkIn"
            control={control}
            render={() => (
              <div className="flex justify-center">
                <DayPicker
                  mode="range"
                  selected={{ from: checkIn, to: checkOut }}
                  onSelect={(range) => {
                    if (range?.from) setValue('checkIn', range.from);
                    if (range?.to) setValue('checkOut', range.to);
                    // Only close when a real range is selected (from and to are different days)
                    if (range?.from && range?.to && range.from.getTime() !== range.to.getTime()) {
                      setShowCalendar(false);
                    }
                  }}
                  disabled={[{ before: new Date() }, ...disabledDays]}
                  numberOfMonths={1}
                  className="text-sm"
                  style={{ '--rdp-cell-size': '36px' } as React.CSSProperties}
                />
              </div>
            )}
          />
        </div>
      )}

      <div className="mb-3" />

      {(errors.checkIn || errors.checkOut) && (
        <p className="text-xs text-red-500 mb-2">{errors.checkIn?.message || errors.checkOut?.message}</p>
      )}

      {/* Guests — 4-category Airbnb-style selector */}
      <div className="border border-stone-200 dark:border-stone-700 rounded-xl p-3 mb-4 space-y-2.5">
        <Label className="text-xs uppercase tracking-wide text-stone-400">Guests</Label>

        {/* Adults row */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-stone-900 dark:text-stone-100">Adults</span>
            <span className="text-xs text-stone-400 ml-1.5">Ages 13+</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAdults((a) => Math.max(1, a - 1))}
              disabled={adults <= 1}
              className="w-7 h-7 rounded-lg border border-stone-200 dark:border-stone-700 flex items-center justify-center hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-300 text-stone-700 dark:text-stone-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >-</button>
            <span className="w-5 text-center text-sm font-medium text-stone-900 dark:text-stone-100">{adults}</span>
            <button
              type="button"
              onClick={() => setAdults((a) => Math.min(maxGuests - children, a + 1))}
              disabled={adults + children >= maxGuests}
              className="w-7 h-7 rounded-lg border border-stone-200 dark:border-stone-700 flex items-center justify-center hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-300 text-stone-700 dark:text-stone-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >+</button>
          </div>
        </div>

        {/* Children row */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-stone-900 dark:text-stone-100">Children</span>
            <span className="text-xs text-stone-400 ml-1.5">Ages 2–12</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setChildren((c) => Math.max(0, c - 1))}
              disabled={children <= 0}
              className="w-7 h-7 rounded-lg border border-stone-200 dark:border-stone-700 flex items-center justify-center hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-300 text-stone-700 dark:text-stone-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >-</button>
            <span className="w-5 text-center text-sm font-medium text-stone-900 dark:text-stone-100">{children}</span>
            <button
              type="button"
              onClick={() => setChildren((c) => Math.min(maxGuests - adults, c + 1))}
              disabled={adults + children >= maxGuests}
              className="w-7 h-7 rounded-lg border border-stone-200 dark:border-stone-700 flex items-center justify-center hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-300 text-stone-700 dark:text-stone-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >+</button>
          </div>
        </div>

        {/* Infants row — independent, max 5 */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-stone-900 dark:text-stone-100">Infants</span>
            <span className="text-xs text-stone-400 ml-1.5">Under 2</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setInfants((i) => Math.max(0, i - 1))}
              disabled={infants <= 0}
              className="w-7 h-7 rounded-lg border border-stone-200 dark:border-stone-700 flex items-center justify-center hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-300 text-stone-700 dark:text-stone-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >-</button>
            <span className="w-5 text-center text-sm font-medium text-stone-900 dark:text-stone-100">{infants}</span>
            <button
              type="button"
              onClick={() => setInfants((i) => Math.min(5, i + 1))}
              disabled={infants >= 5}
              className="w-7 h-7 rounded-lg border border-stone-200 dark:border-stone-700 flex items-center justify-center hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-300 text-stone-700 dark:text-stone-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >+</button>
          </div>
        </div>

        {/* Pets row — independent, max 5 */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-stone-900 dark:text-stone-100">Pets</span>
            <span className="text-xs text-stone-400 ml-1.5">Service animals always welcome</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPets((p) => Math.max(0, p - 1))}
              disabled={pets <= 0}
              className="w-7 h-7 rounded-lg border border-stone-200 dark:border-stone-700 flex items-center justify-center hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-300 text-stone-700 dark:text-stone-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >-</button>
            <span className="w-5 text-center text-sm font-medium text-stone-900 dark:text-stone-100">{pets}</span>
            <button
              type="button"
              onClick={() => setPets((p) => Math.min(5, p + 1))}
              disabled={pets >= 5}
              className="w-7 h-7 rounded-lg border border-stone-200 dark:border-stone-700 flex items-center justify-center hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-300 text-stone-700 dark:text-stone-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >+</button>
          </div>
        </div>

        <p className="text-xs text-stone-400">Max {maxGuests} guests · Infants and pets don&apos;t count toward total</p>
      </div>

      {/* Price breakdown */}
      {breakdown && nights > 0 && (
        <div className="mb-4 space-y-2">
          <button
            type="button"
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="flex items-center gap-1 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
          >
            Price breakdown {showBreakdown ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          {showBreakdown && (
            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-3 space-y-2 text-sm border border-amber-100 dark:border-amber-900/50">
              <div className="flex justify-between text-stone-600">
                <span>{formatCurrency(effectivePrice)} × {nights} night{nights !== 1 ? 's' : ''}</span>
                <span>{formatCurrency(breakdown.subtotal)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Service fee</span>
                <span>{formatCurrency(breakdown.serviceFee)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Taxes</span>
                <span>{formatCurrency(breakdown.taxes)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-stone-900">
                <span>Total</span>
                <span>{formatCurrency(breakdown.total)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Special requests */}
      <div className="mb-4">
        <Label className="text-xs text-stone-400 mb-1 block">Special requests (optional)</Label>
        <Controller
          name="specialRequests"
          control={control}
          render={({ field }) => (
            <Textarea {...field} placeholder="Any special needs?" rows={2} className="text-sm" />
          )}
        />
      </div>

      <Button
        type="submit"
        variant="premium"
        size="lg"
        className="w-full"
        disabled={isSubmitting || !checkIn || !checkOut}
      >
        {isSubmitting ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Loading...</>
        ) : nights > 0 ? (
          `Continue to Payment · ${formatCurrency(breakdown?.total ?? 0)}`
        ) : (
          'Check Availability'
        )}
      </Button>

      <p className="text-xs text-stone-400 text-center mt-3 flex items-center justify-center gap-1">
        <Info className="h-3 w-3" /> Review details before payment
      </p>
    </form>
  );
}
