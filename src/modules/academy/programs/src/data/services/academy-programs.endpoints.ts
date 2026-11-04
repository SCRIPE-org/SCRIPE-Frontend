import { V1 } from "@/core/config/api-endpoints/_shared";

export const ACADEMY_PROGRAMS_ENDPOINTS = {
  LIST: (sportId?: string, isPublishedOnly?: boolean) => {
    const params = new URLSearchParams();
    if (sportId) params.append("sportId", sportId);
    if (isPublishedOnly !== undefined) params.append("isPublishedOnly", String(isPublishedOnly));
    const qs = params.toString();
    return `${V1}/academy/programs${qs ? `?${qs}` : ""}`;
  },
  GET_BY_ID: (id: string) => `${V1}/academy/programs/${id}`,
  CREATE: () => `${V1}/academy/programs`,
  PUBLISH: (id: string) => `${V1}/academy/programs/${id}/publish`,
  SPORTS: () => `${V1}/sports`,
} as const;
