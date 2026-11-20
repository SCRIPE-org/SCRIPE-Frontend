import { V1 } from "@/core/config/api-endpoints/_shared";

const CRM_V1 = `${V1}/crm`;

/**
 * CRM Overview API Endpoints Catalog
 * Authority: SCRIPE CRM C1 Specification
 */
export const CRM_OVERVIEW_ENDPOINTS = {
  PIPELINE_DEFAULT: `${CRM_V1}/pipelines/default`,
  PIPELINE_REPORT: `${CRM_V1}/reports/pipeline`,
  OPPORTUNITIES: `${CRM_V1}/opportunities`,
} as const;
