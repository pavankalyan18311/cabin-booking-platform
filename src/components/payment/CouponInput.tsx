'use client';
import { useState } from 'react';
import { Tag, X, Loader2, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { validateCoupon } from '@/services/payment.service';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

interface AppliedCoupon {
  code: string;
  type: 'percentage' | 'flat';
  value: number;
  discountAmount: number;
  description?: string;
}

interface Props {
  subtotal: number;
  onCouponApplied: (coupon: AppliedCoupon | null) => void;
}

export default function CouponInput({ subtotal, onCouponApplied }: Props) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState<AppliedCoupon | null>(null);

  const handleApply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    try {
      const result = await validateCoupon(code.trim(), subtotal);
      const coupon: AppliedCoupon = {
        code: result.code,
        type: result.type,
        value: result.value,
        discountAmount: result.discountAmount,
        description: result.description,
      };
      setApplied(coupon);
      onCouponApplied(coupon);
      toast.success(`Coupon applied — ${formatCurrency(result.discountAmount)} saved!`);
    } catch (e: unknown) {
      toast.error((e as Error).message ?? 'Invalid coupon code');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setApplied(null);
    setCode('');
    onCouponApplied(null);
  };

  if (applied) {
    return (
      <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-800">{applied.code}</p>
            <p className="text-xs text-emerald-600">
              {applied.type === 'percentage' ? `${applied.value}% off` : `$${applied.value} off`}
              {' — '}saves {formatCurrency(applied.discountAmount)}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleRemove}
          className="p-1 hover:bg-emerald-100 rounded-lg transition-colors"
          aria-label="Remove coupon"
        >
          <X className="h-4 w-4 text-emerald-700" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
        <Input
          placeholder="Coupon code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          className="pl-8 h-9 text-sm uppercase tracking-wider"
          disabled={loading}
        />
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-9 px-4 shrink-0"
        onClick={handleApply}
        disabled={loading || !code.trim()}
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Apply'}
      </Button>
    </div>
  );
}
