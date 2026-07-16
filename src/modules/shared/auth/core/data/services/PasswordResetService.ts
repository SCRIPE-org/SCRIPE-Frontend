import { API_ENDPOINTS } from "@core/config/api-endpoints";
import type { IPasswordResetService } from "../../domain/interfaces/IPasswordResetService";
import type { IPublicApiService } from "@core/interfaces/public-api.interface";
import type {
  RequestPasswordResetDto,
  VerifyResetOtpDto,
  VerifyResetOtpResponseDto,
  ResetPasswordDto,
} from "../models/PasswordResetModels";
import type { ResetWorkspaceOption } from "../../domain/interfaces/IPasswordResetRepository";

export class PasswordResetService implements IPasswordResetService {
  constructor(private readonly api: IPublicApiService) {}

  async requestReset(email: string, method: "otp" | "magic-link" = "otp"): Promise<void> {
    const request: RequestPasswordResetDto = { email, method };
    await this.api.post(API_ENDPOINTS.AUTH.ADMIN_REQUEST_PASSWORD_RESET, request);
  }

  async verifyOtp(email: string, code: string): Promise<{ workspaces?: ResetWorkspaceOption[] }> {
    const request: VerifyResetOtpDto = { email, code };
    const response = await this.api.post<VerifyResetOtpResponseDto>(
      API_ENDPOINTS.AUTH.ADMIN_VERIFY_RESET_OTP,
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
    await this.api.post(API_ENDPOINTS.AUTH.ADMIN_RESET_PASSWORD, request);
  }
}
