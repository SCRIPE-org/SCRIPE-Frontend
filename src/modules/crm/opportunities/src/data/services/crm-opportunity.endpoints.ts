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
  CONTACT_ROLES: (id: string) => `/v1/crm/opportunities/${id}/contact-roles`,
  CONTACT_ROLE_BY_ID: (id: string, roleId: string) => `/v1/crm/opportunities/${id}/contact-roles/${roleId}`,
  DEFAULT_PIPELINE: "/v1/crm/pipelines/default",
  PIPELINES: "/v1/crm/pipelines",
  PIPELINE_BY_ID: (id: string) => `/v1/crm/pipelines/${id}`,
  ACTIVATE_PIPELINE: (id: string) => `/v1/crm/pipelines/${id}/activate`,
  REPLACE_STAGE: (id: string, stageKey: string) => `/v1/crm/pipelines/${id}/stages/${encodeURIComponent(stageKey)}/replace`,
} as const;
