import { V1 } from "./_shared";

export const TENANTS_ENDPOINTS = {
  TENANTS: {
    LIST: `${V1}/Tenants`,
    TREE: `${V1}/Tenants/tree`,
    RESOLVE: `${V1}/Tenants/resolve`,
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
    MY_SETTINGS: `${V1}/Tenants/my/settings`,
    MY_BRANDING: `${V1}/Tenants/my/branding`,
    // ── Customization System ──
    PUBLISH_BRANDING: `${V1}/Tenants/my/settings/publish`,
    DISCARD_DRAFT: `${V1}/Tenants/my/settings/draft`,
    ROLLBACK: (targetVersion: number) => `${V1}/Tenants/my/settings/rollback/${targetVersion}`,
    AUDIT_LOG: `${V1}/Tenants/my/settings/audit-log`,
    RESET_BRANDING: `${V1}/Tenants/my/settings/reset`,
    SYSTEM_SETTINGS: `${V1}/Tenants/system/settings`,
    ADMIN_PREFERENCES: `${V1}/Tenants/admins/my/settings`,
    // ── M11: Dashboard Builder ──
    DASHBOARD_PRESETS: `${V1}/Tenants/my/dashboard-presets`,
    APPLY_PRESET: `${V1}/Tenants/my/dashboard-presets/apply`,
    SAVE_PRESET: `${V1}/Tenants/my/dashboard-presets/save`,
    SAFE_MODE: (id: string) => `${V1}/Tenants/${id}/safe-mode`,
    PERMISSIONS: (id: string) => `${V1}/Tenants/${id}/permissions`,
    PERMISSIONS_GROUPED: (id: string) => `${V1}/Tenants/${id}/permissions/grouped`,
    // ── Domain Management ──
    DOMAINS: (id: string) => `${V1}/Tenants/${id}/domains`,
    DOMAIN_BY_ID: (id: string, domainId: string) => `${V1}/Tenants/${id}/domains/${domainId}`,
    DOMAIN_PRIMARY: (id: string, domainId: string) =>
      `${V1}/Tenants/${id}/domains/${domainId}/primary`,
    DOMAIN_VERIFY: (id: string, domainId: string) =>
      `${V1}/Tenants/${id}/domains/${domainId}/verify`,
  },
};
