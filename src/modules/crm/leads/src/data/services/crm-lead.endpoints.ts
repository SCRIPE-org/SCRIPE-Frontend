export const CRM_LEAD_ENDPOINTS = {
  LEADS: "/v1/crm/leads",
  LEAD_BY_ID: (id: string) => `/v1/crm/leads/${id}`,
  QUALIFY: (id: string) => `/v1/crm/leads/${id}/qualify`,
  LINK_PARTY: (id: string) => `/v1/crm/leads/${id}/link-party`,
  CONVERT: (id: string) => `/v1/crm/leads/${id}/convert`,
  MOVE_STAGE: (id: string) => `/v1/crm/leads/${id}/move-stage`,
} as const;
