/**
 * User Service
 * 
 * Handles user profile operations including fetching, updating,
 * and password management. Uses domain models and follows
 * clean architecture principles.
 */

import { type IApiService } from "./api.service";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { User, UserMapper, type UserData } from "@/domain";
import { appLogger } from "@/lib/logger";
import { passwordStrength, phone, validateForm, VALIDATION_SETS } from "@/lib/validation";

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export class UserService {
  constructor(private readonly apiService: IApiService) {}

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    // ========================================
    // MOCK DATA FOR TESTING (COMMENT OUT FOR REAL API)
    // ========================================
    
    appLogger.info("Using mock user data for testing");
    return UserMapper.fromJson({
      id: "mock-user-id",
      username: "demo-user",
      firstName: "Demo",
      lastName: "User",
      phoneNumber: "+1234567890",
      adminTypeName: "Administrator",
    });
    

    // ========================================
    // REAL API ENDPOINT
    // ========================================
    try {
      const response = await this.apiService.get<User>(API_ENDPOINTS.GET_ADMIN_ME);
      return UserMapper.fromJson(response);
    } catch (error) {
      // Re-throw error to show proper error handling in UI
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData: UpdateProfileRequest): Promise<User> {
    // ========================================
    // MOCK DATA FOR TESTING (COMMENT OUT FOR REAL API)
    // ========================================
    
    appLogger.info("Using mock profile update for testing");
    return UserMapper.fromJson({
      id: "mock-user-id",
      username: "demo-user",
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      phoneNumber: profileData.phoneNumber,
      adminTypeName: "Administrator",
    });
    

    // ========================================
    // REAL API ENDPOINT
    // ========================================
    // try {
    //   const response = await this.apiService.put<User>(
    //     API_ENDPOINTS.UPDATE_ADMIN_PROFILE,
    //     profileData
    //   );
    //   return UserMapper.fromJson(response);
    // } catch (error) {
    //   // Re-throw error to show proper error handling in UI
    //   throw error;
    // }
  }

  /**
   * Change user password
   */
  async changePassword(passwordData: ChangePasswordRequest): Promise<void> {
    // ========================================
    // MOCK DATA FOR TESTING (COMMENT OUT FOR REAL API)
    // ========================================
    
    appLogger.info("Using mock password change for testing");
    // Simulate password validation
    if (passwordData.newPassword.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }
    return Promise.resolve();
    

    // ========================================
    // REAL API ENDPOINT
    // ========================================
    // try {
    //   await this.apiService.put(
    //     API_ENDPOINTS.CHANGE_ADMIN_PASSWORD,
    //     passwordData
    //   );
    // } catch (error) {
    //   // Re-throw error to show proper error handling in UI
    //   throw error;
    // }
  }

  /**
   * Validate password strength
   */
  validatePasswordStrength(password: string): { isValid: boolean; message?: string } {
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

  /**
   * Validate profile data
   */
  validateProfileData(profileData: UpdateProfileRequest): { isValid: boolean; message?: string } {
    const validationResults = validateForm(profileData, VALIDATION_SETS.PROFILE_FORM);
    
    // Check if any validation failed
    for (const [fieldName, result] of Object.entries(validationResults)) {
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

// ========================================
// TESTING INSTRUCTIONS
// ========================================
/*
 * MOCK DATA FOR TESTING BEFORE INTEGRATION:
 * 
 * To use mock data for testing:
 * 1. Uncomment the mock data blocks in each method
 * 2. Comment out the real API endpoint blocks
 * 3. This allows testing UI/UX without backend integration
 * 
 * To use real API endpoints:
 * 1. Keep mock data blocks commented out (as they are now)
 * 2. Real API calls will be made to configured endpoints
 * 3. Errors will be properly thrown and handled in UI
 * 
 * NOTE: Mock data is temporary for testing before integration.
 * Remove mock data blocks completely once backend is integrated.
 */
