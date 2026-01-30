/**
 * Profile View Model
 * 
 * Handles profile management business logic including fetching,
 * updating profile data, and password changes. Uses domain models
 * and services for clean separation of concerns.
 */

import { useState, useCallback, useEffect } from "react";
import { useServices } from "@core/providers/service-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { handleError, getUserFriendlyErrorMessage } from "@core/common/error-handler";
import { appLogger } from "@core/common/logger";
import { User, UserMapper } from "../../domain/entities";
import type { UpdateProfileRequest, ChangePasswordRequest } from "@core/services/user.service";
import { validateForm, VALIDATION_SETS, passwordConfirmation, isFormValid } from "@core/common/validation";

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function useProfileViewModel() {
  // State
  const [profile, setProfile] = useState<User | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");

  // Profile form state
  const [profileFormData, setProfileFormData] = useState<ProfileFormData>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });
  const [profileUpdateLoading, setProfileUpdateLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileUpdateError, setProfileUpdateError] = useState("");

  // Password form state
  const [passwordFormData, setPasswordFormData] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordUpdateLoading, setPasswordUpdateLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Services
  const { userService } = useServices();
  const { t } = useI18n();

  // Fetch profile data
  const fetchProfile = useCallback(async () => {
    try {
      setProfileLoading(true);
      setProfileError("");

      const user = await userService.getCurrentUser();
      setProfile(user);
      
      // Update form data with user data
      setProfileFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phoneNumber: user.phoneNumber || "",
      });

      appLogger.info("Profile fetched successfully", { userId: user.id });
    } catch (error) {
      const appError = handleError(error as Error, 'ProfileViewModel.fetchProfile');
      appLogger.error("Failed to fetch profile:", { error, appError });
      const errorMessage = getUserFriendlyErrorMessage(appError);
      setProfileError(errorMessage);
    } finally {
      setProfileLoading(false);
    }
  }, [userService]);

  // Update profile
  const updateProfile = useCallback(async () => {
    try {
      setProfileUpdateLoading(true);
      setProfileUpdateError("");
      setProfileSuccess(false);

      // Validate profile data
      const validation = userService.validateProfileData(profileFormData);
      if (!validation.isValid) {
        setProfileUpdateError(validation.message || "Invalid profile data");
        return;
      }

      const updateRequest: UpdateProfileRequest = {
        firstName: profileFormData.firstName.trim(),
        lastName: profileFormData.lastName.trim(),
        phoneNumber: profileFormData.phoneNumber.trim(),
      };

      const updatedUser = await userService.updateProfile(updateRequest);
      setProfile(updatedUser);
      setProfileSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => setProfileSuccess(false), 3000);
      
      appLogger.info("Profile updated successfully", { userId: updatedUser.id });
    } catch (error) {
      const appError = handleError(error as Error, 'ProfileViewModel.updateProfile');
      appLogger.error("Failed to update profile:", { error, appError });
      const errorMessage = getUserFriendlyErrorMessage(appError);
      setProfileUpdateError(errorMessage);
    } finally {
      setProfileUpdateLoading(false);
    }
  }, [profileFormData, userService]);

  // Change password
  const changePassword = useCallback(async () => {
    try {
      setPasswordUpdateLoading(true);
      setPasswordError("");
      setPasswordSuccess(false);

      // Validate password form with confirmation
      const passwordValidationSet = {
        currentPassword: [...VALIDATION_SETS.PASSWORD_CHANGE_FORM.currentPassword],
        newPassword: [...VALIDATION_SETS.PASSWORD_CHANGE_FORM.newPassword],
        confirmPassword: [
          ...VALIDATION_SETS.PASSWORD_CHANGE_FORM.confirmPassword,
          passwordConfirmation(passwordFormData.newPassword, "Passwords do not match")
        ]
      };

      const validationResults = validateForm(passwordFormData, passwordValidationSet);
      
      if (!isFormValid(validationResults)) {
        const firstError = Object.values(validationResults).find(result => !result.isValid);
        setPasswordError(firstError?.message || "Invalid password data");
        return;
      }

      const passwordRequest: ChangePasswordRequest = {
        currentPassword: passwordFormData.currentPassword,
        newPassword: passwordFormData.newPassword,
      };

      await userService.changePassword(passwordRequest);
      
      // Reset form on success
      setPasswordFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);
      
      appLogger.info("Password changed successfully");
    } catch (error) {
      const appError = handleError(error as Error, 'ProfileViewModel.changePassword');
      appLogger.error("Failed to change password:", { error, appError });
      const errorMessage = getUserFriendlyErrorMessage(appError);
      setPasswordError(errorMessage);
    } finally {
      setPasswordUpdateLoading(false);
    }
  }, [passwordFormData, userService]);

  // Form field handlers
  const updateProfileField = useCallback((field: keyof ProfileFormData, value: string) => {
    setProfileFormData(prev => ({ ...prev, [field]: value }));
    // Clear errors when user starts typing
    if (profileUpdateError) setProfileUpdateError("");
  }, [profileUpdateError]);

  const updatePasswordField = useCallback((field: keyof PasswordFormData, value: string) => {
    setPasswordFormData(prev => ({ ...prev, [field]: value }));
    // Clear errors when user starts typing
    if (passwordError) setPasswordError("");
  }, [passwordError]);

  const togglePasswordVisibility = useCallback((field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  }, []);

  // Load profile on mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    // Profile state
    profile,
    profileLoading,
    profileError,

    // Profile form
    profileFormData,
    profileUpdateLoading,
    profileSuccess,
    profileUpdateError,

    // Password form
    passwordFormData,
    passwordUpdateLoading,
    passwordSuccess,
    passwordError,
    showPasswords,

    // Actions
    fetchProfile,
    updateProfile,
    changePassword,
    updateProfileField,
    updatePasswordField,
    togglePasswordVisibility,

    // Computed
    isProfileFormValid: isFormValid(validateForm(profileFormData, VALIDATION_SETS.PROFILE_FORM)),
    isPasswordFormValid: isFormValid(validateForm(passwordFormData, VALIDATION_SETS.PASSWORD_CHANGE_FORM)),
  };
}
