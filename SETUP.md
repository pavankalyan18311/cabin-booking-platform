# NestAway — Setup & Deployment Guide

## Prerequisites
- Node.js 18+
- Firebase CLI: `npm install -g firebase-tools`
- A Firebase project (free Spark or paid Blaze plan)

---

## Phase 1 — Firebase Project Setup

### 1. Create a Firebase project
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → name it `nestaway`
3. Enable **Google Analytics** (optional)

### 2. Enable services
- **Authentication** → Sign-in method → Enable **Email/Password** and **Google**
- **Firestore Database** → Create database → Start in **production mode**
- **Storage** → Get started → Start in **production mode**
- **Hosting** → Get started

### 3. Get your config keys
1. Project Settings → General → Your apps → Add a Web app
2. Copy the `firebaseConfig` object
3. Paste values into `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abc
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXX
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

---

## Phase 2 — Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
# → http://localhost:3000
```

---

## Phase 3 — Deploy Firestore Rules & Indexes

```bash
# Login to Firebase
firebase login

# Set your project
firebase use your-project-id

# Deploy security rules and indexes
firebase deploy --only firestore:rules,firestore:indexes,storage
```

---

## Phase 4 — Seed Sample Data

```bash
# Install admin SDK
npm install -D firebase-admin ts-node

# Download service account key:
# Firebase Console → Project Settings → Service Accounts → Generate new private key
# Save as service-account.json in the project root (never commit this file!)

# Run the seed script
npx ts-node --project tsconfig.json scripts/seed.ts
```

---

## Phase 5 — Create Your First Admin User

1. Register a new account on the site
2. In Firebase Console → Firestore → `users` collection
3. Find your user document by UID
4. Edit the `role` field from `"user"` to `"admin"`
5. Refresh the app — you'll now see the Admin Panel

---

## Phase 6 — Deploy to Firebase Hosting

```bash
# Build the Next.js app
npm run build

# Deploy everything
firebase deploy

# Or deploy hosting only
firebase deploy --only hosting
```

Your site will be live at: `https://your-project-id.web.app`

---

## Firestore Collections Reference

| Collection | Purpose |
|---|---|
| `users` | User profiles, roles, blocked status |
| `rooms` | Property listings |
| `bookings` | All reservations with status tracking |
| `reviews` | Room reviews and ratings |
| `favorites` | User saved rooms (one doc per user) |
| `availability` | Booked dates per room (one doc per room) |
| `activity_logs` | Admin audit trail |

---

## Architecture Overview

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Login, Register, Forgot Password
│   ├── (dashboard)/        # User dashboard (protected)
│   ├── (admin)/            # Admin panel (admin-only)
│   ├── rooms/              # Public listings + detail pages
│   └── booking/[id]/       # Booking confirmation
├── components/
│   ├── ui/                 # Shadcn-style base components
│   ├── layout/             # Navbar, Footer
│   ├── shared/             # AuthProvider, Hero, sections
│   ├── rooms/              # RoomCard, SearchBar, FilterPanel
│   ├── booking/            # BookingWidget
│   ├── dashboard/          # DashboardSidebar
│   └── admin/              # AdminSidebar
├── services/               # Firebase service layer
│   ├── auth.service.ts
│   ├── rooms.service.ts
│   ├── bookings.service.ts
│   ├── reviews.service.ts
│   └── users.service.ts
├── hooks/                  # useAuth, useRooms, useBookings
├── store/                  # Zustand stores (auth, search, favorites, UI)
├── lib/
│   ├── firebase/           # Firebase init + collection names
│   ├── utils/              # cn(), formatCurrency(), calculateBookingTotal()
│   └── validations/        # Zod schemas
└── types/                  # TypeScript interfaces
```

---

## Security Rules Summary

- **Public**: read rooms, read reviews, read availability
- **Authenticated users**: create bookings (own), cancel own bookings, write favorites, post reviews
- **Admin only**: write rooms, manage all bookings, manage users, read activity logs
- **Blocked users**: cannot create bookings

---

## Environment Variables Reference

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Web API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firestore project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | FCM sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | App ID |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | GA4 measurement ID (optional) |
| `NEXT_PUBLIC_BASE_URL` | App base URL (for SEO metadata) |
