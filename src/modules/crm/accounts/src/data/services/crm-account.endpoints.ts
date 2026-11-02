export const CRM_ACCOUNT_ENDPOINTS = {
  ACCOUNTS: "/v1/crm/accounts",
  ACCOUNT_BY_ID: (id: string) => `/v1/crm/accounts/${id}`,
} as const;
