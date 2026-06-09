export interface ResetWorkspaceOption {
  tenantId: string;
  tenantName: string;
  tenantCode: string;
  logoUrl?: string | null;
  isPlatformAdmin: boolean;
}

export interface VerifyOtpResult {
  /** Workspaces to choose from. If single/null, auto-proceed to newPassword step. */
  workspaces?: ResetWorkspaceOption[];
}

export interface IPasswordResetRepository {
  /** Send reset instructions — 'otp' sends a code, 'magic-link' sends an email link. */
  requestReset(email: string, method?: "otp" | "magic-link"): Promise<void>;
  /** Verify the 6-digit OTP code and get workspace list (if multi-tenant). */
  verifyOtp(email: string, code: string): Promise<VerifyOtpResult>;
  /**
   * Submit new password.
   * tenantIds: encrypted tenant IDs to reset. Empty/omitted resets ALL workspaces.
   */
  resetPassword(params: {
    email: string;
    otp: string;
    newPassword: string;
    tenantIds?: string[];
  }): Promise<void>;
}
