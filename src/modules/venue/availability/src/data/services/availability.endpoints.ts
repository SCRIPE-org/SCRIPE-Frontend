import { V1 } from "@/core/config/api-endpoints/_shared";

export const AVAILABILITY_ENDPOINTS = {
  CALENDARS: `${V1}/availability-calendars`,
  CALENDAR_BY_ID: (id: string) => `${V1}/availability-calendars/${id}`,
  SEARCH: `${V1}/availability/search`,
} as const;
