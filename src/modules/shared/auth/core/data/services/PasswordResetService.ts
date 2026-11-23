import type {
  IPasswordResetService,
  VerifyOtpServiceResponse,
} from "../../domain/interfaces/IPasswordResetService";
import type { IPublicApiService } from "@core/interfaces/public-api.interface";
import type {
  RequestPasswordResetDto,
  VerifyResetOtpDto,
  VerifyResetOtpResponseDto,
  ResetPasswordDto,
} from "../models/PasswordResetModels";
import type {
  PasswordResetMethod,
  ResetPasswordRequestParams,
} from "../../domain/interfaces/IPasswordResetRepository";
import { AUTH_CORE_ENDPOINTS } from "./auth-core.endpoints";

export class PasswordResetService implements IPasswordResetService {
  constructor(private readonly api: IPublicApiService) {}

  async requestReset(
    email: string,
    method: PasswordResetMethod = "otp",
    tenantId?: string | null
  ): Promise<{ sent?: boolean; retryAfterSeconds?: number } | void> {
    const request: RequestPasswordResetDto = {
      email,
      method,
      ...(tenantId ? { tenantId } : {}),
    };
    return this.api.post<{ sent?: boolean; retryAfterSeconds?: number } | void>(
      AUTH_CORE_ENDPOINTS.ADMIN_REQUEST_PASSWORD_RESET,
      request
    );
  }

  async verifyOtp(
    email: string,
    code: string,
    options?: { method?: PasswordResetMethod; tenantId?: string | null }
  ): Promise<VerifyOtpServiceResponse> {
    const request: VerifyResetOtpDto = {
      email,
      code,
      ...(options?.method ? { method: options.method } : {}),
      ...(options?.tenantId ? { tenantId: options.tenantId } : {}),
    };
    const response = await this.api.post<VerifyResetOtpResponseDto>(
      AUTH_CORE_ENDPOINTS.ADMIN_VERIFY_RESET_OTP,
      request
    );
    return {
      isValid: response?.isValid,
      workspaces: response?.workspaces,
      passwordPolicy: response?.passwordPolicy ?? null,
      resetGrantToken: response?.resetGrantToken ?? null,
    };
  }

  async resetPassword(params: ResetPasswordRequestParams): Promise<void> {
    const request: ResetPasswordDto = {
      email: params.email,
      newPassword: params.newPassword,
      ...(params.otp ? { otp: params.otp } : {}),
      ...(params.code ? { code: params.code } : {}),
      ...(params.method ? { method: params.method } : {}),
      ...(params.resetGrantToken ? { resetGrantToken: params.resetGrantToken } : {}),
      ...(params.tenantIds ? { tenantIds: params.tenantIds } : {}),
    };
    await this.api.post(AUTH_CORE_ENDPOINTS.ADMIN_RESET_PASSWORD, request);
  }
}
