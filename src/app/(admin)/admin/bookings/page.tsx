'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search, CheckCircle, XCircle, Copy, Check,
  RefreshCw, CreditCard, Tag, Loader2, Calendar,
  Users, Clock, DollarSign, TrendingUp, Mail,
  User as UserIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { getAllBookingsAdmin, updateBookingStatus, markBookingRefunded } from '@/services/bookings.service';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import type { Booking, BookingStatus, PaymentStatus } from '@/types';
import { toast } from 'sonner';

function paymentBadge(status: PaymentStatus | undefined, type: string | undefined): { label: string; className: string } | null {
  if (status === 'succeeded') {
    if (type === 'half') return { label: 'Paid in Half',  className: 'bg-orange-100 text-orange-800 border-orange-200' };
    return                        { label: 'Paid in Full', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
  }
  if (status === 'refunded') return { label: 'Refunded', className: 'bg-sky-100 text-sky-800 border-sky-200' };
  if (status === 'failed')   return { label: 'Failed',   className: 'bg-red-100 text-red-800 border-red-200' };
  if (status === 'pending')  return { label: 'Unpaid',   className: 'bg-amber-100 text-amber-800 border-amber-200' };
  return null;
}

function formatBookedAt(iso: string) {
  try {
    const d = parseISO(iso);
    return {
      date: format(d, 'MMM d, yyyy'),
      time: format(d, 'h:mm a'),
    };
  } catch {
    return { date: iso, time: '' };
  }
}

function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 text-white font-semibold text-sm shadow-sm">
      {initials || <UserIcon className="h-4 w-4" />}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="p-1 rounded hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors shrink-0"
      title="Copy"
    >
      {copied
        ? <Check className="h-3 w-3 text-emerald-500" />
        : <Copy className="h-3 w-3" />}
    </button>
  );
}

function StatPill({
  icon: Icon, label, value, color,
}: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  return (
    <div className="flex items-center gap-3 bg-white rounded-xl border border-stone-100 px-4 py-3 shadow-sm">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div>
        <p className="text-xs text-stone-400 leading-none mb-0.5">{label}</p>
        <p className="text-lg font-bold text-stone-900 leading-none">{value}</p>
      </div>
    </div>
  );
}

