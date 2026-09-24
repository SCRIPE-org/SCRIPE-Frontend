export interface SetupCustomFieldDto {
  key: string;
  labelEn: string;
  labelAr?: string;
  placeholderEn?: string;
  placeholderAr?: string;
  valueType: string;
  isRequired: boolean;
  sensitivity: number;
  options?: string;
  optionsAr?: string;
  sortOrder: number;
  currentValue?: unknown;
}

export interface ValidateTokenResponse {
  isValid: boolean;
  adminEmail?: string;
  adminUsername?: string;
  tenantName?: string;
  tenantCode?: string;
  expiresAt?: string;
  error?: string;
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
  message?: string;
  error?: string;
  errorMessage?: string;
}

export interface AccountSetupToken {
  adminEmail?: string;
  adminUsername?: string;
  tenantName?: string;
  tenantCode?: string;
  expiresAt?: string;
}

export interface IAccountSetupService {
  validateToken(token: string): Promise<ValidateTokenResponse>;
  getCustomFields(token: string): Promise<SetupCustomFieldDto[]>;
  activateAccount(request: ActivateAccountRequest): Promise<ActivateAccountResponse>;
}
