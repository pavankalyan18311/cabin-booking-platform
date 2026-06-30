'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, ExternalLink, ToggleLeft, ToggleRight, Wrench, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { getAllRoomsAdmin, deleteRoom, updateRoom } from '@/services/rooms.service';
import { getActiveBookingsForRoom } from '@/services/bookings.service';
import { formatCurrency } from '@/lib/utils';
import type { Room } from '@/types';
import { toast } from 'sonner';

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [availFilter, setAvailFilter] = useState<'all' | 'enabled' | 'disabled'>('all');

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [checkingDelete, setCheckingDelete] = useState<string | null>(null);
  const [blockedDelete, setBlockedDelete] = useState<{ title: string; count: number } | null>(null);

  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [bulkUpdating, setBulkUpdating] = useState(false);

  useEffect(() => {
    getAllRoomsAdmin().then(setRooms).finally(() => setLoading(false));
  }, []);

  const filtered = rooms.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(search.toLowerCase());
    const matchesAvail =
      availFilter === 'all' ||
      (availFilter === 'enabled' ? r.isAvailable !== false : r.isAvailable === false);
    return matchesSearch && matchesAvail;
  });

  const handleDeleteClick = async (room: Room) => {
    setCheckingDelete(room.id);
    try {
      const active = await getActiveBookingsForRoom(room.id);
      if (active.length > 0) {
        setBlockedDelete({ title: room.title, count: active.length });
      } else {
        setDeleteId(room.id);
      }
    } catch {
      toast.error('Failed to check bookings');
    } finally {
      setCheckingDelete(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteRoom(deleteId);
      setRooms((r) => r.filter((room) => room.id !== deleteId));
      toast.success('Cabin deleted');
      setDeleteId(null);
    } catch {
      toast.error('Failed to delete cabin');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleAvailability = async (room: Room) => {
    const next = room.isAvailable === false ? true : false;
    setTogglingId(room.id);
    try {
      await updateRoom(room.id, { isAvailable: next });
      setRooms((prev) => prev.map((r) => r.id === room.id ? { ...r, isAvailable: next } : r));
      toast.success(`Cabin ${next ? 'enabled' : 'disabled'}`);
    } catch {
      toast.error('Failed to update cabin');
    } finally {
      setTogglingId(null);
    }
  };

  const handleBulkToggle = async (enable: boolean) => {
    const targets = filtered.filter((r) =>
      enable ? r.isAvailable === false : r.isAvailable !== false
    );
    if (targets.length === 0) {
      toast.info(`All visible cabins are already ${enable ? 'enabled' : 'disabled'}`);
      return;
    }
    setBulkUpdating(true);
    try {
      await Promise.all(targets.map((r) => updateRoom(r.id, { isAvailable: enable })));
      setRooms((prev) =>
        prev.map((r) =>
          targets.find((t) => t.id === r.id) ? { ...r, isAvailable: enable } : r
        )
      );
      toast.success(`${targets.length} cabin${targets.length > 1 ? 's' : ''} ${enable ? 'enabled' : 'disabled'}`);
    } catch {
      toast.error('Failed to update cabins');
    } finally {
      setBulkUpdating(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900">Cabins</h1>
          <p className="text-stone-500 text-sm mt-0.5">Manage your property listings</p>
        </div>
        <Link href="/admin/rooms/new">
          <Button variant="premium" size="sm" className="gap-1.5 h-9 px-3 sm:px-4 sm:h-10">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Cabin</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </Link>
      </div>

      {/* Toolbar */}
      <div className="space-y-2">
        {/* Row 1: search + filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <Input
              placeholder="Search rooms or locations…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 sm:h-10"
            />
          </div>
          <Select value={availFilter} onValueChange={(v) => setAvailFilter(v as typeof availFilter)}>
            <SelectTrigger className="w-32 sm:w-36 h-9 sm:h-10 shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cabins</SelectItem>
              <SelectItem value="enabled">Enabled</SelectItem>
              <SelectItem value="disabled">Disabled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Row 2: bulk actions + count */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50"
            onClick={() => handleBulkToggle(true)}
            disabled={bulkUpdating}
          >
            {bulkUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <ToggleRight className="h-3 w-3" />}
            Enable All
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs text-red-700 border-red-200 hover:bg-red-50"
            onClick={() => handleBulkToggle(false)}
            disabled={bulkUpdating}
          >
            {bulkUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <ToggleLeft className="h-3 w-3" />}
            Disable All
          </Button>
          <span className="text-xs text-stone-400 ml-auto">
            {filtered.length} {filtered.length === 1 ? 'cabin' : 'cabins'}
          </span>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-[72px] sm:h-20 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🏕️</div>
          <p className="text-stone-500 mb-4 text-sm">No cabins found</p>
          <Link href="/admin/rooms/new">
            <Button variant="premium" size="sm">Add First Cabin</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {filtered.map((room, i) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card className={`p-3 sm:p-4 hover:shadow-md transition-all ${
                room.isUnderMaintenance
                  ? 'border-amber-300 bg-amber-50/40'
                  : room.isAvailable === false
                  ? 'border-red-200 bg-red-50/20'
                  : 'border-stone-100'
              }`}>
                <div className="flex gap-3">
                  {/* Thumbnail */}
                  <div className="relative w-11 h-11 sm:w-14 sm:h-14 rounded-xl overflow-hidden shrink-0 bg-stone-100">
                    {room.images?.[0] ? (
                      <Image src={room.images[0]} alt={room.title} fill className="object-cover" sizes="56px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-stone-200">
                        <svg className="w-5 h-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5M4.5 3h15A1.5 1.5 0 0121 4.5v15a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 19.5v-15A1.5 1.5 0 014.5 3z" />
                        </svg>
                      </div>
                    )}
                    {room.isUnderMaintenance && (
                      <div className="absolute inset-0 bg-amber-500/70 flex items-center justify-center">
                        <Wrench className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Title + desktop price row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                          <h3 className={`font-semibold text-sm truncate ${
                            room.isUnderMaintenance ? 'text-amber-800' : room.isAvailable === false ? 'text-red-800' : 'text-stone-900'
                          }`}>{room.title}</h3>
                          <Badge variant="secondary" className="capitalize text-[10px] px-1.5 py-0 h-4 shrink-0">{room.category}</Badge>
                          {room.isFeatured && (
                            <Badge className="bg-amber-600 text-white text-[10px] px-1.5 py-0 h-4 shrink-0">Featured</Badge>
                          )}
                          {room.isUnderMaintenance && (
                            <Badge className="hidden sm:inline-flex bg-amber-100 text-amber-800 border border-amber-200 text-[10px] px-1.5 py-0 h-4">Maintenance</Badge>
                          )}
                          {room.isAvailable === false && !room.isUnderMaintenance && (
                            <Badge className="hidden sm:inline-flex bg-red-100 text-red-800 border border-red-200 text-[10px] px-1.5 py-0 h-4">Disabled</Badge>
                          )}
                        </div>
                        <p className="text-xs text-stone-400 mt-0.5">
                          {room.maxGuests} guests · {room.bedrooms} bed · {room.bathrooms} bath
                        </p>
                      </div>

                      {/* Desktop price */}
                      <div className="hidden sm:block text-right shrink-0">
                        <p className="font-bold text-stone-900 text-sm">{formatCurrency(room.price)}</p>
                        <p className="text-[10px] text-stone-400">/night</p>
                      </div>
                    </div>

                    {/* Bottom row: mobile price + actions */}
                    <div className="flex items-center justify-between mt-2 gap-2">
                      {/* Mobile price */}
                      <div className="sm:hidden">
                        <span className="font-semibold text-stone-900 text-sm">{formatCurrency(room.price)}</span>
                        <span className="text-xs text-stone-400">/night</span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-0.5 ml-auto sm:ml-0">
                        <button
                          type="button"
                          onClick={() => handleToggleAvailability(room)}
                          disabled={togglingId === room.id}
                          title={room.isAvailable === false ? 'Enable cabin' : 'Disable cabin'}
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition-all border ${
                            room.isAvailable === false
                              ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          }`}
                        >
                          {togglingId === room.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : room.isAvailable === false ? (
                            <ToggleLeft className="h-3 w-3" />
                          ) : (
                            <ToggleRight className="h-3 w-3" />
                          )}
                          {room.isAvailable === false ? 'Off' : 'Live'}
                        </button>
                        <Link href={`/rooms/${room.id}`} target="_blank">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-stone-400 hover:text-stone-700"
                            title="Preview cabin"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Link href={`/admin/rooms/${room.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit cabin">
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteClick(room)}
                          disabled={checkingDelete === room.id}
                          title="Delete cabin"
                        >
                          {checkingDelete === room.id
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <Trash2 className="h-3.5 w-3.5" />
                          }
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Confirm delete */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Cabin</DialogTitle>
            <DialogDescription>
              This will permanently delete the cabin and all its data. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" className="flex-1" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting…' : 'Delete Cabin'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Blocked delete — active bookings exist */}
      <Dialog open={!!blockedDelete} onOpenChange={(open) => !open && setBlockedDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cannot Delete Cabin</DialogTitle>
            <DialogDescription>
              <span className="font-semibold text-stone-800">{blockedDelete?.title}</span> has{' '}
              <span className="font-semibold text-red-600">
                {blockedDelete?.count} active booking{blockedDelete?.count !== 1 ? 's' : ''}
              </span>{' '}
              (pending or confirmed). Cancel or complete all bookings before deleting.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => setBlockedDelete(null)}>Close</Button>
            <Link href="/admin/bookings" className="flex-1">
              <Button
                className="w-full bg-amber-600 hover:bg-amber-700"
                onClick={() => setBlockedDelete(null)}
              >
                View Bookings
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
