import { API_ENDPOINTS } from "@core/config/api-endpoints";
import type { IPasswordResetService } from "../../domain/interfaces/IPasswordResetService";
import type { PublicApiService } from "./PublicApiService";
import type { RequestPasswordResetDto, ResetPasswordDto } from "../models/PasswordResetModels";

export class PasswordResetService implements IPasswordResetService {
  constructor(private readonly api: PublicApiService) {}

  async requestReset(email: string): Promise<void> {
    const request: RequestPasswordResetDto = { email };
    await this.api.post(API_ENDPOINTS.AUTH.ADMIN_REQUEST_PASSWORD_RESET, request);
  }

  async resetPassword(params: {
    email: string;
    otp: string;
    newPassword: string;
  }): Promise<void> {
    const request: ResetPasswordDto = params;
    await this.api.post(API_ENDPOINTS.AUTH.ADMIN_RESET_PASSWORD, request);
  }
}

