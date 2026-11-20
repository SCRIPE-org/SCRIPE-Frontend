import { V1 } from "@/core/config/api-endpoints/_shared";

/** REST API endpoint catalog for CRM Contacts. */
export const CRM_CONTACT_ENDPOINTS = {
  CONTACTS: `${V1}/crm/contacts`,
  CONTACT_BY_ID: (id: string) => `${V1}/crm/contacts/${id}`,
} as const;
