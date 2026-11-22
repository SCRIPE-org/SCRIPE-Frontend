import { V1 } from "./_shared";

export const TENANTS_ENDPOINTS = {
  TENANTS: {
    LIST: `${V1}/tenants`,
    TREE: `${V1}/tenants/tree`,
    SWITCHABLE: `${V1}/tenants/switchable`,
    RESOLVE: `${V1}/customization/resolve`,
    CURRENT_TENANT_CHILDREN: `${V1}/tenants/current-tenant/children`,
    CURRENT_TENANT_HIERARCHY: `${V1}/tenants/current-tenant/hierarchy`,
    CHILDREN: (parentId: string) => `${V1}/tenants/${parentId}/children`,
    BY_ID: (id: string) => `${V1}/tenants/${id}`,
    STATS: (id: string) => `${V1}/tenants/${id}/stats`,
    CREATE: `${V1}/tenants`,
    UPDATE: (id: string) => `${V1}/tenants/${id}`,
    DELETE: (id: string) => `${V1}/tenants/${id}`,
    CREATION_PERMISSIONS: `${V1}/tenants/creation-permissions`,
    SETTINGS: (id: string) => `${V1}/tenants/${id}/settings`,
    CURRENT_SETTINGS: `${V1}/customization/settings`,
    CURRENT_BRANDING: `${V1}/customization/branding`,
    // ── Customization System ──
    PUBLISH_BRANDING: `${V1}/customization/settings/publish`,
    DISCARD_DRAFT: `${V1}/customization/settings/draft`,
    ROLLBACK: (targetVersion: number) => `${V1}/customization/settings/rollback/${targetVersion}`,
    AUDIT_LOG: `${V1}/customization/settings/audit-log`,
    RESET_BRANDING: `${V1}/customization/settings/reset`,
    SYSTEM_SETTINGS: `${V1}/customization/system/settings`,
    ADMIN_PREFERENCES: `${V1}/customization/admins/settings`,
    // ── M11: Dashboard Builder ──
    DASHBOARD_PRESETS: `${V1}/customization/dashboard-presets`,
    APPLY_PRESET: `${V1}/customization/dashboard-presets/apply`,
    SAVE_PRESET: `${V1}/customization/dashboard-presets/save`,
    SAFE_MODE: (id: string) => `${V1}/customization/${id}/safe-mode`,
    PERMISSIONS: (id: string) => `${V1}/tenants/${id}/permissions`,
    PERMISSIONS_GROUPED: (id: string) => `${V1}/tenants/${id}/permissions/grouped`,
    // ── Domain Management ──
    DOMAINS: (id: string) => `${V1}/tenants/${id}/domains`,
    DOMAIN_BY_ID: (id: string, domainId: string) => `${V1}/tenants/${id}/domains/${domainId}`,
    DOMAIN_PRIMARY: (id: string, domainId: string) =>
      `${V1}/tenants/${id}/domains/${domainId}/primary`,
    DOMAIN_VERIFY: (id: string, domainId: string) =>
      `${V1}/tenants/${id}/domains/${domainId}/verify`,
  },
};
