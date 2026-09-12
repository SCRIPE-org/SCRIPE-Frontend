import { V1 } from "@/core/config/api-endpoints/_shared";

export const FACILITY_RESOURCE_PROFILE_ENDPOINTS = {
  LIST: `${V1}/facility-resource-profiles`,
  BY_ID: (id: string) => `${V1}/facility-resource-profiles/${id}`,
  CREATE: `${V1}/facility-resource-profiles`,
  UPDATE: (id: string) => `${V1}/facility-resource-profiles/${id}`,
} as const;
