export const CRM_LEAD_ENDPOINTS = {
  LEADS: "/v1/crm/leads",
  LEAD_BY_ID: (id: string) => `/v1/crm/leads/${id}`,
} as const;
