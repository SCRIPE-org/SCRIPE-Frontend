import { V1 } from "@/core/config/api-endpoints/_shared";

export const TRAINING_GROUPS_ENDPOINTS = {
  LIST: (offeringId?: string, branchId?: string, status?: string) => {
    const params = new URLSearchParams();
    if (offeringId) params.append("offeringId", offeringId);
    if (branchId) params.append("branchId", branchId);
    if (status) params.append("status", status);
    const qs = params.toString();
    return `${V1}/academy/groups${qs ? `?${qs}` : ""}`;
  },
  GET_BY_ID: (id: string) => `${V1}/academy/groups/${id}`,
  CREATE: () => `${V1}/academy/groups`,
  UPDATE: (id: string) => `${V1}/academy/groups/${id}`,
  ARCHIVE: (id: string) => `${V1}/academy/groups/${id}`,
  ROSTER: (id: string, activeOnly = true) => `${V1}/academy/groups/${id}/roster?activeOnly=${activeOnly}`,
  AVAILABLE_COACHES: (sportId?: string) => {
    const qs = sportId ? `?sportId=${encodeURIComponent(sportId)}` : "";
    return `${V1}/academy/groups/available-coaches${qs}`;
  },
  ASSIGN_ATHLETE: (id: string) => `${V1}/academy/groups/${id}/memberships`,
  REMOVE_ATHLETE: (id: string, membershipId: string, reason?: string) => {
    const qs = reason ? `?reason=${encodeURIComponent(reason)}` : "";
    return `${V1}/academy/groups/${id}/memberships/${membershipId}${qs}`;
  },
  TRANSFER_ATHLETE: (id: string, membershipId: string) =>
    `${V1}/academy/groups/${id}/memberships/${membershipId}/transfer`,
  ASSIGN_COACH: (id: string) => `${V1}/academy/groups/${id}/coaches`,
  REMOVE_COACH: (id: string, coachId: string) => `${V1}/academy/groups/${id}/coaches/${coachId}`
};
