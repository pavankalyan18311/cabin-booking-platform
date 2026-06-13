import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Booking } from '@/types';

// ── Mock Firebase Firestore ───────────────────────────────────────────────────
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc:        vi.fn(),
  getDocs:    vi.fn(),
  getDoc:     vi.fn(),
  updateDoc:  vi.fn(),
  query:      vi.fn(),
  where:      vi.fn(),
  orderBy:    vi.fn(),
}));

vi.mock('@/lib/firebase/config', () => ({
  db:   {},
  auth: {
    currentUser: { getIdToken: vi.fn().mockResolvedValue('test-token') },
  },
}));

vi.mock('@/lib/firebase/collections', () => ({
  COLLECTIONS: {
    BOOKINGS:      'bookings',
    AVAILABILITY:  'availability',
    ROOMS:         'rooms',
  },
}));

import * as firestore from 'firebase/firestore';
import {
  getUserBookings,
  getBookingById,
  getRoomAvailability,
} from '@/services/bookings.service';

// ─── helpers ──────────────────────────────────────────────────────────────────

function makeBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: 'bk-1',
    roomId: 'room-1',
    roomTitle: 'Pine Ridge Cabin',
    roomImage: '',
    userId: 'user-1',
    userEmail: 'user@example.com',
    userName: 'Jane Doe',
    checkIn: '2025-07-01',
    checkOut: '2025-07-05',
    guests: 2,
    nights: 4,
    nightlyRate: 150,
    serviceFee: 72,
    taxes: 48,
    discountAmount: 0,
    totalPrice: 720,
    status: 'confirmed',
    paymentStatus: 'succeeded',
    paymentIntentId: 'pi_test',
    createdAt: '2025-06-01T00:00:00.000Z',
    updatedAt: '2025-06-01T00:00:00.000Z',
    ...overrides,
  };
}

// ─── getUserBookings ──────────────────────────────────────────────────────────

describe('getUserBookings', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns an empty array when the user has no bookings', async () => {
    vi.mocked(firestore.query).mockReturnValue('q' as never);
    vi.mocked(firestore.getDocs).mockResolvedValue({ docs: [] } as never);

    const result = await getUserBookings('user-1');
    expect(result).toEqual([]);
  });

  it('maps Firestore documents to Booking objects', async () => {
    const booking = makeBooking();
    const { id, ...bookingData } = booking;
    vi.mocked(firestore.query).mockReturnValue('q' as never);
    vi.mocked(firestore.getDocs).mockResolvedValue({
      docs: [{ id, data: () => bookingData }],
    } as never);

    const result = await getUserBookings('user-1');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(booking.id);
    expect(result[0].roomTitle).toBe(booking.roomTitle);
  });

  it('sorts bookings by createdAt descending', async () => {
    const older = makeBooking({ id: 'bk-old', createdAt: '2025-01-01T00:00:00.000Z' });
    const newer = makeBooking({ id: 'bk-new', createdAt: '2025-06-01T00:00:00.000Z' });

    vi.mocked(firestore.query).mockReturnValue('q' as never);
    vi.mocked(firestore.getDocs).mockResolvedValue({
      docs: [older, newer].map((b) => {
        const { id, ...data } = b;
        return { id, data: () => data };
      }),
    } as never);

    const result = await getUserBookings('user-1');
    expect(result[0].id).toBe('bk-new');
    expect(result[1].id).toBe('bk-old');
  });
});

// ─── getBookingById ───────────────────────────────────────────────────────────

describe('getBookingById', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns null when the document does not exist', async () => {
    vi.mocked(firestore.doc).mockReturnValue('docRef' as never);
    vi.mocked(firestore.getDoc).mockResolvedValue({ exists: () => false } as never);

    const result = await getBookingById('nonexistent');
    expect(result).toBeNull();
  });

  it('returns the booking when it exists', async () => {
    const booking = makeBooking({ id: 'bk-42' });
    const { id, ...bookingData } = booking;
    vi.mocked(firestore.doc).mockReturnValue('docRef' as never);
    vi.mocked(firestore.getDoc).mockResolvedValue({
      exists: () => true,
      id,
      data: () => bookingData,
    } as never);

    const result = await getBookingById('bk-42');
    expect(result).not.toBeNull();
    expect(result!.id).toBe('bk-42');
    expect(result!.status).toBe('confirmed');
  });
});

// ─── getRoomAvailability ──────────────────────────────────────────────────────

describe('getRoomAvailability', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns an empty array when no availability doc exists', async () => {
    vi.mocked(firestore.doc).mockReturnValue('docRef' as never);
    vi.mocked(firestore.getDoc).mockResolvedValue({ exists: () => false } as never);

    const result = await getRoomAvailability('room-1');
    expect(result).toEqual([]);
  });

  it('returns bookedDates array when the doc exists', async () => {
    const dates = ['2025-07-01', '2025-07-02', '2025-07-03'];
    vi.mocked(firestore.doc).mockReturnValue('docRef' as never);
    vi.mocked(firestore.getDoc).mockResolvedValue({
      exists: () => true,
      data: () => ({ bookedDates: dates }),
    } as never);

    const result = await getRoomAvailability('room-1');
    expect(result).toEqual(dates);
  });
});
