/**
 * User Profile Service
 *
 * Handles all API calls for user profile operations.
 * Returns Models (DTOs) - Repository uses Mapper to convert to Entities.
 *
 * Clean Architecture:
 * View → ViewModel → Repository → Service → IApiService
 *
 * @module user/data
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS } from "@core/config/api-endpoints";
import {
      UserModel,
      UpdateProfileModel,
      ChangePasswordModel,
      type UserJson,
} from "../models/UserModel";

export interface IUserProfileService {
      getCurrentUser(): Promise<UserModel>;
      updateProfile(request: UpdateProfileModel): Promise<UserModel>;
      changePassword(request: ChangePasswordModel): Promise<void>;
}

export class UserProfileService implements IUserProfileService {
      constructor(private readonly api: IApiService) { }

      async getCurrentUser(): Promise<UserModel> {
            const json = await this.api.get<UserJson>(API_ENDPOINTS.GET_ADMIN_ME);
            return UserModel.fromJson(json);
      }

      async updateProfile(request: UpdateProfileModel): Promise<UserModel> {
            const json = await this.api.put<UserJson>(
                  API_ENDPOINTS.UPDATE_ADMIN_PROFILE,
                  request.toJson()
            );
            return UserModel.fromJson(json);
      }

      async changePassword(request: ChangePasswordModel): Promise<void> {
            await this.api.put(API_ENDPOINTS.CHANGE_ADMIN_PASSWORD, request.toJson());
      }
}
