export interface IPasswordResetRepository {
  requestReset(email: string): Promise<void>;
  resetPassword(params: { email: string; otp: string; newPassword: string }): Promise<void>;
}
