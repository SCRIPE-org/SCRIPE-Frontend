export interface IPasswordResetService {
  requestReset(email: string): Promise<void>;
  resetPassword(params: { email: string; otp: string; newPassword: string }): Promise<void>;
}

