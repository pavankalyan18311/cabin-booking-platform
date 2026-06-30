import { createHmac, timingSafeEqual } from 'crypto';

// Signs/verifies a bookingId so the "pay remaining balance" link can be
// emailed and clicked without a login session, while staying unguessable
// by anyone but the recipient.
export function signBalanceToken(bookingId: string): string {
  return createHmac('sha256', process.env.STRIPE_SECRET_KEY!).update(bookingId).digest('hex');
}

export function verifyBalanceToken(bookingId: string, token: string): boolean {
  if (!token) return false;
  const expected = Buffer.from(signBalanceToken(bookingId));
  const actual = Buffer.from(token);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
