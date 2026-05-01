/**
 * Auth Service Interface
 *
 * Contract for authentication API operations.
 * Implemented by AuthService in the data/services layer.
 *
 * @module auth/core/domain
 */
import type { LoginRequestModel, LoginResponseModel } from "../types/AuthTypes";
import type { Verify2FARequestModel, Verify2FAResponseModel } from "../types/AuthTypes";

export interface IAuthService {
  login(request: LoginRequestModel): Promise<LoginResponseModel>;
  verify2FA(request: Verify2FARequestModel): Promise<Verify2FAResponseModel>;
  logout(): Promise<void>;
  refreshToken(): Promise<LoginResponseModel>;
  getMe<T>(): Promise<T>;
  impersonate(adminId: string): Promise<LoginResponseModel>;
  stopImpersonation(): Promise<LoginResponseModel>;
  buildOidcConsentForm(
    searchParams: URLSearchParams,
    accessToken: string
  ): { action: string; params: Record<string, string> };
  /** Link an external SSO account to the current admin profile */
  linkExternalLogin(data: {
    identityProviderId: string;
    providerName: string;
    providerKey: string;
    email: string;
    displayName?: string;
  }): Promise<void>;
}
