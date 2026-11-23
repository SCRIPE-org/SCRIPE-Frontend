"use client";

import { useCallback, useState } from "react";
import { DEFAULT_PASSWORD_MAX_LENGTH } from "@core/common/password-policy";
import type { SetupTokenInfo } from "../../domain/entities";
import {
  computeAccountSetupPasswordEntropy,
  computeAccountSetupPasswordScore,
  evaluateAccountSetupPasswordChecks,
  validateAccountSetupCustomFields,
} from "../utils/account-setup-validation.utils";
import { useAccountSetupActions } from "./useAccountSetupActions";
import { useAccountSetupTokenLoader } from "./useAccountSetupTokenLoader";

/**
 * PageState defines the active lifecycle state of the account setup view:
 * - "loading": Token validation is currently in progress.
 * - "valid": The token is valid and the setup form is ready for input.
 * - "invalid": The token is invalid, expired, or missing.
 * - "activating": The administrator setup request is currently submitting.
 * - "success": The setup was completed successfully.
 * - "error": An error occurred during account activation.
 */
export type PageState = "loading" | "valid" | "invalid" | "activating" | "success" | "error";

/**
 * SetupStep represents the 4 discrete onboarding stages:
 * 1: Security (Password & Confirm Password, live policy meter, strength checks)
 * 2: Profile (First Name, Last Name, Phone, Avatar dropzone, verified email/username)
 * 3: Attributes & Compliance (Dynamic custom fields with encryption badges)
 * 4: Launch Celebration (Workspace activation summary & direct access CTA)
 */
export type SetupStep = 1 | 2 | 3 | 4;

/**
 * Custom ViewModel hook for SetupAccountView managing token validation,
 * 4-stage onboarding progression, live password policy checks, profile customization,
 * avatar upload validation, and compliance attributes submission.
 *
 * @param params Settings, active token, and localized validation messages.
 * @returns ViewModel state properties, input setters, and stage action callbacks.
 */
export function useAccountSetupViewModel(params: {
  token: string;
  isResolvingToken?: boolean;
  missingTokenMessage: string;
  invalidTokenMessage: string;
  validationFailedMessage: string;
  activationFailedMessage: string;
  activationUnexpectedMessage: string;
  passwordValidationMessages: {
    minLength: string;
    maxLength?: string;
    hasUpper: string;
    hasLower: string;
    hasNumber: string;
    hasSpecial: string;
    matches: string;
  };
  avatarInvalidTypeMessage?: string;
  avatarTooLargeMessage?: string;
  requiredFieldMessage?: string;
}) {
  const {
    token,
    isResolvingToken = false,
    missingTokenMessage,
    invalidTokenMessage,
    validationFailedMessage,
    activationFailedMessage,
    activationUnexpectedMessage,
    passwordValidationMessages,
    avatarInvalidTypeMessage,
    avatarTooLargeMessage,
    requiredFieldMessage,
  } = params;

  const [currentStep, setCurrentStep] = useState<SetupStep>(1);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [attributesTouched, setAttributesTouched] = useState(false);

  const handleProfileHydrated = useCallback((result: SetupTokenInfo) => {
    if (result.firstName) setFirstName(result.firstName);
    if (result.lastName) setLastName(result.lastName);
    if (result.phoneNumber) setPhoneNumber(result.phoneNumber);
    if (result.profileImageUrl) setProfileImageUrl(result.profileImageUrl);
  }, []);

  const loader = useAccountSetupTokenLoader({
    token,
    isResolvingToken,
    missingTokenMessage,
    invalidTokenMessage,
    validationFailedMessage,
    onProfileHydrated: handleProfileHydrated,
  });

  const passwordPolicyModel = loader.tokenData?.passwordPolicy ?? null;
  const isPasswordPolicyLoading = loader.pageState === "loading";
  const passwordPolicyError =
    loader.pageState === "valid" && !passwordPolicyModel ? validationFailedMessage : null;

  const passwordPolicy = {
    minLength: passwordPolicyModel?.minLength ?? 8,
    maxLength: passwordPolicyModel?.maxLength ?? DEFAULT_PASSWORD_MAX_LENGTH,
    requireUppercase: passwordPolicyModel?.requireUppercase ?? false,
    requireLowercase: passwordPolicyModel?.requireLowercase ?? false,
    requireNumber: passwordPolicyModel?.requireNumber ?? false,
    requireSpecial: passwordPolicyModel?.requireSpecial ?? false,
  };

  const passwordChecks = evaluateAccountSetupPasswordChecks(
    password,
    confirmPassword,
    passwordPolicy
  );
  const isPasswordValid =
    Boolean(passwordPolicyModel) && Object.values(passwordChecks).every(Boolean);
  const passwordScore = computeAccountSetupPasswordScore(passwordChecks, passwordPolicy);
  const passwordEntropy = computeAccountSetupPasswordEntropy(password);
  const isProfileValid = firstName.trim().length > 0;
  const customFieldErrors = validateAccountSetupCustomFields(
    loader.customFields,
    loader.customFieldValues,
    requiredFieldMessage
  );
  const isAttributesValid = Object.keys(customFieldErrors).length === 0;
  const hasCustomFields = loader.customFields.length > 0;
  const canProceedToNext =
    currentStep === 1
      ? isPasswordValid
      : currentStep === 2
        ? isProfileValid
        : currentStep === 3
          ? isAttributesValid
          : true;

  const actions = useAccountSetupActions({
    token,
    currentStep,
    setCurrentStep,
    setPageState: loader.setPageState,
    setErrorMessage: loader.setErrorMessage,
    setValidationErrors,
    password,
    confirmPassword,
    firstName,
    lastName,
    phoneNumber,
    profileImageUrl,
    setProfileImageUrl,
    setAvatarError,
    customFieldValues: loader.customFieldValues,
    hasCustomFields,
    setAttributesTouched,
    passwordChecks,
    passwordMinLength: passwordPolicy.minLength,
    passwordValidationMessages,
    isPasswordValid,
    isProfileValid,
    isAttributesValid,
    activationFailedMessage,
    activationUnexpectedMessage,
    avatarInvalidTypeMessage,
    avatarTooLargeMessage,
  });

  return {
    pageState: loader.pageState,
    setPageState: loader.setPageState,
    currentStep,
    setCurrentStep,
    tokenData: loader.tokenData,
    passwordPolicy: passwordPolicyModel,
    isPasswordPolicyLoading,
    passwordPolicyError,
    retryPasswordPolicy: loader.retryLoad,
    errorMessage: loader.errorMessage,
    validationErrors,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    showConfirm,
    setShowConfirm,
    passwordChecks,
    passwordScore,
    passwordEntropy,
    isPasswordValid,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    phoneNumber,
    setPhoneNumber,
    profileImageUrl,
    setProfileImageUrl,
    avatarError,
    isProfileValid,
    customFields: loader.customFields,
    isLoadingCustomFields: loader.isLoadingCustomFields,
    customFieldValues: loader.customFieldValues,
    setCustomFieldValue: loader.setCustomFieldValue,
    customFieldErrors,
    attributesTouched,
    setAttributesTouched,
    isAttributesValid,
    canProceedToNext,
    ...actions,
  };
}
