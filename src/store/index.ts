import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Room, SearchFilters } from '@/types';

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

interface SearchState {
  filters: SearchFilters;
  setFilters: (filters: Partial<SearchFilters>) => void;
  clearFilters: () => void;
}

interface UIState {
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

interface FavoritesState {
  favorites: string[];
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  setFavorites: (ids: string[]) => void;
  toggleFavorite: (id: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
}));

export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      filters: {},
      setFilters: (filters) =>
        set((s) => ({ filters: { ...s.filters, ...filters } })),
      clearFilters: () => set({ filters: {} }),
    }),
    { name: 'search-filters' }
  )
);

export const useUIStore = create<UIState>((set) => ({
  isMobileMenuOpen: false,
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
}));

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set) => ({
      favorites: [],
      _hasHydrated: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),
      setFavorites: (ids) => set({ favorites: ids }),
      toggleFavorite: (id) =>
        set((s) => ({
          favorites: s.favorites.includes(id)
            ? s.favorites.filter((f) => f !== id)
            : [...s.favorites, id],
        })),
    }),
    {
      name: 'user-favorites',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
