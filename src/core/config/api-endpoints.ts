/**
 * API Endpoints Configuration
 *
 * Centralized endpoint definitions for all API calls.
 * Organized by module for better maintainability.
 *
 * IMPORTANT: These paths must match the backend controller routes exactly.
 * Backend uses [Route("api/v{version:apiVersion}/[controller]")] with URL-based versioning.
 */

/** Current API version prefix */
const V1 = "/v1";

export const API_ENDPOINTS = {
  // ===== AUTH =====
  AUTH: {
    LOGIN: `${V1}/auth/admin/login`,
    LOGOUT: `${V1}/auth/admin/logout`,
    REFRESH: `${V1}/auth/admin/refresh`,
    ME: `${V1}/auth/admin/me`,
    IMPERSONATE: (id: string) => `${V1}/auth/admin/impersonate/${id}`,
    STOP_IMPERSONATION: `${V1}/auth/admin/stop-impersonation`,
    TWO_FA: {
      ENABLE: `${V1}/auth/admin/2fa/enable`,
      CONFIRM: `${V1}/auth/admin/2fa/confirm`,
      VERIFY: `${V1}/auth/admin/2fa/verify`,
      DISABLE: `${V1}/auth/admin/2fa/disable`,
    },
    OIDC: {
      ADMIN_PROVIDERS: `${V1}/auth/oidc/providers/admin`,
      CHALLENGE: `${V1}/auth/oidc/challenge`,
      CALLBACK: `${V1}/auth/oidc/callback`,
      AUTHORIZE: `/connect/authorize`,
    },
    SAML: {
      LOGIN: `${V1}/auth/saml/login`,
    },
  },



  // ===== ADMINS =====
  ADMINS: {
    LIST: `${V1}/Admins`,
    BY_ID: (id: string) => `${V1}/Admins/${id}`,
    BY_TENANT_ID: (tenantId: string) => `${V1}/Admins/byTenantId/${tenantId}`,
    MY_TENANT_ADMINS: `${V1}/Admins/myTenantAdmins`,
    CREATE: `${V1}/Admins`,
    CREATE_FOR_MY_TENANT: `${V1}/Admins/createForMyTenant`,
    UPDATE: (id: string) => `${V1}/Admins/${id}`,
    DELETE: (id: string) => `${V1}/Admins/${id}`,
    SET_ACTIVE: (id: string) => `${V1}/Admins/${id}/active`,
    ROLES: (id: string) => `${V1}/Admins/${id}/roles`,
    REMOVE_ROLE: (adminId: string, roleId: string) => `${V1}/Admins/${adminId}/roles/${roleId}`,
    RESET_PASSWORD: (id: string) => `${V1}/Admins/${id}/reset-password`,
    CHANGE_PASSWORD: (id: string) => `${V1}/Admins/${id}/change-password`,
    BULK: {
      ACTIVATE: `${V1}/Admins/bulk/activate`,
      DEACTIVATE: `${V1}/Admins/bulk/deactivate`,
      DELETE: `${V1}/Admins/bulk/delete`,
      ACTIVATE_ALL: `${V1}/Admins/bulk/activate-all`,
      DEACTIVATE_ALL: `${V1}/Admins/bulk/deactivate-all`,
      DELETE_ALL: `${V1}/Admins/bulk/delete-all`,
    },

    TRANSFER: (id: string) => `${V1}/Admins/${id}/transfer`,
    TRANSFER_PROTECTION: `${V1}/Admins/transfer-protection`,
    SYNC_ROLES: (id: string) => `${V1}/Admins/${id}/roles/sync`,
  },

  // ===== PROFILE (Self-Service) =====
  PROFILE: {
    ME: `${V1}/auth/admin/me`,
    UPDATE_ME: `${V1}/auth/admin/me`,
    AVATAR: `${V1}/auth/admin/me/avatar`,
    CHANGE_PASSWORD: (id: string) => `${V1}/Admins/${id}/change-password`,
    SESSIONS: `${V1}/auth/admin/sessions`,
    REVOKE_SESSION: (tokenId: string) => `${V1}/auth/admin/sessions/${tokenId}`,
    REVOKE_ALL_SESSIONS: `${V1}/auth/admin/sessions/revoke-all`,
    BACKUP_CODES_REGENERATE: `${V1}/auth/admin/2fa/backup-codes/regenerate`,
    SECURITY_LOG: `${V1}/auth/admin/security-log`,
    EXTERNAL_LOGINS: `${V1}/auth/admin/external-logins`,
    LINK_EXTERNAL_LOGIN: `${V1}/auth/admin/external-logins/link`,
    UNLINK_EXTERNAL_LOGIN: (id: string) => `${V1}/auth/admin/external-logins/${id}`,
  },



  ROLES: {
    LIST: `${V1}/Roles`,
    BY_ID: (id: string) => `${V1}/Roles/${id}`,
    BY_TENANT_ID: (tenantId: string) => `${V1}/Roles/byTenantId/${tenantId}`,
    MY_TENANT_ROLES: `${V1}/Roles/myTenantRoles`,
    MY_TENANT_AVAILABLE_PERMISSIONS: `${V1}/Roles/myTenant/available-permissions`,
    CREATE: `${V1}/Roles`,
    CREATE_FOR_MY_TENANT: `${V1}/Roles/createForMyTenant`,
    UPDATE: (id: string) => `${V1}/Roles/${id}`,
    DELETE: (id: string) => `${V1}/Roles/${id}`,
    PERMISSIONS: (id: string) => `${V1}/Roles/${id}/permissions`,
    REMOVE_PERMISSION: (roleId: string, permissionId: string) =>
      `${V1}/Roles/${roleId}/permissions/${permissionId}`,
    CLONE: (id: string) => `${V1}/Roles/${id}/clone`,
    BULK: {
      DELETE: `${V1}/Roles/bulk/delete`,
      DELETE_ALL: `${V1}/Roles/bulk/delete-all`,
    },
  },

  // ===== PERMISSIONS =====
  PERMISSIONS: {
    LIST: `${V1}/Permissions`,
    MY: `${V1}/Permissions/my`,
    BY_ID: (id: string) => `${V1}/Permissions/${id}`,
    CREATE: `${V1}/Permissions`,
    UPDATE: (id: string) => `${V1}/Permissions/${id}`,
    DELETE: (id: string) => `${V1}/Permissions/${id}`,
    CATEGORIES: `${V1}/Permissions/categories`,
  },

  // ===== TENANTS =====
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
    DASHBOARD_SETTINGS: `${V1}/Tenants/my/dashboard-settings`,
    DASHBOARD_SETTINGS_PUBLISH: `${V1}/Tenants/my/dashboard-settings/publish`,
    DASHBOARD_SETTINGS_DISCARD: `${V1}/Tenants/my/dashboard-settings/draft`,
    DASHBOARD_PRESETS: `${V1}/Tenants/my/dashboard-presets`,
    APPLY_PRESET: `${V1}/Tenants/my/dashboard-presets/apply`,
    SAVE_PRESET: `${V1}/Tenants/my/dashboard-presets/save`,
    SAFE_MODE: (id: string) => `${V1}/Tenants/${id}/safe-mode`,
    PERMISSIONS: (id: string) => `${V1}/Tenants/${id}/permissions`,
    // ── Domain Management ──
    DOMAINS: (id: string) => `${V1}/Tenants/${id}/domains`,
    DOMAIN_BY_ID: (id: string, domainId: string) => `${V1}/Tenants/${id}/domains/${domainId}`,
    DOMAIN_PRIMARY: (id: string, domainId: string) => `${V1}/Tenants/${id}/domains/${domainId}/primary`,
    DOMAIN_VERIFY: (id: string, domainId: string) => `${V1}/Tenants/${id}/domains/${domainId}/verify`,
  },

  // ===== THEME MARKETPLACE =====
  THEMES: {
    LIST: `${V1}/Themes`,
    FEATURED: `${V1}/Themes/featured`,
    FAVORITES: `${V1}/Themes/favorites`,
    BY_SLUG: (slug: string) => `${V1}/Themes/${slug}`,
    APPLY: (slug: string) => `${V1}/Themes/${slug}/apply`,
    FAVORITE: (slug: string) => `${V1}/Themes/${slug}/favorite`,
    CREATE: `${V1}/Themes`,
    UPDATE: (slug: string) => `${V1}/Themes/${slug}`,
    DELETE: (slug: string) => `${V1}/Themes/${slug}`,
    DEPRECATE: (slug: string) => `${V1}/Themes/${slug}/deprecate`,
    DUPLICATE: (slug: string) => `${V1}/Themes/${slug}/duplicate`,
    REORDER: `${V1}/Themes/reorder`,
  },

  // ===== THEME BUNDLES =====
  BUNDLES: {
    LIST: `${V1}/ThemeBundles`,
    FEATURED: `${V1}/ThemeBundles/featured`,
    BY_SLUG: (slug: string) => `${V1}/ThemeBundles/${slug}`,
    APPLY: (slug: string) => `${V1}/ThemeBundles/${slug}/apply`,
    FAVORITE: (slug: string) => `${V1}/ThemeBundles/${slug}/favorite`,
    SAVE: `${V1}/ThemeBundles/save-current`,
  },

  // ===== MENUS =====
  MENUS: {
    MY: `${V1}/Menus/my`,
    MY_OVERRIDES: `${V1}/Menus/overrides/my`,
    LIST: `${V1}/Menus`,
    BY_ID: (id: string) => `${V1}/Menus/${id}`,
    CREATE: `${V1}/Menus`,
    UPDATE: (id: string) => `${V1}/Menus/${id}`,
    DELETE: (id: string) => `${V1}/Menus/${id}`,
    REORDER: `${V1}/Menus/reorder`,
    ROLE_VISIBILITY: `${V1}/Menus/role-visibility`,
    OVERRIDES: `${V1}/Menus/overrides`,
    DELETE_OVERRIDE: (id: string) => `${V1}/Menus/overrides/${id}`,
  },

  // ===== DASHBOARD =====
  DASHBOARD: {
    SUMMARY: `${V1}/Dashboard/summary`,
    LOGIN_ACTIVITY: `${V1}/Dashboard/login-activity`,
    RECENT_CHANGES: `${V1}/Dashboard/recent-changes`,
    EVENT_DISTRIBUTION: `${V1}/Dashboard/event-distribution`,
    SECURITY_EVENTS: `${V1}/Dashboard/security-events`,
    TOP_BLOCKED_IPS: `${V1}/Dashboard/top-blocked-ips`,
    EXPORT_OVERVIEW: `${V1}/Dashboard/export/overview`,
    EXPORT_ANALYTICS: `${V1}/Dashboard/export/analytics`,
    EXPORT_SECURITY: `${V1}/Dashboard/export/security`,
  },

  // ===== AUDIT =====
  AUDIT: {
    LOGS: `${V1}/Audit/logs`,
    LOG_DETAIL: (id: string) => `${V1}/Audit/logs/${id}`,
    EXPORT: `${V1}/Audit/export`,
  },

  // ===== RECYCLE BIN =====
  RECYCLE_BIN: {
    LIST: `${V1}/recycle-bin`,
    RESTORE: (entityType: string, id: string) => `${V1}/recycle-bin/${entityType}/${id}/restore`,
    BULK_RESTORE: `${V1}/recycle-bin/bulk-restore`,
  },



  // ===== MESSAGING =====
  MESSAGE_TEMPLATES: {
    LIST: `${V1}/message-templates`,
    BY_ID: (id: string) => `${V1}/message-templates/${id}`,
    CREATE: `${V1}/message-templates`,
    UPDATE: (id: string) => `${V1}/message-templates/${id}`,
    DELETE: (id: string) => `${V1}/message-templates/${id}`,
    PREVIEW: `${V1}/message-templates/preview`,
    CLONE: (id: string) => `${V1}/message-templates/${id}/clone`,
  },
  EMAILS: {
    SEND: `${V1}/emails/send`,
    SEND_BULK: `${V1}/emails/send-bulk`,
    SEARCH_RECIPIENTS: `${V1}/emails/search-recipients`,
    SENT_HISTORY: `${V1}/emails/sent`,
    STATISTICS: `${V1}/emails/statistics`,
    CANCEL: (id: string) => `${V1}/emails/${id}`,
    RESEND: (id: string) => `${V1}/emails/${id}/resend`,
    TEMPLATES_LIST: `${V1}/emails/templates`,
    UPLOAD_ATTACHMENT: `${V1}/email/upload-attachment`,
  },
  // ===== NOTIFICATIONS (Bell UI — read/unread/preferences) =====
  NOTIFICATIONS: {
    LIST: `${V1}/Notifications`,
    UNREAD_COUNT: `${V1}/Notifications/unread-count`,
    MARK_READ: (id: string) => `${V1}/Notifications/${id}/read`,
    MARK_ALL_READ: `${V1}/Notifications/read-all`,
    DELETE: (id: string) => `${V1}/Notifications/${id}`,
    PREFERENCES: `${V1}/Notifications/preferences`,
  },
  NOTIFICATIONS_SENDER: {
    SEARCH_TARGETS: `${V1}/Notifications/search-targets`,
    SEND: `${V1}/Notifications/send`,
  },

  // ===== WEBHOOKS =====
  WEBHOOKS: {
    LIST: `${V1}/webhooks`,
    BY_ID: (id: string) => `${V1}/webhooks/${id}`,
    CREATE: `${V1}/webhooks`,
    UPDATE: (id: string) => `${V1}/webhooks/${id}`,
    DELETE: (id: string) => `${V1}/webhooks/${id}`,
    TOGGLE: (id: string) => `${V1}/webhooks/${id}/toggle`,
    ROTATE_SECRET: (id: string) => `${V1}/webhooks/${id}/rotate-secret`,
    TEST: (id: string) => `${V1}/webhooks/${id}/test`,
    DELIVERY_LOGS: (id: string) => `${V1}/webhooks/${id}/logs`,
    EVENTS: `${V1}/webhooks/events`,
  },

  // ===== ENTITLEMENTS =====
  ENTITLEMENTS: {
    FEATURES: {
      LIST: `${V1}/features`,
      EFFECTIVE: `${V1}/features/effective`,
      BY_ID: (id: string) => `${V1}/features/${id}`,
      CREATE: `${V1}/features`,
      UPDATE: (id: string) => `${V1}/features/${id}`,
      DELETE: (id: string) => `${V1}/features/${id}`,
    },
    EDITIONS: {
      LIST: `${V1}/editions`,
      BY_ID: (id: string) => `${V1}/editions/${id}`,
      CREATE: `${V1}/editions`,
      UPDATE: (id: string) => `${V1}/editions/${id}`,
      DELETE: (id: string) => `${V1}/editions/${id}`,
      SET_FEATURE: (editionId: string, featureId: string) => `${V1}/editions/${editionId}/features/${featureId}`,
      VERSIONS: (editionId: string) => `${V1}/editions/${editionId}/versions`,
      CREATE_VERSION: (editionId: string) => `${V1}/editions/${editionId}/versions`,
      PUBLISH_VERSION: (editionId: string, versionId: string) => `${V1}/editions/${editionId}/versions/${versionId}/publish`,
      CANCEL_VERSION: (editionId: string, versionId: string) => `${V1}/editions/${editionId}/versions/${versionId}/cancel`,
      DIRECT_APPLY_FEATURES: (editionId: string) => `${V1}/editions/${editionId}/features/apply`,
      PRICES: (editionId: string) => `${V1}/editions/${editionId}/prices`,
      SET_PRICES: (editionId: string) => `${V1}/editions/${editionId}/prices`,
      // ── Promotions ──
      PROMOTIONS: (editionId: string) => `${V1}/editions/${editionId}/promotions`,
      CREATE_PROMOTION: (editionId: string) => `${V1}/editions/${editionId}/promotions`,
      UPDATE_PROMOTION: (editionId: string, promoId: string) => `${V1}/editions/${editionId}/promotions/${promoId}`,
      DELETE_PROMOTION: (editionId: string, promoId: string) => `${V1}/editions/${editionId}/promotions/${promoId}`,
      VALIDATE_PROMO_CODE: (editionId: string) => `${V1}/editions/${editionId}/promotions/validate-code`,
    },
    TENANT_FEATURES: {
      OVERRIDES: (tenantId: string) => `${V1}/tenants/${tenantId}/features/overrides`,
      RESOLVED: (tenantId: string) => `${V1}/tenants/${tenantId}/features/resolved`,
      SET_OVERRIDE: (tenantId: string, featureId: string) => `${V1}/tenants/${tenantId}/features/${featureId}`,
      REMOVE_OVERRIDE: (tenantId: string, featureId: string) => `${V1}/tenants/${tenantId}/features/${featureId}`,
    },
    SUBSCRIPTIONS: {
      LIST_ALL: `${V1}/subscriptions`,
      ASSIGN: (tenantId: string) => `${V1}/tenants/${tenantId}/subscription`,
      CHANGE: (tenantId: string) => `${V1}/tenants/${tenantId}/subscription`,
      RENEW: (tenantId: string) => `${V1}/tenants/${tenantId}/subscription/renew`,
      CONVERT: (tenantId: string) => `${V1}/tenants/${tenantId}/subscription/convert`,
      SUSPEND: (tenantId: string) => `${V1}/tenants/${tenantId}/subscription/suspend`,
      RESUME: (tenantId: string) => `${V1}/tenants/${tenantId}/subscription/resume`,
      CANCEL: (tenantId: string) => `${V1}/tenants/${tenantId}/subscription/cancel`,
      RESYNC: (tenantId: string) => `${V1}/tenants/${tenantId}/subscription/resync`,
      LIST_BY_TENANT: (tenantId: string) => `${V1}/tenants/${tenantId}/subscriptions`,
      GET_BY_ID: (id: string) => `${V1}/subscriptions/${id}`,
      REVOKE: (id: string) => `${V1}/subscriptions/${id}`,
      CHANGE_CURRENCY: (tenantId: string) => `${V1}/tenants/${tenantId}/subscription/change-currency`,
      DOWNGRADE_IMPACT: (tenantId: string, targetEditionId: string) => `${V1}/tenants/${tenantId}/subscription/downgrade-impact?targetEditionId=${targetEditionId}`,
      EXPORT: (
        format: string,
        status?: string,
        type?: string,
        currency?: string,
        dateFrom?: string,
        dateTo?: string,
        expiringInDays?: number,
        edition?: string
      ) => {
        const params = new URLSearchParams({ format });
        if (status && status !== "all") params.set("status", status);
        if (type && type !== "all") params.set("type", type);
        if (currency) params.set("currency", currency);
        if (dateFrom) params.set("dateFrom", dateFrom);
        if (dateTo) params.set("dateTo", dateTo);
        if (expiringInDays && expiringInDays > 0) params.set("expiringInDays", expiringInDays.toString());
        if (edition && edition !== "all") params.set("edition", edition);
        return `${V1}/subscriptions/export?${params.toString()}`;
      },
      RECEIPT: (tenantId: string) => `${V1}/tenants/${tenantId}/subscription/receipt`,
    },
    PRICING: {
      PREVIEW: (editionId: string, currency: string, type: string) => `${V1}/editions/${editionId}/prices/preview?currency=${currency}&type=${type}`,
      OVERRIDE_COST_SET: (overrideId: string) => `${V1}/overrides/${overrideId}/cost`,
      OVERRIDE_COST_REMOVE: (overrideId: string) => `${V1}/overrides/${overrideId}/cost`,
    },
    CURRENCY: {
      RATES: (baseCurrency: string = "USD") => `${V1}/currency/rates?baseCurrency=${baseCurrency}`,
      SUPPORTED: `${V1}/currency/supported`,
      REFRESH: `${V1}/currency/rates/refresh`,
      LAST_UPDATED: `${V1}/currency/rates/last-updated`,
    },
  },

  // ===== USER GROUPS =====
  USER_GROUPS: {
    LIST: `${V1}/UserGroups`,
    MY_TENANT_GROUPS: `${V1}/UserGroups/myTenantGroups`,
    BY_ID: (id: string) => `${V1}/UserGroups/${id}`,
    BY_TENANT: (tenantId: string) => `${V1}/UserGroups/byTenant/${tenantId}`,
    CREATE: `${V1}/UserGroups`,
    CREATE_FOR_MY_TENANT: `${V1}/UserGroups/createForMyTenant`,
    UPDATE: (id: string) => `${V1}/UserGroups/${id}`,
    DELETE: (id: string) => `${V1}/UserGroups/${id}`,
    ADD_MEMBERS: (id: string) => `${V1}/UserGroups/${id}/members`,
    REMOVE_MEMBER: (id: string, adminId: string) => `${V1}/UserGroups/${id}/members/${adminId}`,
    SET_ROLES: (id: string) => `${V1}/UserGroups/${id}/roles`,
    SET_RESTRICTIONS: (id: string) => `${V1}/UserGroups/${id}/restrictions`,
    BULK: {
      ACTIVATE: `${V1}/UserGroups/bulk/activate`,
      DEACTIVATE: `${V1}/UserGroups/bulk/deactivate`,
      DELETE: `${V1}/UserGroups/bulk/delete`,
      ACTIVATE_ALL: `${V1}/UserGroups/bulk/activate-all`,
      DEACTIVATE_ALL: `${V1}/UserGroups/bulk/deactivate-all`,
      DELETE_ALL: `${V1}/UserGroups/bulk/delete-all`,
    },
  },

  // ===== IDENTITY PROVIDERS (SSO / OIDC Client) =====
  IDENTITY_PROVIDERS: {
    LIST: `${V1}/identity-providers`,
    BY_ID: (id: string) => `${V1}/identity-providers/${id}`,
    CREATE: `${V1}/identity-providers`,
    UPDATE: (id: string) => `${V1}/identity-providers/${id}`,
    DELETE: (id: string) => `${V1}/identity-providers/${id}`,
    TEST: (id: string) => `${V1}/identity-providers/${id}/test-connection`,
  },

  // ===== OAUTH APPLICATIONS (OIDC Server) =====
  OAUTH_APPS: {
    LIST: `${V1}/oauth-applications`,
    BY_ID: (id: string) => `${V1}/oauth-applications/${id}`,
    CREATE: `${V1}/oauth-applications`,
    UPDATE: (id: string) => `${V1}/oauth-applications/${id}`,
    DELETE: (id: string) => `${V1}/oauth-applications/${id}`,
    REGENERATE_SECRET: (id: string) => `${V1}/oauth-applications/${id}/regenerate-secret`,
  },

  // ===== GENERIC UPLOADS =====
  UPLOADS: {
    IMAGE: `${V1}/uploads/image`,
    VIDEO: `${V1}/uploads/video`,
  },
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
