/**
 * IAccountSetupService — Low-level HTTP data contract for account setup endpoints.
 * Returns raw API DTOs.
 *
 * @module auth/account-setup/domain/interfaces
 */

export interface ValidateTokenResponse {
  adminUsername: string;
  tenantName: string;
  tenantCode?: string;
  email: string;
  adminEmail?: string;
  isValid: boolean;
  errorMessage?: string;
  passwordMinLength?: number;
  passwordRequireUppercase?: boolean;
  passwordRequireNumber?: boolean;
  passwordRequireSpecial?: boolean;
  adminId?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  tenantId?: string;
  expiresAt?: string;
}

export interface SetupCustomFieldDto {
  key: string;
  labelEn: string;
  labelAr?: string;
  placeholderEn?: string;
  placeholderAr?: string;
  valueType: string;
  isRequired: boolean;
  sensitivity: number;
  options?: string | null;
  optionsAr?: string | null;
  sortOrder: number;
  currentValue?: unknown;
}

export interface ActivateAccountRequest {
  token: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  customFieldValues?: Record<string, unknown>;
}

export interface ActivateAccountResponse {
  success: boolean;
  adminUsername?: string;
  tenantName?: string;
  errorMessage?: string;
}

export interface IAccountSetupService {
  validateToken(token: string): Promise<ValidateTokenResponse>;
  getCustomFields(token: string): Promise<SetupCustomFieldDto[]>;
  activateAccount(request: ActivateAccountRequest): Promise<ActivateAccountResponse>;
}
