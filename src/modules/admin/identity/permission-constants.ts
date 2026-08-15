/**
 * Identity Module — Permission Constants
 *
 * Covers: Admins, Roles, User Groups, Users, Permissions,
 * Tenants, Tenant Settings, Identity Providers, OAuth Apps, Passkeys
 *
 * ⚠️ Named `permission-constants.ts` to avoid collision with the
 *    `permissions/` sub-module directory (which handles the CRUD UI
 *    for permission management).
 */
export const IDENTITY_PERMISSIONS = {
  // ── Admins ──────────────────────────────────────────────
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

  // ── Roles ───────────────────────────────────────────────
  ROLES_VIEW: "roles.view",
  ROLES_CREATE: "roles.create",
  ROLES_UPDATE: "roles.update",
  ROLES_DELETE: "roles.delete",
  ROLES_MANAGE_PERMISSIONS: "roles.manage_permissions",
  ROLES_CLONE: "roles.clone",

  // ── User Groups ─────────────────────────────────────────
  USER_GROUPS_VIEW: "user_groups.view",
  USER_GROUPS_CREATE: "user_groups.create",
  USER_GROUPS_UPDATE: "user_groups.update",
  USER_GROUPS_DELETE: "user_groups.delete",

  // ── Users (Client Users) ────────────────────────────────
  USERS_VIEW: "users.view",
  USERS_UPDATE: "users.update",
  USERS_DELETE: "users.delete",
  USERS_UNLOCK: "users.unlock",

  // ── Permissions ─────────────────────────────────────────
  PERMISSIONS_VIEW: "permissions.view",

  // ── Tenants ─────────────────────────────────────────────
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

  // ── Tenant Settings ─────────────────────────────────────
  TENANT_SETTINGS_VIEW: "tenant_settings.view",
  TENANT_SETTINGS_UPDATE: "tenant_settings.update",

  // ── Identity Providers ──────────────────────────────────
  IDENTITY_PROVIDERS_VIEW: "identity_providers.view",
  IDENTITY_PROVIDERS_CREATE: "identity_providers.create",
  IDENTITY_PROVIDERS_UPDATE: "identity_providers.update",
  IDENTITY_PROVIDERS_DELETE: "identity_providers.delete",

  // ── OAuth Applications ──────────────────────────────────
  OAUTH_APPS_VIEW: "oauth_apps.view",
  OAUTH_APPS_CREATE: "oauth_apps.create",
  OAUTH_APPS_UPDATE: "oauth_apps.update",
  OAUTH_APPS_DELETE: "oauth_apps.delete",

  // ── System ──────────────────────────────────────────────
  SYSTEM_IMPERSONATE: "system.impersonate",
  SYSTEM_MANAGE_SETTINGS: "system.manage_settings",

  // ── Identity Context (tenant-switch / scoped access / device sessions) ──
  IDENTITY_CONTEXT_SWITCH: "identity_context.switch",
  IDENTITY_CONTEXT_SCOPES_VIEW: "identity_context.scopes_view",
  IDENTITY_CONTEXT_SCOPES_MANAGE: "identity_context.scopes_manage",
  IDENTITY_CONTEXT_DEVICES_MANAGE: "identity_context.devices_manage",
} as const;
