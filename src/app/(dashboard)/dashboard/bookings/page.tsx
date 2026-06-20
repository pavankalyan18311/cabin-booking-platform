'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar, Users, Loader2, ChevronRight, Tag, Phone,
  CreditCard, Clock, Copy, Check, Receipt, Mountain,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { useAuthStore } from '@/store';
import SupportDialog from '@/components/shared/SupportDialog';
import { useUserBookings } from '@/hooks/useBookings';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { auth } from '@/lib/firebase/config';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import type { Booking, BookingStatus, PaymentStatus } from '@/types';
import { toast } from 'sonner';

const STATUS_TABS: { value: 'all' | BookingStatus; label: string }[] = [
  { value: 'all',       label: 'All'       },
  { value: 'pending',   label: 'Pending'   },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'rejected',  label: 'Rejected'  },
];

function paymentBadge(status: PaymentStatus | undefined, type: string | undefined): { label: string; className: string } | null {
  if (status === 'succeeded') {
    if (type === 'half') return { label: 'Paid in Half',  className: 'bg-orange-500/20 text-orange-300 border border-orange-500/30' };
    return                        { label: 'Paid in Full', className: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' };
  }
  if (status === 'refunded') return { label: 'Refunded', className: 'bg-sky-500/20 text-sky-300 border border-sky-500/30' };
  if (status === 'failed')   return { label: 'Failed',   className: 'bg-red-500/20 text-red-300 border border-red-500/30' };
  if (status === 'pending')  return { label: 'Unpaid',   className: 'bg-amber-500/20 text-amber-300 border border-amber-500/30' };
  return null;
}

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button type="button"
      onClick={async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="inline-flex items-center gap-0.5 p-0.5 rounded hover:bg-white/10 text-white/55 hover:text-white/80 transition-colors shrink-0"
      title={`Copy ${label ?? ''}`}>
      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
    </button>
  );
}

function BookingSkeleton() {
  return (
    <div className="dash-card rounded-2xl p-4 sm:p-5 space-y-3">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-4 w-44 bg-white/8" />
          <div className="flex gap-2">
            <Skeleton className="h-4 w-16 rounded-full bg-white/8" />
            <Skeleton className="h-4 w-12 rounded-full bg-white/8" />
          </div>
        </div>
        <Skeleton className="h-6 w-20 bg-white/8" />
      </div>
      <div className="h-px bg-white/8" />
      <Skeleton className="h-3 w-72 bg-white/8" />
      <Skeleton className="h-3 w-56 bg-white/8" />
      <div className="h-px bg-white/8" />
      <div className="flex justify-between">
        <Skeleton className="h-8 w-16 bg-white/8" />
        <Skeleton className="h-4 w-24 bg-white/8" />
      </div>
    </div>
  );
}

