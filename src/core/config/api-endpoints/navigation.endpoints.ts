import { V1 } from "./_shared";

export const NAVIGATION_ENDPOINTS = {
  MENUS: {
    /** GET /Menus/my — returns default workspace menu + WorkspaceGroups for all workspaces */
    MY: `${V1}/Menus/my`,
    /** GET /Menus/my?workspace={key} — JIT load full menu tree for a specific workspace */
    MY_WORKSPACE: (workspaceKey: string) =>
      `${V1}/Menus/my?workspace=${encodeURIComponent(workspaceKey)}`,
    /** GET /Menus/my/workspaces — lightweight workspace stubs (no menu items) */
    MY_WORKSPACES: `${V1}/Menus/my/workspaces`,
    /**
     * GET /Menus/my/routes — EAGER routes load (Option B).
     * Returns flat array of ALL accessible routes across ALL workspaces.
     * Called ONCE on login to populate useNavigationStore.allRoutes.
     * Eliminates route-guard race conditions during JIT workspace fetches.
     */
    MY_ROUTES: `${V1}/Menus/my/routes`,
    MY_OVERRIDES: `${V1}/Menus/overrides/my`,
    LIST: `${V1}/Menus`,
    BY_ID: (id: string) => `${V1}/Menus/${id}`,
    CREATE: `${V1}/Menus`,
    UPDATE: (id: string) => `${V1}/Menus/${id}`,
    DELETE: (id: string) => `${V1}/Menus/${id}`,
    REORDER: `${V1}/Menus/reorder`,
    ROLE_VISIBILITY: `${V1}/Menus/role-visibility`,
    OVERRIDES: `${V1}/Menus/overrides`,
    DELETE_OVERRIDE: (id: string) => `${V1}/Menus/overrides/${id}`,
  },

  WORKSPACES: {
    LIST: `${V1}/Workspaces`,
    CREATE: `${V1}/Workspaces`,
    UPDATE: (id: string) => `${V1}/Workspaces/${id}`,
    DELETE: (id: string) => `${V1}/Workspaces/${id}`,
    REORDER: `${V1}/Workspaces/reorder`,
  },
};
