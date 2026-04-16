"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthLogin } from "@modules/auth/core/src/presentation/viewmodels/useAuthLogin";
import { useAppStore } from "@core/store/useAppStore";
import { useI18n } from "@core/providers/i18n-provider";
import { validateForm, VALIDATION_SETS, isFormValid } from "@core/common/validation";
import { secureTokenService } from "@core/common/secure-token-service";
import { TwoFactorRequiredError } from "@modules/auth/core/domain/errors/AuthErrors";
import { useServices } from "@core/providers/service-provider";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useNavigation } from "@core/providers/navigation-provider";
import { useQueryClient } from "@tanstack/react-query";
import { appLogger } from "@/core/common/logger";

export interface LoginFormData {
  username: string;
  password: string;
}

export type LoginStep = "credentials" | "two-factor";

export function useLoginViewModel() {
  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);

  // 2FA state
  const [loginStep, setLoginStep] = useState<LoginStep>("credentials");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);
  const [tenantId, setTenantId] = useState<string | undefined>(undefined);

  const loginMutation = useAuthLogin();
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const hasHydrated = useAppStore((state) => state._hasHydrated);
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";

  // Services for 2FA verification (same flow as login success)
  const { authRepository } = useServices();
  const setAuth = useAppStore((state) => state.setAuth);
  const { operationSuccess, operationError } = useEnhancedToast();
  const { refreshNavigation } = useNavigation();
  const queryClient = useQueryClient();

  // Track if redirect has been triggered to prevent loops
  const hasTriggeredRedirect = useRef(false);

  // Form field handlers
  const updateField = useCallback(
    (field: keyof LoginFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (error) setError("");
    },
    [error]
  );

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  // Helper to handle external vs internal redirects
  const handleRedirect = useCallback((path: string) => {
    if (path.startsWith("http://") || path.startsWith("https://")) {
      window.location.href = path;
    } else {
      router.replace(path);
    }
  }, [router]);

  // Check if user should be redirected (stable function - no deps that change)
  const checkAndRedirect = useCallback(() => {
    // Only proceed if store has hydrated
    if (!hasHydrated) return false;

    // Already redirecting or already triggered
    if (isRedirecting || hasTriggeredRedirect.current) return false;

    // Check BOTH conditions: store says authenticated AND actual token exists
    const hasToken = !!secureTokenService.getAccessToken();

    if (isAuthenticated && hasToken) {
      hasTriggeredRedirect.current = true;
      setIsRedirecting(true);
      handleRedirect(redirectPath);
      return true;
    }

    return false;
  }, [hasHydrated, isAuthenticated, isRedirecting, redirectPath, handleRedirect]);

  // Login submission handler
  const handleLogin = useCallback(async () => {
    // Validate form data
    const validationResults = validateForm(formData, VALIDATION_SETS.LOGIN_FORM);

    if (!isFormValid(validationResults)) {
      const firstError = Object.values(validationResults).find((result) => !result.isValid);
      setError(firstError?.message || t("auth.validationError"));
      return;
    }

    setError("");

    try {
      // Extract tenant code from URL for tenant-aware logout redirect
      const devTenantCode = typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("_tenant") ?? undefined
        : undefined;

      await loginMutation.mutateAsync({
        username: formData.username,
        password: formData.password,
        tenantId,
        tenantCode: devTenantCode,
      });

      // After successful login, redirect
      setIsRedirecting(true);
      if (!hasTriggeredRedirect.current) {
        hasTriggeredRedirect.current = true;

        // Small delay to ensure state is updated
        setTimeout(() => {
          handleRedirect(redirectPath);
        }, 100);
      }
    } catch (err: unknown) {
      // If 2FA is required, transition to the 2FA step
      if (err instanceof TwoFactorRequiredError) {
        setLoginStep("two-factor");
        setTwoFactorCode("");
        setError("");
        return;
      }
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
    }
  }, [formData, loginMutation, handleRedirect, redirectPath, t, tenantId]);

  // 2FA code verification handler
  const handleVerify2FA = useCallback(async () => {
    if (!twoFactorCode.trim()) {
      setError(t("auth.twoFactor.enterCode"));
      return;
    }

    setError("");
    setIsVerifying2FA(true);

    try {
      const result = await authRepository.verify2FA(
        formData.username,
        formData.password,
        twoFactorCode
      );
      const { user } = result;

      // Same flow as successful login
      setAuth(user, user.permissions || [], []);
      useAppStore.getState().setSubscriptionInfo(
        result.subscriptionStatus,
        result.gracePhase,
        result.editionName
      );
      useAppStore.getState().setMustChangePassword(result.mustChangePassword ?? false);

      operationSuccess(t("auth.welcomeBack"));

      try {
        await refreshNavigation(false, true);
      } catch (navError) {
        appLogger.error("Failed to fetch navigation after 2FA:", navError);
      }

      queryClient.invalidateQueries();

      setIsRedirecting(true);
      hasTriggeredRedirect.current = true;
      setTimeout(() => {
        router.replace(redirectPath);
      }, 100);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : t("auth.twoFactor.invalidCode");
      setError(errorMessage);
    } finally {
      setIsVerifying2FA(false);
    }
  }, [
    twoFactorCode,
    formData,
    authRepository,
    setAuth,
    operationSuccess,
    refreshNavigation,
    queryClient,
    router,
    t,
    operationError,
  ]);

  // Go back to credentials step
  const goBackToCredentials = useCallback(() => {
    setLoginStep("credentials");
    setTwoFactorCode("");
    setUseBackupCode(false);
    setError("");
  }, []);

  // Toggle between TOTP and backup code input
  const toggleBackupCode = useCallback(() => {
    setUseBackupCode((prev) => !prev);
    setTwoFactorCode("");
    setError("");
  }, []);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({ username: "", password: "" });
    setShowPassword(false);
    setError("");
    setIsRedirecting(false);
    setLoginStep("credentials");
    setTwoFactorCode("");
    setUseBackupCode(false);
    hasTriggeredRedirect.current = false;
  }, []);

  // Computed: should show loading while redirecting OR during login
  const isLoading = loginMutation.isPending || isRedirecting || isVerifying2FA;

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

    // 2FA state
    loginStep,
    twoFactorCode,
    setTwoFactorCode,
    useBackupCode,
    isVerifying2FA,

    // Actions
    updateField,
    togglePasswordVisibility,
    handleLogin,
    handleVerify2FA,
    goBackToCredentials,
    toggleBackupCode,
    checkAndRedirect,
    resetForm,
    setTenantId,

    // Computed
    isFormValid: isFormValid(validateForm(formData, VALIDATION_SETS.LOGIN_FORM)),
  };
}
