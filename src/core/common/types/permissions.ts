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
  return requiredPermissions.some((required) => hasPermission(userPermissions, required));
}

/**
 * Check if user has ALL of the specified permissions
 */
export function hasAllPermissions(
  userPermissions: PermissionCode[],
  requiredPermissions: PermissionCode[]
): boolean {
  return requiredPermissions.every((required) => hasPermission(userPermissions, required));
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

  // User Groups
  USER_GROUPS_VIEW: "user_groups.view",
  USER_GROUPS_CREATE: "user_groups.create",
  USER_GROUPS_UPDATE: "user_groups.update",
  USER_GROUPS_DELETE: "user_groups.delete",

  // Permissions
  PERMISSIONS_VIEW: "permissions.view",

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
  MENUS_CUSTOMIZE: "menus.customize",
  MENUS_CUSTOMIZE_TENANT: "menus.customize_tenant",

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

  // Recycle Bin
  RECYCLE_BIN_VIEW: "recycle_bin.view",
  RECYCLE_BIN_RESTORE: "recycle_bin.restore",

  // Editions
  EDITIONS_VIEW: "editions.view",
  EDITIONS_CREATE: "editions.create",
  EDITIONS_UPDATE: "editions.update",
  EDITIONS_DELETE: "editions.delete",
  EDITIONS_ASSIGN: "editions.assign",

  // Features
  FEATURES_VIEW: "features.view",
  FEATURES_CREATE: "features.create",
  FEATURES_UPDATE: "features.update",
  FEATURES_DELETE: "features.delete",
  FEATURES_OVERRIDE: "features.override",
  FEATURES_RESOLVE: "features.resolve",

  // Subscriptions
  SUBSCRIPTIONS_VIEW: "subscriptions.view",
  SUBSCRIPTIONS_ASSIGN: "subscriptions.assign",

  // Notifications
  NOTIFICATIONS_VIEW: "notifications.view",
  NOTIFICATIONS_CREATE: "notifications.create",
  NOTIFICATIONS_UPDATE: "notifications.update",
  NOTIFICATIONS_DELETE: "notifications.delete",

  // Message Templates
  MESSAGE_TEMPLATES_VIEW: "message-templates.view",
  MESSAGE_TEMPLATES_CREATE: "message-templates.create",
  MESSAGE_TEMPLATES_UPDATE: "message-templates.update",
  MESSAGE_TEMPLATES_DELETE: "message-templates.delete",

  // Emails
  EMAILS_VIEW: "emails.view",
  EMAILS_CREATE: "emails.create",

  // Webhooks
  WEBHOOKS_VIEW: "webhooks.view",
  WEBHOOKS_CREATE: "webhooks.create",
  WEBHOOKS_UPDATE: "webhooks.update",
  WEBHOOKS_DELETE: "webhooks.delete",

  // Identity Providers
  IDENTITY_PROVIDERS_VIEW: "identity_providers.view",
  IDENTITY_PROVIDERS_CREATE: "identity_providers.create",
  IDENTITY_PROVIDERS_UPDATE: "identity_providers.update",
  IDENTITY_PROVIDERS_DELETE: "identity_providers.delete",

  // OAuth Applications
  OAUTH_APPS_VIEW: "oauth_apps.view",
  OAUTH_APPS_CREATE: "oauth_apps.create",
  OAUTH_APPS_UPDATE: "oauth_apps.update",
  OAUTH_APPS_DELETE: "oauth_apps.delete",

  // Bundles
  BUNDLES_VIEW: "bundles.view",
  BUNDLES_VIEW_DETAILS: "bundles.view_details",
  BUNDLES_CREATE: "bundles.create",
  BUNDLES_UPDATE: "bundles.update",
  BUNDLES_DELETE: "bundles.delete",

  // Themes (Marketplace Management)
  THEMES_VIEW: "themes.view",
  THEMES_CREATE: "themes.create",
  THEMES_UPDATE: "themes.update",
  THEMES_DELETE: "themes.delete",
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
  "/settings/menus/customize": [SYSTEM_PERMISSIONS.MENUS_CUSTOMIZE],

  // Monitoring & Analytics pages
  "/dashboard": [SYSTEM_PERMISSIONS.DASHBOARD_VIEW],
  "/audit": [SYSTEM_PERMISSIONS.AUDIT_VIEW],
  "/security": [SYSTEM_PERMISSIONS.SECURITY_VIEW],
  "/analytics": [SYSTEM_PERMISSIONS.ANALYTICS_VIEW],

  // Tenant settings
  "/settings/tenant": [SYSTEM_PERMISSIONS.TENANT_SETTINGS_VIEW],

  // Customizer Studio (uses tenant_settings permission)
  "/customizer": [SYSTEM_PERMISSIONS.TENANT_SETTINGS_VIEW],

  // Recycle Bin
  "/recycle-bin": [SYSTEM_PERMISSIONS.RECYCLE_BIN_VIEW],

  // Entitlements
  "/entitlements/editions": [SYSTEM_PERMISSIONS.EDITIONS_VIEW],
  "/entitlements/features": [SYSTEM_PERMISSIONS.FEATURES_VIEW],
  "/entitlements/subscriptions": [SYSTEM_PERMISSIONS.SUBSCRIPTIONS_VIEW],
  "/entitlements/overrides": [SYSTEM_PERMISSIONS.FEATURES_OVERRIDE],

  // User Groups
  "/user-groups": [SYSTEM_PERMISSIONS.USER_GROUPS_VIEW],

  // Messaging
  "/messaging/email-composer": [SYSTEM_PERMISSIONS.EMAILS_VIEW],
  "/messaging/notifications": [SYSTEM_PERMISSIONS.NOTIFICATIONS_VIEW],
  "/messaging/templates": [SYSTEM_PERMISSIONS.MESSAGE_TEMPLATES_VIEW],

  // Webhooks
  "/settings/webhooks": [SYSTEM_PERMISSIONS.WEBHOOKS_VIEW],

  // Identity Providers & OAuth
  "/settings/identity-providers": [SYSTEM_PERMISSIONS.IDENTITY_PROVIDERS_VIEW],
  "/settings/oauth-apps": [SYSTEM_PERMISSIONS.OAUTH_APPS_VIEW],

  // Theme Management
  "/settings/themes": [SYSTEM_PERMISSIONS.THEMES_VIEW],
  "/settings/themes/gallery": [SYSTEM_PERMISSIONS.THEMES_VIEW],
};
