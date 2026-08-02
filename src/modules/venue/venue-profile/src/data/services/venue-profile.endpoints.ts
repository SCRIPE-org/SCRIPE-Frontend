import { V1 } from "@/core/config/api-endpoints/_shared";

export const VENUE_PROFILE_ENDPOINTS = {
  LIST: `${V1}/venue-profiles`,
  BY_ID: (id: string) => `${V1}/venue-profiles/${id}`,
  CREATE: `${V1}/venue-profiles`,
  UPDATE: (id: string) => `${V1}/venue-profiles/${id}`,
  DELETE: (id: string) => `${V1}/venue-profiles/${id}`,
} as const;
