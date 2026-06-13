import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Relaxin Cabins — how we collect, use, and protect your personal information.',
};

const LAST_UPDATED = 'June 1, 2026';

export default function PrivacyPage() {
  return (
    <div className="bg-white pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-stone-100 text-stone-500 text-xs font-semibold uppercase tracking-widest mb-4">
            Legal
          </span>
          <h1 className="text-4xl font-black text-stone-900 mb-3">Privacy Policy</h1>
          <p className="text-stone-400 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="prose prose-stone max-w-none space-y-8 text-stone-600">

          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-3">1. Information We Collect</h2>
            <p className="leading-relaxed mb-3">When you use Relaxin Cabins, we collect the following types of information:</p>
            <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
              <li><strong>Account information:</strong> Name, email address, and phone number when you register.</li>
              <li><strong>Booking details:</strong> Check-in and check-out dates, number of guests, and special requests.</li>
              <li><strong>Payment information:</strong> Processed securely via Stripe. We never store your full card number.</li>
              <li><strong>Usage data:</strong> Pages visited, search queries, and device/browser information for improving our service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
              <li>To process and manage your cabin bookings.</li>
              <li>To send booking confirmations and important stay-related communications.</li>
              <li>To respond to your customer support inquiries.</li>
              <li>To improve our platform, detect fraud, and maintain security.</li>
              <li>To send promotional offers and updates — you may opt out at any time.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-3">3. Sharing Your Information</h2>
            <p className="leading-relaxed text-sm">
              We do not sell your personal information. We may share data with:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed mt-2">
              <li><strong>Stripe</strong> — to securely process payments.</li>
              <li><strong>Firebase / Google</strong> — for authentication, database, and hosting services.</li>
              <li><strong>Law enforcement</strong> — when required by applicable law.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-3">4. Data Retention</h2>
            <p className="leading-relaxed text-sm">
              We retain your account and booking data for as long as your account is active or as needed to provide our services.
              You may request deletion of your account at any time by contacting us at{' '}
              <a href="mailto:relaxingatcabins@gmail.com" className="text-amber-600 hover:underline">relaxingatcabins@gmail.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-3">5. Cookies</h2>
            <p className="leading-relaxed text-sm">
              We use cookies and similar technologies to maintain your session, remember your preferences,
              and analyze site traffic. You may disable cookies in your browser settings, though some features
              of the site may not function correctly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-3">6. Security</h2>
            <p className="leading-relaxed text-sm">
              We use industry-standard encryption (TLS/HTTPS) for all data in transit. Payments are handled
              entirely by Stripe, which is PCI-DSS compliant. While no system is 100% secure, we take reasonable
              measures to protect your information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-3">7. Your Rights</h2>
            <p className="leading-relaxed text-sm mb-2">Depending on your location, you may have the right to:</p>
            <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
              <li>Access the personal data we hold about you.</li>
              <li>Request correction of inaccurate data.</li>
              <li>Request deletion of your data.</li>
              <li>Opt out of marketing communications.</li>
            </ul>
            <p className="leading-relaxed text-sm mt-2">
              To exercise any of these rights, contact us at{' '}
              <a href="mailto:relaxingatcabins@gmail.com" className="text-amber-600 hover:underline">relaxingatcabins@gmail.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-3">8. Contact Us</h2>
            <p className="leading-relaxed text-sm">
              If you have questions about this Privacy Policy, please contact us:
            </p>
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
