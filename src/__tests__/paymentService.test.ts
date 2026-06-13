import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ── Mock Firebase auth ────────────────────────────────────────────────────────
vi.mock('@/lib/firebase/config', () => ({
  auth: {
    currentUser: { getIdToken: vi.fn().mockResolvedValue('test-token') },
  },
  db: {},
}));

import { createPaymentIntent, createBookingAfterPayment } from '@/services/payment.service';

// ─── createPaymentIntent ──────────────────────────────────────────────────────

describe('createPaymentIntent', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('sends paymentType in the request body', async () => {
    const mockBreakdown = {
      nightlyRate: 100, nights: 3, subtotal: 300, discountAmount: 0,
      serviceFee: 36, taxes: 24, total: 360, chargeAmount: 180,
      remainingBalance: 180, paymentType: 'half',
    };
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ clientSecret: 'cs_test', paymentIntentId: 'pi_test', breakdown: mockBreakdown }),
    });

    await createPaymentIntent({
      roomId: 'room-1',
      checkIn: '2025-07-01',
      checkOut: '2025-07-04',
      guests: 2,
      paymentType: 'half',
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.paymentType).toBe('half');
  });

  it('defaults paymentType to "full" when not provided', async () => {
    const mockBreakdown = {
      nightlyRate: 100, nights: 2, subtotal: 200, discountAmount: 0,
      serviceFee: 24, taxes: 16, total: 240, chargeAmount: 240,
      remainingBalance: 0, paymentType: 'full',
    };
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ clientSecret: 'cs_test', paymentIntentId: 'pi_test', breakdown: mockBreakdown }),
    });

    await createPaymentIntent({
      roomId: 'room-1',
      checkIn: '2025-07-01',
      checkOut: '2025-07-03',
      guests: 1,
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.paymentType).toBe('full');
  });

  it('throws when the API returns an error', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Room not found' }),
    });

    await expect(
      createPaymentIntent({ roomId: 'bad', checkIn: '2025-07-01', checkOut: '2025-07-03', guests: 1 })
    ).rejects.toThrow('Room not found');
  });

  it('includes Authorization header with Bearer token', async () => {
    const mockBreakdown = {
      nightlyRate: 150, nights: 1, subtotal: 150, discountAmount: 0,
      serviceFee: 18, taxes: 12, total: 180, chargeAmount: 180,
      remainingBalance: 0, paymentType: 'full',
    };
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ clientSecret: 'cs_2', paymentIntentId: 'pi_2', breakdown: mockBreakdown }),
    });

    await createPaymentIntent({
      roomId: 'room-2',
      checkIn: '2025-08-01',
      checkOut: '2025-08-02',
      guests: 1,
    });

    const headers = mockFetch.mock.calls[0][1].headers;
    expect(headers.Authorization).toBe('Bearer test-token');
  });
});

// ─── createBookingAfterPayment ────────────────────────────────────────────────

describe('createBookingAfterPayment', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('returns the bookingId from the API response', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ bookingId: 'booking-abc' }),
    });

    const id = await createBookingAfterPayment('pi_123');
    expect(id).toBe('booking-abc');
  });

  it('sends the paymentIntentId in the request body', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ bookingId: 'bk-1' }),
    });

    await createBookingAfterPayment('pi_xyz');
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.paymentIntentId).toBe('pi_xyz');
  });

  it('throws when the API returns an error', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Payment not verified' }),
    });

    await expect(createBookingAfterPayment('pi_bad')).rejects.toThrow('Payment not verified');
  });
});
