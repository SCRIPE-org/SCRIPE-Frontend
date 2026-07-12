/**
 * Permission Types - Dynamic RBAC System
 *
 * Permissions are loaded dynamically from the backend.
 * Format: "resource.action" (e.g., "admins.create", "roles.view")
 *
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  MODULAR ARCHITECTURE: Each parent module defines its own   ║
 * ║  permissions in `src/modules/{module}/permissions.ts`.      ║
 * ║  This central file wires them all together.                 ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

// ── Module permission imports ─────────────────────────────────────────────────
import { IDENTITY_PERMISSIONS } from "@modules/identity/permission-constants";
import { ENTITLEMENTS_PERMISSIONS } from "@modules/entitlements/permission-constants";
import { COMMUNICATION_PERMISSIONS } from "@modules/communication/permission-constants";
import { INTEGRATIONS_PERMISSIONS } from "@modules/integrations/permission-constants";
import { MEDIA_PERMISSIONS } from "@modules/media/permission-constants";
import { CUSTOMIZATION_PERMISSIONS } from "@modules/customization/permission-constants";
import { MONITORING_PERMISSIONS } from "@modules/monitoring/permission-constants";
import { ECOSYSTEM_PERMISSIONS } from "@modules/ecosystem/permission-constants";
import { COMPLIANCE_PERMISSIONS } from "@modules/compliance/permission-constants";
import { PLUGINS_PERMISSIONS } from "@modules/plugins/permission-constants";
import { MARKETPLACE_PERMISSIONS } from "@modules/marketplace/permission-constants";

import { PARTY_KERNEL_PERMISSIONS } from "@modules/party-kernel/permission-constants";
import { HRMS_PERMISSIONS } from "@modules/hrms/permission-constants";
// ── Re-export individual module permissions for direct access ─────────────────
export {
  IDENTITY_PERMISSIONS,
  ENTITLEMENTS_PERMISSIONS,
  COMMUNICATION_PERMISSIONS,
  INTEGRATIONS_PERMISSIONS,
  MEDIA_PERMISSIONS,
  CUSTOMIZATION_PERMISSIONS,
  MONITORING_PERMISSIONS,
  ECOSYSTEM_PERMISSIONS,
  COMPLIANCE_PERMISSIONS,
  PLUGINS_PERMISSIONS,
  MARKETPLACE_PERMISSIONS,
  PARTY_KERNEL_PERMISSIONS,
  HRMS_PERMISSIONS,
};

// ── Types ─────────────────────────────────────────────────────────────────────

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

// ── Permission helpers ────────────────────────────────────────────────────────

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

// ── Aggregated permission constants ───────────────────────────────────────────

/**
 * Aggregated permission constants from ALL modules.
 * Use this for backward compatibility. For new code, prefer
 * importing directly from the module (e.g., IDENTITY_PERMISSIONS).
 */
export const SYSTEM_PERMISSIONS = {
  ...IDENTITY_PERMISSIONS,
  ...ENTITLEMENTS_PERMISSIONS,
  ...COMMUNICATION_PERMISSIONS,
  ...INTEGRATIONS_PERMISSIONS,
  ...MEDIA_PERMISSIONS,
  ...CUSTOMIZATION_PERMISSIONS,
  ...MONITORING_PERMISSIONS,
  ...ECOSYSTEM_PERMISSIONS,
  ...COMPLIANCE_PERMISSIONS,
  ...PLUGINS_PERMISSIONS,
  ...MARKETPLACE_PERMISSIONS,
  ...PARTY_KERNEL_PERMISSIONS,
  ...HRMS_PERMISSIONS,
} as const;

