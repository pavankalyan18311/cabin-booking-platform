'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { LogOut, LayoutDashboard, Shield, Settings, Heart, Mountain, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/store';
import { logoutUser } from '@/services/auth.service';
import { toTitleCase } from '@/lib/utils';
import { toast } from 'sonner';

const navLinks = [
  { href: '/rooms',          label: 'Explore'   },
  { href: '/#amenities',    label: 'Amenities' },
  { href: '/#testimonials', label: 'Reviews'   },
  { href: '/#contact',      label: 'Contact'   },
];

function LogoMark({ dark }: { dark: boolean }) {
  const [err, setErr] = useState(false);
  if (err) {
    return (
      <div className="p-1.5 bg-amber-600 rounded-xl group-hover:bg-amber-700 transition-colors">
        <Mountain className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
      </div>
    );
  }
  return (
    <Image
      src="/logo.gif"
      alt="Relaxin Cabins"
      width={40}
      height={40}
      className="h-9 w-9 lg:h-10 lg:w-10 object-contain drop-shadow-sm"
      onError={() => setErr(true)}
    />
  );
}

export default function Navbar() {
  const [scrolled,      setScrolled]      = useState(false);
  const [dropdownOpen,  setDropdownOpen]  = useState(false);
  const [mounted,       setMounted]       = useState(false);
  const { user } = useAuthStore();
  const router   = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  useEffect(() => { setMounted(true); }, []);

  // Pages with dark/hero backgrounds — navbar stays transparent until scroll
  const isDarkPage = pathname === '/' || pathname.startsWith('/rooms') || pathname.startsWith('/checkout') || pathname.startsWith('/admin');
  const dark = scrolled || !isDarkPage;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setDropdownOpen(false); }, [pathname]);

  const handleLogout = async () => {
    await logoutUser();
    toast.success('Logged out successfully');
    router.push('/');
    setDropdownOpen(false);
  };

  const userInitials = user?.displayName
    ?.split(' ').map((n) => n[0]).join('').toUpperCase() ?? 'U';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      dark
        ? 'bg-white/96 dark:bg-stone-900/96 backdrop-blur-md shadow-sm border-b border-stone-100 dark:border-stone-800'
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 lg:h-16">

          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <LogoMark dark={dark} />
            <span className={`font-bold text-base lg:text-lg tracking-tight transition-colors ${
              dark ? 'text-stone-900 dark:text-stone-100' : 'text-white'
            }`}>
              Relaxin Cabins
            </span>
          </Link>

          {/* ── Desktop nav links ── */}
          <div className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  dark
                    ? 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* ── Auth area ── */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {/* Theme toggle — logged-in users, non-landing pages only */}
                {mounted && pathname !== '/' && (
                  <button
                    type="button"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className={`p-2 rounded-xl transition-colors ${
                      dark
                        ? 'text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-white'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                    title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                  >
                    {theme === 'dark'
                      ? <Sun className="h-5 w-5" />
                      : <Moon className="h-5 w-5" />}
                  </button>
                )}

                {/* Favorites — desktop only (bottom nav handles mobile) */}
                <Link
                  href="/dashboard/favorites"
                  className={`hidden lg:flex p-2 rounded-xl transition-colors ${
                    dark
                      ? 'text-stone-500 hover:bg-stone-100 hover:text-red-500'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                  title="Favorites"
                >
                  <Heart className="h-5 w-5" />
                </Link>

                {/* Avatar + dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className={`flex items-center gap-2 p-1.5 rounded-xl transition-colors ${
                      dark ? 'hover:bg-stone-100' : 'hover:bg-white/10'
                    }`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL} alt={user.displayName} />
                      <AvatarFallback className="text-xs font-semibold bg-amber-100 text-amber-700">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <span className={`text-sm font-medium hidden lg:block ${
                      dark ? 'text-stone-900' : 'text-white'
                    }`}>
                      {toTitleCase(user.displayName?.split(' ')[0])}
                    </span>
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setDropdownOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.96 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-52 bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-100 dark:border-stone-800 py-1.5 z-50"
                        >
                          <div className="px-3 py-2.5 border-b border-stone-100 mb-1">
                            <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">{toTitleCase(user.displayName)}</p>
                            <p className="text-xs text-stone-400 truncate">{user.email}</p>
                          </div>
                          <DropdownItem href="/dashboard"          icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard"   onClick={() => setDropdownOpen(false)} />
                          <DropdownItem href="/dashboard/settings" icon={<Settings className="h-4 w-4" />}        label="Settings"    onClick={() => setDropdownOpen(false)} />
                          {user.role === 'admin' && (
                            <DropdownItem href="/admin" icon={<Shield className="h-4 w-4" />} label="Admin Panel" onClick={() => setDropdownOpen(false)} />
                          )}
                          <div className="border-t border-stone-100 mt-1 pt-1 px-1">
                            <button
                              type="button"
                              onClick={handleLogout}
                              className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                            >
                              <LogOut className="h-4 w-4" />
                              Sign Out
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                {/* Desktop */}
                <Link href="/login" className="hidden lg:block">
                  <Button variant="ghost" size="sm" className={dark ? '' : 'text-white hover:bg-white/10'}>
                    Sign In
                  </Button>
                </Link>
                <Link href="/register" className="hidden lg:block">
                  <Button size="sm" variant="premium">Get Started</Button>
                </Link>

                {/* Mobile: compact sign-in only — bottom nav handles explore/home */}
                <Link href="/login" className="lg:hidden">
                  <Button size="sm" variant="premium" className="h-9 px-4 text-sm">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function DropdownItem({
  href, icon, label, onClick,
}: {
  href: string; icon: React.ReactNode; label: string; onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 px-3 py-2 mx-1 text-sm text-stone-700 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:text-amber-700 dark:hover:text-amber-400 rounded-xl transition-colors"
    >
      {icon}
      {label}
    </Link>
  );
}
