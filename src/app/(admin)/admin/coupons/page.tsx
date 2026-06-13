'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Loader2, Tag, ToggleLeft, ToggleRight, Percent, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { getAllCoupons, createCoupon, deleteCoupon, toggleCouponActive } from '@/services/coupons.service';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Coupon, CouponType } from '@/types';
import { toast } from 'sonner';

interface CouponForm {
  code: string;
  type: CouponType;
  value: string;
  minBookingAmount: string;
  maxUses: string;
  expiresAt: string;
  description: string;
}

const EMPTY_FORM: CouponForm = {
  code: '',
  type: 'percentage',
  value: '',
  minBookingAmount: '0',
  maxUses: '',
  expiresAt: '',
  description: '',
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CouponForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    getAllCoupons().then(setCoupons).finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) { toast.error('Coupon code is required'); return; }
    if (!form.value || Number(form.value) <= 0) { toast.error('Value must be greater than 0'); return; }
    if (form.type === 'percentage' && Number(form.value) > 100) { toast.error('Percentage cannot exceed 100'); return; }
    if (!form.expiresAt) { toast.error('Expiry date is required'); return; }

    setSaving(true);
    try {
      const id = await createCoupon({
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value: Number(form.value),
        minBookingAmount: Number(form.minBookingAmount) || 0,
        ...(form.maxUses ? { maxUses: Number(form.maxUses) } : {}),
        expiresAt: new Date(form.expiresAt).toISOString(),
        isActive: true,
        ...(form.description.trim() ? { description: form.description.trim() } : {}),
      });
      // Optimistic update
      const newCoupon: Coupon = {
        id,
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value: Number(form.value),
        minBookingAmount: Number(form.minBookingAmount) || 0,
        ...(form.maxUses ? { maxUses: Number(form.maxUses) } : {}),
        expiresAt: new Date(form.expiresAt).toISOString(),
        isActive: true,
        usedCount: 0,
        ...(form.description.trim() ? { description: form.description.trim() } : {}),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setCoupons((prev) => [newCoupon, ...prev]);
      setShowCreate(false);
      setForm(EMPTY_FORM);
      toast.success('Coupon created');
    } catch (e: unknown) {
      toast.error((e as Error).message ?? 'Failed to create coupon');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteCoupon(deleteId);
      setCoupons((prev) => prev.filter((c) => c.id !== deleteId));
      toast.success('Coupon deleted');
      setDeleteId(null);
    } catch {
      toast.error('Failed to delete coupon');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggle = async (coupon: Coupon) => {
    setTogglingId(coupon.id);
    try {
      await toggleCouponActive(coupon.id, !coupon.isActive);
      setCoupons((prev) => prev.map((c) => c.id === coupon.id ? { ...c, isActive: !c.isActive } : c));
      toast.success(`Coupon ${!coupon.isActive ? 'activated' : 'deactivated'}`);
    } catch {
      toast.error('Failed to update coupon');
    } finally {
      setTogglingId(null);
    }
  };

  const isExpired = (c: Coupon) => new Date(c.expiresAt) < new Date();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900">Coupons</h1>
          <p className="text-stone-500 text-sm mt-0.5">Manage discount codes for guests</p>
        </div>
        <Button variant="premium" size="sm" className="gap-1.5 h-9" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Create Coupon</span>
          <span className="sm:hidden">Create</span>
        </Button>
      </div>

      {/* Stats row */}
      {!loading && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total', value: coupons.length, color: 'text-stone-900' },
            { label: 'Active', value: coupons.filter((c) => c.isActive && !isExpired(c)).length, color: 'text-emerald-600' },
            { label: 'Expired', value: coupons.filter(isExpired).length, color: 'text-red-500' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-stone-100 p-3 text-center">
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-stone-500">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-16">
          <Tag className="h-10 w-10 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500 text-sm mb-3">No coupons yet</p>
          <Button variant="premium" size="sm" onClick={() => setShowCreate(true)}>Create First Coupon</Button>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {coupons.map((coupon, i) => {
            const expired = isExpired(coupon);
            return (
              <motion.div key={coupon.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className={`p-3 sm:p-4 transition-all ${
                  expired ? 'border-stone-200 opacity-60' : coupon.isActive ? 'border-stone-100' : 'border-red-100 bg-red-50/20'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      coupon.type === 'percentage' ? 'bg-amber-50' : 'bg-emerald-50'
                    }`}>
                      {coupon.type === 'percentage'
                        ? <Percent className="h-4 w-4 text-amber-600" />
                        : <DollarSign className="h-4 w-4 text-emerald-600" />
                      }
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="font-bold text-stone-900 font-mono tracking-wider text-sm">{coupon.code}</span>
                        <Badge
                          className={`text-[10px] px-1.5 h-4 ${
                            expired ? 'bg-stone-100 text-stone-500' :
                            coupon.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {expired ? 'Expired' : coupon.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <span className="text-xs text-stone-500">
                          {coupon.type === 'percentage' ? `${coupon.value}% off` : `${formatCurrency(coupon.value)} off`}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-stone-400 flex-wrap">
                        <span>Used: {coupon.usedCount}{coupon.maxUses ? `/${coupon.maxUses}` : ''}</span>
                        <span>Min: {formatCurrency(coupon.minBookingAmount)}</span>
                        <span>Expires: {formatDate(coupon.expiresAt)}</span>
                      </div>
                      {coupon.description && (
                        <p className="text-xs text-stone-400 mt-0.5 truncate">{coupon.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {!expired && (
                        <button
                          type="button"
                          onClick={() => handleToggle(coupon)}
                          disabled={togglingId === coupon.id}
                          title={coupon.isActive ? 'Deactivate' : 'Activate'}
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition-all border ${
                            coupon.isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                          }`}
                        >
                          {togglingId === coupon.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : coupon.isActive ? (
                            <ToggleRight className="h-3 w-3" />
                          ) : (
                            <ToggleLeft className="h-3 w-3" />
                          )}
                          {coupon.isActive ? 'On' : 'Off'}
                        </button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => setDeleteId(coupon.id)}
                        title="Delete coupon"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create coupon dialog */}
      <Dialog open={showCreate} onOpenChange={(open) => { if (!open) { setShowCreate(false); setForm(EMPTY_FORM); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Coupon</DialogTitle>
            <DialogDescription>New discount code for guests at checkout.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label className="text-xs">Coupon Code *</Label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. SAVE20"
                  className="mt-1 uppercase tracking-wider font-mono"
                  maxLength={20}
                />
              </div>
              <div>
                <Label className="text-xs">Discount Type *</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as CouponType })}>
                  <SelectTrigger className="mt-1 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="flat">Flat ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">
                  Value * {form.type === 'percentage' ? '(0-100)' : '(USD)'}
                </Label>
                <Input
                  type="number"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  placeholder={form.type === 'percentage' ? '20' : '50'}
                  min={1}
                  max={form.type === 'percentage' ? 100 : undefined}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Min Booking Amount ($)</Label>
                <Input
                  type="number"
                  value={form.minBookingAmount}
                  onChange={(e) => setForm({ ...form, minBookingAmount: e.target.value })}
                  placeholder="0"
                  min={0}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Max Uses (blank = unlimited)</Label>
                <Input
                  type="number"
                  value={form.maxUses}
                  onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                  placeholder="Unlimited"
                  min={1}
                  className="mt-1"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Expiry Date *</Label>
                <Input
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="mt-1"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Description (optional)</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. Summer sale 20% off"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" className="flex-1" onClick={() => { setShowCreate(false); setForm(EMPTY_FORM); }}>
                Cancel
              </Button>
              <Button type="submit" variant="premium" className="flex-1" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Coupon'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Coupon</DialogTitle>
            <DialogDescription>This will permanently delete the coupon. Guests who already used it keep their discount.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" className="flex-1" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting…' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
