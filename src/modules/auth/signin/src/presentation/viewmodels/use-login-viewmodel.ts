"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthLogin } from "@modules/auth/core/src/presentation/viewmodels/useAuthLogin";
import { useAppStore } from "@core/store/useAppStore";
import { useI18n } from "@core/providers/i18n-provider";
import { validateForm, VALIDATION_SETS, isFormValid } from "@core/common/validation";
import { secureTokenService } from "@core/common/secure-token-service";
import { TwoFactorRequiredError, WorkspaceSelectionRequiredError, WorkspaceChoice } from "@modules/auth/core/domain/errors/AuthErrors";
import { useServices } from "@core/providers/service-provider";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useNavigation } from "@core/providers/navigation-provider";
import { useQueryClient } from "@tanstack/react-query";
import { appLogger } from "@/core/common/logger";

export interface LoginFormData {
  identifier: string;
  password: string;
}

export type LoginStep = "credentials" | "two-factor" | "workspace-selection";

export function useLoginViewModel() {
  const [formData, setFormData] = useState<LoginFormData>({
    identifier: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);

  // 2FA + workspace-selection state
  const [loginStep, setLoginStep] = useState<LoginStep>("credentials");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);
  const [tenantId, setTenantId] = useState<string | undefined>(undefined);
  const [availableWorkspaces, setAvailableWorkspaces] = useState<WorkspaceChoice[]>([]);

  // Ref to hold the LATEST resolved tenantId without triggering re-renders.
  // This eliminates the race condition where handleLogin captures a stale
  // tenantId value from useState before LoginView's useEffect can update it.
  const tenantIdRef = useRef<string | undefined>(undefined);

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
  const handleRedirect = useCallback(
    (path: string) => {
      if (path.startsWith("http://") || path.startsWith("https://")) {
        window.location.href = path;
      } else {
        router.replace(path);
      }
    },
    [router]
  );

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

      // If must change password, go directly to /change-password
      const mustChange = useAppStore.getState().mustChangePassword;
      const targetPath = mustChange ? "/change-password" : redirectPath;

      handleRedirect(targetPath);
      return true;
    }

    return false;
  }, [hasHydrated, isAuthenticated, isRedirecting, redirectPath, handleRedirect]);

  // Login submission handler
  // Accepts an optional tenantIdOverride to bypass the state-based race condition.
  // LoginView should always pass its resolved tenantId here directly.
  const handleLogin = useCallback(async (tenantIdOverride?: string) => {
    // Validate form data
    const validationResults = validateForm(formData, VALIDATION_SETS.LOGIN_FORM);

    if (!isFormValid(validationResults)) {
      const firstError = Object.values(validationResults).find((result) => !result.isValid);
      setError(firstError?.message || t("auth.validationError"));
      return;
    }

    setError("");

    // Resolve tenantId: prefer direct override, then ref, then state
    const resolvedTenantId = tenantIdOverride ?? tenantIdRef.current ?? tenantId;

    try {
      // Extract tenant code from URL for tenant-aware logout redirect
      const devTenantCode =
        typeof window !== "undefined"
          ? (new URLSearchParams(window.location.search).get("_tenant") ?? undefined)
          : undefined;

      await loginMutation.mutateAsync({
        identifier: formData.identifier,
        password: formData.password,
        tenantId: resolvedTenantId,
        tenantCode: devTenantCode,
      });

      // After successful login, redirect
      setIsRedirecting(true);
      if (!hasTriggeredRedirect.current) {
        hasTriggeredRedirect.current = true;

        // If must change password, go directly to /change-password
        // This prevents the home page from rendering or firing API requests
        const mustChange = useAppStore.getState().mustChangePassword;
        const targetPath = mustChange ? "/change-password" : redirectPath;

        // Small delay to ensure state is updated
        setTimeout(() => {
          handleRedirect(targetPath);
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
      // If the email belongs to multiple tenants, show the workspace picker
      if (err instanceof WorkspaceSelectionRequiredError) {
        setAvailableWorkspaces(err.availableWorkspaces);
        setLoginStep("workspace-selection");
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
        formData.identifier,
        formData.password,
        twoFactorCode,
        tenantId
      );
      const { user } = result;

      // Same flow as successful login
      setAuth(user, user.permissions || [], []);
      useAppStore
        .getState()
        .setSubscriptionInfo(result.subscriptionStatus, result.gracePhase, result.editionName);
      useAppStore.getState().setMustChangePassword(result.mustChangePassword ?? false);

      operationSuccess(t("auth.welcomeBack"));

      // Skip navigation & data fetch if user must change password first
      const mustChange = result.mustChangePassword ?? false;
      if (!mustChange) {
        try {
          await refreshNavigation(false, true);
        } catch (navError) {
          appLogger.error("Failed to fetch navigation after 2FA:", navError);
        }

        queryClient.invalidateQueries();
      }

      setIsRedirecting(true);
      hasTriggeredRedirect.current = true;

      // If must change password, go directly to /change-password
      const targetPath = mustChange ? "/change-password" : redirectPath;

      setTimeout(() => {
        router.replace(targetPath);
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
    tenantId,
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
    setAvailableWorkspaces([]);
    setError("");
    // Reset the redirect guard so a fresh login attempt can redirect normally
    hasTriggeredRedirect.current = false;
  }, []);

  /**
   * Select a workspace from the post-credential picker.
   *
   * For tenant workspaces   → hits CASE A (tenant-scoped login, issues JWT for that tenant)
   * For platform admin      → hits CASE A' (isPlatformAdmin = true, issues platform JWT)
   *                           WITHOUT isPlatformAdmin, backend re-runs CASE B → infinite loop!
   */
  const selectWorkspace = useCallback(
    async (workspace: WorkspaceChoice) => {
      // Guard: disabled cards (suspended tenant, deactivated account, setup pending)
      if (!workspace.isActivated || workspace.isDisabled) return;

      setError("");

      // For platform admin: no tenantId needed — flag the backend to authenticate directly
      const chosenTenantId = workspace.isPlatformAdmin ? undefined : workspace.tenantId;

      // Build the tenant code for logout redirect
      const tenantCode = workspace.isPlatformAdmin ? undefined : workspace.tenantCode;

      try {
        await loginMutation.mutateAsync({
          identifier: formData.identifier,
          password: formData.password,
          tenantId: chosenTenantId,
          tenantCode,
          // ★ CRITICAL: tell backend this is an explicit platform admin selection
          // Without this, backend sees tenantId=null → re-runs CASE B → workspace picker again → ∞
          isPlatformAdmin: workspace.isPlatformAdmin,
        });

        setIsRedirecting(true);
        if (!hasTriggeredRedirect.current) {
          hasTriggeredRedirect.current = true;
          const mustChange = useAppStore.getState().mustChangePassword;
          const targetPath = mustChange ? "/change-password" : redirectPath;
          setTimeout(() => handleRedirect(targetPath), 100);
        }
      } catch (err: unknown) {
        if (err instanceof TwoFactorRequiredError) {
          // CRITICAL: Persist the selected workspace's tenantId so handleVerify2FA
          // sends the 2FA verification to the correct tenant-scoped admin record.
          // Without this, tenantId would remain undefined (from URL resolution)
          // and the backend would look up the wrong admin.
          tenantIdRef.current = chosenTenantId;
          setTenantId(chosenTenantId);

          setLoginStep("two-factor");
          setTwoFactorCode("");
          setError("");
          return;
        }
        // WorkspaceSelectionRequiredError in this context means something went wrong
        // (the backend returned a discovery response instead of a token). Show a clear message.
        if (err instanceof WorkspaceSelectionRequiredError) {
          setError(t("auth.loginFailed"));
          return;
        }
        const errorMessage = err instanceof Error ? err.message : t("auth.loginFailed");
        setError(errorMessage);
      }
    },
    [formData, loginMutation, handleRedirect, redirectPath, t]
  );

  // Toggle between TOTP and backup code input
  const toggleBackupCode = useCallback(() => {
    setUseBackupCode((prev) => !prev);
    setTwoFactorCode("");
    setError("");
  }, []);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({ identifier: "", password: "" });
    setShowPassword(false);
    setError("");
    setIsRedirecting(false);
    setLoginStep("credentials");
    setTwoFactorCode("");
    setUseBackupCode(false);
    setAvailableWorkspaces([]);
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

    // 2FA + workspace selection state
    loginStep,
    twoFactorCode,
    setTwoFactorCode,
    useBackupCode,
    isVerifying2FA,
    availableWorkspaces,

    // Actions
    updateField,
    togglePasswordVisibility,
    handleLogin,
    handleVerify2FA,
    goBackToCredentials,
    toggleBackupCode,
    checkAndRedirect,
    resetForm,
    selectWorkspace,
    // Pass resolved tenantId into the ref immediately (no re-render needed)
    setTenantId: (id: string | undefined) => {
      tenantIdRef.current = id;
      setTenantId(id);
    },

    // Computed
    isFormValid: isFormValid(validateForm(formData, VALIDATION_SETS.LOGIN_FORM)),
  };
}
