import { V1 } from "@/core/config/api-endpoints/_shared";

export const NOTIFICATION_SENDER_ENDPOINTS = {
  SEARCH_TARGETS: `${V1}/Notifications/search-targets`,
  SEND: `${V1}/Notifications/send`,
} as const;
