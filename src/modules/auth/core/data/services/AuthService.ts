/**
 * Auth Service
 *
 * Handles all API calls for the Auth module.
 * Returns Models (DTOs) - Repository uses Mapper to convert to Entities.
 *
 * Clean Architecture:
 * View → ViewModel → Repository → Service → IApiService
 *
 * @module auth/data
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS } from "@core/config/api-endpoints";
import {
  LoginRequestModel,
  LoginResponseModel,
  RefreshTokenRequestModel,
  type LoginResponseJson,
} from "../models/AuthModel";
import {
  Verify2FARequestModel,
  Verify2FAResponseModel,
  type Verify2FAResponseJson,
} from "../models/TwoFactorModels";

export interface IAuthService {
  login(request: LoginRequestModel): Promise<LoginResponseModel>;
  verify2FA(request: Verify2FARequestModel): Promise<Verify2FAResponseModel>;
  logout(refreshToken: string): Promise<void>;
  refreshToken(request: RefreshTokenRequestModel): Promise<LoginResponseModel>;
  getMe<T>(): Promise<T>;
}

export class AuthService implements IAuthService {
  constructor(private readonly api: IApiService) {}

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

  async logout(refreshToken: string): Promise<void> {
    await this.api.post(API_ENDPOINTS.LOGOUT, { refreshToken });
  }

  async refreshToken(request: RefreshTokenRequestModel): Promise<LoginResponseModel> {
    const json = await this.api.postPublic<LoginResponseJson>(
      API_ENDPOINTS.REFRESH,
      request.toJson()
    );
    return LoginResponseModel.fromJson(json);
  }

  async getMe<T>(): Promise<T> {
    return this.api.get<T>(API_ENDPOINTS.GET_ADMIN_ME);
  }
}
