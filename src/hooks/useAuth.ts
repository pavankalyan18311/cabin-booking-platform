'use client';
import { useEffect } from 'react';
import { onAuthChange, getUserProfile } from '@/services/auth.service';
import { useAuthStore, useFavoritesStore } from '@/store';
import { getFavorites } from '@/services/users.service';
import type { User } from '@/types';

// How long to wait for Firebase before giving up and showing the UI anyway
const AUTH_TIMEOUT_MS = 4000;

// Lightweight localStorage cache so returning users see their profile instantly.
// Security note: client-side role is for UI routing only — all server actions
// re-validate against Firestore/Admin SDK regardless of this cached value.
const CACHE_KEY = 'relaxcabin_user';

function readCache(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function writeCache(user: User | null) {
  if (typeof window === 'undefined') return;
  try {
    if (user) localStorage.setItem(CACHE_KEY, JSON.stringify(user));
    else localStorage.removeItem(CACHE_KEY);
  } catch {}
}

export function useAuth() {
  const { user, loading, setUser, setLoading } = useAuthStore();
  const { setFavorites } = useFavoritesStore();

  useEffect(() => {
    // ── Step 0: apply cache before Firebase even responds ─────────────────────
    // On return visits this makes the UI appear instantly with the correct role.
    const cached = readCache();
    if (cached) {
      setUser(cached);
      setLoading(false);
    }

    // ── Safety net: stop blocking after AUTH_TIMEOUT_MS regardless ────────────
    const timeout = setTimeout(() => {
      if (useAuthStore.getState().loading) {
        console.warn('[useAuth] Firebase auth timed out — showing UI as logged-out');
        setLoading(false);
      }
    }, AUTH_TIMEOUT_MS);

    // ── Step 1: subscribe to Firebase auth state ──────────────────────────────
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      clearTimeout(timeout);

      if (firebaseUser) {
        // If there's no cache yet, unblock the UI immediately with a stub user
        // so the screen isn't blank while we fetch the Firestore profile.
        if (!useAuthStore.getState().user) {
          const stub: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email ?? '',
            displayName: firebaseUser.displayName ?? 'User',
            photoURL: firebaseUser.photoURL ?? '',
            role: 'user',
            isBlocked: false,
            isEmailVerified: firebaseUser.emailVerified,
            authProvider:
              firebaseUser.providerData[0]?.providerId === 'google.com'
                ? 'google'
                : 'email',
            createdAt: '',
            updatedAt: '',
          };
          setUser(stub);
          setLoading(false);
        } else {
          // Cache was already applied — clear the loading gate
          setLoading(false);
        }

        // ── Step 2: fetch full Firestore profile in the background ─────────────
        try {
          const [profile, favIds] = await Promise.all([
            getUserProfile(firebaseUser.uid),
            getFavorites(firebaseUser.uid).catch(() => [] as string[]),
          ]);
          // Guard against logout race: only update if still the same user
          if (useAuthStore.getState().user?.uid === firebaseUser.uid) {
            if (profile) {
              setUser(profile);
              writeCache(profile); // keep cache fresh for next visit
            }
            setFavorites(favIds);
          }
        } catch (err) {
          console.error('[useAuth] Firestore profile load failed:', err);
          // Stub/cached user remains — auth still works
        }
      } else {
        // Logged out — clear everything
        writeCache(null);
        setUser(null);
        setFavorites([]);
        setLoading(false);
      }
    });

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, [setUser, setLoading, setFavorites]);

  return { user, loading, isAuthenticated: !!user, isAdmin: user?.role === 'admin' };
}
