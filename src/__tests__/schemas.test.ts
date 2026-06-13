import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// ── Replicate the schemas used in the admin forms ─────────────────────────────

const nearbyLocationSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  type: z.enum([
    'restaurant', 'gas_station', 'grocery', 'hospital',
    'attraction', 'beach', 'hiking', 'shopping', 'other',
  ] as const),
  distance: z.number().positive('Must be positive'),
  unit: z.enum(['miles', 'km'] as const),
});

// ─── Nearby location schema ───────────────────────────────────────────────────

describe('nearbyLocationSchema', () => {
  it('passes with valid data', () => {
    const result = nearbyLocationSchema.safeParse({
      name: 'Mountain Market',
      type: 'grocery',
      distance: 1.5,
      unit: 'miles',
    });
    expect(result.success).toBe(true);
  });

  it('fails when name is too short', () => {
    const result = nearbyLocationSchema.safeParse({
      name: 'A',
      type: 'restaurant',
      distance: 2,
      unit: 'miles',
    });
    expect(result.success).toBe(false);
  });

  it('fails when type is invalid', () => {
    const result = nearbyLocationSchema.safeParse({
      name: 'Some Place',
      type: 'invalid_type',
      distance: 1,
      unit: 'miles',
    });
    expect(result.success).toBe(false);
  });

  it('fails when distance is zero', () => {
    const result = nearbyLocationSchema.safeParse({
      name: 'Corner Store',
      type: 'grocery',
      distance: 0,
      unit: 'km',
    });
    expect(result.success).toBe(false);
  });

  it('fails when distance is negative', () => {
    const result = nearbyLocationSchema.safeParse({
      name: 'Corner Store',
      type: 'grocery',
      distance: -1,
      unit: 'km',
    });
    expect(result.success).toBe(false);
  });

  it('fails when unit is invalid', () => {
    const result = nearbyLocationSchema.safeParse({
      name: 'Corner Store',
      type: 'grocery',
      distance: 1,
      unit: 'feet',
    });
    expect(result.success).toBe(false);
  });

  it('accepts all valid location types', () => {
    const validTypes = [
      'restaurant', 'gas_station', 'grocery', 'hospital',
      'attraction', 'beach', 'hiking', 'shopping', 'other',
    ] as const;

    for (const type of validTypes) {
      const result = nearbyLocationSchema.safeParse({
        name: 'Test Place',
        type,
        distance: 1,
        unit: 'miles',
      });
      expect(result.success, `type "${type}" should be valid`).toBe(true);
    }
  });

  it('accepts km unit', () => {
    const result = nearbyLocationSchema.safeParse({
      name: 'Lakeside Trail',
      type: 'hiking',
      distance: 3.2,
      unit: 'km',
    });
    expect(result.success).toBe(true);
  });
});

// ─── Payment type validation ──────────────────────────────────────────────────

const paymentTypeSchema = z.enum(['token', 'half', 'full'] as const);

describe('paymentTypeSchema', () => {
  it('accepts token', () => {
    expect(paymentTypeSchema.safeParse('token').success).toBe(true);
  });

  it('accepts half', () => {
    expect(paymentTypeSchema.safeParse('half').success).toBe(true);
  });

  it('accepts full', () => {
    expect(paymentTypeSchema.safeParse('full').success).toBe(true);
  });

  it('rejects pay_at_property', () => {
    expect(paymentTypeSchema.safeParse('pay_at_property').success).toBe(false);
  });

  it('rejects empty string', () => {
    expect(paymentTypeSchema.safeParse('').success).toBe(false);
  });
});

// ─── Booking total calculation invariants ─────────────────────────────────────

describe('booking total invariants', () => {
  function calculateBookingTotal(nightlyRate: number, nights: number) {
    const subtotal    = nightlyRate * nights;
    const serviceFee  = Math.round(subtotal * 0.12);
    const taxes       = Math.round(subtotal * 0.08);
    const total       = subtotal + serviceFee + taxes;
    return { subtotal, serviceFee, taxes, total };
  }

  function calcChargeAmount(total: number, type: 'token' | 'half' | 'full') {
    if (type === 'token') return Math.round(total * 0.25 * 100) / 100;
    if (type === 'half')  return Math.round(total * 0.50 * 100) / 100;
    return total;
  }

  it('token charge + remaining balance equals total', () => {
    const { total } = calculateBookingTotal(200, 3);
    const charge     = calcChargeAmount(total, 'token');
    const remaining  = Math.round((total - charge) * 100) / 100;
    expect(Math.round((charge + remaining) * 100) / 100).toBe(total);
  });

  it('half charge + remaining balance equals total', () => {
    const { total } = calculateBookingTotal(120, 5);
    const charge     = calcChargeAmount(total, 'half');
    const remaining  = Math.round((total - charge) * 100) / 100;
    expect(Math.round((charge + remaining) * 100) / 100).toBe(total);
  });

  it('full charge leaves no remaining balance', () => {
    const { total } = calculateBookingTotal(150, 4);
    const charge     = calcChargeAmount(total, 'full');
    const remaining  = Math.round((total - charge) * 100) / 100;
    expect(remaining).toBe(0);
  });

  it('charge is always less than or equal to total', () => {
    for (const type of ['token', 'half', 'full'] as const) {
      const { total } = calculateBookingTotal(300, 2);
      const charge = calcChargeAmount(total, type);
      expect(charge).toBeLessThanOrEqual(total);
    }
  });
});
