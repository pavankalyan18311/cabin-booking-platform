'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Heart, Calendar, User, Home } from 'lucide-react';
import { useAuthStore } from '@/store';
import { cn } from '@/lib/utils';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  // Hide on admin, auth, checkout, booking detail (has own CTAs), and verify-email
  const hide =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/verify-email') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/booking/') ||
    (pathname.startsWith('/rooms/') && pathname !== '/rooms');

  if (hide) return null;

  const items = user
    ? [
        { href: '/rooms',                label: 'Explore',  icon: Search   },
        { href: '/dashboard/favorites',  label: 'Saved',    icon: Heart    },
        { href: '/dashboard/bookings',   label: 'Bookings', icon: Calendar },
        { href: '/dashboard',            label: 'Profile',  icon: User     },
      ]
    : [
        { href: '/',       label: 'Home',    icon: Home   },
        { href: '/rooms',  label: 'Explore', icon: Search },
        { href: '/login',  label: 'Sign In', icon: User   },
      ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/98 backdrop-blur-xl border-t border-stone-100 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
      <div className="flex items-stretch justify-around pb-safe pt-1">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/' && item.href !== '/rooms' && pathname.startsWith(item.href)) ||
            (item.href === '/rooms' && (pathname === '/rooms' || pathname.startsWith('/rooms?')));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 flex-1 py-2 px-1 min-h-[52px] transition-colors',
                isActive ? 'text-amber-600' : 'text-stone-400 hover:text-stone-600'
              )}
            >
              <div className={cn(
                'flex items-center justify-center w-8 h-8 rounded-xl transition-all',
                isActive ? 'bg-amber-50' : ''
              )}>
                <item.icon className={cn('h-5 w-5', isActive ? 'stroke-[2.5px]' : 'stroke-[1.75px]')} />
              </div>
              <span className={cn(
                'text-[10px] leading-none font-medium',
                isActive ? 'text-amber-600 font-semibold' : 'text-stone-400'
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
