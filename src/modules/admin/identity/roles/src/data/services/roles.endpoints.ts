import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * Documentation for module export
 */
export const ROLES_ENDPOINTS = {
  LIST: `${V1}/Roles`,
  BY_ID: (id: string) => `${V1}/Roles/${id}`,
  BY_TENANT_ID: (tenantId: string) => `${V1}/Roles/byTenantId/${tenantId}`,
  MY_TENANT_ROLES: `${V1}/Roles/myTenantRoles`,
  MY_TENANT_AVAILABLE_PERMISSIONS: `${V1}/Roles/myTenant/available-permissions`,
  MY_TENANT_AVAILABLE_PERMISSIONS_GROUPED: `${V1}/Roles/myTenant/available-permissions/grouped`,
  CREATE: `${V1}/Roles`,
  CREATE_FOR_MY_TENANT: `${V1}/Roles/createForMyTenant`,
  UPDATE: (id: string) => `${V1}/Roles/${id}`,
  DELETE: (id: string) => `${V1}/Roles/${id}`,
  PERMISSIONS: (id: string) => `${V1}/Roles/${id}/permissions`,
  REMOVE_PERMISSION: (roleId: string, permissionId: string) =>
    `${V1}/Roles/${roleId}/permissions/${permissionId}`,
  CLONE: (id: string) => `${V1}/Roles/${id}/clone`,
  BULK: {
    DELETE: `${V1}/Roles/bulk/delete`,
    DELETE_ALL: `${V1}/Roles/bulk/delete-all`,
  },
  TENANTS: {
    PERMISSIONS: (id: string) => `${V1}/Tenants/${id}/permissions`,
    PERMISSIONS_GROUPED: (id: string) => `${V1}/Tenants/${id}/permissions/grouped`,
    CREATION_PERMISSIONS: `${V1}/Tenants/creation-permissions`,
  },
} as const;
