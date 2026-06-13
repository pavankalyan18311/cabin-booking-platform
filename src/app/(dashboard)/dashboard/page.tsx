'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Calendar, Heart, MapPin, ArrowRight, User, Clock, CheckCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store';
import { useUserBookings } from '@/hooks/useBookings';
import { useFavoritesStore } from '@/store';
import { formatCurrency, formatDate, getStatusColor, toTitleCase } from '@/lib/utils';

export default function DashboardPage() {
  const { user }    = useAuthStore();
  const { bookings, loading } = useUserBookings(user?.uid);
  const { favorites } = useFavoritesStore();

  const completedBookings = bookings.filter((b) => b.status === 'completed');

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingTrip = bookings
    .filter((b) => b.status === 'confirmed' && new Date(b.checkIn) >= today)
    .sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime())[0] ?? null;

  const daysUntilTrip = upcomingTrip
    ? Math.ceil((new Date(upcomingTrip.checkIn).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const stats = [
    { label: 'Bookings',  value: bookings.length,           icon: Calendar, cardCls: 'dash-card-gold',   iconCls: 'text-amber-400',   valueCls: 'text-amber-300'  },
    { label: 'Favorites', value: favorites.length,          icon: Heart,    cardCls: 'dash-card-orange',  iconCls: 'text-orange-400',  valueCls: 'text-orange-300' },
    { label: 'Completed', value: completedBookings.length,  icon: MapPin,   cardCls: 'dash-card-green',   iconCls: 'text-emerald-400', valueCls: 'text-emerald-300'},
  ];

  return (
    <div className="space-y-5">

      {/* ── Welcome ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-0.5">
          <Sparkles className="h-4 w-4 text-amber-600" />
          <p className="text-amber-600 text-xs font-bold uppercase tracking-widest">Your Dashboard</p>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-stone-100">
          Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-500 to-yellow-500">{toTitleCase(user?.displayName?.split(' ')[0])}</span>!
        </h1>
        <p className="text-slate-700 dark:text-stone-300 mt-1 text-sm font-medium">Here&apos;s what&apos;s happening with your trips.</p>
      </motion.div>

      {/* ── Upcoming trip banner ── */}
      {!loading && upcomingTrip && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Link href={`/booking/${upcomingTrip.id}`}>
            <div className="dash-trip-banner relative overflow-hidden rounded-2xl p-5 cursor-pointer group">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute -top-6 -right-6 w-40 h-40 bg-yellow-300 rounded-full blur-2xl" />
                <div className="absolute -bottom-8 -left-4 w-32 h-32 bg-blue-300 rounded-full blur-2xl" />
              </div>
              <div className="relative flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-emerald-300 shrink-0" />
                    <p className="text-white/70 text-xs font-bold uppercase tracking-wider">Upcoming Trip</p>
                  </div>
                  <h3 className="text-white font-black text-lg leading-snug mb-1 group-hover:text-yellow-200 transition-colors truncate">
                    {upcomingTrip.roomTitle ?? 'Cabin Booking'}
                  </h3>
                  <div className="flex items-center gap-3 text-white/70 text-sm">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      {formatDate(upcomingTrip.checkIn)}
                    </span>
                    <span className="text-white/30">·</span>
                    <span>{upcomingTrip.nights} night{upcomingTrip.nights !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div className="shrink-0 text-center bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-3">
                  <p className="text-white text-3xl font-black leading-none">{daysUntilTrip}</p>
                  <p className="text-white/70 text-[10px] font-semibold mt-0.5 uppercase tracking-wider">
                    {daysUntilTrip === 1 ? 'day left' : 'days to go'}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      )}

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.06 }} className="h-full">
            <div className={`${s.cardCls} rounded-2xl p-3 sm:p-5 h-full flex flex-col`}>
              <s.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${s.iconCls} mb-2 sm:mb-3 shrink-0`} />
              <div className={`text-2xl sm:text-3xl font-black ${s.valueCls}`}>
                {loading ? <Skeleton className="h-7 w-7 bg-white/10" /> : s.value}
              </div>
              <p className="text-white/75 text-[11px] sm:text-xs mt-0.5 font-medium leading-tight">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Recent bookings ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
        <div className="dash-card rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h2 className="text-base font-bold text-white">Recent Bookings</h2>
            <Link href="/dashboard/bookings">
              <Button variant="ghost" size="sm" className="gap-1 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 text-xs h-7">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
          <div className="h-px bg-white/8 mx-5" />
          <div className="p-5">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full rounded-xl bg-white/6" />)}
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-10">
                <div className="inline-flex p-4 rounded-full bg-white/6 mb-3">
                  <Calendar className="h-7 w-7 text-white/30" />
                </div>
                <p className="font-semibold text-white/70 mb-1">No trips yet</p>
                <p className="text-white/30 text-sm mb-4">Reserve your first cabin and it'll appear here.</p>
                <Link href="/rooms">
                  <Button size="sm" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 font-bold">
                    Explore Cabins
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-1.5">
                {bookings.slice(0, 4).map((booking) => (
                  <Link key={booking.id} href={`/booking/${booking.id}`}>
                    <div className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/6 transition-colors group">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white/80 group-hover:text-amber-300 transition-colors truncate">
                          {booking.roomTitle ?? 'Cabin Booking'}
                          <span className="text-white/50 font-normal text-xs ml-1.5">#{booking.id.slice(0, 6).toUpperCase()}</span>
                        </p>
                        <p className="text-xs text-white/60 flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3 shrink-0" />
                          {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0 ml-3">
                        <span className="font-bold text-white/80 text-sm">{formatCurrency(booking.totalPrice)}</span>
                        <Badge className={`${getStatusColor(booking.status)} text-[10px] px-1.5 h-4`} variant="secondary">
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Quick links ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { href: '/rooms',              icon: MapPin, label: 'Explore Cabins', sub: 'Find your next retreat',  cardCls: 'dash-card-gold',  iconCls: 'text-amber-400',   labelCls: 'text-amber-300'  },
          { href: '/dashboard/profile',  icon: User,   label: 'Edit Profile',   sub: 'Update your details',    cardCls: 'dash-card-blue',  iconCls: 'text-blue-400',    labelCls: 'text-blue-300'   },
        ].map((item) => (
          <motion.div key={item.href} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Link href={item.href}>
              <div className={`${item.cardCls} rounded-2xl p-5 flex items-center gap-4 hover:-translate-y-0.5 hover:shadow-lg transition-all group cursor-pointer`}>
                <div className="p-3 bg-white/8 rounded-xl shrink-0 group-hover:bg-white/12 transition-colors">
                  <item.icon className={`h-5 w-5 ${item.iconCls}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-sm ${item.labelCls}`}>{item.label}</p>
                  <p className="text-xs text-white/65">{item.sub}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-white/45 group-hover:text-white/80 transition-colors shrink-0" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

    </div>
  );
}
