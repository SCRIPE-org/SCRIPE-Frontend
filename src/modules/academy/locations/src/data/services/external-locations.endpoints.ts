import { V1 } from "@/core/config/api-endpoints/_shared";

export const EXTERNAL_LOCATIONS_ENDPOINTS = {
  LIST: (branchId?: string) => {
    const params = new URLSearchParams();
    if (branchId) params.append("branchId", branchId);
    const qs = params.toString();
    return `${V1}/academy/locations${qs ? `?${qs}` : ""}`;
  },
  CREATE: () => `${V1}/academy/locations`,
} as const;