// ── Page permission mapping ───────────────────────────────────────────────────

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
  /*
  "/customization/themes": [SYSTEM_PERMISSIONS.THEMES_VIEW],
  "/customization/gallery": [SYSTEM_PERMISSIONS.THEMES_VIEW],
  "/customization/menus": [SYSTEM_PERMISSIONS.MENUS_VIEW],
  "/customization/menus/customize": [SYSTEM_PERMISSIONS.MENUS_CUSTOMIZE],
  */

  // Entitlements
  "/entitlements/editions": [SYSTEM_PERMISSIONS.EDITIONS_VIEW],
  "/entitlements/editions/compare": [SYSTEM_PERMISSIONS.EDITIONS_VIEW],
  "/entitlements/editions/[id]": [SYSTEM_PERMISSIONS.EDITIONS_VIEW],
  "/entitlements/features": [SYSTEM_PERMISSIONS.FEATURES_VIEW],

  "/entitlements/subscriptions/[tenantId]": [SYSTEM_PERMISSIONS.SUBSCRIPTIONS_VIEW],
  "/entitlements/overrides": [SYSTEM_PERMISSIONS.FEATURES_OVERRIDE],
  "/entitlements/overrides/[tenantId]": [SYSTEM_PERMISSIONS.FEATURES_OVERRIDE],
  "/entitlements/invoices": [SYSTEM_PERMISSIONS.INVOICES_VIEW],

  "/entitlements/billing-hub": [SYSTEM_PERMISSIONS.BILLING_DASHBOARD_VIEW],
  "/payment-gateways": [SYSTEM_PERMISSIONS.PAYMENT_GATEWAYS_MANAGE],
  "/entitlements/payouts": [SYSTEM_PERMISSIONS.BILLING_MANAGE],
  "/entitlements/tenant-plans": [SYSTEM_PERMISSIONS.TENANT_PLANS_VIEW],
  "/entitlements/tenant-plans/compare": [SYSTEM_PERMISSIONS.TENANT_PLANS_VIEW],
  "/entitlements/tenant-plans/[id]": [SYSTEM_PERMISSIONS.TENANT_PLANS_VIEW],
  "/entitlements/tenant-feature-definitions": [SYSTEM_PERMISSIONS.TENANT_FEATURE_DEFINITIONS_VIEW],
  "/entitlements/tenant-feature-definitions/create": [
    SYSTEM_PERMISSIONS.TENANT_FEATURE_DEFINITIONS_CREATE,
  ],
  "/entitlements/tenant-feature-definitions/[id]": [
    SYSTEM_PERMISSIONS.TENANT_FEATURE_DEFINITIONS_VIEW,
  ],
  "/entitlements/tenant-feature-definitions/[id]/edit": [
    SYSTEM_PERMISSIONS.TENANT_FEATURE_DEFINITIONS_UPDATE,
  ],
  "/entitlements/user-subscriptions": [SYSTEM_PERMISSIONS.USER_SUBSCRIPTIONS_VIEW],
  "/my-subscription": [], // User self-service — any authenticated user
  "/my-stripe-account": [SYSTEM_PERMISSIONS.TENANT_STRIPE_CONNECT_VIEW],
  "/entitlements/transactions": [SYSTEM_PERMISSIONS.TRANSACTIONS_VIEW],

  // Communication & Integrations
  "/communication/message-composer": [SYSTEM_PERMISSIONS.EMAILS_VIEW],
  "/communication/notifications": [SYSTEM_PERMISSIONS.NOTIFICATIONS_VIEW],
  "/communication/templates": [SYSTEM_PERMISSIONS.MESSAGE_TEMPLATES_VIEW],
  "/communication/templates/new": [SYSTEM_PERMISSIONS.MESSAGE_TEMPLATES_CREATE],
  "/communication/templates/[id]/edit": [SYSTEM_PERMISSIONS.MESSAGE_TEMPLATES_UPDATE],
  "/integrations/webhooks": [SYSTEM_PERMISSIONS.WEBHOOKS_VIEW],
  "/integrations/webhooks/[id]": [SYSTEM_PERMISSIONS.WEBHOOKS_VIEW],
  "/integrations/apikeys": [SYSTEM_PERMISSIONS.API_KEYS_VIEW],

  // Media
  "/media": [SYSTEM_PERMISSIONS.MEDIA_VIEW],

  // Ecosystem
  "/recycle-bin": [SYSTEM_PERMISSIONS.RECYCLE_BIN_VIEW],

  // Stripe Connect

  "/entitlements/commissions": [SYSTEM_PERMISSIONS.COMMISSIONS_VIEW],
  "/entitlements/commission-ledger": [SYSTEM_PERMISSIONS.COMMISSIONS_VIEW],
  "/entitlements/commission-invoices": [SYSTEM_PERMISSIONS.COMMISSIONS_VIEW],

  // Platform Stripe Dashboard
  "/entitlements/platform-stripe": [SYSTEM_PERMISSIONS.PLATFORM_STRIPE_VIEW],

  // Revenue Analytics
  "/entitlements/analytics": [SYSTEM_PERMISSIONS.ANALYTICS_REVENUE_VIEW],

  // Tenant Payment Gateways (Self-Service)
  "/my-payment-methods": [SYSTEM_PERMISSIONS.TENANT_PAYMENT_GATEWAYS_VIEW],

  // Platform Leads / CRM (Phase 5)
  "/entitlements/leads": [SYSTEM_PERMISSIONS.LEADS_VIEW],
  "/entitlements/onboarding/questions": [SYSTEM_PERMISSIONS.ONBOARDING_QUESTIONS_VIEW],
  "/entitlements/signup-content": [SYSTEM_PERMISSIONS.SIGNUP_CONTENT_VIEW],

  // Compliance Module
  "/compliance": [SYSTEM_PERMISSIONS.COMPLIANCE_DASHBOARD_VIEW],
  "/compliance/regulations": [SYSTEM_PERMISSIONS.COMPLIANCE_REGULATIONS_VIEW],
  "/compliance/dsr": [SYSTEM_PERMISSIONS.COMPLIANCE_DSR_VIEW],
  "/compliance/dsr/[id]": [SYSTEM_PERMISSIONS.COMPLIANCE_DSR_VIEW],
  "/compliance/consent": [SYSTEM_PERMISSIONS.COMPLIANCE_CONSENT_VIEW],
  "/compliance/retention": [SYSTEM_PERMISSIONS.COMPLIANCE_RETENTION_VIEW],
  "/compliance/inventory": [SYSTEM_PERMISSIONS.COMPLIANCE_DATA_INVENTORY_VIEW],
  "/compliance/reports": [SYSTEM_PERMISSIONS.COMPLIANCE_REPORTS_VIEW],
  "/compliance/reports/[id]": [SYSTEM_PERMISSIONS.COMPLIANCE_REPORTS_VIEW],

  /*
  // Plugins Module
  "/plugins": [SYSTEM_PERMISSIONS.PLUGINS_CATALOG_VIEW],
  "/plugins/catalog": [SYSTEM_PERMISSIONS.PLUGINS_CATALOG_VIEW],
  "/plugins/installed": [SYSTEM_PERMISSIONS.PLUGINS_INSTALLED_VIEW],
  "/plugins/[installationId]": [SYSTEM_PERMISSIONS.PLUGINS_INSTALLED_VIEW],
  "/plugins/installed/[installationId]": [SYSTEM_PERMISSIONS.PLUGINS_INSTALLED_VIEW],
  "/plugins/installed/[installationId]/logs": [SYSTEM_PERMISSIONS.PLUGINS_EXECUTION_LOGS_VIEW],
  "/plugins/installed/[installationId]/settings": [SYSTEM_PERMISSIONS.PLUGINS_INSTALLED_CONFIGURE],
  "/plugins/definitions": [SYSTEM_PERMISSIONS.PLUGINS_DEFINITION_VIEW],
  "/plugins/logs": [SYSTEM_PERMISSIONS.PLUGINS_EXECUTION_LOGS_VIEW],

  // Marketplace Module
  "/marketplace": [SYSTEM_PERMISSIONS.APP_LISTINGS_VIEW],
  "/marketplace/catalog": [SYSTEM_PERMISSIONS.APP_LISTINGS_VIEW],
  "/marketplace/catalog/[id]": [SYSTEM_PERMISSIONS.APP_LISTINGS_VIEW],
  "/marketplace/categories": [SYSTEM_PERMISSIONS.APP_LISTINGS_VIEW],
  "/marketplace/submissions": [SYSTEM_PERMISSIONS.APP_SUBMISSIONS_VIEW],
  "/marketplace/submissions/[id]": [SYSTEM_PERMISSIONS.APP_SUBMISSIONS_VIEW],
  "/marketplace/developers": [SYSTEM_PERMISSIONS.DEVELOPER_PROFILES_VIEW],
  "/marketplace/developers/[id]": [SYSTEM_PERMISSIONS.DEVELOPER_PROFILES_VIEW],
  "/marketplace/reviews": [SYSTEM_PERMISSIONS.APP_REVIEWS_VIEW],
  "/marketplace/financials": [SYSTEM_PERMISSIONS.APP_PURCHASES_VIEW],
  "/marketplace/financials/payouts": [SYSTEM_PERMISSIONS.DEVELOPER_PAYOUTS_VIEW],
  // Marketplace Vendor (Tenant) Self-Service
  "/marketplace/my-profile": [SYSTEM_PERMISSIONS.DEVELOPER_PROFILES_VIEW],
  "/marketplace/my-submissions": [SYSTEM_PERMISSIONS.APP_SUBMISSIONS_VIEW],
  "/marketplace/my-earnings": [SYSTEM_PERMISSIONS.APP_PURCHASES_VIEW],
  */

  // PartyKernel Module
  "/party-kernel": [SYSTEM_PERMISSIONS.PARTY_VIEW],

  // Party Feature
  "/party-kernel/parties": [SYSTEM_PERMISSIONS.PARTY_VIEW],

  // PartyPerson Feature
  "/party-kernel/party-people": [SYSTEM_PERMISSIONS.PARTY_PERSON_VIEW],

  // PartyOrganization Feature
  "/party-kernel/party-organizations": [SYSTEM_PERMISSIONS.PARTY_ORGANIZATION_VIEW],

  // PartyRole Feature
  "/party-kernel/party-roles": [SYSTEM_PERMISSIONS.PARTY_ROLE_VIEW],

  // PartyRelationship Feature
  "/party-kernel/party-relationships": [SYSTEM_PERMISSIONS.PARTY_RELATIONSHIP_VIEW],

  // ContactPoint Feature
  "/party-kernel/contact-points": [SYSTEM_PERMISSIONS.CONTACT_POINT_VIEW],

  // MergeCandidate Feature
  "/party-kernel/merge-candidates": [SYSTEM_PERMISSIONS.MERGE_CANDIDATE_VIEW],

  // Hrms Module
  "/hrms": [SYSTEM_PERMISSIONS.STAFF_MEMBER_VIEW],

  // StaffMember Feature
  "/hrms/staff-members": [SYSTEM_PERMISSIONS.STAFF_MEMBER_VIEW],

  // EmploymentRecord Feature
  "/hrms/employment-records": [SYSTEM_PERMISSIONS.EMPLOYMENT_RECORD_VIEW],

  // StaffAssignment Feature
  "/hrms/staff-assignments": [SYSTEM_PERMISSIONS.STAFF_ASSIGNMENT_VIEW],

  // StaffCompetency Feature
  "/hrms/staff-competencies": [SYSTEM_PERMISSIONS.STAFF_COMPETENCY_VIEW],

  // Qualification Feature
  "/hrms/qualifications": [SYSTEM_PERMISSIONS.QUALIFICATION_VIEW],

  // Certification Feature
  "/hrms/certifications": [SYSTEM_PERMISSIONS.CERTIFICATION_VIEW],

  // StaffAvailability Feature
  "/hrms/staff-availabilities": [SYSTEM_PERMISSIONS.STAFF_AVAILABILITY_VIEW],
};
