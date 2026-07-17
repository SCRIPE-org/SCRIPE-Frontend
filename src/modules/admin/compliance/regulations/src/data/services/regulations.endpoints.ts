import { V1 } from "@/core/config/api-endpoints/_shared";

export const REGULATIONS_ENDPOINTS = {
  REGULATIONS: `${V1}/compliance/regulations`,
  REGULATION_BY_ID: (id: string) => `${V1}/compliance/regulations/${id}`,
  REGULATION_PURPOSES: (id: string) => `${V1}/compliance/regulations/${id}/purposes`,
  REGULATION_PURPOSE_BY_ID: (id: string, purposeId: string) =>
    `${V1}/compliance/regulations/${id}/purposes/${purposeId}`,
} as const;
