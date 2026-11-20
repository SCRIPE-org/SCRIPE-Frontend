import { V1 } from "@/core/config/api-endpoints/_shared";

/** REST API endpoint catalog for CRM Activities and Work Item follow-ups. */
export const CRM_ACTIVITY_ENDPOINTS = {
  ACTIVITIES: `${V1}/crm/activities`,
  FOLLOW_UP: (id: string) => `${V1}/crm/activities/${id}/follow-up`,
  WORK_ITEM_BY_ID: (workItemId: string) => `${V1}/work-items/${workItemId}`,
} as const;
