export type UserRole = 'user' | 'admin';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  isBlocked: boolean;
  isEmailVerified?: boolean;   // custom OTP verification (distinct from Firebase Auth emailVerified)
  authProvider?: 'email' | 'google'; // Google users are auto-verified
}

export interface OTPRecord {
  userId: string;
  email: string;
  otpHash: string;       // SHA-256(otp + userId) — never store plain OTP
  expiresAt: string;     // ISO — 10 min from creation
  attempts: number;      // failed attempts (max 5 before invalidated)
  verified: boolean;
  requestCount: number;  // OTP sends in current 30-min rate-limit window
  windowStart: string;   // ISO — start of the rate-limit window
  createdAt: string;
}

export interface Room {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  toilets?: number;
  balconies?: number;
  kitchens?: number;
  diningRooms?: number;
  livingRooms?: number;
  queensizeBeds?: number;
  sofaBeds?: number;
  foldawayBeds?: number;
  loftBeds?: number;
  kingsizeBeds?: number;
  terraces?: number;
  size?: number;
  location?: string;
  coordinates?: { lat: number; lng: number };
  images: string[];
  amenities: string[];
  category: RoomCategory;
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
  isFeatured: boolean;
  isUnderMaintenance?: boolean;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export type RoomCategory = 'cabin' | 'lodge' | 'cottage' | 'villa' | 'chalet';

export interface Booking {
  id: string;
  roomId: string;
  roomTitle?: string;
  roomImage?: string;   // first image URL — denormalized at booking creation time
  room?: Room;
  userId: string;
  userEmail?: string;
  userName?: string;
  user?: User;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: BookingStatus;
  totalPrice: number;
  nightlyRate: number;
  nights: number;
  serviceFee: number;
  taxes: number;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  // Payment
  paymentIntentId?: string;
  paymentStatus?: PaymentStatus;
  paymentType?: PaymentType;
  depositAmount?: number;      // amount charged at booking time
  remainingBalance?: number;   // amount due at check-in (0 for full payments)
  balancePaid?: boolean;       // true once the remaining balance was paid online
  balancePaidAt?: string;
  couponCode?: string;
  discountAmount?: number;
}

export interface Review {
  id: string;
  roomId: string;
  userId: string;
  user?: Pick<User, 'displayName' | 'photoURL'>;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Availability {
  roomId: string;
  bookedDates: string[]; // ISO date strings
}

export interface SearchFilters {
  checkIn?: Date;
  checkOut?: Date;
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  category?: RoomCategory;
}

export type CouponType = 'percentage' | 'flat';

export interface Coupon {
  id: string;
  code: string;            // uppercase, e.g. "SAVE20"
  type: CouponType;
  value: number;           // percentage (0-100) OR flat USD amount
  minBookingAmount: number; // minimum subtotal before discount is applied
  maxUses?: number;        // undefined = unlimited
  usedCount: number;
  expiresAt: string;       // ISO string
  isActive: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';

export type PaymentType = 'token' | 'half' | 'full';

export interface NearbyLocation {
  id: string;
  name: string;
  distance: number;    // always in miles
  approxTime: string;  // e.g. "~5 min drive", "10 min walk"
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  paymentIntentId: string;
  amount: number;          // in USD cents (Stripe convention stored here too)
  currency: string;        // 'usd'
  status: PaymentStatus;
  couponCode?: string;
  discountAmount: number;  // 0 if no coupon
  nightlyRate: number;
  nights: number;
  subtotal: number;
  serviceFee: number;
  taxes: number;
  createdAt: string;
  updatedAt: string;
}

export type GallerySpan = 'col-span-2 row-span-2' | 'col-span-1 row-span-1';

export interface GalleryItem {
  id: string;
  src: string;        // Firebase Storage URL
  label: string;
  sub: string;
  span: GallerySpan;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminStats {
  totalBookings: number;
  totalRevenue: number;
  totalRooms: number;
  totalUsers: number;
  occupancyRate: number;
  pendingBookings: number;
  recentBookings: Booking[];
  popularRooms: Room[];
  monthlyRevenue: { month: string; revenue: number }[];
  bookingsByStatus: { status: string; count: number }[];
}
