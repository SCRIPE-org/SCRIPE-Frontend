import { V1 } from "@/core/config/api-endpoints/_shared";

/** API endpoints owned by the CRM Reports sub-module. */
export const CRM_REPORTS_ENDPOINTS = {
  PIPELINE_REPORT: `${V1}/crm/reports/pipeline`,
} as const;
