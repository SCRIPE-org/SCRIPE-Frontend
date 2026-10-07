import { V1 } from "@/core/config/api-endpoints/_shared";

export const SECURITY_ENDPOINTS = {
  SECURITY_EVENTS: `${V1}/Dashboard/security-events`,
  TOP_BLOCKED_IPS: `${V1}/Dashboard/top-blocked-ips`,
  LOGIN_ACTIVITY: `${V1}/Dashboard/login-activity`,
  RECENT_CHANGES: `${V1}/Dashboard/recent-changes`,
  SUMMARY: `${V1}/Dashboard/summary`,
  SESSIONS: `${V1}/auth/admin/sessions`,
  REVOKE_SESSION: (tokenId: string) => `${V1}/auth/admin/sessions/${tokenId}`,
  REVOKE_ALL_SESSIONS: `${V1}/auth/admin/sessions/revoke-all`,
  ADMINS: `${V1}/Admins`,
  EXPORT_SECURITY: `${V1}/Dashboard/export/security`,
} as const;
