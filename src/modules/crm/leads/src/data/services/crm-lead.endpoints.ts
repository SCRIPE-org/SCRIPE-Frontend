import { V1 } from "@/core/config/api-endpoints/_shared";

/** REST API endpoint catalog for CRM Leads lifecycle operations. */
export const CRM_LEAD_ENDPOINTS = {
  LEADS: `${V1}/crm/leads`,
  LEAD_BY_ID: (id: string) => `${V1}/crm/leads/${id}`,
  ASSIGN_OWNER: (id: string) => `${V1}/crm/leads/${id}/owner`,
  QUALIFY: (id: string) => `${V1}/crm/leads/${id}/qualify`,
  LINK_PARTY: (id: string) => `${V1}/crm/leads/${id}/link-party`,
  CONVERT: (id: string) => `${V1}/crm/leads/${id}/convert`,
  MOVE_STAGE: (id: string) => `${V1}/crm/leads/${id}/move-stage`,
} as const;
