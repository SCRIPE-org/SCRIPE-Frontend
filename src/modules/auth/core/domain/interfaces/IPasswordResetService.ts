import type { ResetWorkspaceOption } from "./IPasswordResetRepository";

export interface IPasswordResetService {
  /** POST to request reset instructions via OTP or magic-link. */
  requestReset(email: string, method?: "otp" | "magic-link"): Promise<void>;
  /** POST to verify OTP. Returns workspace list if multi-tenant. */
  verifyOtp(email: string, code: string): Promise<{ workspaces?: ResetWorkspaceOption[] }>;
  /** POST to submit new password. tenantIds: encrypted IDs; empty resets all workspaces. */
  resetPassword(params: {
    email: string;
    otp: string;
    newPassword: string;
    tenantIds?: string[];
  }): Promise<void>;
}
