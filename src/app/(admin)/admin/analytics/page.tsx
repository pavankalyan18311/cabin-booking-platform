'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie,
} from 'recharts';
import { getAllBookingsAdmin } from '@/services/bookings.service';
import { getAllRoomsAdmin } from '@/services/rooms.service';
import { formatCurrency } from '@/lib/utils';
import { format, parseISO, eachMonthOfInterval, startOfYear, endOfYear } from 'date-fns';

// Hex values used by recharts (SVG fill); Tailwind equivalents used for the legend dots
const COLORS      = ['#d97706', '#10b981', '#ef4444', '#3b82f6', '#8b5cf6'];
const COLOR_CLASSES = ['bg-amber-600', 'bg-emerald-500', 'bg-red-500', 'bg-blue-500', 'bg-violet-500'];

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<{
    monthlyRevenue: { month: string; revenue: number; bookings: number }[];
    categoryData: { name: string; value: number; fill: string }[];
    totalRevenue: number;
    totalBookings: number;
    avgBookingValue: number;
    topRooms: { id: string; count: number }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAllBookingsAdmin(), getAllRoomsAdmin()]).then(([bookings, rooms]) => {
      // Monthly revenue
      const months = eachMonthOfInterval({ start: startOfYear(new Date()), end: endOfYear(new Date()) });
      const monthlyRevenue = months.map((m) => {
        const monthStr = format(m, 'MMM');
        const monthBookings = bookings.filter((b) => {
          try { return format(parseISO(b.createdAt), 'MMM yyyy') === format(m, 'MMM yyyy'); } catch { return false; }
        });
        return {
          month: monthStr,
          revenue: monthBookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + b.totalPrice, 0),
          bookings: monthBookings.length,
        };
      });

      // Category distribution
      const catCount: Record<string, number> = {};
      rooms.forEach((r) => { catCount[r.category] = (catCount[r.category] ?? 0) + 1; });
      const categoryData = Object.entries(catCount).map(([name, value], i) => ({
        name, value, fill: COLORS[i % COLORS.length],
      }));

      const validBookings = bookings.filter((b) => b.status !== 'cancelled');
      const totalRevenue = validBookings.reduce((s, b) => s + b.totalPrice, 0);

      // Top rooms by bookings
      const roomCount: Record<string, number> = {};
      bookings.forEach((b) => { roomCount[b.roomId] = (roomCount[b.roomId] ?? 0) + 1; });
      const topRooms = Object.entries(roomCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id, count]) => ({ id, count }));

      setData({
        monthlyRevenue,
        categoryData,
        totalRevenue,
        totalBookings: bookings.length,
        avgBookingValue: validBookings.length > 0 ? totalRevenue / validBookings.length : 0,
        topRooms,
      });
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Analytics</h1>
        <p className="text-stone-500 mt-1">Platform performance metrics.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Revenue', value: data ? formatCurrency(data.totalRevenue) : '—', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Total Bookings', value: data?.totalBookings ?? '—', icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Avg. Booking Value', value: data ? formatCurrency(data.avgBookingValue) : '—', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card>
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`p-3 rounded-xl ${kpi.bg}`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-stone-900">{loading ? <Skeleton className="h-7 w-20" /> : kpi.value}</div>
                  <p className="text-sm text-stone-500">{kpi.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Revenue chart */}
      <Card>
        <CardHeader><CardTitle className="text-base">Revenue & Bookings — {new Date().getFullYear()}</CardTitle></CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-64 w-full" /> : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={data?.monthlyRevenue}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(v, n) => [n === 'revenue' ? `$${v}` : v, n === 'revenue' ? 'Revenue' : 'Bookings']} />
                <Area type="monotone" dataKey="revenue" stroke="#d97706" fill="url(#revGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bookings bar */}
        <Card>
          <CardHeader><CardTitle className="text-base">Monthly Bookings</CardTitle></CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-48 w-full" /> : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data?.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="bookings" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Property categories */}
        <Card>
          <CardHeader><CardTitle className="text-base">Properties by Category</CardTitle></CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-48 w-full" /> : (
              <div className="flex items-center justify-center gap-6">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie data={data?.categoryData} cx="50%" cy="50%" outerRadius={70} dataKey="value" paddingAngle={3} />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {data?.categoryData.map((c, i) => (
                    <div key={c.name} className="flex items-center gap-2 text-sm">
                      <div className={`w-3 h-3 rounded-full ${COLOR_CLASSES[i % COLOR_CLASSES.length]}`} />
                      <span className="capitalize text-stone-600">{c.name}</span>
                      <span className="font-medium ml-auto">{c.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
