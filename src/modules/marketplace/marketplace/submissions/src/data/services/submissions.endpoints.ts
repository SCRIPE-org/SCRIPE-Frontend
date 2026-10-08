import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * Documentation for module export
 */
export const SUBMISSIONS_ENDPOINTS = {
  SUBMISSIONS: `${V1}/marketplace/submissions`,
  SUBMISSION_BY_ID: (id: string) => `${V1}/marketplace/submissions/${id}`,
  SUBMISSION_APPROVE: (id: string) => `${V1}/marketplace/submissions/${id}/approve`,
  SUBMISSION_REJECT: (id: string) => `${V1}/marketplace/submissions/${id}/reject`,
  SUBMISSION_REQUEST_REVISIONS: (id: string) =>
    `${V1}/marketplace/submissions/${id}/request-revisions`,
} as const;
