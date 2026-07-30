import { V1 } from "@/core/config/api-endpoints/_shared";

export const USER_GROUPS_ENDPOINTS = {
  LIST: `${V1}/user-groups`,
  MY_TENANT_GROUPS: `${V1}/user-groups/myTenantGroups`,
  BY_ID: (id: string) => `${V1}/user-groups/${id}`,
  BY_TENANT: (tenantId: string) => `${V1}/user-groups/byTenant/${tenantId}`,
  CREATE: `${V1}/user-groups`,
  CREATE_FOR_MY_TENANT: `${V1}/user-groups/createForMyTenant`,
  UPDATE: (id: string) => `${V1}/user-groups/${id}`,
  DELETE: (id: string) => `${V1}/user-groups/${id}`,
  ADD_MEMBERS: (id: string) => `${V1}/user-groups/${id}/members`,
  REMOVE_MEMBER: (id: string, adminId: string) => `${V1}/user-groups/${id}/members/${adminId}`,
  SET_ROLES: (id: string) => `${V1}/user-groups/${id}/roles`,
  SET_RESTRICTIONS: (id: string) => `${V1}/user-groups/${id}/restrictions`,
  BULK: {
    ACTIVATE: `${V1}/user-groups/bulk/activate`,
    DEACTIVATE: `${V1}/user-groups/bulk/deactivate`,
    DELETE: `${V1}/user-groups/bulk/delete`,
    ACTIVATE_ALL: `${V1}/user-groups/bulk/activate-all`,
    DEACTIVATE_ALL: `${V1}/user-groups/bulk/deactivate-all`,
    DELETE_ALL: `${V1}/user-groups/bulk/delete-all`,
  },
} as const;
