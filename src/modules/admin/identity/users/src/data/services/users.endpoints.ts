import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * Documentation for module export
 */
export const USERS_ENDPOINTS = {
  LIST: `${V1}/Users`,
  BY_ID: (id: string) => `${V1}/Users/${id}`,
  UPDATE: (id: string) => `${V1}/Users/${id}`,
  DELETE: (id: string) => `${V1}/Users/${id}`,
  SET_ACTIVE: (id: string) => `${V1}/Users/${id}/active`,
  UNLOCK: (id: string) => `${V1}/Users/${id}/unlock`,
  BULK: {
    ACTIVATE: `${V1}/Users/bulk/activate`,
    DEACTIVATE: `${V1}/Users/bulk/deactivate`,
    DELETE: `${V1}/Users/bulk/delete`,
    ACTIVATE_ALL: `${V1}/Users/bulk/activate-all`,
    DEACTIVATE_ALL: `${V1}/Users/bulk/deactivate-all`,
    DELETE_ALL: `${V1}/Users/bulk/delete-all`,
  },
} as const;
