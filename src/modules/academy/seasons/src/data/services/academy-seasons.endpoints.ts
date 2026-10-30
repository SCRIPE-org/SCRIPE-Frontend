import { V1 } from "@/core/config/api-endpoints/_shared";

export const ACADEMY_SEASONS_ENDPOINTS = {
  LIST: () => `${V1}/academy/seasons`,
  CREATE: () => `${V1}/academy/seasons`,
} as const;
