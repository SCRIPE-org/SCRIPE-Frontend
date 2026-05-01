import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@modules/auth/core/domain/entities/User";
import { PermissionCode, AdminRole } from "@core/common/types/permissions";
import { secureTokenService } from "@core/common/secure-token-service";
import { STORAGE_KEYS } from "@core/config/storage-keys";

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

  // Subscription State (populated from login response)
  subscriptionStatus: string | null;
  gracePhase: string | null;
  editionName: string | null;
  setSubscriptionInfo: (
    status: string | null,
    gracePhase: string | null,
    editionName: string | null
  ) => void;

  // Must Change Password (force password change on first login)
  mustChangePassword: boolean;
  setMustChangePassword: (must: boolean) => void;

  // Tenant context (for tenant-aware logout redirect)
  tenantCode: string | null;
  setTenantCode: (code: string | null) => void;

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
      // ... existing code in setAuth ...
      setAuth: (user, permissions, roles) => {
        if (typeof document !== "undefined") {
          document.cookie = `${STORAGE_KEYS.nexora_auth_state}=true; path=/; max-age=2592000; samesite=Lax`;
        }
        set({
          user,
          isAuthenticated: true,
          permissions,
          roles,
          restrictedFields: user.restrictedFields ?? {},
        });
      },
      logout: () => {
        if (typeof document !== "undefined") {
          document.cookie = `${STORAGE_KEYS.nexora_auth_state}=; path=/; max-age=0; samesite=Lax`;
        }
        // Also clear tokens when logging out from store
        secureTokenService.clearTokens();
        set({
          user: null,
          isAuthenticated: false,
          permissions: [],
          roles: [],
          restrictedFields: {},
          tenantCode: null,
          subscriptionStatus: null,
          gracePhase: null,
          editionName: null,
          mustChangePassword: false,
        });
      },

      // Subscription State
      subscriptionStatus: null,
      gracePhase: null,
      editionName: null,
      setSubscriptionInfo: (status, gracePhase, editionName) =>
        set({ subscriptionStatus: status, gracePhase, editionName }),

      // Must Change Password
      mustChangePassword: false,
      setMustChangePassword: (must) => set({ mustChangePassword: must }),

      // Tenant context
      tenantCode: null,
      setTenantCode: (code) => set({ tenantCode: code }),

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
        tenantCode: state.tenantCode,
        subscriptionStatus: state.subscriptionStatus,
        gracePhase: state.gracePhase,
        editionName: state.editionName,
        mustChangePassword: state.mustChangePassword,
      }),
      onRehydrateStorage: () => (state) => {
        // With in-memory tokens, the access token is ALWAYS null after page reload.
        // The persisted isAuthenticated is just a HINT — the route-guard will
        // call /auth/refresh to validate the httpOnly cookie and get a new token.
        // Do NOT call logout() here — that would clear the Zustand auth state
        // before the route-guard has a chance to silently refresh.
        state?.setHasHydrated(true);

        // Sidebar pref fallback: if no persisted sidebar state, check tenant pref
        if (typeof window !== "undefined") {
          try {
            const stored = localStorage.getItem("app-storage");
            const hasPersisted = stored && JSON.parse(stored).state?.sidebarOpen !== undefined;
            if (!hasPersisted) {
              const prefCollapsed = localStorage.getItem(STORAGE_KEYS.PREF_SIDEBAR_COLLAPSED);
              if (prefCollapsed !== null) {
                state?.setSidebarOpen(prefCollapsed !== "true");
              }
            }
          } catch {
            /* ignore parse errors */
          }
        }
      },
    }
  )
);
