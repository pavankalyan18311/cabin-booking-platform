import { describe, it, expect } from 'vitest';
import {
  calculateNights,
  calculateBookingTotal,
  formatCurrency,
  formatDate,
  generateSlug,
  getStatusColor,
  truncateText,
} from '@/lib/utils';

// ─── calculateNights ──────────────────────────────────────────────────────────

describe('calculateNights', () => {
  it('returns the number of days between check-in and check-out', () => {
    const checkIn  = new Date('2025-06-01');
    const checkOut = new Date('2025-06-05');
    expect(calculateNights(checkIn, checkOut)).toBe(4);
  });

  it('returns at least 1 when check-in equals check-out', () => {
    const date = new Date('2025-06-01');
    expect(calculateNights(date, date)).toBe(1);
  });

  it('returns at least 1 when check-out is before check-in', () => {
    const checkIn  = new Date('2025-06-05');
    const checkOut = new Date('2025-06-03');
    expect(calculateNights(checkIn, checkOut)).toBe(1);
  });

  it('handles single-night stays', () => {
    const checkIn  = new Date('2025-12-24');
    const checkOut = new Date('2025-12-25');
    expect(calculateNights(checkIn, checkOut)).toBe(1);
  });

  it('handles long stays across months', () => {
    const checkIn  = new Date('2025-01-01');
    const checkOut = new Date('2025-02-01');
    expect(calculateNights(checkIn, checkOut)).toBe(31);
  });
});

// ─── calculateBookingTotal ────────────────────────────────────────────────────

describe('calculateBookingTotal', () => {
  it('computes subtotal as nightlyRate × nights', () => {
    const { subtotal } = calculateBookingTotal(100, 3);
    expect(subtotal).toBe(300);
  });

  it('computes service fee as 12% of subtotal (rounded)', () => {
    const { serviceFee } = calculateBookingTotal(100, 3);
    expect(serviceFee).toBe(Math.round(300 * 0.12)); // 36
  });

  it('computes taxes as 8% of subtotal (rounded)', () => {
    const { taxes } = calculateBookingTotal(100, 3);
    expect(taxes).toBe(Math.round(300 * 0.08)); // 24
  });

  it('computes correct total', () => {
    const { subtotal, serviceFee, taxes, total } = calculateBookingTotal(100, 3);
    expect(total).toBe(subtotal + serviceFee + taxes);
  });

  it('handles fractional nightly rates', () => {
    const { subtotal } = calculateBookingTotal(99.99, 2);
    expect(subtotal).toBeCloseTo(199.98);
  });

  it('handles a single night', () => {
    const { subtotal, serviceFee, taxes, total } = calculateBookingTotal(200, 1);
    expect(subtotal).toBe(200);
    expect(serviceFee).toBe(24);
    expect(taxes).toBe(16);
    expect(total).toBe(240);
  });
});

// ─── Payment charge amounts (mirrors calcChargeAmount in create-intent) ───────

describe('payment charge amounts', () => {
  const TOKEN_RATE = 0.25;
  const HALF_RATE  = 0.50;

  function calcChargeAmount(total: number, paymentType: 'token' | 'half' | 'full'): number {
    if (paymentType === 'token') return Math.round(total * TOKEN_RATE * 100) / 100;
    if (paymentType === 'half')  return Math.round(total * HALF_RATE  * 100) / 100;
    return total;
  }

  it('token charges 25% of total', () => {
    expect(calcChargeAmount(200, 'token')).toBe(50);
  });

  it('half charges 50% of total', () => {
    expect(calcChargeAmount(200, 'half')).toBe(100);
  });

  it('full charges 100% of total', () => {
    expect(calcChargeAmount(200, 'full')).toBe(200);
  });

  it('rounds to 2 decimal places for token', () => {
    expect(calcChargeAmount(99.99, 'token')).toBe(25);
  });

  it('remaining balance is total minus charge', () => {
    const total = 400;
    const charge = calcChargeAmount(total, 'token');
    const remaining = Math.round((total - charge) * 100) / 100;
    expect(remaining).toBe(300);
  });

  it('remaining balance is 0 for full payment', () => {
    const total = 500;
    const charge = calcChargeAmount(total, 'full');
    const remaining = Math.round((total - charge) * 100) / 100;
    expect(remaining).toBe(0);
  });
});

// ─── formatCurrency ───────────────────────────────────────────────────────────

describe('formatCurrency', () => {
  it('formats whole dollar amounts', () => {
    expect(formatCurrency(100)).toBe('$100');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0');
  });

  it('formats large amounts with comma separators', () => {
    expect(formatCurrency(1500)).toBe('$1,500');
  });
});

// ─── formatDate ──────────────────────────────────────────────────────────────

describe('formatDate', () => {
  it('formats an ISO string into "MMM dd, yyyy"', () => {
    expect(formatDate('2025-06-15')).toBe('Jun 15, 2025');
  });

  it('accepts a Date object', () => {
    expect(formatDate(new Date('2025-01-01'))).toBe('Jan 01, 2025');
  });
});

// ─── generateSlug ─────────────────────────────────────────────────────────────

describe('generateSlug', () => {
  it('converts spaces to hyphens', () => {
    expect(generateSlug('Mountain Cabin')).toBe('mountain-cabin');
  });

  it('lowercases the string', () => {
    expect(generateSlug('LUXURY SUITE')).toBe('luxury-suite');
  });

  it('removes special characters', () => {
    expect(generateSlug("Joe's BBQ Shack!")).toBe('joes-bbq-shack');
  });

  it('collapses multiple hyphens', () => {
    expect(generateSlug('hello  world')).toBe('hello-world');
  });
});

// ─── getStatusColor ───────────────────────────────────────────────────────────

describe('getStatusColor', () => {
  it('returns amber classes for pending', () => {
    expect(getStatusColor('pending')).toContain('amber');
  });

  it('returns emerald classes for confirmed', () => {
    expect(getStatusColor('confirmed')).toContain('emerald');
  });

  it('returns red classes for cancelled', () => {
    expect(getStatusColor('cancelled')).toContain('red');
  });

  it('returns blue classes for completed', () => {
    expect(getStatusColor('completed')).toContain('blue');
  });

  it('returns gray classes for unknown status', () => {
    expect(getStatusColor('unknown_status')).toContain('gray');
  });
});

// ─── truncateText ─────────────────────────────────────────────────────────────

describe('truncateText', () => {
  it('returns the text unchanged when within maxLength', () => {
    expect(truncateText('Hello', 10)).toBe('Hello');
  });

  it('truncates and appends ellipsis when over maxLength', () => {
    const result = truncateText('Hello World', 5);
    expect(result).toBe('Hello...');
  });

  it('returns the exact string when length equals maxLength', () => {
    expect(truncateText('Hello', 5)).toBe('Hello');
  });
});
