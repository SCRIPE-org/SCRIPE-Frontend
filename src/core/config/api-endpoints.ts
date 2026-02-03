/**
 * API Endpoints Configuration
 *
 * Centralized endpoint definitions for all API calls.
 * Organized by module for better maintainability.
 * 
 * IMPORTANT: These paths must match the backend controller routes exactly.
 * Backend uses [Route("api/[controller]")] which results in PascalCase paths.
 */

export const API_ENDPOINTS = {
  // ===== AUTH =====
  AUTH: {
    LOGIN: "/auth/admin/login",
    LOGOUT: "/auth/admin/logout",
    REFRESH: "/auth/admin/refresh",
    ME: "/auth/admin/me",
    TWO_FA: {
      ENABLE: "/auth/admin/2fa/enable",
      CONFIRM: "/auth/admin/2fa/confirm",
      VERIFY: "/auth/admin/2fa/verify",
      DISABLE: "/auth/admin/2fa/disable",
    },
  },

  // Legacy auth endpoints (for backward compatibility)
  LOGIN: "/auth/admin/login",
  LOGOUT: "/auth/admin/logout",
  REFRESH: "/auth/admin/refresh",
  GET_ADMIN_ME: "/auth/admin/me",

  // ===== ADMINS =====
  ADMINS: {
    LIST: "/Admins",
    BY_ID: (id: string) => `/Admins/${id}`,
    BY_TENANT_ID: (tenantId: string) => `/Admins/byTenantId/${tenantId}`,
    MY_TENANT_ADMINS: "/Admins/myTenantAdmins",
    CREATE: "/Admins",
    CREATE_FOR_MY_TENANT: "/Admins/createForMyTenant",
    UPDATE: (id: string) => `/Admins/${id}`,
    DELETE: (id: string) => `/Admins/${id}`,
    SET_ACTIVE: (id: string) => `/Admins/${id}/active`,
    ROLES: (id: string) => `/Admins/${id}/roles`,
    REMOVE_ROLE: (adminId: string, roleId: string) =>
      `/Admins/${adminId}/roles/${roleId}`,
    RESET_PASSWORD: (id: string) => `/Admins/${id}/reset-password`,
    CHANGE_PASSWORD: (id: string) => `/Admins/${id}/change-password`,
    BULK: {
      ACTIVATE: "/Admins/bulk/activate",
      DEACTIVATE: "/Admins/bulk/deactivate",
      DELETE: "/Admins/bulk/delete",
    },
  },

  // Legacy profile endpoints
  UPDATE_ADMIN_PROFILE: "/auth/admin/me",
  CHANGE_ADMIN_PASSWORD: "/auth/admin/me/password",

  // ===== ROLES =====
  ROLES: {
    LIST: "/Roles",
    BY_ID: (id: string) => `/Roles/${id}`,
    BY_TENANT_ID: (tenantId: string) => `/Roles/byTenantId/${tenantId}`,
    MY_TENANT_ROLES: "/Roles/myTenantRoles",
    CREATE: "/Roles",
    UPDATE: (id: string) => `/Roles/${id}`,
    DELETE: (id: string) => `/Roles/${id}`,
    PERMISSIONS: (id: string) => `/Roles/${id}/permissions`,
    REMOVE_PERMISSION: (roleId: string, permissionId: string) =>
      `/Roles/${roleId}/permissions/${permissionId}`,
  },

  // ===== PERMISSIONS =====
  PERMISSIONS: {
    LIST: "/Permissions",
    MY: "/Permissions/my",
    BY_ID: (id: string) => `/Permissions/${id}`,
    CREATE: "/Permissions",
    UPDATE: (id: string) => `/Permissions/${id}`,
    DELETE: (id: string) => `/Permissions/${id}`,
    CATEGORIES: "/Permissions/categories",
  },

  // ===== TENANTS =====
  TENANTS: {
    LIST: "/Tenants",
    TREE: "/Tenants/tree",
    BY_ID: (id: string) => `/Tenants/${id}`,
    STATS: (id: string) => `/Tenants/${id}/stats`,
    CREATE: "/Tenants",
    UPDATE: (id: string) => `/Tenants/${id}`,
    DELETE: (id: string) => `/Tenants/${id}`,
  },

  // ===== MENUS =====
  MENUS: {
    MY: "/Menus/my",
    LIST: "/Menus",
    BY_ID: (id: string) => `/Menus/${id}`,
    CREATE: "/Menus",
    UPDATE: (id: string) => `/Menus/${id}`,
    DELETE: (id: string) => `/Menus/${id}`,
  },

  // Legacy menu endpoints
  GET_MENU_ITEMS: "/Menus/my",
};

/**
 * Helper to build URL with query parameters
 */
export function buildUrl(
  baseUrl: string,
  params?: Record<string, string | number | boolean | undefined | null>
): string {
  if (!params) return baseUrl;

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}
