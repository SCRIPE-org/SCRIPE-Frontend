import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
      // Sidebar State
      sidebarOpen: boolean;
      toggleSidebar: () => void;
      setSidebarOpen: (open: boolean) => void;

      // UI Density (ERP Feature)
      density: 'compact' | 'comfortable' | 'spacious';
      setDensity: (density: 'compact' | 'comfortable' | 'spacious') => void;
}

export const useAppStore = create<AppState>()(
      persist(
            (set) => ({
                  sidebarOpen: true,
                  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
                  setSidebarOpen: (open) => set({ sidebarOpen: open }),

                  density: 'comfortable',
                  setDensity: (density) => set({ density }),
            }),
            {
                  name: 'app-storage', // unique name
            }
      )
);
