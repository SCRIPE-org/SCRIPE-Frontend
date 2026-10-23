import { V1 } from "@/core/config/api-endpoints/_shared";

export const VENUE_OVERVIEW_ENDPOINTS = {
  GET: (facilityId?: string, date?: string) => {
    const params = new URLSearchParams();
    if (facilityId) params.append("facilityId", facilityId);
    if (date) params.append("date", date);
    const qs = params.toString();
    return qs ? `${V1}/venue-overview?${qs}` : `${V1}/venue-overview`;
  },
} as const;
