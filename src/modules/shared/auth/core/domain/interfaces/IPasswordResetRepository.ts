import type { PasswordPolicyDto, PasswordPolicyModel } from "@core/common/password-policy";

export type PasswordResetMethod = "otp" | "magic-link";

export interface ResetWorkspaceOption {
  tenantId: string;
  tenantName: string;
  tenantCode: string;
  logoUrl?: string | null;
  isPlatformAdmin: boolean;
  passwordPolicy?: PasswordPolicyDto | null;
}

export interface VerifyOtpResult {
  /** Whether the OTP or magic-link token is valid. */
  isValid?: boolean;
  /** Workspaces to choose from. If single/null, auto-proceed to newPassword step. */
  workspaces?: ResetWorkspaceOption[];
  /** Effective backend password policy returned alongside verification. */
  passwordPolicy?: PasswordPolicyModel | null;
  /** Single-use reset grant token minted by verify-reset-otp. */
  resetGrantToken?: string | null;
}

export interface ResetPasswordRequestParams {
  email: string;
  otp?: string;
  code?: string;
  method?: PasswordResetMethod;
  resetGrantToken?: string | null;
  newPassword: string;
  tenantIds?: string[];
}

export interface IPasswordResetRepository {
  /** Send reset instructions — 'otp' sends a code, 'magic-link' sends an email link. */
  requestReset(
    email: string,
    method?: PasswordResetMethod,
    tenantId?: string | null
  ): Promise<{ sent?: boolean; retryAfterSeconds?: number } | void>;
  /** Verify the OTP or magic-link credential and get workspace list + policy + grant token. */
  verifyOtp(
    email: string,
    code: string,
    options?: { method?: PasswordResetMethod; tenantId?: string | null }
  ): Promise<VerifyOtpResult>;
  /**
   * Submit new password.
   * tenantIds: encrypted tenant IDs to reset. Empty/omitted resets ALL workspaces.
   */
  resetPassword(params: ResetPasswordRequestParams): Promise<void>;
}
