'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Elements } from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Calendar, Users, Star, Shield, Loader2, Zap, CreditCard, Lock,
  CalendarClock, Ban, ShieldOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import CouponInput from '@/components/payment/CouponInput';
import PaymentForm from '@/components/payment/PaymentForm';
import { getStripe } from '@/lib/stripe/client';
import {
  createPaymentIntent, createBookingAfterPayment, type PriceBreakdown,
} from '@/services/payment.service';
import { formatCurrency, formatDate } from '@/lib/utils';
import { parseISO } from 'date-fns';
import type { Room, PaymentType } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const COUPONS_ENABLED = false;

interface AppliedCoupon { code: string; discountAmount: number; }
interface Props { room: Room; checkIn: string; checkOut: string; guests: number; specialRequests?: string; }

const PAYMENT_OPTIONS: {
  type: PaymentType; label: string; sublabel: string; icon: React.ElementType; badge?: string;
}[] = [
  { type: 'half',  label: 'Half (50%)',  sublabel: 'Pay rest at check-in', icon: Zap,        badge: 'Popular'      },
  { type: 'full',  label: 'Pay in Full', sublabel: 'Complete now',         icon: CreditCard, badge: 'Recommended'  },
];

export default function CheckoutClient({ room, checkIn, checkOut, guests, specialRequests }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [paymentType,      setPaymentType]      = useState<PaymentType>('full');
  const [clientSecret,     setClientSecret]     = useState<string | null>(null);
  const [breakdown,        setBreakdown]        = useState<PriceBreakdown | null>(null);
  const [appliedCoupon,    setAppliedCoupon]    = useState<AppliedCoupon | null>(null);
  const [loadingIntent,    setLoadingIntent]    = useState(true);
  const [intentError,      setIntentError]      = useState<string | null>(null);
  const [handlingRedirect, setHandlingRedirect] = useState(false);
  const latestCallRef = useRef(0);

  const initPaymentIntent = useCallback(async (type: PaymentType, couponCode?: string) => {
    const callId = ++latestCallRef.current;
    setLoadingIntent(true); setIntentError(null); setClientSecret(null);
    try {
      const result = await createPaymentIntent({ roomId: room.id, checkIn, checkOut, guests, specialRequests, couponCode, paymentType: type });
      if (callId !== latestCallRef.current) return;
      setClientSecret(result.clientSecret);
      setBreakdown(result.breakdown);
    } catch (e: unknown) {
      if (callId !== latestCallRef.current) return;
      const msg = (e as Error).message ?? 'Failed to initialise payment';
      setIntentError(msg); toast.error(msg);
    } finally {
      if (callId === latestCallRef.current) setLoadingIntent(false);
    }
  }, [room.id, checkIn, checkOut, guests, specialRequests]);

  useEffect(() => {
    const returnedIntentId = searchParams.get('payment_intent');
    const redirectStatus   = searchParams.get('redirect_status');
    if (returnedIntentId && redirectStatus === 'succeeded') {
      setHandlingRedirect(true);
      createBookingAfterPayment(returnedIntentId)
        .then((bookingId) => { toast.success('Booking confirmed!'); router.replace(`/booking/${bookingId}`); })
        .catch((err: unknown) => { toast.error((err as Error).message ?? 'Failed to create booking'); setHandlingRedirect(false); });
      return;
    }
    initPaymentIntent(paymentType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePaymentTypeChange = (type: PaymentType) => { setPaymentType(type); initPaymentIntent(type, appliedCoupon?.code); };
  const handleCouponApplied = (coupon: { code: string; discountAmount: number } | null) => {
    setAppliedCoupon(coupon); initPaymentIntent(paymentType, coupon?.code);
  };

  return (
    <ProtectedRoute skipEmailGate>
      <div className="min-h-screen bg-dual-blend pt-16 pb-24 lg:pb-10">

        {/* ── Header ── */}
        <div className="border-b border-white/[0.07] py-5 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <Link href={`/rooms/${room.id}`}
              className="flex items-center gap-1.5 text-stone-400 hover:text-white text-sm transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to listing
            </Link>
            <div className="flex items-center gap-2 text-stone-500 text-xs">
              <Lock className="h-3.5 w-3.5 text-amber-500" />
              Secured by Stripe
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.h1
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl font-black text-white mb-8">
            Complete your booking
          </motion.h1>

          <div className="grid lg:grid-cols-[1fr_380px] gap-6 lg:gap-8 items-start">

            {/* ── Left ── */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

              {/* Payment type */}
              {!handlingRedirect && (
                <div className="bg-[#132E1C] border border-[#1F4A2D] rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-5">
                    <Shield className="h-4 w-4 text-amber-500" />
                    <h2 className="text-base font-bold text-white">Choose payment plan</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {PAYMENT_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      const selected = paymentType === opt.type;
                      const amount = breakdown
                        ? opt.type === 'half' ? breakdown.total * 0.5 : breakdown.total
                        : null;
                      return (
                        <button key={opt.type} type="button" onClick={() => handlePaymentTypeChange(opt.type)}
                          className={cn(
                            'relative flex flex-col items-start gap-2 rounded-2xl border-2 p-4 text-left transition-all duration-200',
                            selected
                              ? 'border-amber-500 bg-amber-600/10'
                              : 'border-[#1F4A2D] bg-[#091510] hover:border-stone-600',
                          )}>
                          {opt.badge && (
                            <span className={cn(
                              'absolute -top-2.5 right-3 text-[10px] font-bold px-2.5 py-0.5 rounded-full',
                              selected ? 'bg-amber-500 text-white' : 'bg-stone-700 text-stone-400',
                            )}>{opt.badge}</span>
                          )}
                          <div className={cn('p-2 rounded-xl', selected ? 'bg-amber-500/20' : 'bg-stone-800')}>
                            <Icon className={cn('h-4 w-4', selected ? 'text-amber-400' : 'text-stone-400')} />
                          </div>
                          <span className={cn('font-bold text-sm', selected ? 'text-white' : 'text-stone-300')}>
                            {opt.label}
                          </span>
                          <span className="text-xs text-stone-500 leading-snug">{opt.sublabel}</span>
                          {amount !== null && (
                            <span className={cn('text-base font-black mt-1', selected ? 'text-amber-400' : 'text-stone-400')}>
                              {formatCurrency(amount)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {breakdown && breakdown.remainingBalance > 0 && (
                    <div className="mt-4 rounded-xl bg-amber-900/20 border border-amber-800/40 p-3 text-sm text-amber-300">
                      <span className="font-semibold">Today:</span> {formatCurrency(breakdown.chargeAmount)}
                      <span className="text-amber-600 mx-2">·</span>
                      <span className="font-semibold">At check-in:</span> {formatCurrency(breakdown.remainingBalance)}
                    </div>
                  )}
                </div>
              )}

              {/* Coupon */}
              {COUPONS_ENABLED && breakdown && !handlingRedirect && (
                <div className="bg-[#132E1C] border border-[#1F4A2D] rounded-2xl p-5">
                  <h2 className="text-base font-bold text-white mb-3">Have a coupon?</h2>
                  <CouponInput subtotal={breakdown.subtotal} onCouponApplied={handleCouponApplied} />
                </div>
              )}

              {/* Stripe form */}
              <div className="bg-[#132E1C] border border-[#1F4A2D] rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-5">
                  <Lock className="h-4 w-4 text-amber-500" />
                  <h2 className="text-base font-bold text-white">Payment details</h2>
                </div>
                {handlingRedirect ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <Loader2 className="h-7 w-7 animate-spin text-amber-500" />
                    <p className="text-stone-400 text-sm">Confirming your payment...</p>
                  </div>
                ) : loadingIntent ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-stone-500" />
                  </div>
                ) : intentError ? (
                  <div className="py-8 text-center">
                    <p className="text-sm text-red-400 mb-4">{intentError}</p>
                    <Button variant="outline" size="sm"
                      className="border-[#1F4A2D] text-stone-300 hover:bg-[#1A3A22]"
                      onClick={() => initPaymentIntent(paymentType, appliedCoupon?.code)}>
                      Try again
                    </Button>
                  </div>
                ) : clientSecret && breakdown ? (
                  <Elements key={clientSecret} stripe={getStripe()} options={{
                    clientSecret,
                    appearance: {
                      theme: 'night',
                      variables: {
                        colorPrimary: '#d97706',
                        colorBackground: '#0c0a09',
                        colorText: '#e7e5e4',
                        colorDanger: '#f87171',
                        borderRadius: '12px',
                        fontFamily: 'Inter, system-ui, sans-serif',
                      },
                    },
                  }}>
                    <PaymentForm total={breakdown.chargeAmount} />
                  </Elements>
                ) : null}
              </div>
            </motion.div>

            {/* ── Right: Summary ── */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
              className="lg:sticky lg:top-24">
              <div className="bg-[#132E1C] border border-[#1F4A2D] rounded-2xl overflow-hidden">
                {/* Room image */}
                <div className="relative aspect-[16/9]">
                  {room.images[0] ? (
                    <Image src={room.images[0]} alt={room.title} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-900 to-stone-950 flex items-center justify-center">
                      <span className="text-4xl">🏕️</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-bold text-white text-sm leading-snug line-clamp-1">{room.title}</h3>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {/* Meta */}
                  <div className="flex items-center gap-3 text-xs text-stone-500">
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />{room.rating.toFixed(1)}
                    </span>
                    <Badge variant="secondary" className="capitalize text-xs bg-stone-800 text-stone-400 border-0">
                      {room.category}
                    </Badge>
                  </div>

                  <Separator className="bg-stone-800" />

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {[{ label: 'Check-in', val: checkIn }, { label: 'Check-out', val: checkOut }].map((d) => (
                      <div key={d.label}>
                        <p className="text-xs text-stone-600 mb-0.5">{d.label}</p>
                        <p className="font-semibold text-stone-200">{formatDate(parseISO(d.val))}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-stone-500">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-amber-500" />
                      {breakdown?.nights ?? '—'} night{breakdown?.nights !== 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5 text-amber-500" />
                      {guests} guest{guests !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {specialRequests && (
                    <div className="bg-[#091510] rounded-xl p-3 text-xs text-stone-500">
                      <span className="text-stone-400 font-medium">Requests: </span>{specialRequests}
                    </div>
                  )}

                  <Separator className="bg-stone-800" />

                  {/* Breakdown */}
                  {breakdown ? (
                    <div className="space-y-2.5 text-sm">
                      <div className="flex justify-between text-stone-400">
                        <span>{formatCurrency(breakdown.nightlyRate)} × {breakdown.nights} nights</span>
                        <span className="text-stone-300">{formatCurrency(breakdown.subtotal)}</span>
                      </div>
                      {breakdown.discountAmount > 0 && (
                        <div className="flex justify-between text-emerald-400">
                          <span>Coupon discount</span>
                          <span>−{formatCurrency(breakdown.discountAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-stone-400">
                        <span>Service fee</span>
                        <span className="text-stone-300">{formatCurrency(breakdown.serviceFee)}</span>
                      </div>
                      <div className="flex justify-between text-stone-400">
                        <span>Taxes</span>
                        <span className="text-stone-300">{formatCurrency(breakdown.taxes)}</span>
                      </div>
                      <Separator className="bg-stone-800" />
                      <div className="flex justify-between font-black text-white text-base">
                        <span>Total</span>
                        <span>{formatCurrency(breakdown.total)}</span>
                      </div>
                      {breakdown.remainingBalance > 0 && (
                        <>
                          <Separator className="bg-stone-800" />
                          <div className="flex justify-between text-amber-400 font-semibold">
                            <span>Charged today</span>
                            <span>{formatCurrency(breakdown.chargeAmount)}</span>
                          </div>
                          <div className="flex justify-between text-stone-600 text-xs">
                            <span>Due at check-in</span>
                            <span>{formatCurrency(breakdown.remainingBalance)}</span>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {[1,2,3,4].map(i => <div key={i} className="h-4 bg-stone-800 rounded animate-pulse" />)}
                    </div>
                  )}
                </div>

                {/* Policies */}
                <div className="px-5 pt-2 pb-5">
                  <div className="rounded-xl border border-[#1F4A2D]/70 overflow-hidden">
                    <div className="px-4 py-2.5 bg-[#091510]/80 border-b border-[#1F4A2D]/50">
                      <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Booking Policies</p>
                    </div>
                    <div className="divide-y divide-[#1F4A2D]/40">
                      <div className="flex items-start gap-3 px-4 py-3">
                        <div className="shrink-0 w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/20 flex items-center justify-center mt-0.5">
                          <CalendarClock className="h-3.5 w-3.5 text-amber-400" />
                        </div>
                        <div>
                          <p className="text-stone-200 font-semibold text-xs">Payment Schedule</p>
                          <p className="text-stone-500 text-xs mt-0.5 leading-relaxed">50% due now · remaining balance due <span className="text-amber-400">1 day before arrival</span></p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 px-4 py-3">
                        <div className="shrink-0 w-7 h-7 rounded-lg bg-red-500/15 border border-red-500/20 flex items-center justify-center mt-0.5">
                          <Ban className="h-3.5 w-3.5 text-red-400" />
                        </div>
                        <div>
                          <p className="text-stone-200 font-semibold text-xs">Cancellation</p>
                          <p className="text-stone-500 text-xs mt-0.5 leading-relaxed">All paid prepayments are <span className="text-red-400">non-refundable</span></p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 px-4 py-3">
                        <div className="shrink-0 w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center mt-0.5">
                          <ShieldOff className="h-3.5 w-3.5 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-stone-200 font-semibold text-xs">Security Deposit</p>
                          <p className="text-stone-500 text-xs mt-0.5 leading-relaxed"><span className="text-emerald-400">No deposit</span> required</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
