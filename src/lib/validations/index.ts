import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: z.email('Invalid email address'),
});

export const profileSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  photoURL: z.url().optional().or(z.literal('')),
});

export const bookingSchema = z.object({
  checkIn: z.date({ message: 'Check-in date is required' }),
  checkOut: z.date({ message: 'Check-out date is required' }),
  guests: z.number().min(1, 'At least 1 guest required'),
  specialRequests: z.string().max(500).optional(),
}).refine((data) => data.checkOut > data.checkIn, {
  message: 'Check-out must be after check-in',
  path: ['checkOut'],
});

const optionalCount = z.preprocess(
  (val) => (val === '' || val === null || val === undefined || (typeof val === 'number' && isNaN(val)) ? undefined : Number(val)),
  z.number().int().positive().optional()
);

export const roomSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(1, 'Price must be greater than 0'),
  discountPrice: z.preprocess(
    (val) => (val === '' || val === null || val === undefined || (typeof val === 'number' && isNaN(val)) ? undefined : Number(val)),
    z.number().positive().optional()
  ),
  maxGuests: z.number().min(1),
  bedrooms: z.number().min(1),
  bathrooms: z.number().min(1),
  toilets: optionalCount,
  balconies: optionalCount,
  kitchens: optionalCount,
  diningRooms: optionalCount,
  livingRooms: optionalCount,
  queensizeBeds: optionalCount,
  sofaBeds: optionalCount,
  foldawayBeds: optionalCount,
  loftBeds: optionalCount,
  kingsizeBeds: optionalCount,
  terraces: optionalCount,
  category: z.enum(['cabin', 'lodge', 'cottage', 'villa', 'chalet']),
  images: z.array(z.string().min(1)).min(1, 'Add at least one image'),
  amenities: z.array(z.string()).min(1, 'Select at least one amenity'),
  isFeatured: z.boolean().default(false),
  isAvailable: z.boolean().default(true),
  isUnderMaintenance: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
});

export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, 'Review must be at least 10 characters').max(1000),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type RoomInput = z.infer<typeof roomSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
