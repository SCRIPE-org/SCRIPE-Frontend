import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * MergeCandidate Submodule API Endpoints
 * Co-located with MergeCandidateService according to SCRIPE frontend architecture rules.
 */
export const MERGE_CANDIDATE_ENDPOINTS = {
  LIST: `${V1}/merge-candidates`,
  BY_ID: (id: string) => `${V1}/merge-candidates/${id}`,
  CREATE: `${V1}/merge-candidates`,
  UPDATE: (id: string) => `${V1}/merge-candidates/${id}`,
  DELETE: (id: string) => `${V1}/merge-candidates/${id}`,
} as const;
