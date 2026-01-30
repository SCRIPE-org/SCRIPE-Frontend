import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@modules/auth/core/domain/entities/User';

interface AppState {
      // Sidebar State
      sidebarOpen: boolean;
      toggleSidebar: () => void;
      setSidebarOpen: (open: boolean) => void;

      // UI Density (ERP Feature)
      density: 'compact' | 'comfortable' | 'spacious';
      setDensity: (density: 'compact' | 'comfortable' | 'spacious') => void;

      // Auth State
      user: User | null;
      isAuthenticated: boolean;
      setUser: (user: User | null) => void;
      logout: () => void;

      // Hydration State
      _hasHydrated: boolean;
      setHasHydrated: (state: boolean) => void;
}

export const useAppStore = create<AppState>()(
      persist(
            (set) => ({
                  sidebarOpen: true,
                  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
                  setSidebarOpen: (open) => set({ sidebarOpen: open }),

                  density: 'comfortable',
                  setDensity: (density) => set({ density }),

                  // Auth State
                  user: null,
                  isAuthenticated: false,
                  setUser: (user) => set({ user, isAuthenticated: !!user }),
                  logout: () => set({ user: null, isAuthenticated: false }),

                  // Hydration State
                  _hasHydrated: false,
                  setHasHydrated: (state) => set({ _hasHydrated: state }),
            }),
            {
                  name: 'app-storage', // unique name
                  partialize: (state) => ({
                        // Persist these fields
                        sidebarOpen: state.sidebarOpen,
                        density: state.density,
                        user: state.user,
                        isAuthenticated: state.isAuthenticated
                  }),
                  onRehydrateStorage: () => (state) => {
                        state?.setHasHydrated(true);
                  },
            }
      )
);
