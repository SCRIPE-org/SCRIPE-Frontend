import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * Documentation for module export
 */
export const STAFF_MEMBER_ENDPOINTS = {
  LIST: `${V1}/staff-members`,
  BY_ID: (id: string) => `${V1}/staff-members/${id}`,
  CREATE: `${V1}/staff-members`,
  UPDATE: (id: string) => `${V1}/staff-members/${id}`,
  DELETE: (id: string) => `${V1}/staff-members/${id}`,
  // Read-only cross-module search for the Linked User Account picker (F-86).
  // StaffMember.identityUserId may reference either an Identity Admin or an
  // Identity User (see backend CreateStaffMemberCommandHandler, which tries
  // both readers) so both list endpoints are queried directly here — mirroring
  // the existing cross-module search pattern in
  // billing/entitlements/user-subscriptions (searchUsers), not a new import of
  // the Identity module's own repository/service.
  ADMINS_SEARCH: `${V1}/Admins`,
  USERS_SEARCH: `${V1}/Users`,
} as const;
