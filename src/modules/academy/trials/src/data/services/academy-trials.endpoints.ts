import { V1 } from "@/core/config/api-endpoints/_shared";

export const ACADEMY_TRIALS_ENDPOINTS = {
  LIST: (offeringId?: string, athleteId?: string, status?: string) => {
    const params = new URLSearchParams();
    if (offeringId) params.append("offeringId", offeringId);
    if (athleteId) params.append("athleteId", athleteId);
    if (status) params.append("status", status);
    const query = params.toString();
    return `${V1}/academy/trials${query ? `?${query}` : ""}`;
  },
  GET_BY_ID: (id: string) => `${V1}/academy/trials/${id}`,
  CREATE: () => `${V1}/academy/trials`,
  EVALUATE: (id: string) => `${V1}/academy/trials/${id}/evaluation`,
  DECIDE: (id: string) => `${V1}/academy/trials/${id}/decision`,
};
