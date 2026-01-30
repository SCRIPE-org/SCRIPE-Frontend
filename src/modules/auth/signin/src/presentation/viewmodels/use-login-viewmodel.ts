"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthLogin } from "../../../../hooks/useAuthLogin";
import { useAppStore } from "@core/store/useAppStore";
import { useI18n } from "@core/providers/i18n-provider";
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
  const [error, setError] = useState("");

  const loginMutation = useAuthLogin();
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const { t } = useI18n();
  const router = useRouter();

  // Form field handlers
  const updateField = useCallback((field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      const firstError = Object.values(validationResults).find(result => !result.isValid);
      setError(firstError?.message || t("auth.validationError"));
      return;
    }

    setError("");

    try {
      await loginMutation.mutateAsync({
        username: formData.username,
        password: formData.password
      });

      // Redirect handled by onSuccess in useAuthLogin? 
      // Actually useAuthLogin only sets user. RouteGuard or this ViewModel should redirect.
      // The original had a small delay then redirect.

      setTimeout(() => {
        router.replace("/");
      }, 100);

    } catch (err: any) {
      // Error handling is also done in mutation onError, but we set local error state for inline display
      setError(err?.message || "Login failed");
    }
  }, [formData, loginMutation, router, t]);

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
    isLoading: loginMutation.isPending,
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
