import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * Documentation for module export
 */
export const ANALYTICS_ENDPOINTS = {
  OVERVIEW: `${V1}/analytics/overview`,
  MRR_MOVEMENT: `${V1}/analytics/mrr-movement`,
  COHORT: `${V1}/analytics/cohort`,
  LTV: `${V1}/analytics/ltv`,
  FORECAST: `${V1}/analytics/forecast`,
  HEALTH_SCORES: `${V1}/analytics/health`,
  HEALTH_BY_ID: (tenantId: string) => `${V1}/analytics/health/${tenantId}`,
  REPORT_PREFERENCES: `${V1}/analytics/report-preference`,
  EXPORT: `${V1}/analytics/export`,
  GENERATE_REPORT: `${V1}/analytics/generate-report`,
} as const;
