/**
 * User Profile Repository Interface
 *
 * Defines the contract for user profile data operations.
 *
 * @module user/domain
 */
import type { User } from "@modules/auth/core/domain/entities/User";

/**
 * Update profile request
 */
export interface UpdateProfileRequest {
      firstName: string;
      lastName: string;
      phoneNumber: string;
}

/**
 * Change password request
 */
export interface ChangePasswordRequest {
      currentPassword: string;
      newPassword: string;
}

/**
 * User profile repository interface
 */
export interface IUserProfileRepository {
      /**
       * Get current authenticated user
       */
      getCurrentUser(): Promise<User>;

      /**
       * Update current user's profile
       */
      updateProfile(request: UpdateProfileRequest): Promise<User>;

      /**
       * Change current user's password
       */
      changePassword(request: ChangePasswordRequest): Promise<void>;

      /**
       * Validate password strength
       */
      validatePasswordStrength(password: string): { isValid: boolean; message?: string };

      /**
       * Validate profile data
       */
      validateProfileData(data: UpdateProfileRequest): { isValid: boolean; message?: string };
}
