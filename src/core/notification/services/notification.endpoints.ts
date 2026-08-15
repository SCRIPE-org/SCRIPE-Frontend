import { V1 } from "@/core/config/api-endpoints/_shared";

export const NOTIFICATION_ENDPOINTS = {
  LIST: `${V1}/Notifications`,
  UNREAD_COUNT: `${V1}/Notifications/unread-count`,
  MARK_READ: (id: string) => `${V1}/Notifications/${id}/read`,
  MARK_ALL_READ: `${V1}/Notifications/read-all`,
  DELETE: (id: string) => `${V1}/Notifications/${id}`,
  PREFERENCES: `${V1}/Notifications/preferences`,
} as const;
