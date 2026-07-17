import { V1 } from "@/core/config/api-endpoints/_shared";

export const DASHBOARD_ENDPOINTS = {
  SUMMARY: `${V1}/Dashboard/summary`,
  LOGIN_ACTIVITY: `${V1}/Dashboard/login-activity`,
  RECENT_CHANGES: `${V1}/Dashboard/recent-changes`,
  EVENT_DISTRIBUTION: `${V1}/Dashboard/event-distribution`,
  EXPORT_OVERVIEW: `${V1}/Dashboard/export/overview`,
} as const;
