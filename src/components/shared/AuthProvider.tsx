'use client';
import { useAuth } from '@/hooks/useAuth';

// useAuth already fetches favorites via Promise.all inside onAuthChange.
// No secondary effect needed here — it would be a duplicate Firestore read.
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  useAuth();
  return <>{children}</>;
}
