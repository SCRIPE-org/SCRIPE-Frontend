import { V1 } from "@core/config/api-endpoints/_shared";

/** Endpoint constants for personal operational feeds consumed on `/hub`. */
export const HOME_FEED_ENDPOINTS = {
  NOTIFICATIONS: `${V1}/account/notifications`,
  NOTIFICATION_MARK_READ: (id: string) => `${V1}/account/notifications/${id}/read`,
  NOTIFICATION_READ_ALL: `${V1}/account/notifications/read-all`,
  ACTIVITY: `${V1}/account/activity`,
} as const;
