import { V1 } from "@/core/config/api-endpoints/_shared";

export const WORK_ITEM_ENDPOINTS = {
  LIST: `${V1}/work-items`,
  BY_ID: (id: string) => `${V1}/work-items/${id}`,
  CREATE: `${V1}/work-items`,
  UPDATE: (id: string) => `${V1}/work-items/${id}`,
  DELETE: (id: string) => `${V1}/work-items/${id}`,
  // Reuses Identity's admin list endpoint for the "Assigned To" picker's
  // server search -- same endpoint the Leads module's assignable-admins
  // picker calls (LEADS_ENDPOINTS.ADMINS_LIST). Requires admins.view.
  ADMINS_LIST: `${V1}/Admins`,
} as const;
