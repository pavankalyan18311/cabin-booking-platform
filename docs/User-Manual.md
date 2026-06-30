# Relaxin Cabins — Platform User Manual

**A complete guide to how the website works, what your guests can do, and what you can manage as the site owner.**

---

## 1. What This Platform Is

Relaxin Cabins is a full booking website for your cabin rentals — similar in spirit to Airbnb or Vrbo, but built specifically for your property and branded entirely as your own. Guests can browse your cabins, check real-time availability, pay online, and manage their trip. You get a private admin area to manage rooms, bookings, guests, pricing, and see how the business is performing — all without needing a developer for day-to-day changes.

The site has two sides:

- **The guest-facing website** — what visitors and customers see and use.
- **The admin dashboard** — a private area only you (and anyone you promote to admin) can access, for running the business.

---

## 2. The Guest Experience

### 2.1 Homepage

The homepage is the first impression: a full-screen hero with your branding, a search bar to start a booking, trust badges (no booking fees, secure checkout, instant confirmation, 24/7 support), and a series of sections below it:

- **Featured cabins** — a curated preview of your top properties.
- **"The Full Relaxin Experience"** — a showcase of your property's unique perks (waterfront access, the entrance/welcome area, the slot gaming lounge) plus quick-glance amenities like the on-site ATM, sandy beach, and fire pits.
- **Amenities overview** — the comforts every guest can expect.
- **Photo gallery preview** — a taste of the full gallery.
- **Nearby attractions** — local things to do, with distance/drive-time, to help guests plan their stay.
- **Guest reviews** — real testimonials with star ratings.
- **FAQ** and a **contact form** for questions that come in directly from the site.

### 2.2 Browsing Cabins ("Explore")

The Explore page lists every cabin you've published, with:

- A live search box (search by cabin name as you type).
- Sorting: Default, Price (low→high or high→low), or Top Rated.
- A filter panel for narrowing by category and price range.
- Each cabin card shows its photo, name, rating, and nightly price at a glance.

### 2.3 Cabin Detail Page

Clicking into a cabin shows everything a guest needs to decide:

- A full photo gallery with a fullscreen lightbox viewer.
- Description, amenities (with icons), and bedroom/bathroom/guest-capacity details.
- Guest reviews and star ratings for that specific cabin.
- A "Save to Favorites" heart icon, so guests can shortlist cabins to come back to later.
- A booking widget showing price, a date picker, and a guest-count selector, leading straight into checkout.

### 2.4 Booking & Checkout

At checkout, the guest sees a clear price breakdown (nightly rate × nights, service fee, taxes, any discount) and chooses how to pay:

- **Pay in Full** — settle the entire stay now.
- **Half Now, Half Later (50%)** — pay a deposit today; the remaining balance can be paid securely online via a link emailed to them, or in person at check-in.

Payments are processed by **Stripe**, the same payment processor used by major travel and e-commerce platforms — guest card details never touch your server directly, which keeps the business well clear of card-data liability.

After paying, the guest lands on a **booking confirmation page** showing their booking ID, a status timeline (Confirmed → Check-in → Completed), the full price breakdown, and a "Contact Support" option. The page can also be printed for guests who want a paper copy.

### 2.5 Guest Accounts

Guests create an account with email/password (verified with a 6-digit emailed code) or sign in instantly with Google. Once signed in, they get a personal dashboard:

- **Overview** — upcoming trip countdown, quick stats (total bookings, favorites, completed stays), and recent booking activity.
- **My Bookings** — every past and upcoming booking, filterable by status, with the ability to cancel a pending/confirmed booking themselves.
- **Favorites** — every cabin they've saved.
- **Profile** — name and phone number.
- **Settings** — change display name, email, or password, and manage notification preferences.

### 2.6 Photo Gallery Page

A dedicated, editorial-style gallery page showcasing your property's best photography in a magazine-like grid, with a fullscreen viewer for browsing photo by photo.

### 2.7 Other Pages

- **About** — describes your different rental groups/styles (cabins, loft & luxe units, the loghouse).
- **Terms of Service** and **Privacy Policy** — standard legal pages.

---

## 3. Payments, Explained Simply

| Guest pays... | What happens |
|---|---|
| **Full amount** | Card is charged in full at booking. Booking goes to "pending" for your review/approval, then "confirmed." |
| **50% deposit** | Card is charged for half at booking. The guest is emailed a secure link to pay the remaining balance online at any time before arrival — or they can simply bring cash/card at check-in instead. Either way, once the balance is paid, your records update automatically. |

