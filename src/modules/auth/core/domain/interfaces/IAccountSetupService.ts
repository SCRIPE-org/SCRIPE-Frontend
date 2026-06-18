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
}

export interface ActivateAccountRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ActivateAccountResponse {
  success: boolean;
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
  activateAccount(request: ActivateAccountRequest): Promise<ActivateAccountResponse>;
}
