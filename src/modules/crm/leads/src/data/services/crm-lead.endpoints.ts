export const CRM_LEAD_ENDPOINTS = {
  LEADS: "/crm/leads",
  LEAD_BY_ID: (id: string) => `/crm/leads/${id}`,
} as const;
