import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * Documentation for module export
 */
export const TENANTS_ENDPOINTS = {
  LIST: `${V1}/Tenants`,
  TREE: `${V1}/Tenants/tree`,
  RESOLVE: `${V1}/customization/resolve`,
  MY_CHILDREN: `${V1}/Tenants/myChildren`,
  MY_TENANT_AND_CHILDREN: `${V1}/Tenants/myTenantAndChildren`,
  CHILDREN: (parentId: string) => `${V1}/Tenants/${parentId}/children`,
  BY_ID: (id: string) => `${V1}/Tenants/${id}`,
  STATS: (id: string) => `${V1}/Tenants/${id}/stats`,
  CREATE: `${V1}/Tenants`,
  UPDATE: (id: string) => `${V1}/Tenants/${id}`,
  DELETE: (id: string) => `${V1}/Tenants/${id}`,
  CREATION_PERMISSIONS: `${V1}/Tenants/creation-permissions`,
  SETTINGS: (id: string) => `${V1}/Tenants/${id}/settings`,
  MY_SETTINGS: `${V1}/customization/settings`,
  MY_BRANDING: `${V1}/customization/branding`,
  PUBLISH_BRANDING: `${V1}/customization/settings/publish`,
  DISCARD_DRAFT: `${V1}/customization/settings/draft`,
  ROLLBACK: (targetVersion: number) => `${V1}/customization/settings/rollback/${targetVersion}`,
  AUDIT_LOG: `${V1}/customization/settings/audit-log`,
  RESET_BRANDING: `${V1}/customization/settings/reset`,
  SYSTEM_SETTINGS: `${V1}/customization/system/settings`,
  ADMIN_PREFERENCES: `${V1}/customization/admins/settings`,
  DASHBOARD_PRESETS: `${V1}/customization/dashboard-presets`,
  APPLY_PRESET: `${V1}/customization/dashboard-presets/apply`,
  SAVE_PRESET: `${V1}/customization/dashboard-presets/save`,
  SAFE_MODE: (id: string) => `${V1}/customization/${id}/safe-mode`,
  PERMISSIONS: (id: string) => `${V1}/Tenants/${id}/permissions`,
  PERMISSIONS_GROUPED: (id: string) => `${V1}/Tenants/${id}/permissions/grouped`,
  DOMAINS: (id: string) => `${V1}/Tenants/${id}/domains`,
  DOMAIN_BY_ID: (id: string, domainId: string) => `${V1}/Tenants/${id}/domains/${domainId}`,
  DOMAIN_PRIMARY: (id: string, domainId: string) =>
    `${V1}/Tenants/${id}/domains/${domainId}/primary`,
  DOMAIN_VERIFY: (id: string, domainId: string) => `${V1}/Tenants/${id}/domains/${domainId}/verify`,
  ENTITLEMENTS: {
    EDITIONS: {
      LIST: `${V1}/editions`,
      PROMOTIONS: (editionId: string) => `${V1}/editions/${editionId}/promotions`,
      VALIDATE_PROMO_CODE: (editionId: string) =>
        `${V1}/editions/${editionId}/promotions/validate-code`,
    },
    TENANT_FEATURES: {
      RESOLVED: (tenantId: string) => `${V1}/tenants/${tenantId}/features/resolved`,
    },
    SUBSCRIPTIONS: {
      ASSIGN: (tenantId: string) => `${V1}/tenants/${tenantId}/subscription`,
      CHANGE: (tenantId: string) => `${V1}/tenants/${tenantId}/subscription`,
      RENEW: (tenantId: string) => `${V1}/tenants/${tenantId}/subscription/renew`,
      CONVERT: (tenantId: string) => `${V1}/tenants/${tenantId}/subscription/convert`,
      SUSPEND: (tenantId: string) => `${V1}/tenants/${tenantId}/subscription/suspend`,
      RESUME: (tenantId: string) => `${V1}/tenants/${tenantId}/subscription/resume`,
      CANCEL: (tenantId: string) => `${V1}/tenants/${tenantId}/subscription/cancel`,
      RESYNC: (tenantId: string) => `${V1}/tenants/${tenantId}/subscription/resync`,
      LIST_BY_TENANT: (tenantId: string) => `${V1}/tenants/${tenantId}/subscriptions`,
      CHANGE_CURRENCY: (tenantId: string) =>
        `${V1}/tenants/${tenantId}/subscription/change-currency`,
      DOWNGRADE_IMPACT: (tenantId: string, targetEditionId: string) =>
        `${V1}/tenants/${tenantId}/subscription/downgrade-impact?targetEditionId=${targetEditionId}`,
    },
    PRICING: {
      PREVIEW: (editionId: string, currency: string, type: string) =>
        `${V1}/editions/${editionId}/prices/preview?currency=${currency}&type=${type}`,
    },
  },
} as const;
