import { V1 } from "./_shared";

export const SYSTEM_ENDPOINTS = {
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

  AUDIT: {
    LOGS: `${V1}/Audit/logs`,
    LOG_DETAIL: (id: string) => `${V1}/Audit/logs/${id}`,
    EXPORT: `${V1}/Audit/export`,
    ANALYTICS: `${V1}/Audit/analytics`,
    TOP_USERS: `${V1}/Audit/analytics/top-users`,
    COMPLIANCE_REPORT: `${V1}/Audit/compliance-report`,
  },

  RECYCLE_BIN: {
    LIST: `${V1}/recycle-bin`,
    RESTORE: (entityType: string, id: string) => `${V1}/recycle-bin/${entityType}/${id}/restore`,
    BULK_RESTORE: `${V1}/recycle-bin/bulk-restore`,
  },

  UPLOADS: {
    IMAGE: `${V1}/uploads/image`,
    VIDEO: `${V1}/uploads/video`,
  },
};
