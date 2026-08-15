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
    HUB_SUMMARY: `${V1}/Audit/hub-summary`,
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

  // ── Session-based downloads (DownloadsController) ──────────────────────
  // CREATE_SESSION mints a short-lived, single-file session token (auth +
  // medias.view required — see DownloadsController.CreateSession). BY_SESSION
  // redeems it with no Authorization header ([AllowAnonymous]), which is the
  // whole point: native <img>/<video> tags can never carry a Bearer header,
  // so this is how they render files now that /api/files itself requires one.
  DOWNLOADS: {
    CREATE_SESSION: `${V1}/downloads/session`,
    BY_SESSION: (sessionId: string) => `${V1}/downloads/session/${sessionId}`,
  },
};
