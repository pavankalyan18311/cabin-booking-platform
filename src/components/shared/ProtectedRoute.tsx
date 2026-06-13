'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store';
import LoadingScreen from './LoadingScreen';

interface Props {
  children: React.ReactNode;
  requireAdmin?: boolean;
  // Set true on pages that don't require email verification (e.g. booking detail after payment)
  skipEmailGate?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false, skipEmailGate = false }: Props) {
  const { user, loading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (user.isBlocked) {
      router.push('/');
      return;
    }
    if (requireAdmin && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    // Gate email/password users who haven't verified their email yet.
    // Google users are always auto-verified; skipEmailGate bypasses for
    // pages reachable immediately after payment (booking confirmation).
    if (!skipEmailGate && user.authProvider === 'email' && user.isEmailVerified === false) {
      router.push('/verify-email');
    }
  }, [user, loading, router, requireAdmin, skipEmailGate, pathname]);

  if (loading) return <LoadingScreen />;
  if (!user) return null;
  if (user.isBlocked) return null;
  if (requireAdmin && user.role !== 'admin') return null;
  if (!skipEmailGate && user.authProvider === 'email' && user.isEmailVerified === false) return null;

  return <>{children}</>;
}
