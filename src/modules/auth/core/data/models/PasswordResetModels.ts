export interface RequestPasswordResetDto {
  email: string;
  method?: "otp" | "magic-link";
}

export interface VerifyResetOtpDto {
  email: string;
  code: string;
}

export interface VerifyResetOtpResponseDto {
  workspaces?: Array<{
    tenantId: string;
    tenantName: string;
    tenantCode: string;
    logoUrl?: string | null;
    isPlatformAdmin: boolean;
  }>;
}

export interface ResetPasswordDto {
  email: string;
  otp: string;
  newPassword: string;
  tenantId?: string;
}
