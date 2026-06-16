import Link from 'next/link';
import { Mountain, Mail, Phone, MapPin, Globe, Share2, Link2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-600 rounded-xl">
                <Mountain className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white">Relax Cabin</span>
            </Link>
            <p className="text-sm leading-relaxed">
              7 unique rentals on one beautiful property in New Lisbon, WI — open year-round, pet-friendly, minutes from Castle Rock Lake.
            </p>
            <div className="flex gap-3">
              {[
                { href: '#', label: 'Instagram', icon: Globe },
                { href: '#', label: 'Twitter / X', icon: Share2 },
                { href: '#', label: 'Facebook', icon: Link2 },
              ].map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  title={label}
                  className="p-2 rounded-xl bg-stone-800 hover:bg-amber-600 hover:text-white transition-colors"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-white font-semibold mb-4">Our Rentals</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'All 7 Rentals',    href: '/rooms' },
                { label: 'The Lodge',         href: '/rooms' },
                { label: 'The Loft',          href: '/rooms' },
                { label: 'The Luxe',          href: '/rooms' },
                { label: 'Wooded Cabins',     href: '/rooms' },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="hover:text-amber-400 transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'About Us',        href: '/about'    },
                { label: 'Blog',            href: '/blog'     },
                { label: 'Privacy Policy',  href: '/privacy'  },
                { label: 'Terms of Service',href: '/terms'    },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="hover:text-amber-400 transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 mt-0.5 text-amber-500 shrink-0" />
                <span>N6768 WI-58, New Lisbon, WI 53950</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-amber-500 shrink-0" />
                <span>608-350-0800</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-amber-500 shrink-0" />
                <span>relaxingatcabins@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-stone-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm">© {new Date().getFullYear()} Relax Cabin. All rights reserved.</p>
          <p className="text-sm">Built with passion for nature lovers everywhere.</p>
        </div>
      </div>
    </footer>
  );
}
