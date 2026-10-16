import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * Documentation for module export
 */
export const REVIEWS_ENDPOINTS = {
  REVIEWS: `${V1}/marketplace/reviews`,
  REVIEW_BY_ID: (id: string) => `${V1}/marketplace/reviews/${id}`,
} as const;
