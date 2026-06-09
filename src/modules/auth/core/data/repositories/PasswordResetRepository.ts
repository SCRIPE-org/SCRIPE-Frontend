import type {
  IPasswordResetRepository,
  ResetWorkspaceOption,
  VerifyOtpResult,
} from "../../domain/interfaces/IPasswordResetRepository";
import type { IPasswordResetService } from "../../domain/interfaces/IPasswordResetService";

export class PasswordResetRepository implements IPasswordResetRepository {
  constructor(private readonly service: IPasswordResetService) {}

  requestReset(email: string, method: "otp" | "magic-link" = "otp"): Promise<void> {
    return this.service.requestReset(email, method);
  }

  async verifyOtp(email: string, code: string): Promise<VerifyOtpResult> {
    const result = await this.service.verifyOtp(email, code);
    return {
      workspaces: result.workspaces as ResetWorkspaceOption[] | undefined,
    };
  }

  resetPassword(params: {
    email: string;
    otp: string;
    newPassword: string;
    tenantIds?: string[];
  }): Promise<void> {
    return this.service.resetPassword(params);
  }
}
