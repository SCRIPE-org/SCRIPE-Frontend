import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * Documentation for module export
 */
export const ADMIN_ENDPOINTS = {
  LIST: `${V1}/Admins`,
  BY_ID: (id: string) => `${V1}/Admins/${id}`,
  BY_TENANT_ID: (tenantId: string) => `${V1}/Admins/byTenantId/${tenantId}`,
  CURRENT_TENANT: `${V1}/admins/current-tenant`,
  CREATE: `${V1}/Admins`,
  CREATE_IN_CURRENT_TENANT: `${V1}/admins/current-tenant`,
  UPDATE: (id: string) => `${V1}/Admins/${id}`,
  DELETE: (id: string) => `${V1}/Admins/${id}`,
  SET_ACTIVE: (id: string) => `${V1}/Admins/${id}/active`,
  ROLES: (id: string) => `${V1}/Admins/${id}/roles`,
  REMOVE_ROLE: (adminId: string, roleId: string) => `${V1}/Admins/${adminId}/roles/${roleId}`,
  RESET_PASSWORD: (id: string) => `${V1}/Admins/${id}/reset-password`,
  RESET_MFA: (id: string) => `${V1}/Admins/${id}/reset-mfa`,
  CHANGE_PASSWORD: (id: string) => `${V1}/Admins/${id}/change-password`,
  BULK: {
    ACTIVATE: `${V1}/Admins/bulk/activate`,
    DEACTIVATE: `${V1}/Admins/bulk/deactivate`,
    DELETE: `${V1}/Admins/bulk/delete`,
    ACTIVATE_ALL: `${V1}/Admins/bulk/activate-all`,
    DEACTIVATE_ALL: `${V1}/Admins/bulk/deactivate-all`,
    DELETE_ALL: `${V1}/Admins/bulk/delete-all`,
  },
  TRANSFER: (id: string) => `${V1}/Admins/${id}/transfer`,
  TRANSFER_PROTECTION: `${V1}/Admins/transfer-protection`,
  SYNC_ROLES: (id: string) => `${V1}/Admins/${id}/roles/sync`,
  RESEND_SETUP_EMAIL: `${V1}/account-setup/resend`,
} as const;
