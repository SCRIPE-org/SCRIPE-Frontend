import { V1 } from "@/core/config/api-endpoints/_shared";

export const PROGRAM_OFFERINGS_ENDPOINTS = {
  LIST: (branchId?: string, seasonId?: string, programId?: string) => {
    const params = new URLSearchParams();
    if (branchId) params.append("branchId", branchId);
    if (seasonId) params.append("seasonId", seasonId);
    if (programId) params.append("programId", programId);
    const qs = params.toString();
    return `${V1}/academy/offerings${qs ? `?${qs}` : ""}`;
  },
  CREATE: () => `${V1}/academy/offerings`,
} as const;
