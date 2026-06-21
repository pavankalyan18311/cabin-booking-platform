'use client';
import { use } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  CheckCircle, Clock, XCircle, Calendar, Users,
  ArrowRight, ArrowLeft, Printer, CreditCard, Tag, Copy, Check, Phone,
  Home, Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import SupportDialog from '@/components/shared/SupportDialog';
import { getBookingById } from '@/services/bookings.service';
import { getRoomById } from '@/services/rooms.service';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import type { Booking, BookingStatus, PaymentStatus, Room } from '@/types';

const STATUS_CONFIG: Record<BookingStatus, {
  Icon: typeof CheckCircle;
  gradient: string;
  glow: string;
  iconColor: string;
  title: string;
  subtitle: string;
}> = {
  pending: {
    Icon: Clock,
    gradient: 'from-amber-900/40 to-stone-950',
    glow: 'bg-amber-500/20',
    iconColor: 'text-amber-400',
    title: 'Booking Submitted!',
    subtitle: 'Your reservation is awaiting review.',
  },
  confirmed: {
    Icon: CheckCircle,
    gradient: 'from-emerald-900/40 to-stone-950',
    glow: 'bg-emerald-500/20',
    iconColor: 'text-emerald-400',
    title: "You're Confirmed!",
    subtitle: 'Your reservation is all set. See you soon!',
  },
  rejected: {
    Icon: XCircle,
    gradient: 'from-red-900/30 to-stone-950',
    glow: 'bg-red-500/20',
    iconColor: 'text-red-400',
    title: 'Booking Not Approved',
    subtitle: 'Unfortunately your booking was not approved.',
  },
  completed: {
    Icon: Star,
    gradient: 'from-amber-900/30 to-stone-950',
    glow: 'bg-amber-500/20',
    iconColor: 'text-amber-400',
    title: 'Stay Completed!',
    subtitle: 'Thank you for choosing Relax Cabin.',
  },
  cancelled: {
    Icon: XCircle,
    gradient: 'from-stone-900 to-stone-950',
    glow: 'bg-stone-700/30',
    iconColor: 'text-stone-500',
    title: 'Booking Cancelled',
    subtitle: 'This booking has been cancelled.',
  },
};

const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { label: string; className: string }> = {
  succeeded: { label: 'Payment Successful', className: 'bg-emerald-900/30 text-emerald-400 border-emerald-800/40' },
  pending:   { label: 'Payment Pending',    className: 'bg-amber-900/30 text-amber-400 border-amber-800/40'     },
  failed:    { label: 'Payment Failed',     className: 'bg-red-900/30 text-red-400 border-red-800/40'           },
  refunded:  { label: 'Refunded',           className: 'bg-sky-900/30 text-sky-400 border-sky-800/40'           },
};

type TimelineStep = { key: string; label: string; sublabel: string };
const TIMELINE_STEPS: TimelineStep[] = [
  { key: 'confirmed', label: 'Confirmed', sublabel: 'Booking confirmed' },
  { key: 'checkin',   label: 'Check-in',  sublabel: 'Stay begins'      },
  { key: 'completed', label: 'Completed', sublabel: 'Trip finished'     },
];

function getTimelineActiveStep(booking: Booking): number {
  const today   = new Date(); today.setHours(0, 0, 0, 0);
  const checkIn = new Date(booking.checkIn); checkIn.setHours(0, 0, 0, 0);
  if (booking.status === 'completed') return 2;
  if (booking.status === 'confirmed') return today >= checkIn ? 1 : 0;
  return -1;
}

