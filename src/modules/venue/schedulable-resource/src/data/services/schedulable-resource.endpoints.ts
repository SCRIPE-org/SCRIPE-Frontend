import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * Documentation for module export
 */
export const SCHEDULABLE_RESOURCE_ENDPOINTS = {
  LIST: `${V1}/schedulable-resources`,
  BY_ID: (id: string) => `${V1}/schedulable-resources/${id}`,
  CREATE: `${V1}/schedulable-resources`,
  UPDATE: (id: string) => `${V1}/schedulable-resources/${id}`,
  DELETE: (id: string) => `${V1}/schedulable-resources/${id}`,
  PUBLICATION_CHECKLIST: (id: string) => `${V1}/schedulable-resources/${id}/publication-checklist`,
  PUBLISH: (id: string) => `${V1}/schedulable-resources/${id}/publish`,
} as const;
