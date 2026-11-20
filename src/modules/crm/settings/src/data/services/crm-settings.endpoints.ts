import { V1 } from "@/core/config/api-endpoints/_shared";

/** API endpoints owned by the CRM Settings sub-module. */
export const CRM_SETTINGS_ENDPOINTS = {
  SETTINGS: `${V1}/crm/settings`,
  GOVERNANCE_CATALOG: `${V1}/crm/settings/governance-catalog`,
  ASSIGNEES: `${V1}/crm/settings/assignees`,
  TENANT: `${V1}/crm/settings/tenant`,
  USER: `${V1}/crm/settings/user`,
} as const;
