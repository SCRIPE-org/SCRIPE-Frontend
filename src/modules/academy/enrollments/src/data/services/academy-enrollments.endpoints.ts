import { V1 } from "@/core/config/api-endpoints/_shared";

export const ACADEMY_ENROLLMENTS_ENDPOINTS = {
  LIST: (offeringId?: string, athleteId?: string, status?: string, billingStatus?: string) => {
    const params = new URLSearchParams();
    if (offeringId) params.append("offeringId", offeringId);
    if (athleteId) params.append("athleteId", athleteId);
    if (status) params.append("status", status);
    if (billingStatus) params.append("billingStatus", billingStatus);
    const query = params.toString();
    return `${V1}/academy/enrollments${query ? `?${query}` : ""}`;
  },
  GET_BY_ID: (id: string) => `${V1}/academy/enrollments/${id}`,
  CREATE: () => `${V1}/academy/enrollments`,
  FINANCE_HANDOFF: (id: string) => `${V1}/academy/enrollments/${id}/finance-handoff`,
  ACTIVATE: (id: string) => `${V1}/academy/enrollments/${id}/activate`,
};
