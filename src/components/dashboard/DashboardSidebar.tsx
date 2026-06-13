'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, Heart, User, Settings, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuthStore } from '@/store';
import { cn, toTitleCase } from '@/lib/utils';

const navItems = [
  { href: '/dashboard',           label: 'Overview',    icon: LayoutDashboard, accent: 'text-amber-400'   },
  { href: '/dashboard/bookings',  label: 'My Bookings', icon: Calendar,        accent: 'text-blue-400'    },
  { href: '/dashboard/favorites', label: 'Favorites',   icon: Heart,           accent: 'text-rose-400'    },
  { href: '/dashboard/profile',   label: 'Profile',     icon: User,            accent: 'text-emerald-400' },
  { href: '/dashboard/settings',  label: 'Settings',    icon: Settings,        accent: 'text-orange-400'  },
];

export default function DashboardSidebar() {
  const pathname  = usePathname();
  const { user }  = useAuthStore();

  const initials  = user?.displayName?.split(' ').map((n) => n[0]).join('').toUpperCase() ?? 'U';
  const isActive  = (href: string) => pathname === href;

  return (
    <div className="w-full lg:w-64 lg:shrink-0 lg:self-stretch">

      {/* ── Mobile: horizontal scrollable bar ── */}
      <div className="lg:hidden dash-sidebar rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-white/8">
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarFallback className="text-xs bg-gradient-to-br from-amber-500 to-orange-600 text-white font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <p className="text-sm font-semibold text-white/90 truncate">{toTitleCase(user?.displayName)}</p>
        </div>
        <nav className="overflow-x-auto">
          <div className="flex gap-1 p-2 min-w-max">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap',
                    active ? 'dash-nav-active text-amber-300' : 'text-white/75 hover:text-white hover:bg-white/6'
                  )}>
                  <item.icon className={cn('h-4 w-4 shrink-0', active ? 'text-amber-400' : 'text-white/65')} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* ── Desktop: vertical sidebar ── */}
      <aside className="hidden lg:block sticky top-24">
        <div className="dash-sidebar rounded-2xl p-4">

          {/* User card */}
          <div className="flex items-center gap-3 p-3 mb-5 rounded-xl bg-white/6 border border-white/8">
            <Avatar className="h-11 w-11 shrink-0">
              <AvatarFallback className="text-base font-black bg-gradient-to-br from-amber-400 via-orange-500 to-yellow-400 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-bold text-white text-sm truncate">{toTitleCase(user?.displayName)}</p>
              <p className="text-xs text-white/65 truncate">{user?.email}</p>
              <span className="inline-block mt-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full
                bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-300 capitalize">
                {user?.role}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-white/8 mb-3" />

          {/* Nav */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                    active
                      ? 'dash-nav-active text-amber-200'
                      : 'text-white/50 hover:text-white/85 hover:bg-white/6'
                  )}>
                  <item.icon className={cn('h-4 w-4 shrink-0 transition-colors', active ? 'text-amber-400' : `${item.accent} opacity-50`)} />
                  <span className="flex-1">{item.label}</span>
                  {active && <ChevronRight className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                </Link>
              );
            })}
          </nav>

          {/* Bottom divider + tagline */}
          <div className="mt-5 pt-4 border-t border-white/8">
            <p className="text-[10px] text-white/50 text-center tracking-widest uppercase">Relax Cabin</p>
          </div>
        </div>
      </aside>
    </div>
  );
}
