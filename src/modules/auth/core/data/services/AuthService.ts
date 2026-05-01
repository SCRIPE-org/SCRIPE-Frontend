/**
 * Auth Service (API Layer)
 *
 * Handles HTTP communication for authentication endpoints.
 * Uses IApiService for network calls.
 *
 * Refresh tokens are managed exclusively by httpOnly cookies —
 * they are never passed as parameters or included in request bodies.
 * The browser sends them automatically via withCredentials: true.
 *
 * @module auth/data
 */

import { LoginRequestModel, LoginResponseModel, type LoginResponseJson } from "../models/AuthModel";
import {
  Verify2FARequestModel,
  Verify2FAResponseModel,
  type Verify2FAResponseJson,
} from "../models/TwoFactorModels";
import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS } from "@core/config/api-endpoints";
import { ALLOWED_OIDC_PARAMS } from "@core/config/oidc-keys";
import type { IAuthService } from "../../domain/interfaces/IAuthService";

export class AuthService implements IAuthService {
  constructor(private readonly api: IApiService) {}

  async login(request: LoginRequestModel): Promise<LoginResponseModel> {
    const json = await this.api.postPublic<LoginResponseJson>(
      API_ENDPOINTS.AUTH.LOGIN,
      request.toJson()
    );
    return LoginResponseModel.fromJson(json);
  }

  async verify2FA(request: Verify2FARequestModel): Promise<Verify2FAResponseModel> {
    const json = await this.api.postPublic<Verify2FAResponseJson>(
      API_ENDPOINTS.AUTH.TWO_FA.VERIFY,
      request.toJson()
    );
    return Verify2FAResponseModel.fromJson(json);
  }

  /**
   * Logout — the httpOnly cookie is sent automatically via withCredentials.
   * Backend CookieAuthMiddleware reads the refresh token from the cookie.
   */
  async logout(): Promise<void> {
    await this.api.post(API_ENDPOINTS.AUTH.LOGOUT, {});
  }

  /**
   * Refresh — the httpOnly cookie is sent automatically via withCredentials.
   * Backend CookieAuthMiddleware injects the refresh token into the request body.
   */
  async refreshToken(): Promise<LoginResponseModel> {
    const json = await this.api.postPublic<LoginResponseJson>(API_ENDPOINTS.AUTH.REFRESH, {});
    return LoginResponseModel.fromJson(json);
  }

  async getMe<T>(): Promise<T> {
    return this.api.get<T>(API_ENDPOINTS.AUTH.ME);
  }

  /**
   * Impersonate an admin — httpOnly cookie set by CookieAuthMiddleware.
   * Returns access token (same shape as login response).
   */
  async impersonate(adminId: string): Promise<LoginResponseModel> {
    const json = await this.api.post<LoginResponseJson>(
      API_ENDPOINTS.AUTH.IMPERSONATE(adminId),
      {}
    );
    return LoginResponseModel.fromJson(json);
  }

  /**
   * Stop impersonation — httpOnly cookie carries the refresh token.
   * Returns original admin's access token.
   */
  async stopImpersonation(): Promise<LoginResponseModel> {
    const json = await this.api.post<LoginResponseJson>(API_ENDPOINTS.AUTH.STOP_IMPERSONATION, {});
    return LoginResponseModel.fromJson(json);
  }

  /**
   * Constructs the HTML Form action URL and whitelist of hidden input parameters
   * required to securely POST the OIDC consent back to the backend.
   */
  buildOidcConsentForm(
    searchParams: URLSearchParams,
    accessToken: string
  ): { action: string; params: Record<string, string> } {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const baseHost = backendUrl.replace(/\/api$/, "");
    const action = `${baseHost}${API_ENDPOINTS.AUTH.OIDC.AUTHORIZE}`;

    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (ALLOWED_OIDC_PARAMS.includes(key as any)) {
        params[key] = value;
      }
    });

    params["access_token"] = accessToken;

    return { action, params };
  }

  /**
   * Link an external SSO account to the currently authenticated admin profile.
   */
  async linkExternalLogin(data: {
    identityProviderId: string;
    providerName: string;
    providerKey: string;
    email: string;
    displayName?: string;
  }): Promise<void> {
    await this.api.post(API_ENDPOINTS.PROFILE.LINK_EXTERNAL_LOGIN, data);
  }
}
