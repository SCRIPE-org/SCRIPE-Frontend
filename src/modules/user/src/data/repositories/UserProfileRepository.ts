/**
 * User Profile Repository Implementation
 *
 * Implements IUserProfileRepository using UserProfileService.
 * Uses UserProfileMapper to convert Models → Entities.
 *
 * Clean Architecture:
 * View → ViewModel → Repository → Service → IApiService
 *                       ↓
 *              Mapper (Model ↔ Entity)
 *
 * @module user/data
 */
import type { User } from "@modules/auth/core/domain/entities/User";
import type {
      IUserProfileRepository,
      UpdateProfileRequest,
      ChangePasswordRequest,
} from "../../domain/interfaces/IUserProfileRepository";
import type { IUserProfileService } from "../services/UserProfileService";
import { UpdateProfileModel, ChangePasswordModel } from "../models/UserModel";
import {
      passwordStrength,
      validateForm,
      VALIDATION_SETS,
} from "@core/common/validation";
import { appLogger } from "@core/common/logger";
import { UserProfileMapper } from "../mappers/UserProfileMapper";

export class UserProfileRepository implements IUserProfileRepository {
      constructor(private readonly service: IUserProfileService) { }

      async getCurrentUser(): Promise<User> {
            try {
                  const model = await this.service.getCurrentUser();
                  return UserProfileMapper.toEntity(model);
            } catch (error) {
                  appLogger.error("Failed to get current user:", error);
                  throw error;
            }
      }

      async updateProfile(request: UpdateProfileRequest): Promise<User> {
            // Validate before sending
            const validation = this.validateProfileData(request);
            if (!validation.isValid) {
                  throw new Error(validation.message || "Invalid profile data");
            }

            try {
                  const requestModel = new UpdateProfileModel(
                        request.firstName,
                        request.lastName,
                        request.phoneNumber
                  );
                  const responseModel = await this.service.updateProfile(requestModel);
                  return UserProfileMapper.toEntity(responseModel);
            } catch (error) {
                  appLogger.error("Failed to update profile:", error);
                  throw error;
            }
      }

      async changePassword(request: ChangePasswordRequest): Promise<void> {
            // Validate password strength
            const validation = this.validatePasswordStrength(request.newPassword);
            if (!validation.isValid) {
                  throw new Error(validation.message || "Password too weak");
            }

            try {
                  const requestModel = new ChangePasswordModel(
                        request.currentPassword,
                        request.newPassword
                  );
                  await this.service.changePassword(requestModel);
            } catch (error) {
                  appLogger.error("Failed to change password:", error);
                  throw error;
            }
      }

      validatePasswordStrength(
            password: string
      ): { isValid: boolean; message?: string } {
            const validation = passwordStrength({
                  minLength: 6,
                  requireLowercase: true,
                  requireUppercase: true,
                  requireNumber: true,
                  requireSpecial: false,
            })(password);

            return {
                  isValid: validation.isValid,
                  message: validation.message,
            };
      }

      validateProfileData(
            data: UpdateProfileRequest
      ): { isValid: boolean; message?: string } {
            const validationResults = validateForm(data, VALIDATION_SETS.PROFILE_FORM);

            for (const [, result] of Object.entries(validationResults)) {
                  if (!result.isValid) {
                        return {
                              isValid: false,
                              message: result.message,
                        };
                  }
            }

            return { isValid: true };
      }
}
