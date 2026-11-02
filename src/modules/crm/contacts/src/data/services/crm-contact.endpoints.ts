export const CRM_CONTACT_ENDPOINTS = {
  CONTACTS: "/v1/crm/contacts",
  CONTACT_BY_ID: (id: string) => `/v1/crm/contacts/${id}`,
} as const;
