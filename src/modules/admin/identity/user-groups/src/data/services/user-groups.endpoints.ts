import { V1 } from "@/core/config/api-endpoints/_shared";

export const USER_GROUPS_ENDPOINTS = {
  LIST: `${V1}/UserGroups`,
  MY_TENANT_GROUPS: `${V1}/UserGroups/myTenantGroups`,
  BY_ID: (id: string) => `${V1}/UserGroups/${id}`,
  BY_TENANT: (tenantId: string) => `${V1}/UserGroups/byTenant/${tenantId}`,
  CREATE: `${V1}/UserGroups`,
  CREATE_FOR_MY_TENANT: `${V1}/UserGroups/createForMyTenant`,
  UPDATE: (id: string) => `${V1}/UserGroups/${id}`,
  DELETE: (id: string) => `${V1}/UserGroups/${id}`,
  ADD_MEMBERS: (id: string) => `${V1}/UserGroups/${id}/members`,
  REMOVE_MEMBER: (id: string, adminId: string) => `${V1}/UserGroups/${id}/members/${adminId}`,
  SET_ROLES: (id: string) => `${V1}/UserGroups/${id}/roles`,
  SET_RESTRICTIONS: (id: string) => `${V1}/UserGroups/${id}/restrictions`,
  BULK: {
    ACTIVATE: `${V1}/UserGroups/bulk/activate`,
    DEACTIVATE: `${V1}/UserGroups/bulk/deactivate`,
    DELETE: `${V1}/UserGroups/bulk/delete`,
    ACTIVATE_ALL: `${V1}/UserGroups/bulk/activate-all`,
    DEACTIVATE_ALL: `${V1}/UserGroups/bulk/deactivate-all`,
    DELETE_ALL: `${V1}/UserGroups/bulk/delete-all`,
  },
} as const;
