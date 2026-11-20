import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * REST API Endpoint catalog for CRM Opportunities lifecycle operations.
 */
export const CRM_OPPORTUNITY_ENDPOINTS = {
  OPPORTUNITIES: `${V1}/crm/opportunities`,
  OPPORTUNITY_BY_ID: (id: string) => `${V1}/crm/opportunities/${id}`,
  UPDATE: (id: string) => `${V1}/crm/opportunities/${id}`,
  ASSIGN_OWNER: (id: string) => `${V1}/crm/opportunities/${id}/owner`,
  STAGE: (id: string) => `${V1}/crm/opportunities/${id}/stage`,
  CLOSE: (id: string) => `${V1}/crm/opportunities/${id}/close`,
  REOPEN: (id: string) => `${V1}/crm/opportunities/${id}/reopen`,
  CONTACT_ROLES: (id: string) => `${V1}/crm/opportunities/${id}/contact-roles`,
  CONTACT_ROLE_BY_ID: (id: string, roleId: string) => `${V1}/crm/opportunities/${id}/contact-roles/${roleId}`,
} as const;