export default function AdminBookingsPage() {
  const [bookings, setBookings]         = useState<Booking[]>([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | BookingStatus>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | PaymentStatus>('all');
  const [rejectId, setRejectId]         = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting]       = useState(false);
  const [cancelId, setCancelId]         = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling]     = useState(false);
  const [refundingId, setRefundingId]   = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [launching, setLaunching]         = useState(false);

  useEffect(() => {
    getAllBookingsAdmin().then(setBookings).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleRocketLaunch = () => {
    if (launching) return;
    setLaunching(true);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 400);
    setTimeout(() => setLaunching(false), 1200);
  };

  const handleStatusUpdate = async (id: string, status: BookingStatus) => {
    try {
      await updateBookingStatus(id, status);
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b));
      toast.success(`Booking ${status}`);
    } catch {
      toast.error('Failed to update booking');
    }
  };

  const handleReject = async () => {
    if (!rejectId) return;
    setRejecting(true);
    try {
      await updateBookingStatus(rejectId, 'rejected', rejectReason.trim() || undefined);
      setBookings((prev) => prev.map((b) => b.id === rejectId ? { ...b, status: 'rejected' as BookingStatus } : b));
      toast.success('Booking rejected');
      setRejectId(null);
      setRejectReason('');
    } catch {
      toast.error('Failed to reject booking');
    } finally {
      setRejecting(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelId) return;
    setCancelling(true);
    try {
      await updateBookingStatus(cancelId, 'cancelled', cancelReason.trim() || undefined);
      setBookings((prev) => prev.map((b) => b.id === cancelId ? { ...b, status: 'cancelled' as BookingStatus, paymentStatus: b.paymentStatus === 'succeeded' ? 'refunded' as PaymentStatus : b.paymentStatus } : b));
      toast.success('Booking cancelled and refund issued');
      setCancelId(null);
      setCancelReason('');
    } catch {
      toast.error('Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  const handleRefund = async (id: string) => {
    setRefundingId(id);
    try {
      await markBookingRefunded(id);
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, paymentStatus: 'refunded' as PaymentStatus } : b));
      toast.success('Marked as refunded — process the actual refund in Stripe dashboard.');
    } catch {
      toast.error('Failed to mark as refunded');
    } finally {
      setRefundingId(null);
    }
  };

  const filtered = bookings.filter((b) => {
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      b.id.toLowerCase().includes(q) ||
      (b.userEmail ?? b.userId).toLowerCase().includes(q) ||
      (b.userName ?? '').toLowerCase().includes(q) ||
      (b.roomTitle ?? b.roomId).toLowerCase().includes(q) ||
      (b.paymentIntentId ?? '').toLowerCase().includes(q) ||
      (b.couponCode ?? '').toLowerCase().includes(q);
    const matchesStatus  = statusFilter  === 'all' || b.status        === statusFilter;
    const matchesPayment = paymentFilter === 'all' || b.paymentStatus === paymentFilter;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const totalRevenue   = bookings.filter((b) => b.paymentStatus === 'succeeded').reduce((s, b) => s + b.totalPrice, 0);
  const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Bookings</h1>
        <p className="text-stone-500 mt-0.5 text-sm">Review, approve, and manage all reservations.</p>
      </div>

      {/* ── Stats ── */}
      {!loading && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <StatPill icon={Calendar}   label="Total Bookings" value={bookings.length}              color="bg-amber-500" />
          <StatPill icon={TrendingUp} label="Confirmed"      value={confirmedCount}               color="bg-emerald-500" />
          <StatPill icon={DollarSign} label="Total Revenue"  value={formatCurrency(totalRevenue)} color="bg-blue-500" />
        </div>
      )}

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-2 items-end">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <Input
            placeholder="Search guest, room, transaction ID, coupon…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10"
          />
        </div>

        {/* Booking status */}
        <div className="flex flex-col gap-1 w-full sm:w-44 shrink-0">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wide px-1">Booking status</span>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
            <SelectTrigger className="h-10 w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Bookings</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Payment status */}
        <div className="flex flex-col gap-1 w-full sm:w-40 shrink-0">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wide px-1">Payment</span>
          <Select value={paymentFilter} onValueChange={(v) => setPaymentFilter(v as typeof paymentFilter)}>
            <SelectTrigger className="h-10 w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="succeeded">Paid</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center px-3 h-10 bg-white border border-stone-200 rounded-lg text-sm text-stone-500 shrink-0 self-end">
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* ── List ── */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No bookings match your filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b, i) => {
            const payBadge  = paymentBadge(b.paymentStatus, b.paymentType);
            const canRefund = b.paymentStatus === 'succeeded' && (b.status === 'cancelled' || b.status === 'rejected');
            const bookedAt  = formatBookedAt(b.createdAt);
            const guestName = b.userName || b.userEmail?.split('@')[0] || 'Guest';

            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <div className="bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md hover:border-stone-200 transition-all overflow-hidden">

                  {/* ── Row 1: ID + badges + price ── */}
                  <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-stone-400 bg-stone-50 border border-stone-100 px-2 py-0.5 rounded-md tracking-wide">
                        #{b.id.slice(0, 8).toUpperCase()}
                      </span>
                      <Badge
                        className={`${getStatusColor(b.status)} border text-xs font-medium px-2`}
                        variant="secondary"
                      >
                        {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                      </Badge>
                      {payBadge && (
                        <Badge
                          className={`${payBadge.className} border text-xs font-medium px-2`}
                          variant="secondary"
                        >
                          {payBadge.label}
                        </Badge>
                      )}
                      {b.paymentType === 'half' && b.remainingBalance != null && b.remainingBalance > 0 && (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs px-2 py-0.5">
                          <DollarSign className="h-2.5 w-2.5 shrink-0" />
                          {formatCurrency(b.remainingBalance)} due at check-in
                        </span>
                      )}
                      {b.couponCode && (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs px-2 py-0.5 font-mono">
                          <Tag className="h-2.5 w-2.5 shrink-0" />
                          {b.couponCode}
                          {b.discountAmount && b.discountAmount > 0 && (
                            <span className="text-emerald-600">−{formatCurrency(b.discountAmount)}</span>
                          )}
                        </span>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xl font-bold text-stone-900">{formatCurrency(b.totalPrice)}</p>
                      {(b.discountAmount ?? 0) > 0 && (
                        <p className="text-xs text-emerald-600">−{formatCurrency(b.discountAmount ?? 0)} discount</p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* ── Row 2: Guest info + Stay details ── */}
                  <div className="grid sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-stone-100">

                    {/* Guest */}
                    <div className="flex items-start gap-3 px-5 py-3.5">
                      <UserAvatar name={guestName} />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-1">Guest</p>
                        <p className="font-semibold text-stone-900 text-sm truncate">{guestName}</p>
                        {b.userEmail && (
                          <div className="flex items-center gap-1 text-xs text-stone-500 mt-0.5">
                            <Mail className="h-3 w-3 shrink-0 text-stone-400" />
                            <span className="truncate">{b.userEmail}</span>
                          </div>
                        )}
                        <p className="text-xs text-stone-400 mt-0.5 font-mono">{b.userId.slice(0, 12)}…</p>
                      </div>
                    </div>

                    {/* Stay */}
                    <div className="px-5 py-3.5">
                      <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-1">Stay</p>
                      <p className="font-semibold text-stone-900 text-sm mb-1.5 truncate">
                        {b.roomTitle ?? 'Cabin Booking'}
                      </p>
                      <div className="flex items-center gap-1.5 text-sm text-stone-700 mb-1">
                        <Calendar className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        <span className="font-medium">{formatDate(b.checkIn)}</span>
                        <span className="text-stone-300 mx-0.5">→</span>
                        <span className="font-medium">{formatDate(b.checkOut)}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-stone-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-stone-400" />
                          {b.nights} night{b.nights !== 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-stone-400" />
                          {b.guests} guest{b.guests !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* ── Row 3: Booked at + TX ID ── */}
                  <div className="grid sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-stone-100 bg-stone-50/50">

                    {/* Booked at */}
                    <div className="flex items-center gap-2.5 px-5 py-3">
                      <div className="p-1.5 bg-white rounded-lg border border-stone-100 shrink-0">
                        <Clock className="h-3.5 w-3.5 text-stone-500" />
                      </div>
                      <div>
                        <p className="text-xs text-stone-400">Booked on</p>
                        <p className="text-sm font-medium text-stone-800">
                          {bookedAt.date}
                          {bookedAt.time && (
                            <span className="text-stone-500 font-normal"> at {bookedAt.time}</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* TX ID */}
                    <div className="flex items-center gap-2.5 px-5 py-3">
                      <div className="p-1.5 bg-white rounded-lg border border-stone-100 shrink-0">
                        <CreditCard className="h-3.5 w-3.5 text-stone-500" />
                      </div>
                      {b.paymentIntentId ? (
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-stone-400">Transaction ID</p>
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-mono text-stone-700 truncate">
                              {b.paymentIntentId}
                            </span>
                            <CopyButton text={b.paymentIntentId} />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs text-stone-400">Transaction ID</p>
                          <p className="text-xs text-stone-400 italic">Pay at property</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── Rejection / cancellation reason ── */}
                  {b.rejectionReason && (
                    <div className="px-5 pb-3">
                      <p className="text-xs text-orange-700 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2">
                        <span className="font-medium">Rejection reason:</span> {b.rejectionReason}
                      </p>
                    </div>
                  )}
                  {b.status === 'cancelled' && b.cancellationReason && (
                    <div className="px-5 pb-3">
                      <p className="text-xs text-stone-600 bg-stone-50 border border-stone-100 rounded-lg px-3 py-2">
                        <span className="font-medium">Cancelled:</span> {b.cancellationReason}
                      </p>
                    </div>
                  )}

                  {/* ── Actions ── */}
                  <div className="flex items-center gap-2 px-5 py-3 border-t border-stone-100 bg-white flex-wrap">
                    {b.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 h-8 text-xs px-3"
                          onClick={() => handleStatusUpdate(b.id, 'confirmed')}
                        >
                          <CheckCircle className="h-3.5 w-3.5" /> Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="gap-1.5 h-8 text-xs px-3"
                          onClick={() => setRejectId(b.id)}
                        >
                          <XCircle className="h-3.5 w-3.5" /> Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs gap-1.5 px-3 text-stone-600 border-stone-200 hover:bg-stone-50"
                          onClick={() => setCancelId(b.id)}
                        >
                          <XCircle className="h-3.5 w-3.5" /> Cancel
                        </Button>
                      </>
                    )}
                    {b.status === 'confirmed' && (
                      <>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 text-xs px-3"
                          onClick={() => handleStatusUpdate(b.id, 'completed')}
                        >
                          Mark Completed
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs gap-1.5 px-3 text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => setCancelId(b.id)}
                        >
                          <XCircle className="h-3.5 w-3.5" /> Cancel & Refund
                        </Button>
                      </>
                    )}
                    {canRefund && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs gap-1.5 px-3 text-sky-700 border-sky-200 hover:bg-sky-50"
                        onClick={() => handleRefund(b.id)}
                        disabled={refundingId === b.id}
                      >
                        {refundingId === b.id
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : <RefreshCw className="h-3.5 w-3.5" />}
                        Mark Refunded
                      </Button>
                    )}
                    {(b.status === 'completed' || b.status === 'cancelled' || b.status === 'rejected') && (
                      <span className="text-xs text-stone-400 ml-auto">No further actions available</span>
                    )}
                  </div>

                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Rocket scroll-to-top button ── */}
      {showScrollTop && !launching && (
        <button
          type="button"
          onClick={handleRocketLaunch}
          aria-label="Scroll to top"
          className="rocket-btn fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full
            bg-gradient-to-br from-amber-400 to-orange-500
            shadow-[0_0_20px_rgba(251,146,60,0.6)] hover:shadow-[0_0_32px_rgba(251,146,60,0.9)]
            flex items-center justify-center text-3xl
            transition-all duration-300 hover:scale-110 active:scale-95"
        >
          🚀
        </button>
      )}

      {/* Grand rocket launch sequence */}
      {launching && (
        <div className="pointer-events-none">
          {/* Screen flash */}
          <div className="rocket-flash fixed inset-0 z-40 bg-amber-400/20" />
          {/* Main rocket */}
          <div className="rocket-launch fixed bottom-6 right-6 z-50 text-5xl">🚀</div>
          {/* Flame trail 1 */}
          <div className="rocket-trail-1 fixed bottom-6 right-7 z-49 text-3xl">🔥</div>
          {/* Flame trail 2 */}
          <div className="rocket-trail-2 fixed bottom-6 right-7 z-49 text-2xl">🔥</div>
          {/* Smoke puff left */}
          <div className="rocket-smoke-l fixed bottom-10 right-12 z-49 text-2xl">💨</div>
          {/* Smoke puff right */}
          <div className="rocket-smoke-r fixed bottom-10 right-4 z-49 text-2xl">💨</div>
          {/* Star sparks */}
          <div className="rocket-spark-1 fixed bottom-8 right-2 z-49 text-xl">⭐</div>
          <div className="rocket-spark-2 fixed bottom-8 right-14 z-49 text-lg">✨</div>
          <div className="rocket-spark-3 fixed bottom-14 right-10 z-49 text-base">⭐</div>
        </div>
      )}

      {/* ── Cancel Dialog ── */}
      <Dialog open={!!cancelId} onOpenChange={(open) => { if (!open) { setCancelId(null); setCancelReason(''); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              The booking dates will be freed and any Stripe payment will be automatically refunded to the guest.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for cancellation (optional)"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            className="mt-2"
            rows={3}
          />
          <div className="flex gap-3 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => { setCancelId(null); setCancelReason(''); }}>
              Back
            </Button>
            <Button variant="destructive" className="flex-1" onClick={handleCancel} disabled={cancelling}>
              {cancelling ? 'Cancelling…' : 'Cancel & Refund'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Reject Dialog ── */}
      <Dialog open={!!rejectId} onOpenChange={(open) => { if (!open) { setRejectId(null); setRejectReason(''); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Booking</DialogTitle>
            <DialogDescription>
              Optionally provide a reason for the guest. The booking dates will be freed automatically.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection (optional)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="mt-2"
            rows={3}
          />
          <div className="flex gap-3 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => { setRejectId(null); setRejectReason(''); }}>
              Cancel
            </Button>
            <Button variant="destructive" className="flex-1" onClick={handleReject} disabled={rejecting}>
              {rejecting ? 'Rejecting…' : 'Reject Booking'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
