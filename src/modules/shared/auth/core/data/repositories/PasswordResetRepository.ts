import { mapPasswordPolicyDto } from "@core/common/password-policy";
import type {
  IPasswordResetRepository,
  PasswordResetMethod,
  ResetPasswordRequestParams,
  ResetWorkspaceOption,
  VerifyOtpResult,
} from "../../domain/interfaces/IPasswordResetRepository";
import type { IPasswordResetService } from "../../domain/interfaces/IPasswordResetService";

export class PasswordResetRepository implements IPasswordResetRepository {
  constructor(private readonly service: IPasswordResetService) {}

  requestReset(
    email: string,
    method: PasswordResetMethod = "otp",
    tenantId?: string | null
  ): Promise<{ sent?: boolean; retryAfterSeconds?: number } | void> {
    return this.service.requestReset(email, method, tenantId);
  }

  async verifyOtp(
    email: string,
    code: string,
    options?: { method?: PasswordResetMethod; tenantId?: string | null }
  ): Promise<VerifyOtpResult> {
    const result = await this.service.verifyOtp(email, code, options);
    return {
      isValid: result.isValid ?? true,
      workspaces: result.workspaces as ResetWorkspaceOption[] | undefined,
      passwordPolicy: result.passwordPolicy
        ? mapPasswordPolicyDto(result.passwordPolicy)
        : null,
      resetGrantToken: result.resetGrantToken ?? null,
    };
  }

  resetPassword(params: ResetPasswordRequestParams): Promise<void> {
    return this.service.resetPassword(params);
  }
}
