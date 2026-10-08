/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getAuthContainer } from "@modules/auth/di";
import type { SetupTokenInfo, SetupCustomField } from "../../domain/entities";

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
 * useAccountSetupViewModel is the custom presentation hook / ViewModel for SetupAccountView.
 * It manages token validation, 4-stage stepper navigation, live password strength,
 * administrator profile customization, avatar uploads, and dynamic compliance attributes.
 *
 * @param params Settings, active token, and localized validation messages.
 * @returns ViewModel state properties, user credentials input binding, and trigger callbacks.
 */
export function useAccountSetupViewModel(params: {
  token: string;
  missingTokenMessage: string;
  invalidTokenMessage: string;
  validationFailedMessage: string;
  activationFailedMessage: string;
  activationUnexpectedMessage: string;
  passwordValidationMessages: {
    minLength: string;
    hasUpper: string;
    hasLower: string;
    hasNumber: string;
    hasSpecial: string;
    matches: string;
  };
}) {
  const {
    token,
    missingTokenMessage,
    invalidTokenMessage,
    validationFailedMessage,
    activationFailedMessage,
    activationUnexpectedMessage,
    passwordValidationMessages,
  } = params;

  // ── Lifecycle & Stepper State ──
  const [pageState, setPageState] = useState<PageState>(!token ? "invalid" : "loading");
  const [currentStep, setCurrentStep] = useState<SetupStep>(1);
  const [tokenData, setTokenData] = useState<SetupTokenInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>(!token ? missingTokenMessage : "");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // ── Stage 1: Security State ──
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ── Stage 2: Profile State ──
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [avatarError, setAvatarError] = useState<string | null>(null);

  // ── Stage 3: Attributes & Compliance State ──
  const [customFields, setCustomFields] = useState<SetupCustomField[]>([]);
  const [isLoadingCustomFields, setIsLoadingCustomFields] = useState(false);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, unknown>>({});

  // ── Password Policy Constraints ──
  const passwordMinLength = tokenData?.passwordMinLength ?? 8;
  const passwordRequireUppercase = tokenData?.passwordRequireUppercase !== false;
  const passwordRequireNumber = tokenData?.passwordRequireNumber !== false;
  const passwordRequireSpecial = tokenData?.passwordRequireSpecial === true;

  const passwordChecks = useMemo(
    () => ({
      minLength: password.length >= passwordMinLength,
      hasUpper: passwordRequireUppercase ? /[A-Z]/.test(password) : true,
      hasLower: /[a-z]/.test(password),
      hasNumber: passwordRequireNumber ? /\d/.test(password) : true,
      hasSpecial: passwordRequireSpecial ? /[^A-Za-z0-9]/.test(password) : true,
      matches: password === confirmPassword && confirmPassword.length > 0,
    }),
    [
      confirmPassword,
      password,
      passwordMinLength,
      passwordRequireNumber,
      passwordRequireSpecial,
      passwordRequireUppercase,
    ]
  );

  const isPasswordValid = useMemo(
    () => Object.values(passwordChecks).every(Boolean),
    [passwordChecks]
  );

  const passwordScore = useMemo(() => {
    let passed = 0;
    let total = 0;
    total++;
    if (passwordChecks.minLength) passed++;
    total++;
    if (passwordChecks.hasLower) passed++;
    if (passwordRequireUppercase) {
      total++;
      if (passwordChecks.hasUpper) passed++;
    }
    if (passwordRequireNumber) {
      total++;
      if (passwordChecks.hasNumber) passed++;
    }
    if (passwordRequireSpecial) {
      total++;
      if (passwordChecks.hasSpecial) passed++;
    }
    total++;
    if (passwordChecks.matches) passed++;
    return Math.round((passed / total) * 100);
  }, [passwordChecks, passwordRequireNumber, passwordRequireSpecial, passwordRequireUppercase]);

  const passwordEntropy = useMemo(() => {
    if (!password) return 0;
    let pool = 0;
    if (/[a-z]/.test(password)) pool += 26;
    if (/[A-Z]/.test(password)) pool += 26;
    if (/\d/.test(password)) pool += 10;
    if (/[^A-Za-z0-9]/.test(password)) pool += 32;
    if (pool === 0) return 0;
    return password.length * Math.log2(pool);
  }, [password]);

  // ── Profile Validation ──
  const isProfileValid = useMemo(() => firstName.trim().length > 0, [firstName]);

  // ── Stage 3: Attributes & Compliance State ──
  const [attributesTouched, setAttributesTouched] = useState(false);

  // ── Attributes Field-Level Errors & Overall Validity ──
  const customFieldErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    for (const field of customFields) {
      if (field.isRequired) {
        const val = customFieldValues[field.key];
        const isEmpty =
          val === undefined ||
          val === null ||
          (typeof val === "string" && val.trim() === "") ||
          (Array.isArray(val) && val.length === 0);

        if (isEmpty) {
          errors[field.key] = "This field is required";
        }
      }
    }
    return errors;
  }, [customFields, customFieldValues]);

  const isAttributesValid = useMemo(() => {
    return Object.keys(customFieldErrors).length === 0;
  }, [customFieldErrors]);

  // ── Avatar Photo Handler ──
  const handleAvatarUpload = useCallback((file: File) => {
    setAvatarError(null);
    if (!file.type.startsWith("image/")) {
      setAvatarError("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError("Image size must be less than 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setProfileImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const removeAvatar = useCallback(() => {
    setProfileImageUrl("");
    setAvatarError(null);
  }, []);

  // ── Custom Field Value Mutator ──
  const setCustomFieldValue = useCallback((key: string, value: unknown) => {
    setCustomFieldValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  // ── Token Validation & Setup Context Fetch ──
  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    async function validate() {
      try {
        const result = await getAuthContainer().accountSetupRepository.validateToken(token);
        if (cancelled) return;

        if (result.isValid) {
          setTokenData(result);
          if (result.firstName) setFirstName(result.firstName);
          if (result.lastName) setLastName(result.lastName);
          if (result.phoneNumber) setPhoneNumber(result.phoneNumber);
          if (result.profileImageUrl) setProfileImageUrl(result.profileImageUrl);
          setPageState("valid");

          // Load active custom fields for identity.admin
          try {
            setIsLoadingCustomFields(true);
            const fields = await getAuthContainer().accountSetupRepository.getCustomFields(token);
            if (cancelled) return;
            setCustomFields(fields || []);
            const initialVals: Record<string, unknown> = {};
            for (const f of fields || []) {
              if (f.currentValue !== undefined && f.currentValue !== null) {
                initialVals[f.key] = f.currentValue;
              }
            }
            setCustomFieldValues(initialVals);
          } catch (fieldErr) {
            console.warn("Failed to fetch setup custom fields:", fieldErr);
          } finally {
            if (!cancelled) setIsLoadingCustomFields(false);
          }
        } else {
          setPageState("invalid");
          setErrorMessage(result.error || result.errorMessage || invalidTokenMessage);
        }
      } catch (err: unknown) {
        if (cancelled) return;
        const details = (
          err as { details?: { error?: string; message?: string; errorMessage?: string } }
        )?.details;
        setPageState("invalid");
        setErrorMessage(
          details?.error || details?.errorMessage || details?.message || validationFailedMessage
        );
      }
    }

    validate();
    return () => {
      cancelled = true;
    };
  }, [invalidTokenMessage, token, validationFailedMessage]);

  // ── Final Activation Handler ──
  const activate = useCallback(async () => {
    setValidationErrors([]);

    if (!isPasswordValid) {
      setCurrentStep(1);
      const errors: string[] = [];
      const minLengthVal = tokenData?.passwordMinLength ?? 8;
      if (!passwordChecks.minLength) {
        errors.push(passwordValidationMessages.minLength.replace("{{min}}", String(minLengthVal)));
      }
      if (!passwordChecks.hasUpper) errors.push(passwordValidationMessages.hasUpper);
      if (!passwordChecks.hasLower) errors.push(passwordValidationMessages.hasLower);
      if (!passwordChecks.hasNumber) errors.push(passwordValidationMessages.hasNumber);
      if (!passwordChecks.hasSpecial) errors.push(passwordValidationMessages.hasSpecial);
      if (!passwordChecks.matches) errors.push(passwordValidationMessages.matches);
      setValidationErrors(errors);
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
      const result = await getAuthContainer().accountSetupRepository.activateAccount({
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
      const details = (
        err as { details?: { error?: string; message?: string; errorMessage?: string } }
      )?.details;
      setPageState("error");
      setErrorMessage(
        details?.error || details?.errorMessage || details?.message || activationUnexpectedMessage
      );
    }
  }, [
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
    token,
  ]);

  // ── Stepper Navigation ──
  const canProceedToNext = useMemo(() => {
    if (currentStep === 1) return isPasswordValid;
    if (currentStep === 2) return isProfileValid;
    if (currentStep === 3) return isAttributesValid;
    return true;
  }, [currentStep, isPasswordValid, isProfileValid, isAttributesValid]);

  const hasCustomFields = customFields.length > 0;

  const goToNextStep = useCallback(() => {
    setValidationErrors([]);
    if (currentStep === 1) {
      if (!isPasswordValid) return;
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!isProfileValid) return;
      if (hasCustomFields) {
        setCurrentStep(3);
      } else {
        void activate();
      }
    } else if (currentStep === 3) {
      setAttributesTouched(true);
      if (!isAttributesValid) return;
      void activate();
    }
  }, [currentStep, isPasswordValid, isProfileValid, hasCustomFields, isAttributesValid, activate]);

  const goToPrevStep = useCallback(() => {
    setValidationErrors([]);
    if (currentStep > 1 && currentStep < 4) {
      setCurrentStep((s) => (s - 1) as SetupStep);
    }
  }, [currentStep]);

  const goToStep = useCallback(
    (step: SetupStep) => {
      if (step === 1) {
        setCurrentStep(1);
      } else if (step === 2 && isPasswordValid) {
        setCurrentStep(2);
      } else if (step === 3 && isPasswordValid && isProfileValid && hasCustomFields) {
        setCurrentStep(3);
      }
    },
    [isPasswordValid, isProfileValid, hasCustomFields]
  );

  const retry = useCallback(() => {
    setErrorMessage("");
    setPageState("valid");
  }, []);

  return {
    pageState,
    setPageState,
    currentStep,
    setCurrentStep,
    tokenData,
    errorMessage,
    validationErrors,

    // Step 1: Security
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

    // Step 2: Profile
    firstName,
    setFirstName,
    lastName,
    setLastName,
    phoneNumber,
    setPhoneNumber,
    profileImageUrl,
    setProfileImageUrl,
    avatarError,
    handleAvatarUpload,
    removeAvatar,
    isProfileValid,

    // Step 3: Custom Fields
    customFields,
    isLoadingCustomFields,
    customFieldValues,
    setCustomFieldValue,
    customFieldErrors,
    attributesTouched,
    setAttributesTouched,
    isAttributesValid,

    // Stepper Navigation
    canProceedToNext,
    goToNextStep,
    goToPrevStep,
    goToStep,

    // Execution
    activate,
    retry,
  };
}