function BookingTimeline({ booking }: { booking: Booking }) {
  if (booking.status === 'cancelled') return null;

  /* ── Rejected — show a distinct red indicator ── */
  if (booking.status === 'rejected') {
    return (
      <div className="bg-[#2E1010] border border-[#4A1818] rounded-2xl p-5">
        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Progress</p>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-red-500/20 border-2 border-red-500/50 flex items-center justify-center shrink-0">
            <XCircle className="h-5 w-5 text-red-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-red-300">Booking Rejected</p>
            <p className="text-xs text-stone-400 mt-0.5">{booking.rejectionReason || 'Not approved at this time'}</p>
          </div>
        </div>
      </div>
    );
  }

  const activeStep = getTimelineActiveStep(booking);
  const progressWidth = activeStep === 0 ? 'w-0' : activeStep === 1 ? 'w-1/2' : 'w-[calc(100%-2rem)]';

  return (
    <div className="bg-[#132E1C] border border-[#1F4A2D] rounded-2xl p-5">
      <p className="text-xs font-bold text-stone-300 uppercase tracking-widest mb-6">Progress</p>
      <div className="relative">
        {/* Track */}
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-stone-700" />
        {/* Fill */}
        <div className={`absolute top-4 left-4 h-0.5 bg-amber-500 transition-all duration-700 ${progressWidth}`} />
        <div className="relative flex justify-between">
          {TIMELINE_STEPS.map((step, i) => {
            const done    = i <= activeStep;
            const current = i === activeStep;
            return (
              <div key={step.key} className="flex flex-col items-center gap-2.5 flex-1">
                <div className={`relative z-10 flex items-center justify-center w-9 h-9 rounded-full border-2 transition-all duration-500
                  ${done    ? 'bg-amber-500 border-amber-400 shadow-lg shadow-amber-900/60' : 'bg-[#091510] border-stone-700'}
                  ${current ? 'ring-2 ring-amber-400/30 ring-offset-1 ring-offset-[#132E1C]' : ''}`}>
                  {done
                    ? <Check className="h-4 w-4 text-white" strokeWidth={3} />
                    : <span className="w-2.5 h-2.5 rounded-full bg-stone-600" />}
                  {current && (
                    <motion.div className="absolute inset-0 rounded-full border-2 border-amber-400"
                      animate={{ scale: [1, 1.45, 1], opacity: [0.8, 0, 0.8] }}
                      transition={{ duration: 2, repeat: Infinity }} />
                  )}
                </div>
                <div className="text-center">
                  <p className={`text-xs font-bold ${done ? 'text-white' : 'text-stone-400'}`}>{step.label}</p>
                  <p className={`text-[10px] mt-0.5 hidden sm:block ${done ? 'text-stone-300' : 'text-stone-500'}`}>{step.sublabel}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button type="button" aria-label="Copy"
      onClick={async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="p-1.5 rounded-lg hover:bg-[#1A3A22] text-stone-600 hover:text-stone-400 transition-colors shrink-0">
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

function NextStepsBox({ booking }: { booking: Booking }) {
  if (booking.status === 'pending') return (
    <div className="dash-card-gold rounded-2xl p-5">
      <p className="font-bold text-amber-300 mb-1.5 text-sm">What happens next?</p>
      <p className="text-sm text-amber-400/80 leading-relaxed">
        Our team will review your booking and send confirmation within 2 hours. Check your dashboard for real-time updates.
      </p>
    </div>
  );
  if (booking.status === 'confirmed') {
    const daysUntil = Math.ceil((new Date(booking.checkIn).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return (
      <div className="dash-card-green rounded-2xl p-5">
        <p className="font-bold text-emerald-300 mb-1.5 text-sm">You&apos;re all set!</p>
        <p className="text-sm text-emerald-400/80 leading-relaxed">
          {daysUntil > 0 ? `Your stay is ${daysUntil} day${daysUntil !== 1 ? 's' : ''} away. ` : ''}
          We look forward to welcoming you on <strong className="text-emerald-300">{formatDate(booking.checkIn)}</strong>. Please arrive between 2–4 PM.
        </p>
      </div>
    );
  }
  if (booking.status === 'completed') return (
    <div className="dash-card-gold rounded-2xl p-5">
      <p className="font-bold text-amber-300 mb-1.5 text-sm">Thank you for staying with us!</p>
      <p className="text-sm text-amber-400/80 leading-relaxed">
        We hope you had a wonderful experience. Your feedback helps other travellers — consider leaving a review.
      </p>
    </div>
  );
  if (booking.status === 'rejected') return (
    <div className="dash-card-orange rounded-2xl p-5">
      <p className="font-bold text-red-300 mb-1.5 text-sm">Booking Not Approved</p>
      <p className="text-sm text-red-400/80 leading-relaxed">
        {booking.rejectionReason || 'Your booking was not approved at this time.'}
        {' '}If a payment was taken, a full refund will be processed within 3–5 business days.
      </p>
    </div>
  );
  if (booking.status === 'cancelled') return (
    <div className="dash-card rounded-2xl p-5">
      <p className="font-bold text-white/70 mb-1.5 text-sm">Booking Cancelled</p>
      <p className="text-sm text-white/40 leading-relaxed">
        {booking.cancellationReason || 'This booking has been cancelled.'} The dates are now available.
      </p>
    </div>
  );
  return null;
}

function BookingDetailSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-28 rounded-xl bg-white/10" />
        <Skeleton className="h-8 w-28 rounded-xl bg-white/10" />
      </div>
      <div className="text-center space-y-3 mb-8">
        <Skeleton className="h-20 w-20 rounded-full mx-auto bg-white/10" />
        <Skeleton className="h-7 w-48 mx-auto rounded-xl bg-white/10" />
        <Skeleton className="h-4 w-32 mx-auto rounded bg-white/10" />
      </div>
      <Skeleton className="h-48 w-full rounded-2xl bg-white/10" />
      <Skeleton className="h-24 w-full rounded-2xl bg-white/10" />
      <div className="dash-card rounded-2xl p-6 space-y-4">
        {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-4 w-full rounded bg-white/8" />)}
      </div>
    </div>
  );
}

export default function BookingConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [booking, setBooking]     = useState<Booking | null>(null);
  const [room,    setRoom]        = useState<Room | null>(null);
  const [loading, setLoading]     = useState(true);
  const [supportOpen, setSupportOpen] = useState(false);

  useEffect(() => {
    getBookingById(id).then(async (b) => {
      setBooking(b);
      if (b?.roomId) { const r = await getRoomById(b.roomId); setRoom(r); }
    }).finally(() => setLoading(false));
  }, [id]);

  const config = booking ? STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.pending : null;
  const subtotal = booking ? booking.nightlyRate * booking.nights : 0;

  return (
    <ProtectedRoute skipEmailGate>
      <div className="min-h-screen bg-dashboard pt-20 pb-20 lg:pb-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          {loading ? <BookingDetailSkeleton /> : !booking || !config ? (
            <div className="text-center py-24">
              <div className="inline-flex p-4 bg-slate-100 dark:bg-white/10 rounded-full mb-4">
                <XCircle className="h-10 w-10 text-slate-400 dark:text-white/50" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Booking not found</h2>
              <p className="text-slate-500 dark:text-white/55 mb-6 text-sm">This booking may have been removed or the link is incorrect.</p>
              <Link href="/rooms"><Button variant="premium">Browse Cabins</Button></Link>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

              {/* Back + Print */}
              <div className="flex items-center justify-between">
                <Link href="/dashboard/bookings">
                  <Button variant="ghost" size="sm" className="gap-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-white/65 dark:hover:text-white dark:hover:bg-white/10 -ml-2">
                    <ArrowLeft className="h-4 w-4" /> My Bookings
                  </Button>
                </Link>
                <Button variant="outline" size="sm"
                  className="gap-1.5 border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:border-white/15 dark:text-white/55 dark:hover:bg-white/10 dark:hover:text-white print:hidden"
                  onClick={() => window.print()}>
                  <Printer className="h-3.5 w-3.5" /> Print
                </Button>
              </div>

              {/* Status hero */}
              <div className={`relative rounded-3xl overflow-hidden bg-gradient-to-b ${config.gradient} p-8 text-center`}>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))]
                  from-white/5 via-transparent to-transparent pointer-events-none" />
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 220, delay: 0.15 }}
                  className={`inline-flex p-5 ${config.glow} rounded-full mb-4 print:hidden`}>
                  <config.Icon className={`h-12 w-12 ${config.iconColor}`} />
                </motion.div>
                <h1 className="text-2xl font-black text-white mb-1">{config.title}</h1>
                <p className="text-stone-400 text-sm mb-3">{config.subtitle}</p>
                <p className="text-xs text-stone-600 font-mono bg-[#091510]/60 inline-block px-3 py-1 rounded-full">
                  #{id.slice(0, 8).toUpperCase()}
                </p>
              </div>

              {/* Room image */}
              {room?.images?.[0] && (
                <div className="relative rounded-2xl overflow-hidden h-48 sm:h-56 print:hidden">
                  <Image src={room.images[0]} alt={room.title} fill className="object-cover"
                    sizes="(max-width: 640px) 100vw, 672px" priority />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <div>
                      <p className="text-white font-bold text-sm drop-shadow">{room.title}</p>
                    </div>
                    {room.rating > 0 && (
                      <div className="flex items-center gap-1 bg-amber-500/90 backdrop-blur-sm rounded-lg px-2 py-1">
                        <Star className="h-3 w-3 text-white fill-white" />
                        <span className="text-white text-xs font-bold">{room.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Timeline */}
              <BookingTimeline booking={booking} />

              {/* Booking details card */}
              <div className="bg-[#132E1C] border border-[#1F4A2D] rounded-2xl p-6 space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-bold text-white text-lg leading-snug">
                    {room?.title ?? booking.roomTitle ?? 'Your Cabin'}
                  </h2>
                  <Badge className={`${getStatusColor(booking.status)} shrink-0 border`} variant="secondary">
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </Badge>
                </div>

                <Separator className="bg-stone-800" />

                {/* Dates + guests */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Check-in',  icon: Calendar, val: formatDate(booking.checkIn)  },
                    { label: 'Check-out', icon: Calendar, val: formatDate(booking.checkOut) },
                    { label: 'Guests',    icon: Users,    val: `${booking.guests} guest${booking.guests !== 1 ? 's' : ''}` },
                    { label: 'Duration',  icon: Home,     val: `${booking.nights} night${booking.nights !== 1 ? 's' : ''}` },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-xs text-stone-400 font-semibold mb-0.5 uppercase tracking-wide">{item.label}</p>
                      <div className="flex items-center gap-1.5">
                        <item.icon className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        <p className="text-sm font-bold text-white">{item.val}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="bg-stone-800" />

                {/* Price breakdown */}
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between text-stone-300">
                    <span>{formatCurrency(booking.nightlyRate)} × {booking.nights} night{booking.nights !== 1 ? 's' : ''}</span>
                    <span className="text-white">{formatCurrency(subtotal)}</span>
                  </div>
                  {booking.discountAmount && booking.discountAmount > 0 ? (
                    <div className="flex justify-between text-emerald-400">
                      <span className="flex items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5" />
                        Coupon{booking.couponCode ? ` (${booking.couponCode})` : ''}
                      </span>
                      <span>−{formatCurrency(booking.discountAmount)}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between text-stone-300">
                    <span>Service fee</span><span className="text-white">{formatCurrency(booking.serviceFee)}</span>
                  </div>
                  <div className="flex justify-between text-stone-300">
                    <span>Taxes</span><span className="text-white">{formatCurrency(booking.taxes)}</span>
                  </div>
                  <Separator className="bg-stone-800" />
                  <div className="flex justify-between font-black text-white text-base">
                    <span>Total</span><span>{formatCurrency(booking.totalPrice)}</span>
                  </div>
                </div>

                {/* Payment info */}
                {(booking.paymentStatus || booking.paymentIntentId) && (
                  <>
                    <Separator className="bg-stone-800" />
                    <div className="space-y-2.5">
                      <p className="text-xs font-bold text-stone-300 uppercase tracking-widest">Payment</p>
                      {booking.paymentStatus && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-stone-300">Status</span>
                          <Badge className={`${PAYMENT_STATUS_CONFIG[booking.paymentStatus].className} border text-xs`} variant="secondary">
                            {PAYMENT_STATUS_CONFIG[booking.paymentStatus].label}
                          </Badge>
                        </div>
                      )}
                      {booking.paymentIntentId && (
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-sm text-stone-300 flex items-center gap-1 shrink-0">
                            <CreditCard className="h-3.5 w-3.5 text-stone-400" /> Transaction
                          </span>
                          <div className="flex items-center gap-1 min-w-0">
                            <span className="text-xs font-mono text-stone-400 truncate max-w-[160px]">
                              {booking.paymentIntentId}
                            </span>
                            <CopyButton text={booking.paymentIntentId} />
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {booking.specialRequests && (
                  <>
                    <Separator className="bg-stone-800" />
                    <div>
                      <p className="text-xs font-semibold text-stone-300 uppercase tracking-wide mb-1.5">Special Requests</p>
                      <p className="text-sm text-stone-200 bg-[#091510] rounded-xl px-3 py-2">{booking.specialRequests}</p>
                    </div>
                  </>
                )}
              </div>

              <NextStepsBox booking={booking} />

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 print:hidden pb-4">
                <Link href="/dashboard/bookings" className="flex-1">
                  <Button variant="outline" className="w-full gap-2 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-white/15 dark:text-white/65 dark:hover:bg-white/10 dark:hover:text-white">
                    <ArrowLeft className="h-4 w-4" /> My Bookings
                  </Button>
                </Link>
                <Button
                  className="flex-1 w-full gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 font-bold shadow-md shadow-orange-200"
                  onClick={() => setSupportOpen(true)}
                >
                  <Phone className="h-4 w-4" /> Contact Support
                </Button>
                {(booking.status === 'completed' || booking.status === 'cancelled' || booking.status === 'rejected') && (
                  <Link href="/rooms" className="flex-1">
                    <Button variant="premium" className="w-full gap-2">
                      Explore Cabins <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>

            </motion.div>
          )}
        </div>
      </div>

      <SupportDialog
        open={supportOpen}
        onClose={() => setSupportOpen(false)}
        bookingId={booking?.id}
        roomTitle={booking?.roomTitle ?? undefined}
        userEmail={booking?.userEmail ?? undefined}
        userName={booking?.userName ?? undefined}
      />
    </ProtectedRoute>
  );
}
