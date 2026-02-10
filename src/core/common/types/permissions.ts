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
      ADMINS_VIEW_DETAILS: "admins.view_details",
      ADMINS_CREATE: "admins.create",
      ADMINS_UPDATE: "admins.update",
      ADMINS_DELETE: "admins.delete",
      ADMINS_ASSIGN_ROLES: "admins.assign_roles",
      ADMINS_RESET_PASSWORD: "admins.reset_password",
      ADMINS_BULK_ACTIVATE: "admins.bulk_activate",
      ADMINS_BULK_DEACTIVATE: "admins.bulk_deactivate",
      ADMINS_BULK_DELETE: "admins.bulk_delete",
      ADMINS_IMPERSONATE: "admins.impersonate",
      ADMINS_TRANSFER: "admins.transfer",

      // Roles
      ROLES_VIEW: "roles.view",
      ROLES_CREATE: "roles.create",
      ROLES_UPDATE: "roles.update",
      ROLES_DELETE: "roles.delete",
      ROLES_MANAGE_PERMISSIONS: "roles.manage_permissions",
      ROLES_CLONE: "roles.clone",

      // Permissions
      PERMISSIONS_VIEW: "permissions.view",
      PERMISSIONS_CREATE: "permissions.create",
      PERMISSIONS_UPDATE: "permissions.update",
      PERMISSIONS_DELETE: "permissions.delete",

      // Tenants
      TENANTS_VIEW: "tenants.view",
      TENANTS_VIEW_DETAILS: "tenants.view_details",
      TENANTS_VIEW_SUBTENANTS: "tenants.view_subTenants",
      TENANTS_DRILL_DOWN: "tenants.drill_down",
      TENANTS_VIEW_ADMINS: "tenants.view_admins",
      TENANTS_VIEW_ROLES: "tenants.view_roles",
      TENANTS_CREATE: "tenants.create",
      TENANTS_UPDATE: "tenants.update",
      TENANTS_DELETE: "tenants.delete",
      TENANTS_CASCADE_DELETE: "tenants.cascade_delete",
      TENANTS_MANAGE_QUOTAS: "tenants.manage_quotas",
      TENANTS_MANAGE_SETTINGS: "tenants.manage_settings",

      // Menus
      MENUS_VIEW: "menus.view",
      MENUS_CREATE: "menus.create",
      MENUS_UPDATE: "menus.update",
      MENUS_DELETE: "menus.delete",
      MENUS_MANAGE_LINKS: "menus.manage_links",

      // Audit
      AUDIT_VIEW: "audit.view",
      AUDIT_EXPORT: "audit.export",
      AUDIT_VIEW_CHILDREN: "audit.view_children",
      AUDIT_EXPORT_PDF: "audit.export_pdf",

      // Dashboard
      DASHBOARD_VIEW: "dashboard.view",
      DASHBOARD_VIEW_SYSTEM: "dashboard.view_system",

      // Security Monitoring
      SECURITY_VIEW: "security.view",
      SECURITY_MANAGE_SETTINGS: "security.manage_settings",

      // Analytics
      ANALYTICS_VIEW: "analytics.view",
      ANALYTICS_VIEW_CHILDREN: "analytics.view_children",
      ANALYTICS_EXPORT: "analytics.export",

      // System
      SYSTEM_IMPERSONATE: "system.impersonate",
      SYSTEM_MANAGE_SETTINGS: "system.manage_settings",

      // Tenant Settings (for My Tenant page)
      TENANT_SETTINGS_VIEW: "tenant_settings.view",
      TENANT_SETTINGS_UPDATE: "tenant_settings.update",
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
      "/admins": [SYSTEM_PERMISSIONS.ADMINS_VIEW],
      "/roles": [SYSTEM_PERMISSIONS.ROLES_VIEW],
      "/settings/permissions": [SYSTEM_PERMISSIONS.PERMISSIONS_VIEW],
      "/tenants": [SYSTEM_PERMISSIONS.TENANTS_VIEW],
      "/settings/menus": [SYSTEM_PERMISSIONS.MENUS_VIEW],

      // Monitoring & Analytics pages
      "/dashboard": [SYSTEM_PERMISSIONS.DASHBOARD_VIEW],
      "/audit": [SYSTEM_PERMISSIONS.AUDIT_VIEW],
      "/security": [SYSTEM_PERMISSIONS.SECURITY_VIEW],
      "/analytics": [SYSTEM_PERMISSIONS.ANALYTICS_VIEW],

      // Tenant settings
      "/settings/tenant": [SYSTEM_PERMISSIONS.TENANT_SETTINGS_VIEW],
};
