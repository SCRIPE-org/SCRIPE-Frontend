/**
 * CRM API Endpoints Catalog
 * Authority: SCRIPE CRM C1 Specification
 */
export const CRM_ENDPOINTS = {
  PIPELINE_DEFAULT: "/v1/crm/pipelines/default",
  PIPELINE_REPORT: "/v1/crm/reports/pipeline",
  OPPORTUNITIES: "/v1/crm/opportunities",
  LEADS: "/v1/crm/leads",
  ACCOUNTS: "/v1/crm/accounts",
  ACCOUNT_PARTIES: "/v1/crm/accounts/parties",
  ACCOUNT_LOOKUP_CANDIDATES: "/v1/crm/accounts/lookup-candidates",
  CONTACTS: "/v1/crm/contacts",
  ACTIVITIES: "/v1/crm/activities",
  SETTINGS: "/v1/crm/settings",
  SETTINGS_TENANT: "/v1/crm/settings/tenant",
  SETTINGS_USER: "/v1/crm/settings/user",
  SETTINGS_ASSIGNEES: "/v1/crm/settings/assignees",
} as const;
