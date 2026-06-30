'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Calendar, Users, DollarSign, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie,
} from 'recharts';
import { getAllBookingsAdmin } from '@/services/bookings.service';
import { getAllRoomsAdmin } from '@/services/rooms.service';
import { getAllUsers } from '@/services/users.service';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import type { Booking, Room, User } from '@/types';
import { format, parseISO } from 'date-fns';

const COLORS = ['#d97706', '#10b981', '#ef4444', '#3b82f6', '#f97316'];

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAllBookingsAdmin(), getAllRoomsAdmin(), getAllUsers()])
      .then(([b, r, u]) => { setBookings(b); setRooms(r); setUsers(u); })
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = bookings
    .filter((b) => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const occupancyRate = rooms.length > 0
    ? Math.round((rooms.filter((r) => !r.isAvailable).length / rooms.length) * 100)
    : 0;

  // Monthly revenue data
  const monthlyData = bookings
    .filter((b) => b.status !== 'cancelled')
    .reduce((acc, b) => {
      const month = format(parseISO(b.createdAt), 'MMM');
      acc[month] = (acc[month] ?? 0) + b.totalPrice;
      return acc;
    }, {} as Record<string, number>);

  const chartData = Object.entries(monthlyData).map(([month, revenue]) => ({ month, revenue }));

  // Status distribution
  const statusData = ['pending', 'confirmed', 'completed', 'cancelled', 'rejected'].map((status, i) => ({
    name: status,
    value: bookings.filter((b) => b.status === status).length,
    fill: COLORS[i % COLORS.length],
  }));

  const stats = [
    { label: 'Total Bookings', value: bookings.length, icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50', change: '+12%' },
    { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', change: '+8%' },
    { label: 'Total Cabins', value: rooms.length, icon: Home, color: 'text-blue-600', bg: 'bg-blue-50', change: `${rooms.filter(r => r.isAvailable).length} available` },
    { label: 'Total Users', value: users.length, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', change: '+5 this week' },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-stone-900">Admin Dashboard</h1>
        <p className="text-stone-500 mt-1">Overview of your platform performance.</p>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <span className="text-xs text-emerald-600 font-medium">{stat.change}</span>
                </div>
                <div className="text-2xl font-bold text-stone-900 mb-0.5">
                  {loading ? <Skeleton className="h-8 w-16" /> : stat.value}
                </div>
                <p className="text-sm text-stone-500">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Monthly Revenue</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-48 w-full" />
            ) : chartData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-stone-400">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip formatter={(v) => [`$${v}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#d97706" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Bookings by Status</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="60%" height={200}>
                  <PieChart>
                    <Pie data={statusData.filter(s => s.value > 0)} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {statusData.map((s, i) => (
                    <div key={s.name} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="capitalize text-stone-600">{s.name}</span>
                      <span className="font-medium ml-auto">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent bookings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Bookings</CardTitle>
          <Clock className="h-4 w-4 text-stone-400" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12" />)}</div>
          ) : bookings.slice(0, 8).length === 0 ? (
            <p className="text-stone-400 text-sm text-center py-8">No bookings yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100">
                    {['Booking ID', 'User', 'Check-in', 'Check-out', 'Amount', 'Status'].map((h) => (
                      <th key={h} className="pb-2 text-left font-medium text-stone-500 text-xs">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {bookings.slice(0, 8).map((b) => (
                    <tr key={b.id} className="hover:bg-stone-50">
                      <td className="py-2.5 font-mono text-xs text-stone-500">{b.id.slice(0, 8)}...</td>
                      <td className="py-2.5 text-stone-700 text-xs">{b.userEmail ?? b.userName ?? `${b.userId.slice(0, 8)}…`}</td>
                      <td className="py-2.5 text-stone-600">{formatDate(b.checkIn)}</td>
                      <td className="py-2.5 text-stone-600">{formatDate(b.checkOut)}</td>
                      <td className="py-2.5 font-semibold text-stone-900">{formatCurrency(b.totalPrice)}</td>
                      <td className="py-2.5">
                        <Badge className={`${getStatusColor(b.status)} text-xs`} variant="secondary">{b.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
