import { V1 } from "@/core/config/api-endpoints/_shared";

export const MENUS_ENDPOINTS = {
  LIST: `${V1}/Menus`,
  BY_ID: (id: string) => `${V1}/Menus/${id}`,
  CREATE: `${V1}/Menus`,
  UPDATE: (id: string) => `${V1}/Menus/${id}`,
  DELETE: (id: string) => `${V1}/Menus/${id}`,
  REORDER: `${V1}/Menus/reorder`,
  ROLE_VISIBILITY: `${V1}/Menus/role-visibility`,
  OVERRIDES: `${V1}/Menus/overrides`,
  DELETE_OVERRIDE: (id: string) => `${V1}/Menus/overrides/${id}`,
} as const;
