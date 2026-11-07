import { V1 } from "@/core/config/api-endpoints/_shared";

export const ACADEMY_ATHLETES_ENDPOINTS = {
  LIST: (branchId?: string, sportId?: string, search?: string) => {
    const params = new URLSearchParams();
    if (branchId) params.append("branchId", branchId);
    if (sportId) params.append("sportId", sportId);
    if (search) params.append("search", search);
    const query = params.toString();
    return `${V1}/academy/athletes${query ? `?${query}` : ""}`;
  },
  GET_BY_ID: (id: string) => `${V1}/academy/athletes/${id}`,
  GUARDIANS: (query?: string) => `${V1}/academy/athletes/guardians${query ? `?query=${encodeURIComponent(query)}` : ""}`,
  REGISTER_CHILD: () => `${V1}/academy/athletes/child`,
  REGISTER_ADULT: () => `${V1}/academy/athletes/adult`,
  LINK_SIBLING: () => `${V1}/academy/athletes/sibling`,
  ADD_PARTICIPATION: (id: string) => `${V1}/academy/athletes/${id}/participations`,
  SPORTS: () => `${V1}/sports`
};
