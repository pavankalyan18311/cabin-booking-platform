import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for Relaxin Cabins — the rules and conditions that govern your use of our platform.',
};

const LAST_UPDATED = 'June 1, 2026';

export default function TermsPage() {
  return (
    <div className="bg-white pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-stone-100 text-stone-500 text-xs font-semibold uppercase tracking-widest mb-4">
            Legal
          </span>
          <h1 className="text-4xl font-black text-stone-900 mb-3">Terms of Service</h1>
          <p className="text-stone-400 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="space-y-8 text-stone-600">

          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-3">1. Acceptance of Terms</h2>
            <p className="leading-relaxed text-sm">
              By accessing or using the Relaxin Cabins website and booking platform, you agree to be bound
              by these Terms of Service. If you do not agree, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-3">2. Bookings & Reservations</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
              <li>All bookings are subject to availability and confirmation by Relaxin Cabins.</li>
              <li>You must be at least 18 years of age to make a reservation.</li>
              <li>The number of guests may not exceed the maximum occupancy stated on the listing.</li>
              <li>Check-in and check-out times are specified in your booking confirmation.</li>
              <li>You are responsible for leaving the property in the same condition as you found it.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-3">3. Payments</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
              <li>Payment is required at the time of booking. We accept all major credit and debit cards via Stripe.</li>
              <li>Prices are displayed in US Dollars (USD) and include applicable taxes and service fees.</li>
              <li>If you selected a partial payment plan, the remaining balance is due at check-in.</li>
              <li>We reserve the right to correct pricing errors. You will be notified before any charge is processed.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-3">4. Cancellations & Refunds</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
              <li>All paid prepayments are non-refundable, regardless of when the cancellation is made.</li>
              <li>Please review your selected dates carefully before confirming a booking.</li>
              <li>The remaining balance, where applicable, is due before arrival as shown at checkout.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-3">5. Guest Conduct</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
              <li>Guests must comply with all house rules provided at check-in and in your booking confirmation.</li>
              <li>Noise, parties, or events beyond the listed occupancy are prohibited.</li>
              <li>Any damage to the property will be the financial responsibility of the booking guest.</li>
              <li>Smoking is prohibited inside all cabins.</li>
              <li>Pet policies vary per property and are listed on each cabin page.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-3">6. Limitation of Liability</h2>
            <p className="leading-relaxed text-sm">
              Relaxin Cabins is not liable for any indirect, incidental, or consequential damages arising from
              your use of our platform or your stay at a listed property. Our total liability shall not exceed
              the amount paid for your booking.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-3">7. Changes to Terms</h2>
            <p className="leading-relaxed text-sm">
              We reserve the right to modify these Terms at any time. Changes become effective upon posting to
              this page. Continued use of our service constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-3">8. Contact</h2>
            <p className="leading-relaxed text-sm">For questions about these Terms, contact us:</p>
            <address className="not-italic mt-3 text-sm space-y-1">
              <p className="font-semibold text-stone-900">Relaxin Cabins</p>
              <p>N6768 WI-58, New Lisbon, WI 53950</p>
              <p><a href="tel:6083500800" className="text-amber-600 hover:underline">608-350-0800</a></p>
              <p><a href="mailto:relaxingatcabins@gmail.com" className="text-amber-600 hover:underline">relaxingatcabins@gmail.com</a></p>
            </address>
          </section>

        </div>
      </div>
    </div>
  );
}
