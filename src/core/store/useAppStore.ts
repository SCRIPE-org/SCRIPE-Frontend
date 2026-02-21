import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@modules/auth/core/domain/entities/User";
import { PermissionCode, AdminRole } from "@core/common/types/permissions";
import { secureTokenService } from "@core/common/secure-token-service";
import { appLogger } from "../common/logger";

interface AppState {
  // Sidebar State
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // UI Density (ERP Feature)
  density: "compact" | "comfortable" | "spacious";
  setDensity: (density: "compact" | "comfortable" | "spacious") => void;

  // Auth State
  user: User | null;
  isAuthenticated: boolean;
  permissions: PermissionCode[];
  roles: AdminRole[];
  restrictedFields: Record<string, string[]>;
  setUser: (user: User | null) => void;
  setAuth: (user: User, permissions: PermissionCode[], roles: AdminRole[]) => void;
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

      density: "comfortable",
      setDensity: (density) => set({ density }),

      // Auth State
      user: null,
      isAuthenticated: false,
      permissions: [],
      roles: [],
      restrictedFields: {},
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setAuth: (user, permissions, roles) =>
        set({
          user,
          isAuthenticated: true,
          permissions,
          roles,
          restrictedFields: user.restrictedFields ?? {},
        }),
      logout: () => {
        // Also clear tokens when logging out from store
        secureTokenService.clearTokens();
        set({
          user: null,
          isAuthenticated: false,
          permissions: [],
          roles: [],
          restrictedFields: {},
        });
      },

      // Hydration State
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: "app-storage",
      partialize: (state) => ({
        // Persist these fields
        sidebarOpen: state.sidebarOpen,
        density: state.density,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        permissions: state.permissions,
        roles: state.roles,
        restrictedFields: state.restrictedFields,
      }),
      onRehydrateStorage: () => (state) => {
        // With in-memory tokens, the access token is ALWAYS null after page reload.
        // The persisted isAuthenticated is just a HINT — the route-guard will
        // call /auth/refresh to validate the httpOnly cookie and get a new token.
        // Do NOT call logout() here — that would clear the Zustand auth state
        // before the route-guard has a chance to silently refresh.
        state?.setHasHydrated(true);
      },
    }
  )
);
