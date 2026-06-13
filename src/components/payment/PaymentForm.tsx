'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createBookingAfterPayment } from '@/services/payment.service';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

interface Props {
  total: number;
  onSuccess?: (bookingId: string) => void;
}

export default function PaymentForm({ total, onSuccess }: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setErrorMessage(null);

    try {
      // 1. Confirm payment with Stripe
      // return_url is required for redirect-based payment methods (bank transfers, wallets)
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message ?? 'Payment failed. Please try again.');
        return;
      }

      if (paymentIntent?.status !== 'succeeded') {
        setErrorMessage('Payment was not completed. Please try again.');
        return;
      }

      // 2. Create booking server-side (verifies payment, creates Firestore record)
      const bookingId = await createBookingAfterPayment(paymentIntent.id);

      toast.success('Booking confirmed! Payment received.');
      if (onSuccess) {
        onSuccess(bookingId);
      } else {
        router.replace(`/booking/${bookingId}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement
        options={{
          layout: 'tabs',
          paymentMethodOrder: ['card', 'apple_pay', 'google_pay'],
        }}
      />

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <Button
        type="submit"
        variant="premium"
        size="lg"
        className="w-full gap-2"
        disabled={!stripe || !elements || processing}
      >
        {processing ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Processing payment...</>
        ) : (
          <><Lock className="h-4 w-4" /> Pay {formatCurrency(total)}</>
        )}
      </Button>

      <p className="text-xs text-stone-400 text-center flex items-center justify-center gap-1">
        <Lock className="h-3 w-3" />
        Secured by Stripe · 256-bit SSL encryption
      </p>
    </form>
  );
}
