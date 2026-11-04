export const CRM_ACCOUNT_ENDPOINTS = {
  ACCOUNTS: "/v1/crm/accounts",
  PARTIES: "/v1/crm/accounts/parties",
  ACCOUNT_BY_ID: (id: string) => `/v1/crm/accounts/${id}`,
} as const;
