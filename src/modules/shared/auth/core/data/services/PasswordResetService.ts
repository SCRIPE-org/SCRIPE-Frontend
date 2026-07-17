import type { IPasswordResetService } from "../../domain/interfaces/IPasswordResetService";
import type { IPublicApiService } from "@core/interfaces/public-api.interface";
import type {
  RequestPasswordResetDto,
  VerifyResetOtpDto,
  VerifyResetOtpResponseDto,
  ResetPasswordDto,
} from "../models/PasswordResetModels";
import type { ResetWorkspaceOption } from "../../domain/interfaces/IPasswordResetRepository";
import { AUTH_CORE_ENDPOINTS } from "./auth-core.endpoints";

export class PasswordResetService implements IPasswordResetService {
  constructor(private readonly api: IPublicApiService) {}

  async requestReset(email: string, method: "otp" | "magic-link" = "otp"): Promise<void> {
    const request: RequestPasswordResetDto = { email, method };
    await this.api.post(AUTH_CORE_ENDPOINTS.ADMIN_REQUEST_PASSWORD_RESET, request);
  }

  async verifyOtp(email: string, code: string): Promise<{ workspaces?: ResetWorkspaceOption[] }> {
    const request: VerifyResetOtpDto = { email, code };
    const response = await this.api.post<VerifyResetOtpResponseDto>(
      AUTH_CORE_ENDPOINTS.ADMIN_VERIFY_RESET_OTP,
      request
    );
    return {
      workspaces: response?.workspaces,
    };
  }

  async resetPassword(params: {
    email: string;
    otp: string;
    newPassword: string;
    tenantIds?: string[];
  }): Promise<void> {
    const request: ResetPasswordDto = params;
    await this.api.post(AUTH_CORE_ENDPOINTS.ADMIN_RESET_PASSWORD, request);
  }
}
