export const TRAINING_GROUPS_ENDPOINTS = {
  LIST: (offeringId?: string, branchId?: string, status?: string) => {
    const params = new URLSearchParams();
    if (offeringId) params.append("offeringId", offeringId);
    if (branchId) params.append("branchId", branchId);
    if (status) params.append("status", status);
    const qs = params.toString();
    return `/api/v1/academy/groups${qs ? `?${qs}` : ""}`;
  },
  GET_BY_ID: (id: string) => `/api/v1/academy/groups/${id}`,
  CREATE: () => `/api/v1/academy/groups`,
  UPDATE: (id: string) => `/api/v1/academy/groups/${id}`,
  ARCHIVE: (id: string) => `/api/v1/academy/groups/${id}`,
  ROSTER: (id: string, activeOnly = true) => `/api/v1/academy/groups/${id}/roster?activeOnly=${activeOnly}`,
  ASSIGN_ATHLETE: (id: string) => `/api/v1/academy/groups/${id}/memberships`,
  REMOVE_ATHLETE: (id: string, membershipId: string, reason?: string) => {
    const qs = reason ? `?reason=${encodeURIComponent(reason)}` : "";
    return `/api/v1/academy/groups/${id}/memberships/${membershipId}${qs}`;
  },
  TRANSFER_ATHLETE: (id: string, membershipId: string) =>
    `/api/v1/academy/groups/${id}/memberships/${membershipId}/transfer`,
  ASSIGN_COACH: (id: string) => `/api/v1/academy/groups/${id}/coaches`,
  REMOVE_COACH: (id: string, coachId: string) => `/api/v1/academy/groups/${id}/coaches/${coachId}`
};
