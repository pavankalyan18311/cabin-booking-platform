import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { differenceInDays, format, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM dd, yyyy');
}

export function calculateNights(checkIn: Date, checkOut: Date): number {
  return Math.max(1, differenceInDays(checkOut, checkIn));
}

export function calculateBookingTotal(
  nightlyRate: number,
  nights: number
): { subtotal: number; serviceFee: number; taxes: number; total: number } {
  const subtotal = nightlyRate * nights;
  const serviceFee = Math.round(subtotal * 0.12);
  const taxes = Math.round(subtotal * 0.08);
  const total = subtotal + serviceFee + taxes;
  return { subtotal, serviceFee, taxes, total };
}

export function toTitleCase(name?: string | null): string {
  if (!name) return '';
  return name.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800',
    confirmed: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800',
    rejected: 'bg-orange-100 text-orange-800',
  };
  return colors[status] ?? 'bg-gray-100 text-gray-800';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
