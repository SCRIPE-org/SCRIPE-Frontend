import type {
  PasswordPolicyDto,
} from "@core/common/password-policy";
import type {
  PasswordResetMethod,
  ResetPasswordRequestParams,
  ResetWorkspaceOption,
} from "./IPasswordResetRepository";

export interface VerifyOtpServiceResponse {
  isValid?: boolean;
  workspaces?: ResetWorkspaceOption[];
  passwordPolicy?: PasswordPolicyDto | null;
  resetGrantToken?: string | null;
}

export interface IPasswordResetService {
  /** POST to request reset instructions via OTP or magic-link. */
  requestReset(
    email: string,
    method?: PasswordResetMethod,
    tenantId?: string | null
  ): Promise<{ sent?: boolean; retryAfterSeconds?: number } | void>;
  /** POST to verify OTP or magic-link token. Returns workspaces, policy, and grant token. */
  verifyOtp(
    email: string,
    code: string,
    options?: { method?: PasswordResetMethod; tenantId?: string | null }
  ): Promise<VerifyOtpServiceResponse>;
  /** POST to submit new password. tenantIds: encrypted IDs; empty resets all workspaces. */
  resetPassword(params: ResetPasswordRequestParams): Promise<void>;
}
