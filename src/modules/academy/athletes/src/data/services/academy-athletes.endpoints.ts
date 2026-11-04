export const ACADEMY_ATHLETES_ENDPOINTS = {
  LIST: (branchId?: string, sportId?: string, search?: string) => {
    const params = new URLSearchParams();
    if (branchId) params.append("branchId", branchId);
    if (sportId) params.append("sportId", sportId);
    if (search) params.append("search", search);
    const query = params.toString();
    return `/api/v1/academy/athletes${query ? `?${query}` : ""}`;
  },
  GET_BY_ID: (id: string) => `/api/v1/academy/athletes/${id}`,
  GUARDIANS: (query?: string) => `/api/v1/academy/athletes/guardians${query ? `?query=${encodeURIComponent(query)}` : ""}`,
  REGISTER_CHILD: () => "/api/v1/academy/athletes/child",
  REGISTER_ADULT: () => "/api/v1/academy/athletes/adult",
  LINK_SIBLING: () => "/api/v1/academy/athletes/sibling",
  ADD_PARTICIPATION: (id: string) => `/api/v1/academy/athletes/${id}/participations`,
  SPORTS: () => "/api/v1/sports"
};
