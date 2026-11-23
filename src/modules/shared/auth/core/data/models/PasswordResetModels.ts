import type { PasswordPolicyDto } from "@core/common/password-policy";

export type ResetMethod = "otp" | "magic-link";

export interface RequestPasswordResetDto {
  email: string;
  method?: ResetMethod;
  tenantId?: string | null;
}

export interface VerifyResetOtpDto {
  email: string;
  code: string;
  method?: ResetMethod;
  tenantId?: string | null;
}

export interface ResetWorkspaceOptionDto {
  tenantId: string;
  tenantName: string;
  tenantCode: string;
  logoUrl?: string | null;
  isPlatformAdmin: boolean;
  passwordPolicy?: PasswordPolicyDto | null;
}

export interface VerifyResetOtpResponseDto {
  isValid?: boolean;
  workspaces?: ResetWorkspaceOptionDto[];
  passwordPolicy?: PasswordPolicyDto | null;
  resetGrantToken?: string | null;
}

export interface ResetPasswordDto {
  email: string;
  otp?: string;
  code?: string;
  method?: ResetMethod;
  resetGrantToken?: string | null;
  newPassword: string;
  /** Encrypted tenant IDs to reset. Omit or send empty to reset all workspaces. */
  tenantIds?: string[];
}
