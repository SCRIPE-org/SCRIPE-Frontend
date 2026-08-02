import { V1 } from "@/core/config/api-endpoints/_shared";

export const AUDIT_ENDPOINTS = {
  LOGS: `${V1}/Audit/logs`,
  LOG_DETAIL: (id: string) => `${V1}/Audit/logs/${id}`,
  EXPORT: `${V1}/Audit/export`,
  ANALYTICS: `${V1}/Audit/analytics`,
  TOP_USERS: `${V1}/Audit/analytics/top-users`,
  COMPLIANCE_REPORT: `${V1}/Audit/compliance-report`,
  HUB_SUMMARY: `${V1}/Audit/hub-summary`,
} as const;
