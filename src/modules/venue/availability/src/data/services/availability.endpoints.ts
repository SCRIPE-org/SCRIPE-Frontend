import { V1 } from "@/core/config/api-endpoints/_shared";

export const AVAILABILITY_ENDPOINTS = {
  CALENDARS: `${V1}/availability-calendars`,
  CALENDAR_BY_ID: (id: string) => `${V1}/availability-calendars/${id}`,
  SEARCH: `${V1}/availability/search`,
  BLACKOUTS: `${V1}/blackouts`,
  BLACKOUT_BY_ID: (id: string) => `${V1}/blackouts/${id}`,
  MAINTENANCE_BLOCKS: `${V1}/maintenance-blocks`,
  MAINTENANCE_BLOCK_BY_ID: (id: string) => `${V1}/maintenance-blocks/${id}`,
} as const;
