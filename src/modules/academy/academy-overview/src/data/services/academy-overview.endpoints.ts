import { V1 } from "@/core/config/api-endpoints/_shared";

export const ACADEMY_OVERVIEW_ENDPOINTS = {
  GET: () => `${V1}/academy/overview`,
} as const;
