import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * ANALYTICS_ENDPOINTS
 */
export const ANALYTICS_ENDPOINTS = {
  SUMMARY: `${V1}/Dashboard/summary`,
  EVENT_DISTRIBUTION: `${V1}/Dashboard/event-distribution`,
  LOGIN_ACTIVITY: `${V1}/Dashboard/login-activity`,
  EXPORT_ANALYTICS: `${V1}/Dashboard/export/analytics`,
  SUBSCRIPTIONS: `${V1}/Dashboard/subscriptions`,
  TENANTS: `${V1}/Tenants`,
  FEATURES_GROUPED: `${V1}/features/grouped`,
} as const;
