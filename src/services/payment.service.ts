import { auth } from '@/lib/firebase/config';
import type { PaymentType } from '@/types';

async function getAuthToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  return user.getIdToken();
}

export interface PriceBreakdown {
  nightlyRate: number;
  nights: number;
  subtotal: number;
  discountAmount: number;
  serviceFee: number;
  taxes: number;
  total: number;
  chargeAmount: number;      // what Stripe charges today
  remainingBalance: number;  // due at check-in
  paymentType: PaymentType;
}

export interface CreateIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  breakdown: PriceBreakdown;
}

export async function createPaymentIntent(params: {
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  specialRequests?: string;
  couponCode?: string;
  paymentType?: PaymentType;
}): Promise<CreateIntentResponse> {
  const token = await getAuthToken();
  const res = await fetch('/api/payment/create-intent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ...params, paymentType: params.paymentType ?? 'full' }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Failed to create payment intent');
  return data as CreateIntentResponse;
}

export async function createBookingAfterPayment(paymentIntentId: string): Promise<string> {
  const token = await getAuthToken();
  const res = await fetch('/api/payment/create-booking', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ paymentIntentId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Failed to create booking');
  return data.bookingId as string;
}

// Reserve a booking without online payment (pay at property / cash on delivery).
// Pricing is still calculated server-side; dates are blocked immediately.
export async function reserveBooking(params: {
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  specialRequests?: string;
}): Promise<{ bookingId: string; breakdown: PriceBreakdown }> {
  const token = await getAuthToken();
  const res = await fetch('/api/booking/reserve', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Failed to reserve booking');
  return data as { bookingId: string; breakdown: PriceBreakdown };
}

export async function validateCoupon(code: string, subtotal: number): Promise<{
  valid: boolean;
  code: string;
  type: 'percentage' | 'flat';
  value: number;
  discountAmount: number;
  description?: string;
}> {
  const token = await getAuthToken();
  const res = await fetch('/api/coupons/validate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ code, subtotal }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Invalid coupon');
  return data;
}
