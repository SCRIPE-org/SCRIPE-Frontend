import { V1 } from "@/core/config/api-endpoints/_shared";

/** REST API endpoint catalog for CRM Accounts and Party resolution. */
export const CRM_ACCOUNT_ENDPOINTS = {
  ACCOUNTS: `${V1}/crm/accounts`,
  PARTIES: `${V1}/crm/accounts/parties`,
  ACCOUNT_BY_ID: (id: string) => `${V1}/crm/accounts/${id}`,
} as const;
