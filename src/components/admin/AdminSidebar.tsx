'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import NextImage from 'next/image';
import {
  LayoutDashboard, Home, Calendar, Users, BarChart3, MapPin, Images, Mountain,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/rooms', label: 'Cabins', icon: Home },
  { href: '/admin/bookings', label: 'Bookings', icon: Calendar },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/gallery',  label: 'Gallery',  icon: Images  },
  { href: '/admin/nearby',   label: 'Nearby',   icon: MapPin  },
];

function SidebarLogo({ size }: { size: number }) {
  const [err, setErr] = React.useState(false);
  if (err) {
    return (
      <div className="p-1.5 bg-amber-600 rounded-lg shrink-0">
        <Mountain className="h-4 w-4 text-white" />
      </div>
    );
  }
  return (
    <NextImage src="/logo.gif" alt="Relaxin Cabins" width={size} height={size}
      className="object-contain shrink-0" onError={() => setErr(true)} />
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || (href !== '/admin' && pathname.startsWith(href));

  return (
    <div className="w-full lg:w-56 lg:shrink-0 lg:self-stretch">
      {/* Mobile: horizontal scrollable nav bar */}
      <nav className="lg:hidden bg-stone-900 rounded-2xl p-2 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          <div className="flex items-center gap-2 px-3 py-2 mr-2 border-r border-stone-700 shrink-0">
            <SidebarLogo size={28} />
            <span className="text-xs font-semibold text-white">Admin</span>
          </div>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap',
                isActive(item.href)
                  ? 'bg-amber-600 text-white'
                  : 'text-stone-400 hover:bg-stone-800 hover:text-white'
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Desktop: vertical sidebar */}
      <aside className="hidden lg:block sticky top-24">
        <div className="bg-stone-900 rounded-2xl p-4">
          <div className="flex items-center gap-2 px-2 py-3 mb-4 border-b border-stone-700">
            <SidebarLogo size={36} />
            <div>
              <p className="text-xs font-semibold text-white">Admin Panel</p>
              <p className="text-xs text-stone-400">Relaxin Cabins</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive(item.href)
                    ? 'bg-amber-600 text-white'
                    : 'text-stone-400 hover:bg-stone-800 hover:text-white'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>
    </div>
  );
}
