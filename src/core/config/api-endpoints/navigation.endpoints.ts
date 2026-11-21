import { V1 } from "./_shared";

export const NAVIGATION_ENDPOINTS = {
  MENUS: {
    /** GET /menus/navigation — single-pass navigation bootstrap (optionally passing Tier 1 ?redirect=) */
    NAVIGATION: `${V1}/menus/navigation`,
    NAVIGATION_BOOTSTRAP: (redirect?: string | null) =>
      redirect ? `${V1}/menus/navigation?redirect=${encodeURIComponent(redirect)}` : `${V1}/menus/navigation`,
    /** GET /menus/navigation?workspace={key} — JIT load full menu tree for a specific workspace */
    WORKSPACE_NAVIGATION: (workspaceKey: string) =>
      `${V1}/menus/navigation?workspace=${encodeURIComponent(workspaceKey)}`,
    /** GET /menus/navigation/workspaces — lightweight workspace stubs (no menu items) */
    AUTHORIZED_WORKSPACES: `${V1}/menus/navigation/workspaces`,
    /** POST /menus/navigation/workspaces/{key}/pin — toggle pin state for current admin */
    TOGGLE_WORKSPACE_PIN: (workspaceKey: string) =>
      `${V1}/menus/navigation/workspaces/${encodeURIComponent(workspaceKey)}/pin`,
    /**
     * GET /menus/navigation/routes — EAGER routes load (Option B).
     * Returns flat array of ALL accessible routes across ALL workspaces.
     * Called ONCE on login to populate useNavigationStore.allRoutes.
     * Eliminates route-guard race conditions during JIT workspace fetches.
     */
    AUTHORIZED_ROUTES: `${V1}/menus/navigation/routes`,
    ACTIVE_OVERRIDES: `${V1}/menus/navigation/overrides`,
    LIST: `${V1}/menus`,
    BY_ID: (id: string) => `${V1}/menus/${id}`,
    CREATE: `${V1}/menus`,
    UPDATE: (id: string) => `${V1}/menus/${id}`,
    DELETE: (id: string) => `${V1}/menus/${id}`,
    REORDER: `${V1}/menus/reorder`,
    ROLE_VISIBILITY: `${V1}/menus/role-visibility`,
    OVERRIDES: `${V1}/menus/overrides`,
    DELETE_OVERRIDE: (id: string) => `${V1}/menus/overrides/${id}`,
  },

  WORKSPACES: {
    LIST: `${V1}/workspaces`,
    CREATE: `${V1}/workspaces`,
    UPDATE: (id: string) => `${V1}/workspaces/${id}`,
    DELETE: (id: string) => `${V1}/workspaces/${id}`,
    REORDER: `${V1}/workspaces/reorder`,
  },
};
