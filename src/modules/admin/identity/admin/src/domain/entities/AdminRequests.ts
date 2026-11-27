/**
 * Admin Requests
 *
 * DTOs for admin API operations.
 */

/**
 * Create admin request (strictly email-invitation-only).
 * Creators never choose, see, or assign another administrator's password;
 * the invitee establishes their own credentials via the single-use setup link.
 */
export interface CreateAdminRequest {
  username: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email: string;
  notes?: string;
  roleIds?: string[]; // Optional - at least one role OR group required
  userGroupIds?: string[]; // Optional - at least one role OR group required
  tenantId?: string;
}

/**
 * Update admin request
 */
export interface UpdateAdminRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  notes?: string;
  isActive?: boolean;
}

/**
 * Assign role to admin request
 */
export interface AssignRoleRequest {
  roleId: string;
  tenantId?: string;
  inheritToChildren?: boolean;
  expiresAt?: string;
}

/**
 * Reset password request — dispatches a single-use email recovery link with an optional audit reason.
 */
export interface ResetPasswordRequest {
  reason?: string;
}

/**
 * Reset MFA request — disables TOTP/backup codes, optionally revokes passkeys, and forces re-enrollment.
 */
export interface ResetAdminMfaRequest {
  reason?: string;
  revokePasskeys: boolean;
}

/**
 * Change password request
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * Bulk admins filter request
 */
export interface BulkAdminsFilterRequest {
  search?: string;
  isActive?: boolean;
}

/**
 * Transfer admin request
 */
export interface TransferAdminRequest {
  targetTenantId: string | null; // Null for System (Super Admin)
  targetRoleId: string;
}

/**
 * Transfer protection request
 */
export interface TransferProtectionRequest {
  targetAdminId: string;
}
