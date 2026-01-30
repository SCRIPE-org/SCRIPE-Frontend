"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@core/providers/auth-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { handleError, getUserFriendlyErrorMessage } from "@core/common/error-handler";
import { appLogger } from "@core/common/logger";
import { AuthMapper } from "../../../../core/data/mappers/AuthMapper";
import { validateForm, VALIDATION_SETS, isFormValid } from "@core/common/validation";

export interface LoginFormData {
  username: string;
  password: string;
}

export function useLoginViewModel() {
  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { login, isAuthenticated } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  // Form field handlers
  const updateField = useCallback((field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (error) setError("");
  }, [error]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // Login submission handler
  const handleLogin = useCallback(async () => {
    // Validate form data
    const validationResults = validateForm(formData, VALIDATION_SETS.LOGIN_FORM);

    if (!isFormValid(validationResults)) {
      // Get the first validation error
      const firstError = Object.values(validationResults).find(result => !result.isValid);
      setError(firstError?.message || t("auth.validationError"));
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Create domain model for login request using mapper
      const loginRequest = AuthMapper.loginRequestFromJson({
        username: formData.username,
        password: formData.password
      });

      await login(formData.username, formData.password);

      // Small delay to ensure auth state is properly updated
      setTimeout(() => {
        router.replace("/");
      }, 100);
    } catch (error) {
      const appError = handleError(error as Error, 'Login');
      appLogger.error("Login failed:", { error, appError });
      const errorMessage = getUserFriendlyErrorMessage(appError);
      setError(errorMessage);
      // Error is displayed inline above the form fields, no page reload
    } finally {
      setIsLoading(false);
    }
  }, [formData.username, formData.password, login, router, t]);

  // Navigation handler for authenticated users
  const redirectIfAuthenticated = useCallback(() => {
    if (isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, router]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({ username: "", password: "" });
    setShowPassword(false);
    setError("");
  }, []);

  return {
    // State
    formData,
    showPassword,
    isLoading,
    error,
    isAuthenticated,

    // Actions
    updateField,
    togglePasswordVisibility,
    handleLogin,
    redirectIfAuthenticated,
    resetForm,

    // Computed
    isFormValid: isFormValid(validateForm(formData, VALIDATION_SETS.LOGIN_FORM)),
  };
}