function BookingCard({ booking, onCancel, onSupport }: { booking: Booking; onCancel: (id: string) => void; onSupport: (id: string, roomTitle?: string) => void }) {
  const payBadge  = paymentBadge(booking.paymentStatus, booking.paymentType);
  const subtotal  = booking.nightlyRate * booking.nights;
  const canCancel = booking.status === 'pending' || booking.status === 'confirmed';

  return (
    <div className="dash-card rounded-2xl overflow-hidden hover:border-amber-500/30 transition-all group">

      {/* Header */}
      <div className="px-4 pt-4 pb-3 sm:px-5 sm:pt-5">
        <div className="flex items-start gap-3">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-white/6">
            {booking.roomImage ? (
              <Image src={booking.roomImage} alt={booking.roomTitle ?? 'Room'} fill className="object-cover" sizes="80px" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-900/40 to-blue-900/40">
                <Mountain className="h-6 w-6 text-amber-400/60" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-white group-hover:text-amber-300 transition-colors truncate mb-1.5 text-sm sm:text-base">
                {booking.roomTitle ?? 'Cabin Booking'}
              </h3>
              <div className="text-right shrink-0">
                <p className="text-base sm:text-lg font-black text-white">{formatCurrency(booking.totalPrice)}</p>
                {booking.discountAmount && booking.discountAmount > 0 ? (
                  <p className="text-[10px] text-emerald-400 font-medium">−{formatCurrency(booking.discountAmount)} saved</p>
                ) : null}
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center gap-0.5 text-[10px] text-white/65 font-mono bg-white/8 border border-white/15 px-1.5 py-0.5 rounded">
                #{booking.id.slice(0, 8).toUpperCase()}
                <CopyButton text={booking.id} label="booking ID" />
              </span>
              <Badge className={`${getStatusColor(booking.status)} text-[10px] px-1.5 h-4`} variant="secondary">
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </Badge>
              {payBadge && (
                <Badge className={`${payBadge.className} text-[10px] px-1.5 h-4`} variant="secondary">{payBadge.label}</Badge>
              )}
              {booking.couponCode && (
                <span className="inline-flex items-center gap-0.5 bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-full text-[10px] px-1.5 py-0.5 font-mono font-medium">
                  <Tag className="h-2.5 w-2.5 shrink-0" />{booking.couponCode}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-white/8 mx-4 sm:mx-5" />

      {/* Stay details */}
      <div className="px-4 py-2.5 sm:px-5 flex flex-wrap gap-x-5 gap-y-1 text-sm text-white/85 font-medium">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          {formatDate(booking.checkIn)} <span className="text-white/40 mx-0.5">→</span> {formatDate(booking.checkOut)}
        </span>
        <span className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-blue-400 shrink-0" />
          {booking.guests} guest{booking.guests !== 1 ? 's' : ''} · {booking.nights} night{booking.nights !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Price breakdown */}
      <div className="px-4 pb-2.5 sm:px-5 space-y-1.5">
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-white/70">
          <span>{formatCurrency(booking.nightlyRate)} × {booking.nights} = {formatCurrency(subtotal)}</span>
          {booking.discountAmount && booking.discountAmount > 0 ? (
            <span className="text-emerald-400">−{formatCurrency(booking.discountAmount)}</span>
          ) : null}
          <span>+{formatCurrency(booking.serviceFee)} svc</span>
          <span>+{formatCurrency(booking.taxes)} tax</span>
        </div>
        {booking.paymentIntentId && (
          <div className="flex items-center gap-1">
            <CreditCard className="h-3 w-3 text-white/50 shrink-0" />
            <span className="text-[10px] text-white/55 font-mono truncate max-w-[200px] sm:max-w-xs">{booking.paymentIntentId}</span>
            <CopyButton text={booking.paymentIntentId} label="transaction ID" />
          </div>
        )}
        <div className="flex items-center gap-1 text-[10px] text-white/65 font-medium">
          <Clock className="h-2.5 w-2.5 shrink-0" />
          <span>Booked {formatDate(booking.createdAt)}</span>
          {booking.confirmedAt && <span className="text-emerald-400 ml-1">· Confirmed {formatDate(booking.confirmedAt)}</span>}
          {booking.cancelledAt && <span className="text-red-400 ml-1">· Cancelled {formatDate(booking.cancelledAt)}</span>}
        </div>
      </div>

      {booking.rejectionReason && (
        <div className="px-4 pb-3 sm:px-5">
          <p className="text-xs text-orange-300 bg-orange-500/10 border border-orange-500/20 rounded-lg px-2.5 py-1.5">
            Rejection reason: {booking.rejectionReason}
          </p>
        </div>
      )}
      {booking.status === 'cancelled' && booking.cancellationReason && (
        <div className="px-4 pb-3 sm:px-5">
          <p className="text-xs text-white/40 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5">
            Cancelled: {booking.cancellationReason}
          </p>
        </div>
      )}

      <div className="h-px bg-white/8 mx-4 sm:mx-5" />

      {/* Actions */}
      <div className="px-4 py-3 sm:px-5 flex items-center justify-between gap-2">
        <div className="flex gap-2 flex-wrap">
          {canCancel && (
            <Button variant="outline" size="sm"
              className="h-8 text-xs text-red-400 border-red-500/30 bg-red-500/10 hover:bg-red-500/20 hover:text-red-300"
              onClick={() => onCancel(booking.id)}>
              Cancel
            </Button>
          )}
          <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-white/65 hover:text-white hover:bg-white/8"
            onClick={() => onSupport(booking.id, booking.roomTitle ?? undefined)}>
            <Phone className="h-3 w-3" /> Support
          </Button>
        </div>
        <Link href={`/booking/${booking.id}`}
          className="flex items-center gap-1 text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors">
          <Receipt className="h-3.5 w-3.5" /> View Receipt <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export default function BookingsPage() {
  const { user } = useAuthStore();
  const { bookings, loading, error, updateBooking, refetch } = useUserBookings(user?.uid);
  const [tab, setTab]               = useState<'all' | BookingStatus>('all');
  const [cancelId, setCancelId]     = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [supportBooking, setSupportBooking] = useState<{ id: string; roomTitle?: string } | null>(null);

  const { pullDistance, refreshing, triggered } = usePullToRefresh({ onRefresh: refetch });
  const filtered = tab === 'all' ? bookings : bookings.filter((b) => b.status === tab);

  const openCancelDialog  = (id: string) => { setCancelId(id); setCancelReason(''); };
  const closeCancelDialog = () => { setCancelId(null); setCancelReason(''); };

  const handleCancel = async () => {
    if (!cancelId) return;
    setCancelling(true);
    const reason = cancelReason.trim() || 'Cancelled by guest';
    try {
      const res  = await fetch('/api/booking/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await auth.currentUser?.getIdToken()}` },
        body: JSON.stringify({ bookingId: cancelId, reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to cancel booking');

      updateBooking(cancelId, {
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        cancellationReason: reason,
        ...(data.refunded ? { paymentStatus: 'refunded' as const } : {}),
      });

      if (data.refunded) {
        toast.success('Booking cancelled — your refund will appear in 3–5 business days.');
      } else {
        toast.success('Booking cancelled successfully.');
      }
      closeCancelDialog();
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Failed to cancel booking');
    } finally { setCancelling(false); }
  };

  return (
    <div className="space-y-5">

      {/* Pull-to-refresh */}
      <div className={`lg:hidden flex justify-center items-center gap-2 text-xs overflow-hidden transition-all duration-200 ${
        refreshing || pullDistance > 0 ? 'h-10 opacity-100' : 'h-0 opacity-0'}`}>
        {refreshing ? (
          <><Loader2 className="h-4 w-4 animate-spin text-amber-400" /><span className="text-white/40">Refreshing…</span></>
        ) : triggered ? (
          <><div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center"><Check className="h-2.5 w-2.5 text-white" strokeWidth={3} /></div><span className="text-amber-400 font-medium">Release to refresh</span></>
        ) : (
          <><div className="w-4 h-4 rounded-full border-2 border-white/20" /><span className="text-white/30">Pull down to refresh</span></>
        )}
      </div>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">My Bookings</h1>
            <p className="text-slate-700 dark:text-white/65 mt-1 text-sm font-medium">Manage and track your cabin reservations.</p>
          </div>
          <Button variant="ghost" size="sm"
            className="gap-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-white/35 dark:hover:text-white/70 dark:hover:bg-white/8 hidden sm:flex"
            onClick={refetch} disabled={loading || refreshing}>
            <Loader2 className={`h-3.5 w-3.5 ${loading || refreshing ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>
      </motion.div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
          Failed to load bookings. Please refresh the page.
        </div>
      )}

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList className="mb-4 flex-wrap h-auto gap-1 bg-stone-900 border border-stone-700/60 p-1 rounded-xl shadow-md">
          {STATUS_TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}
              className="text-xs sm:text-sm text-white/55 hover:text-white/90 rounded-lg transition-colors
                         data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500
                         data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:font-semibold">
              {t.label}
              {t.value !== 'all' && (
                <span className="ml-1 text-[10px] opacity-60">({bookings.filter((b) => b.status === t.value).length})</span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={tab}>
          {loading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <BookingSkeleton key={i} />)}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex p-4 bg-white/6 rounded-full mb-3">
                <Calendar className="h-8 w-8 text-white/25" />
              </div>
              <p className="font-bold text-white/90 mb-1">{tab === 'all' ? 'No trips yet' : `No ${tab} bookings`}</p>
              <p className="text-white/65 text-sm mb-5">
                {tab === 'all' ? 'Your reservations will appear here once you book a cabin.' : `You have no ${tab} reservations right now.`}
              </p>
              {tab === 'all' && (
                <Link href="/rooms">
                  <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 font-bold">
                    Find a Cabin
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((booking, i) => (
                <motion.div key={booking.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <BookingCard booking={booking} onCancel={openCancelDialog} onSupport={(id, room) => setSupportBooking({ id, roomTitle: room })} />
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <SupportDialog
        open={!!supportBooking}
        onClose={() => setSupportBooking(null)}
        bookingId={supportBooking?.id}
        roomTitle={supportBooking?.roomTitle}
        userEmail={user?.email ?? undefined}
        userName={user?.displayName ?? undefined}
      />

      {/* Cancel dialog — kept light for accessibility */}
      <Dialog open={!!cancelId} onOpenChange={(open) => { if (!open) closeCancelDialog(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this booking?</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-3 mt-1">
                {cancelId && (() => {
                  const b = bookings.find((x) => x.id === cancelId);
                  return b ? (
                    <div className="flex items-center gap-3 bg-stone-50 rounded-xl p-3 border border-stone-100">
                      {b.roomImage && (
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                          <Image src={b.roomImage} alt={b.roomTitle ?? ''} fill className="object-cover" sizes="48px" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-stone-800 truncate">{b.roomTitle ?? 'Cabin Booking'}</p>
                        <p className="text-stone-400 text-xs mt-0.5">{formatDate(b.checkIn)} → {formatDate(b.checkOut)}</p>
                      </div>
                    </div>
                  ) : null;
                })()}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-stone-600">
                    Reason <span className="text-stone-400 font-normal">(optional)</span>
                  </label>
                  <Textarea placeholder="e.g. Change of plans…" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} rows={2} className="resize-none text-sm" />
                </div>
                <p className="text-xs text-stone-400">This action cannot be undone. Contact support to arrange a refund if applicable.</p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-1">
            <Button variant="outline" className="flex-1" onClick={closeCancelDialog}>Keep Booking</Button>
            <Button variant="destructive" className="flex-1" onClick={handleCancel} disabled={cancelling}>
              {cancelling ? <><Loader2 className="h-4 w-4 animate-spin mr-1" />Cancelling...</> : 'Yes, Cancel'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
