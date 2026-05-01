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

  // Users (Client Users)
  USERS_VIEW: "users.view",
  USERS_UPDATE: "users.update",
  USERS_DELETE: "users.delete",
  USERS_UNLOCK: "users.unlock",

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

  // Dashboard Builder
  DASHBOARD_BUILDER_VIEW: "settings.dashboard_builder.view",
  DASHBOARD_BUILDER_UPDATE: "settings.dashboard_builder.update",
  DASHBOARD_BUILDER_PUBLISH: "settings.dashboard_builder.publish",
  DASHBOARD_BUILDER_ADMIN_OVERRIDE: "settings.dashboard_builder.admin_override",
  DASHBOARD_BUILDER_PRESETS: "settings.dashboard_builder.presets",
  DASHBOARD_BUILDER_SAVE_PRESETS: "settings.dashboard_builder.save_presets",
  DASHBOARD_BUILDER_EXPORT: "settings.dashboard_builder.export",

  // Billing
  INVOICES_VIEW: "invoices.view",
  INVOICES_EXPORT: "invoices.export",
  TRANSACTIONS_VIEW: "transactions.view",
  BILLING_MANAGE: "billing.manage",
  BILLING_DASHBOARD_VIEW: "billing.manage",
  PAYMENT_GATEWAYS_MANAGE: "payment_gateways.manage",

  // Tenant Plans (Tier 2)
  TENANT_PLANS_VIEW: "tenant_plans.view",
  TENANT_PLANS_CREATE: "tenant_plans.create",
  TENANT_PLANS_UPDATE: "tenant_plans.update",
  TENANT_PLANS_DELETE: "tenant_plans.delete",

  // Tenant Feature Definitions (Tier 2)
  TENANT_FEATURE_DEFINITIONS_VIEW: "tenant_feature_definitions.view",
  TENANT_FEATURE_DEFINITIONS_CREATE: "tenant_feature_definitions.create",
  TENANT_FEATURE_DEFINITIONS_UPDATE: "tenant_feature_definitions.update",
  TENANT_FEATURE_DEFINITIONS_DELETE: "tenant_feature_definitions.delete",

  // User Subscriptions (Tier 2)
  USER_SUBSCRIPTIONS_VIEW: "user_subscriptions.view",
  USER_SUBSCRIPTIONS_CREATE: "user_subscriptions.create",
  USER_SUBSCRIPTIONS_UPDATE: "user_subscriptions.update",
  USER_SUBSCRIPTIONS_DELETE: "user_subscriptions.delete",

  // Tenant Plan Promotions (Tier 2)
  TENANT_PLAN_PROMOTIONS_VIEW: "tenant_plan_promotions.view",
  TENANT_PLAN_PROMOTIONS_CREATE: "tenant_plan_promotions.create",
  TENANT_PLAN_PROMOTIONS_UPDATE: "tenant_plan_promotions.update",
  TENANT_PLAN_PROMOTIONS_DELETE: "tenant_plan_promotions.delete",

  // Stripe Connect
  STRIPE_CONNECT_VIEW: "stripe_connect.view",
  STRIPE_CONNECT_CREATE: "stripe_connect.create",
  STRIPE_CONNECT_UPDATE: "stripe_connect.update",
  STRIPE_CONNECT_DELETE: "stripe_connect.delete",

  // Commissions
  COMMISSIONS_VIEW: "commissions.view",
  COMMISSIONS_EXPORT: "commissions.export",
  COMMISSIONS_MANAGE: "commissions.manage",
  COMMISSIONS_WAIVE: "commissions.waive",

  // Tenant Stripe Connect (self-service)
  TENANT_STRIPE_CONNECT_VIEW: "tenant_stripe_connect.view",
  TENANT_STRIPE_CONNECT_MANAGE: "tenant_stripe_connect.manage",

  // Platform Stripe Dashboard (system admins)
  PLATFORM_STRIPE_VIEW: "platform_stripe.view",

  // Revenue Analytics
  ANALYTICS_REVENUE_VIEW: "revenue_analytics.view",
  ANALYTICS_HEALTH_VIEW: "revenue_analytics.view_health",
  ANALYTICS_REPORTS_MANAGE: "revenue_analytics.manage_reports",

  // Tenant Payment Gateways (Tier 2 self-service)
  TENANT_PAYMENT_GATEWAYS_VIEW: "tenant_payment_gateways.view",
  TENANT_PAYMENT_GATEWAYS_CONFIGURE: "tenant_payment_gateways.configure",
  TENANT_PAYMENT_GATEWAYS_VERIFY: "tenant_payment_gateways.verify",
  TENANT_PAYMENT_GATEWAYS_REMOVE: "tenant_payment_gateways.remove",

  // Compliance Management
  // Dashboard
  COMPLIANCE_DASHBOARD_VIEW: "compliance_dashboard.view",
  COMPLIANCE_DASHBOARD_EXPORT: "compliance_dashboard.export",
  // Regulation Profiles
  COMPLIANCE_REGULATIONS_VIEW: "compliance_regulations.view",
  // Consent Management
  COMPLIANCE_CONSENT_VIEW: "compliance_consent.view",
  COMPLIANCE_CONSENT_MANAGE: "compliance_consent.manage",
  COMPLIANCE_CONSENT_VIEW_ANALYTICS: "compliance_consent.view_analytics",
  // Data Subject Requests (DSR)
  COMPLIANCE_DSR_VIEW: "compliance_dsr.view",
  COMPLIANCE_DSR_CREATE: "compliance_dsr.create",
  COMPLIANCE_DSR_REVIEW: "compliance_dsr.review",
  COMPLIANCE_DSR_EXECUTE: "compliance_dsr.execute",
  COMPLIANCE_DSR_CANCEL: "compliance_dsr.cancel",
  // Retention Policies
  COMPLIANCE_RETENTION_VIEW: "compliance_retention.view",
  COMPLIANCE_RETENTION_MANAGE: "compliance_retention.manage",
  // Data Inventory
  COMPLIANCE_DATA_INVENTORY_VIEW: "compliance_data_inventory.view",
  // Reports
  COMPLIANCE_REPORTS_VIEW: "compliance_reports.view",
  COMPLIANCE_REPORTS_GENERATE: "compliance_reports.generate",
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
  "/profile/security": [],
  "/profile/activity": [],
  "/profile/sessions": [],

  // Identity & Access
  "/admins": [SYSTEM_PERMISSIONS.ADMINS_VIEW],
  "/roles": [SYSTEM_PERMISSIONS.ROLES_VIEW],
  "/roles/[id]": [SYSTEM_PERMISSIONS.ROLES_VIEW],
  "/settings/permissions": [SYSTEM_PERMISSIONS.PERMISSIONS_VIEW],
  "/tenants": [SYSTEM_PERMISSIONS.TENANTS_VIEW],
  "/tenants/create": [SYSTEM_PERMISSIONS.TENANTS_CREATE],
  "/tenants/[id]": [SYSTEM_PERMISSIONS.TENANTS_VIEW],
  "/users": [SYSTEM_PERMISSIONS.USERS_VIEW],
  "/user-groups": [SYSTEM_PERMISSIONS.USER_GROUPS_VIEW],
  "/user-groups/[id]": [SYSTEM_PERMISSIONS.USER_GROUPS_VIEW],
  "/settings/identity-providers": [SYSTEM_PERMISSIONS.IDENTITY_PROVIDERS_VIEW],
  "/settings/identity-providers/create": [SYSTEM_PERMISSIONS.IDENTITY_PROVIDERS_CREATE],
  "/settings/identity-providers/[id]": [SYSTEM_PERMISSIONS.IDENTITY_PROVIDERS_VIEW],
  "/settings/oauth-apps": [SYSTEM_PERMISSIONS.OAUTH_APPS_VIEW],
  "/settings/oauth-apps/create": [SYSTEM_PERMISSIONS.OAUTH_APPS_CREATE],
  "/settings/oauth-apps/[id]": [SYSTEM_PERMISSIONS.OAUTH_APPS_VIEW],

  // Monitoring & Analytics pages
  "/dashboard": [SYSTEM_PERMISSIONS.DASHBOARD_VIEW],
  "/audit": [SYSTEM_PERMISSIONS.AUDIT_VIEW],
  "/security": [SYSTEM_PERMISSIONS.SECURITY_VIEW],
  "/analytics": [SYSTEM_PERMISSIONS.ANALYTICS_VIEW],

  // Customization
  "/customization/branding": [SYSTEM_PERMISSIONS.TENANT_SETTINGS_VIEW],
  "/customizer": [SYSTEM_PERMISSIONS.TENANT_SETTINGS_VIEW],
  "/customization/themes": [SYSTEM_PERMISSIONS.THEMES_VIEW],
  "/customization/gallery": [SYSTEM_PERMISSIONS.THEMES_VIEW],
  "/customization/menus": [SYSTEM_PERMISSIONS.MENUS_VIEW],
  "/customization/menus/customize": [SYSTEM_PERMISSIONS.MENUS_CUSTOMIZE],

  // Entitlements
  "/entitlements/editions": [SYSTEM_PERMISSIONS.EDITIONS_VIEW],
  "/entitlements/editions/compare": [SYSTEM_PERMISSIONS.EDITIONS_VIEW],
  "/entitlements/editions/[id]": [SYSTEM_PERMISSIONS.EDITIONS_VIEW],
  "/entitlements/features": [SYSTEM_PERMISSIONS.FEATURES_VIEW],
  "/entitlements/subscriptions": [SYSTEM_PERMISSIONS.SUBSCRIPTIONS_VIEW],
  "/entitlements/subscriptions/[tenantId]": [SYSTEM_PERMISSIONS.SUBSCRIPTIONS_VIEW],
  "/entitlements/overrides": [SYSTEM_PERMISSIONS.FEATURES_OVERRIDE],
  "/entitlements/overrides/[tenantId]": [SYSTEM_PERMISSIONS.FEATURES_OVERRIDE],
  "/entitlements/invoices": [SYSTEM_PERMISSIONS.INVOICES_VIEW],
  "/entitlements/billing-dashboard": [SYSTEM_PERMISSIONS.BILLING_DASHBOARD_VIEW],
  "/payment-gateways": [SYSTEM_PERMISSIONS.PAYMENT_GATEWAYS_MANAGE],
  "/entitlements/payouts": [SYSTEM_PERMISSIONS.BILLING_MANAGE],
  "/entitlements/tenant-plans": [SYSTEM_PERMISSIONS.TENANT_PLANS_VIEW],
  "/entitlements/tenant-plans/compare": [SYSTEM_PERMISSIONS.TENANT_PLANS_VIEW],
  "/entitlements/tenant-plans/[id]": [SYSTEM_PERMISSIONS.TENANT_PLANS_VIEW],
  "/entitlements/tenant-feature-definitions": [SYSTEM_PERMISSIONS.TENANT_FEATURE_DEFINITIONS_VIEW],
  "/entitlements/tenant-feature-definitions/create": [SYSTEM_PERMISSIONS.TENANT_FEATURE_DEFINITIONS_CREATE],
  "/entitlements/tenant-feature-definitions/[id]": [SYSTEM_PERMISSIONS.TENANT_FEATURE_DEFINITIONS_VIEW],
  "/entitlements/tenant-feature-definitions/[id]/edit": [SYSTEM_PERMISSIONS.TENANT_FEATURE_DEFINITIONS_UPDATE],
  "/entitlements/user-subscriptions": [SYSTEM_PERMISSIONS.USER_SUBSCRIPTIONS_VIEW],
  "/my-subscription": [], // User self-service — any authenticated user
  "/my-stripe-account": [SYSTEM_PERMISSIONS.TENANT_STRIPE_CONNECT_VIEW],
  "/entitlements/transactions": [SYSTEM_PERMISSIONS.TRANSACTIONS_VIEW],

  // Messaging & Webhooks
  "/messaging/email-composer": [SYSTEM_PERMISSIONS.EMAILS_VIEW],
  "/messaging/notifications": [SYSTEM_PERMISSIONS.NOTIFICATIONS_VIEW],
  "/messaging/templates": [SYSTEM_PERMISSIONS.MESSAGE_TEMPLATES_VIEW],
  "/messaging/templates/new": [SYSTEM_PERMISSIONS.MESSAGE_TEMPLATES_CREATE],
  "/messaging/templates/[id]/edit": [SYSTEM_PERMISSIONS.MESSAGE_TEMPLATES_UPDATE],
  "/messaging/webhooks": [SYSTEM_PERMISSIONS.WEBHOOKS_VIEW],
  "/messaging/webhooks/[id]": [SYSTEM_PERMISSIONS.WEBHOOKS_VIEW],

  // Ecosystem
  "/recycle-bin": [SYSTEM_PERMISSIONS.RECYCLE_BIN_VIEW],

  // Stripe Connect
  "/entitlements/stripe-connect": [SYSTEM_PERMISSIONS.STRIPE_CONNECT_VIEW],
  "/entitlements/commissions": [SYSTEM_PERMISSIONS.COMMISSIONS_VIEW],
  "/entitlements/commission-ledger": [SYSTEM_PERMISSIONS.COMMISSIONS_VIEW],
  "/entitlements/commission-invoices": [SYSTEM_PERMISSIONS.COMMISSIONS_VIEW],
  "/entitlements/payment-hub": [SYSTEM_PERMISSIONS.BILLING_MANAGE],

  // Platform Stripe Dashboard
  "/entitlements/platform-stripe": [SYSTEM_PERMISSIONS.PLATFORM_STRIPE_VIEW],

  // Revenue Analytics
  "/entitlements/analytics": [SYSTEM_PERMISSIONS.ANALYTICS_REVENUE_VIEW],

  // Tenant Payment Gateways (Self-Service)
  "/my-payment-methods": [SYSTEM_PERMISSIONS.TENANT_PAYMENT_GATEWAYS_VIEW],

  // Compliance Module
  "/compliance": [SYSTEM_PERMISSIONS.COMPLIANCE_DASHBOARD_VIEW],
  "/compliance/dsr": [SYSTEM_PERMISSIONS.COMPLIANCE_DSR_VIEW],
  "/compliance/consent": [SYSTEM_PERMISSIONS.COMPLIANCE_CONSENT_VIEW],
  "/compliance/retention": [SYSTEM_PERMISSIONS.COMPLIANCE_RETENTION_VIEW],
  "/compliance/inventory": [SYSTEM_PERMISSIONS.COMPLIANCE_DATA_INVENTORY_VIEW],
  "/compliance/reports": [SYSTEM_PERMISSIONS.COMPLIANCE_REPORTS_VIEW],
};

