export const CRM_ACTIVITY_ENDPOINTS = {
  ACTIVITIES: "/v1/crm/activities",
  FOLLOW_UP: (id: string) => `/v1/crm/activities/${id}/follow-up`,
} as const;
