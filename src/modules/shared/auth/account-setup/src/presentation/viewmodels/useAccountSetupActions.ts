/**
 * Action callbacks, avatar upload validation, stepper navigation, and final activation
 * submission hook for `useAccountSetupViewModel`.
 *
 * @module auth/account-setup/presentation/viewmodels
 */

"use client";

import { useCallback } from "react";
import { useServices } from "@core/providers/service-provider";
import type { PageState, SetupStep } from "./useAccountSetupViewModel";
import {
  collectPasswordValidationErrors,
  extractAccountSetupApiError,
  type AccountSetupPasswordChecks,
  type AccountSetupPasswordMessages,
} from "../utils/account-setup-validation.utils";

/** Parameters accepted by `useAccountSetupActions`. */
export interface UseAccountSetupActionsParams {
  token: string;
  currentStep: SetupStep;
  setCurrentStep: React.Dispatch<React.SetStateAction<SetupStep>>;
  setPageState: React.Dispatch<React.SetStateAction<PageState>>;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setValidationErrors: React.Dispatch<React.SetStateAction<string[]>>;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  profileImageUrl: string;
  setProfileImageUrl: React.Dispatch<React.SetStateAction<string>>;
  setAvatarError: React.Dispatch<React.SetStateAction<string | null>>;
  customFieldValues: Record<string, unknown>;
  hasCustomFields: boolean;
  setAttributesTouched: React.Dispatch<React.SetStateAction<boolean>>;
  passwordChecks: AccountSetupPasswordChecks;
  passwordMinLength: number;
  passwordValidationMessages: AccountSetupPasswordMessages;
  isPasswordValid: boolean;
  isProfileValid: boolean;
  isAttributesValid: boolean;
  activationFailedMessage: string;
  activationUnexpectedMessage: string;
  avatarInvalidTypeMessage?: string;
  avatarTooLargeMessage?: string;
}

/**
 * Provides avatar upload handlers, step navigation callbacks, retry handler,
 * and final account activation submission.
 */
export function useAccountSetupActions(params: UseAccountSetupActionsParams) {
  const { accountSetupRepository } = useServices();
  const {
    token,
    currentStep,
    setCurrentStep,
    setPageState,
    setErrorMessage,
    setValidationErrors,
    password,
    confirmPassword,
    firstName,
    lastName,
    phoneNumber,
    profileImageUrl,
    setProfileImageUrl,
    setAvatarError,
    customFieldValues,
    hasCustomFields,
    setAttributesTouched,
    passwordChecks,
    passwordMinLength,
    passwordValidationMessages,
    isPasswordValid,
    isProfileValid,
    isAttributesValid,
    activationFailedMessage,
    activationUnexpectedMessage,
    avatarInvalidTypeMessage = "Please select a valid image file (PNG, JPG, WEBP).",
    avatarTooLargeMessage = "Image size must be less than 2MB.",
  } = params;

  const handleAvatarUpload = useCallback(
    (file: File) => {
      setAvatarError(null);
      if (!file.type.startsWith("image/")) {
        setAvatarError(avatarInvalidTypeMessage);
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setAvatarError(avatarTooLargeMessage);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") setProfileImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    },
    [avatarInvalidTypeMessage, avatarTooLargeMessage, setAvatarError, setProfileImageUrl]
  );

  const removeAvatar = useCallback(() => {
    setProfileImageUrl("");
    setAvatarError(null);
  }, [setAvatarError, setProfileImageUrl]);

  const activate = useCallback(async () => {
    setValidationErrors([]);

    if (!isPasswordValid) {
      setCurrentStep(1);
      setValidationErrors(
        collectPasswordValidationErrors(
          passwordChecks,
          passwordMinLength,
          passwordValidationMessages
        )
      );
      return;
    }
    if (!isProfileValid) {
      setCurrentStep(2);
      return;
    }
    if (!isAttributesValid) {
      setAttributesTouched(true);
      setCurrentStep(3);
      return;
    }

    setPageState("activating");
    try {
      const result = await accountSetupRepository.activateAccount({
        token,
        password,
        confirmPassword,
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
        profileImageUrl: profileImageUrl.trim() || undefined,
        customFieldValues:
          Object.keys(customFieldValues).length > 0 ? customFieldValues : undefined,
      });

      if (result.success) {
        setPageState("success");
        setCurrentStep(4);
      } else {
        setPageState("error");
        setErrorMessage(result.error || result.errorMessage || activationFailedMessage);
      }
    } catch (err: unknown) {
      setPageState("error");
      setErrorMessage(extractAccountSetupApiError(err, activationUnexpectedMessage));
    }
  }, [
    accountSetupRepository,
    activationFailedMessage,
    activationUnexpectedMessage,
    confirmPassword,
    customFieldValues,
    firstName,
    isAttributesValid,
    isPasswordValid,
    isProfileValid,
    lastName,
    password,
    passwordChecks,
    passwordMinLength,
    passwordValidationMessages,
    phoneNumber,
    profileImageUrl,
    setAttributesTouched,
    setCurrentStep,
    setErrorMessage,
    setPageState,
    setValidationErrors,
    token,
  ]);

  const goToNextStep = useCallback(() => {
    setValidationErrors([]);
    if (currentStep === 1 && isPasswordValid) {
      setCurrentStep(2);
    } else if (currentStep === 2 && isProfileValid) {
      if (hasCustomFields) setCurrentStep(3);
      else void activate();
    } else if (currentStep === 3) {
      setAttributesTouched(true);
      if (isAttributesValid) void activate();
    }
  }, [
    activate,
    currentStep,
    hasCustomFields,
    isAttributesValid,
    isPasswordValid,
    isProfileValid,
    setAttributesTouched,
    setCurrentStep,
    setValidationErrors,
  ]);

  const goToPrevStep = useCallback(() => {
    setValidationErrors([]);
    if (currentStep > 1 && currentStep < 4) setCurrentStep((s) => (s - 1) as SetupStep);
  }, [currentStep, setCurrentStep, setValidationErrors]);

  const goToStep = useCallback(
    (step: SetupStep) => {
      if (step === 1) setCurrentStep(1);
      else if (step === 2 && isPasswordValid) setCurrentStep(2);
      else if (step === 3 && isPasswordValid && isProfileValid && hasCustomFields) {
        setCurrentStep(3);
      }
    },
    [hasCustomFields, isPasswordValid, isProfileValid, setCurrentStep]
  );

  const retry = useCallback(() => {
    setErrorMessage("");
    setPageState("valid");
  }, [setErrorMessage, setPageState]);

  return {
    handleAvatarUpload,
    removeAvatar,
    activate,
    goToNextStep,
    goToPrevStep,
    goToStep,
    retry,
  };
}
