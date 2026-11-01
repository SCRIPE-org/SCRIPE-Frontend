/**
 * REST API Endpoint catalog for CRM Opportunities lifecycle operations.
 */
export const CRM_OPPORTUNITY_ENDPOINTS = {
  OPPORTUNITIES: "/v1/crm/opportunities",
  OPPORTUNITY_BY_ID: (id: string) => `/v1/crm/opportunities/${id}`,
  UPDATE: (id: string) => `/v1/crm/opportunities/${id}`,
  ASSIGN_OWNER: (id: string) => `/v1/crm/opportunities/${id}/owner`,
  STAGE: (id: string) => `/v1/crm/opportunities/${id}/stage`,
  CLOSE: (id: string) => `/v1/crm/opportunities/${id}/close`,
  REOPEN: (id: string) => `/v1/crm/opportunities/${id}/reopen`,
} as const;
