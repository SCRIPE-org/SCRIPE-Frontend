export const ACADEMY_TRIALS_ENDPOINTS = {
  LIST: (offeringId?: string, athleteId?: string, status?: string) => {
    const params = new URLSearchParams();
    if (offeringId) params.append("offeringId", offeringId);
    if (athleteId) params.append("athleteId", athleteId);
    if (status) params.append("status", status);
    const query = params.toString();
    return `/api/v1/academy/trials${query ? `?${query}` : ""}`;
  },
  GET_BY_ID: (id: string) => `/api/v1/academy/trials/${id}`,
  CREATE: () => "/api/v1/academy/trials",
  EVALUATE: (id: string) => `/api/v1/academy/trials/${id}/evaluation`,
  DECIDE: (id: string) => `/api/v1/academy/trials/${id}/decision`,
};