All charges, refunds, and balances are tracked automatically in the booking record — no manual bookkeeping needed.

---

## 4. Your Admin Dashboard

Everything below is only visible to you and anyone you've granted admin access.

### 4.1 Dashboard Home

A snapshot of the business: total bookings, total revenue, total rooms (and how many are currently available), total registered users, a monthly revenue chart, a breakdown of bookings by status, and a table of the most recent bookings.

### 4.2 Rooms

Create, edit, enable/disable, or delete each cabin listing. For each cabin you control:

- Title, description, nightly price, bedroom/bathroom count, max guests, category.
- Photos (multiple images per listing).
- Amenities — pick from a categorized list (kitchen, entertainment, outdoor, safety, views, etc.).
- Featured flag (to highlight it on the homepage), availability toggle, and a "Under Maintenance" flag for temporarily hiding a cabin without deleting it.

A cabin with active bookings can't be accidentally deleted — the system blocks it and tells you why.

### 4.3 Bookings

Every booking across the entire business, filterable by date range, searchable by booking ID or guest email. From here you can:

- **Approve** or **reject** pending bookings (with a custom reason sent to the guest).
- **Mark a booking refunded** after issuing a refund through Stripe.
- View full guest and payment details for any booking.

### 4.4 Users

A full list of everyone with an account:

- Search by name or email.
- Promote a user to **admin** (or remove admin access).
- **Block** a user (instantly prevents them from logging in) or unblock them.
- A **"Show Username/Email Table"** view for quickly scanning or copying a list of names and emails.
- A **"Download Excel"** button that exports the same list as a spreadsheet file — handy for mailing lists, guest records, or sharing with someone who isn't logged into the admin panel.

### 4.5 Coupons

Create discount codes for promotions — percentage-off or fixed-amount, with an optional minimum booking amount, a usage limit, and an expiry date. Toggle any coupon on or off without deleting it.

### 4.6 Gallery

Manage exactly which photos appear on the public Gallery page — upload new images, set a large/small display size, add captions, and remove outdated photos.

### 4.7 Nearby Attractions

Manage the "things to do nearby" list shown on the homepage — add a place, its distance, and approximate travel time from your property.

### 4.8 Analytics

A deeper look at performance: monthly revenue trends, your top-performing cabins, booking volume by category, and revenue broken down by booking status.

---

## 5. What Happens Automatically (No Action Needed)

The platform runs several things on its own, every day, with no one needing to click a button:

- **Booking confirmation emails** — sent the moment a payment succeeds.
- **Half-payment balance link** — automatically included in that confirmation email when a guest pays the 50% deposit option, so they can settle the rest online whenever they're ready.
- **Stay-completed "thank you" emails** — every night, the system checks for any confirmed booking whose checkout date has passed, automatically marks it "completed," and sends the guest a thank-you email inviting them to leave a review.
- **Admin new-booking alerts** — you're emailed automatically whenever a new booking comes in.
- **Email verification codes** — sent automatically when a guest signs up with email/password.
- **Password reset emails** — sent automatically when a guest forgets their password.
- **Contact form messages** — submitted directly to your inbox the moment a visitor sends one.

---

## 6. Feature Highlights

A few things worth knowing make this platform stand out:

- **Favorites/wishlist** — guests can save cabins and come back to them later.
- **Verified reviews** — only guests can leave a rating and review, keeping feedback genuine.
- **Secure payments** — handled entirely by Stripe, an industry-standard payment processor.
- **Automatic status tracking** — bookings move through Pending → Confirmed → Completed (or Cancelled/Rejected) with the guest kept informed by email at every step.
- **Mobile-friendly** — the entire site, including the admin dashboard, works cleanly on phones and tablets.
- **Light & dark mode** — guests can choose their preferred look in their account settings.
- **Spreadsheet exports** — guest contact lists can be pulled straight from the admin Users page.

---

## 7. A Couple of Notes

- **Coupons** are fully built and ready to use, but the entry field is currently hidden from the checkout page. Let us know if/when you'd like promotional codes turned on for guests.
- The **half-payment balance link** relies on a small Stripe configuration step (enabling one additional webhook event) — this is a one-time setup item on our end, not something you need to do.

---

*Questions about anything in this manual, or want a feature added or changed? Just ask — that's what we're here for.*
