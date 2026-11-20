import { V1 } from "./_shared";

export const IDENTITY_ENDPOINTS = {
  ADMINS: {
    LIST: `${V1}/admins`,
    BY_ID: (id: string) => `${V1}/admins/${id}`,
    BY_TENANT_ID: (tenantId: string) => `${V1}/admins/byTenantId/${tenantId}`,
    CURRENT_TENANT: `${V1}/admins/current-tenant`,
    CREATE: `${V1}/admins`,
    CREATE_IN_CURRENT_TENANT: `${V1}/admins/current-tenant`,
    UPDATE: (id: string) => `${V1}/admins/${id}`,
    DELETE: (id: string) => `${V1}/admins/${id}`,
    SET_ACTIVE: (id: string) => `${V1}/admins/${id}/active`,
    ROLES: (id: string) => `${V1}/admins/${id}/roles`,
    REMOVE_ROLE: (adminId: string, roleId: string) => `${V1}/admins/${adminId}/roles/${roleId}`,
    RESET_PASSWORD: (id: string) => `${V1}/admins/${id}/reset-password`,
    CHANGE_PASSWORD: (id: string) => `${V1}/admins/${id}/change-password`,
    BULK: {
      ACTIVATE: `${V1}/admins/bulk/activate`,
      DEACTIVATE: `${V1}/admins/bulk/deactivate`,
      DELETE: `${V1}/admins/bulk/delete`,
      ACTIVATE_ALL: `${V1}/admins/bulk/activate-all`,
      DEACTIVATE_ALL: `${V1}/admins/bulk/deactivate-all`,
      DELETE_ALL: `${V1}/admins/bulk/delete-all`,
    },

    TRANSFER: (id: string) => `${V1}/admins/${id}/transfer`,
    TRANSFER_PROTECTION: `${V1}/admins/transfer-protection`,
    SYNC_ROLES: (id: string) => `${V1}/admins/${id}/roles/sync`,
  },

  ROLES: {
    LIST: `${V1}/roles`,
    BY_ID: (id: string) => `${V1}/roles/${id}`,
    BY_TENANT_ID: (tenantId: string) => `${V1}/roles/byTenantId/${tenantId}`,
    CURRENT_TENANT: `${V1}/roles/current-tenant`,
    CURRENT_TENANT_AVAILABLE_PERMISSIONS: `${V1}/roles/current-tenant/available-permissions`,
    CURRENT_TENANT_AVAILABLE_PERMISSIONS_GROUPED: `${V1}/roles/current-tenant/available-permissions/grouped`,
    CREATE: `${V1}/roles`,
    CREATE_IN_CURRENT_TENANT: `${V1}/roles/current-tenant`,
    UPDATE: (id: string) => `${V1}/roles/${id}`,
    DELETE: (id: string) => `${V1}/roles/${id}`,
    PERMISSIONS: (id: string) => `${V1}/roles/${id}/permissions`,
    REMOVE_PERMISSION: (roleId: string, permissionId: string) =>
      `${V1}/roles/${roleId}/permissions/${permissionId}`,
    CLONE: (id: string) => `${V1}/roles/${id}/clone`,
    BULK: {
      DELETE: `${V1}/roles/bulk/delete`,
      DELETE_ALL: `${V1}/roles/bulk/delete-all`,
    },
  },

  PERMISSIONS: {
    LIST: `${V1}/permissions`,
    EFFECTIVE: `${V1}/permissions/effective`,
    BY_ID: (id: string) => `${V1}/permissions/${id}`,
    CREATE: `${V1}/permissions`,
    UPDATE: (id: string) => `${V1}/permissions/${id}`,
    DELETE: (id: string) => `${V1}/permissions/${id}`,
    CATEGORIES: `${V1}/permissions/categories`,
    GROUPED: `${V1}/permissions/grouped`,
  },

  USER_GROUPS: {
    LIST: `${V1}/user-groups`,
    CURRENT_TENANT: `${V1}/user-groups/current-tenant`,
    BY_ID: (id: string) => `${V1}/user-groups/${id}`,
    BY_TENANT: (tenantId: string) => `${V1}/user-groups/byTenant/${tenantId}`,
    CREATE: `${V1}/user-groups`,
    CREATE_IN_CURRENT_TENANT: `${V1}/user-groups/current-tenant`,
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
  },

  USERS: {
    LIST: `${V1}/users`,
    BY_ID: (id: string) => `${V1}/users/${id}`,
    UPDATE: (id: string) => `${V1}/users/${id}`,
    DELETE: (id: string) => `${V1}/users/${id}`,
    SET_ACTIVE: (id: string) => `${V1}/users/${id}/active`,
    UNLOCK: (id: string) => `${V1}/users/${id}/unlock`,
    BULK: {
      ACTIVATE: `${V1}/users/bulk/activate`,
      DEACTIVATE: `${V1}/users/bulk/deactivate`,
      DELETE: `${V1}/users/bulk/delete`,
      ACTIVATE_ALL: `${V1}/users/bulk/activate-all`,
      DEACTIVATE_ALL: `${V1}/users/bulk/deactivate-all`,
      DELETE_ALL: `${V1}/users/bulk/delete-all`,
    },
  },

  IDENTITY_CONTEXT: {
    MEMBERSHIPS: `${V1}/identity-context/memberships`,
    SWITCH: `${V1}/identity-context/switch`,
    ACTORS: `${V1}/identity-context/actors`,
  },
};
