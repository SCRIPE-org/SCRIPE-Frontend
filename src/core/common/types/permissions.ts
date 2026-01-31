/**
 * Permission Types - Dynamic RBAC System
 *
 * Permissions are loaded dynamically from the backend.
 * Format: "resource.action" (e.g., "admins.create", "roles.view")
 */

/**
 * Permission code format: "resource.action"
 * Examples: "admins.view", "admins.create", "roles.manage_permissions"
 */
export type PermissionCode = string;

/**
 * Permission entity from backend
 */
export interface Permission {
      id: string;
      resource: string;
      action: string;
      code: string; // "admins.create"
      defaultScope: string;
      description?: string;
      category?: string; // "Admin Management"
      displayOrder: number;
}

/**
 * Role entity from backend
 */
export interface Role {
      id: string;
      name: string;
      code: string;
      description?: string;
      tenantId?: string;
      tenantName?: string;
      isSystem: boolean;
      priority: number;
      isActive: boolean;
      createdAt: string;
      permissions: RolePermission[];
}

/**
 * Role permission assignment
 */
export interface RolePermission {
      permissionId: string;
      permissionCode: string;
      scope?: string;
}

/**
 * Admin role assignment (for user's roles)
 */
export interface AdminRole {
      roleId: string;
      roleName: string;
      roleCode: string;
      tenantId?: string;
      tenantName?: string;
      expiresAt?: string;
      inheritedPermissions: PermissionCode[];
}

/**
 * Check if a permission code matches a pattern
 * Supports wildcards: "admins.*" matches "admins.view", "admins.create", etc.
 */
export function matchesPermission(
      userPermission: PermissionCode,
      requiredPermission: PermissionCode
): boolean {
      // Superadmin wildcard
      if (userPermission === "*") return true;

      // Exact match
      if (userPermission === requiredPermission) return true;

      // Wildcard pattern: "admins.*" matches "admins.view"
      if (userPermission.endsWith(".*")) {
            const resource = userPermission.slice(0, -2);
            return requiredPermission.startsWith(resource + ".");
      }

      return false;
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(
      userPermissions: PermissionCode[],
      requiredPermission: PermissionCode
): boolean {
      return userPermissions.some((p) => matchesPermission(p, requiredPermission));
}

/**
 * Check if user has ANY of the specified permissions
 */
export function hasAnyPermission(
      userPermissions: PermissionCode[],
      requiredPermissions: PermissionCode[]
): boolean {
      return requiredPermissions.some((required) =>
            hasPermission(userPermissions, required)
      );
}

/**
 * Check if user has ALL of the specified permissions
 */
export function hasAllPermissions(
      userPermissions: PermissionCode[],
      requiredPermissions: PermissionCode[]
): boolean {
      return requiredPermissions.every((required) =>
            hasPermission(userPermissions, required)
      );
}

/**
 * Permission constants for the System module
 */
export const SYSTEM_PERMISSIONS = {
      // Admins
      ADMINS_VIEW: "admins.view",
      ADMINS_CREATE: "admins.create",
      ADMINS_UPDATE: "admins.update",
      ADMINS_DELETE: "admins.delete",
      ADMINS_ASSIGN_ROLES: "admins.assign_roles",
      ADMINS_RESET_PASSWORD: "admins.reset_password",

      // Roles
      ROLES_VIEW: "roles.view",
      ROLES_CREATE: "roles.create",
      ROLES_UPDATE: "roles.update",
      ROLES_DELETE: "roles.delete",
      ROLES_MANAGE_PERMISSIONS: "roles.manage_permissions",

      // Permissions
      PERMISSIONS_VIEW: "permissions.view",
      PERMISSIONS_CREATE: "permissions.create",
      PERMISSIONS_UPDATE: "permissions.update",
      PERMISSIONS_DELETE: "permissions.delete",

      // Tenants
      TENANTS_VIEW: "tenants.view",
      TENANTS_CREATE: "tenants.create",
      TENANTS_UPDATE: "tenants.update",
      TENANTS_DELETE: "tenants.delete",

      // Menus
      MENUS_VIEW: "menus.view",
      MENUS_CREATE: "menus.create",
      MENUS_UPDATE: "menus.update",
      MENUS_DELETE: "menus.delete",
} as const;

/**
 * Page permission mapping (for RouteGuard)
 * Maps routes to required permissions
 */
export const PAGE_PERMISSIONS: Record<string, PermissionCode[]> = {
      "/": [], // Public (authenticated)
      "/login": [], // Public
      "/settings": [],
      "/profile": [],

      // System module pages
      "/system/admins": [SYSTEM_PERMISSIONS.ADMINS_VIEW],
      "/system/roles": [SYSTEM_PERMISSIONS.ROLES_VIEW],
      "/system/permissions": [SYSTEM_PERMISSIONS.PERMISSIONS_VIEW],
      "/system/tenants": [SYSTEM_PERMISSIONS.TENANTS_VIEW],
      "/system/menus": [SYSTEM_PERMISSIONS.MENUS_VIEW],
};
