/**
 * Account Setup Service
 *
 * Handles public (no-auth) API calls for the account activation flow.
 * Uses a raw axios instance because these endpoints don't require JWT.
 *
 * @module auth/account-setup
 */
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

/** Response from GET /account-setup/validate */
export interface ValidateTokenResponse {
  isValid: boolean;
  adminEmail?: string;
  adminUsername?: string;
  tenantName?: string;
  tenantCode?: string;
  expiresAt?: string;
  error?: string;
}

/** Request body for POST /account-setup/activate */
export interface ActivateAccountRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

/** Response from POST /account-setup/activate */
export interface ActivateAccountResponse {
  success: boolean;
  message?: string;
  error?: string;
}

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

export const AccountSetupService = {
  /**
   * Validate a setup token (public, no auth)
   */
  async validateToken(token: string): Promise<ValidateTokenResponse> {
    const { data } = await api.get<ValidateTokenResponse>(`/v1/account-setup/validate`, {
      params: { token },
    });
    return data;
  },

  /**
   * Activate account — set password and consume the token (public, no auth)
   */
  async activateAccount(request: ActivateAccountRequest): Promise<ActivateAccountResponse> {
    const { data } = await api.post<ActivateAccountResponse>(`/v1/account-setup/activate`, request);
    return data;
  },
};
