import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * Documentation for module export
 */
export const ROLES_ENDPOINTS = {
  LIST: `${V1}/Roles`,
  BY_ID: (id: string) => `${V1}/Roles/${id}`,
  BY_TENANT_ID: (tenantId: string) => `${V1}/Roles/byTenantId/${tenantId}`,
  CURRENT_TENANT: `${V1}/roles/current-tenant`,
  CURRENT_TENANT_AVAILABLE_PERMISSIONS: `${V1}/roles/current-tenant/available-permissions`,
  CURRENT_TENANT_AVAILABLE_PERMISSIONS_GROUPED: `${V1}/roles/current-tenant/available-permissions/grouped`,
  CREATE: `${V1}/Roles`,
  CREATE_IN_CURRENT_TENANT: `${V1}/roles/current-tenant`,
  UPDATE: (id: string) => `${V1}/Roles/${id}`,
  DELETE: (id: string) => `${V1}/Roles/${id}`,
  PERMISSIONS: (id: string) => `${V1}/Roles/${id}/permissions`,
  REMOVE_PERMISSION: (roleId: string, permissionId: string) =>
    `${V1}/Roles/${roleId}/permissions/${permissionId}`,
  CLONE: (id: string) => `${V1}/Roles/${id}/clone`,
  WORKSPACE_ENTRIES: (id: string) => `${V1}/roles/${id}/workspace-entries`,
  DELETE_WORKSPACE_ENTRY: (id: string, workspaceKey: string) =>
    `${V1}/roles/${id}/workspace-entries/${encodeURIComponent(workspaceKey)}`,
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
