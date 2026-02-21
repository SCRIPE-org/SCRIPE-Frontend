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
  },

  // Legacy auth endpoints (for backward compatibility)
  LOGIN: `${V1}/auth/admin/login`,
  LOGOUT: `${V1}/auth/admin/logout`,
  REFRESH: `${V1}/auth/admin/refresh`,
  GET_ADMIN_ME: `${V1}/auth/admin/me`,

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
    IMPERSONATE: (id: string) => `${V1}/Admins/${id}/impersonate`,
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
  },

  // Legacy profile endpoints
  UPDATE_ADMIN_PROFILE: `${V1}/auth/admin/me`,
  CHANGE_ADMIN_PASSWORD: `${V1}/auth/admin/me/password`,

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
    PERMISSIONS: (id: string) => `${V1}/Tenants/${id}/permissions`,
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

  // Legacy menu endpoints
  GET_MENU_ITEMS: `${V1}/Menus/my`,

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
