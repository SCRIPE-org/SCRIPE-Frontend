"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthLogin } from "../../../../hooks/useAuthLogin";
import { useAppStore } from "@core/store/useAppStore";
import { useI18n } from "@core/providers/i18n-provider";
import { validateForm, VALIDATION_SETS, isFormValid } from "@core/common/validation";
import { secureTokenService } from "@core/common/secure-token-service";

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
  const [isRedirecting, setIsRedirecting] = useState(false);

  const loginMutation = useAuthLogin();
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const hasHydrated = useAppStore((state) => state._hasHydrated);
  const { t } = useI18n();
  const router = useRouter();

  // Track if redirect has been triggered to prevent loops
  const hasTriggeredRedirect = useRef(false);

  // Form field handlers
  const updateField = useCallback((field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError("");
  }, [error]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // Check if user should be redirected (stable function - no deps that change)
  const checkAndRedirect = useCallback(() => {
    // Only proceed if store has hydrated
    if (!hasHydrated) return false;

    // Already redirecting or already triggered
    if (isRedirecting || hasTriggeredRedirect.current) return false;

    // Check BOTH conditions: store says authenticated AND actual token exists
    const hasToken = secureTokenService.hasToken();

    if (isAuthenticated && hasToken) {
      hasTriggeredRedirect.current = true;
      setIsRedirecting(true);
      router.replace("/");
      return true;
    }

    return false;
  }, [hasHydrated, isAuthenticated, isRedirecting, router]);

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

      // After successful login, redirect
      setIsRedirecting(true);
      hasTriggeredRedirect.current = true;

      // Small delay to ensure state is updated
      setTimeout(() => {
        router.replace("/");
      }, 100);

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
    }
  }, [formData, loginMutation, router, t]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({ username: "", password: "" });
    setShowPassword(false);
    setError("");
    setIsRedirecting(false);
    hasTriggeredRedirect.current = false;
  }, []);

  // Computed: should show loading while redirecting OR during login
  const isLoading = loginMutation.isPending || isRedirecting;

  // Computed: is truly authenticated (both store and token)
  const isTrulyAuthenticated = hasHydrated && isAuthenticated && secureTokenService.hasToken();

  return {
    // State
    formData,
    showPassword,
    isLoading,
    error,
    isAuthenticated: isTrulyAuthenticated,
    hasHydrated,
    isRedirecting,

    // Actions
    updateField,
    togglePasswordVisibility,
    handleLogin,
    checkAndRedirect,
    resetForm,

    // Computed
    isFormValid: isFormValid(validateForm(formData, VALIDATION_SETS.LOGIN_FORM)),
  };
}
