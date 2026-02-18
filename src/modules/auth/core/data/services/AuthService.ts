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

import {
  LoginRequestModel,
  LoginResponseModel,
  type LoginResponseJson,
} from "../models/AuthModel";
import {
  Verify2FARequestModel,
  Verify2FAResponseModel,
  type Verify2FAResponseJson,
} from "../models/TwoFactorModels";
import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS } from "@core/config/api-endpoints";

export interface IAuthService {
  login(request: LoginRequestModel): Promise<LoginResponseModel>;
  verify2FA(request: Verify2FARequestModel): Promise<Verify2FAResponseModel>;
  logout(): Promise<void>;
  refreshToken(): Promise<LoginResponseModel>;
  getMe<T>(): Promise<T>;
}

export class AuthService implements IAuthService {
  constructor(private readonly api: IApiService) { }

  async login(request: LoginRequestModel): Promise<LoginResponseModel> {
    const json = await this.api.postPublic<LoginResponseJson>(
      API_ENDPOINTS.LOGIN,
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
    await this.api.post(API_ENDPOINTS.LOGOUT, {});
  }

  /**
   * Refresh — the httpOnly cookie is sent automatically via withCredentials.
   * Backend CookieAuthMiddleware injects the refresh token into the request body.
   */
  async refreshToken(): Promise<LoginResponseModel> {
    const json = await this.api.postPublic<LoginResponseJson>(
      API_ENDPOINTS.REFRESH,
      {}
    );
    return LoginResponseModel.fromJson(json);
  }

  async getMe<T>(): Promise<T> {
    return this.api.get<T>(API_ENDPOINTS.GET_ADMIN_ME);
  }
}
