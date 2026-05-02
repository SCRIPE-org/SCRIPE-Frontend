import type { IPasswordResetRepository } from "../../domain/interfaces/IPasswordResetRepository";
import type { IPasswordResetService } from "../../domain/interfaces/IPasswordResetService";

export class PasswordResetRepository implements IPasswordResetRepository {
  constructor(private readonly service: IPasswordResetService) {}

  requestReset(email: string): Promise<void> {
    return this.service.requestReset(email);
  }

  resetPassword(params: { email: string; otp: string; newPassword: string }): Promise<void> {
    return this.service.resetPassword(params);
  }
}

