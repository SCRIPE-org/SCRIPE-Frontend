"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthLogin } from "@modules/auth/core/src/presentation/viewmodels/useAuthLogin";
import { useAppStore } from "@core/store/useAppStore";
import { useI18n } from "@core/providers/i18n-provider";
import { validateForm, VALIDATION_SETS, isFormValid } from "@core/common/validation";
import { secureTokenService } from "@core/common/secure-token-service";
import {
  TwoFactorRequiredError,
  WorkspaceSelectionRequiredError,
} from "@modules/auth/core/domain/errors/AuthErrors";
import type { WorkspaceChoice } from "@modules/auth/core/domain/errors/AuthErrors";
import { use2FAHandler } from "./use2FAHandler";
import { useWorkspaceSelector } from "./useWorkspaceSelector";
import { useMagicLinkHandler } from "./useMagicLinkHandler";
import { getAuthContainer } from "@modules/auth/di";

/**
 * Interface defining property specifications, keys types, and structural contract rules for login form data.
 */
export interface LoginFormData {
  identifier: string;
  password: string;
  staySignedIn: boolean;
}

/**
 * Exported type defining parameters and fields for login step configurations.
 */
export type LoginStep =
  | "credentials"
  | "two-factor"
  | "workspace-selection"
  | "magic-link-request"
  | "magic-link-sent"
  | "phone-otp"
  | "passkey"
  | "qr-login";

/**
 * React hook/ViewModel orchestrating state and data flows for login view model.
 * Handles active states updates, form fields validations, and browser navigation controllers.
 */
export function useLoginViewModel() {
  const [formData, setFormData] = useState<LoginFormData>({
    identifier: "",
    password: "",
    staySignedIn: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [shakeKey, setShakeKey] = useState(0);
  // Atomically sets error + bumps shake animation key
  const setErrorWithShake = useCallback((msg: string) => {
    setError(msg);
    if (msg) setShakeKey((k) => k + 1);
  }, []);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [loginStep, setLoginStep] = useState<LoginStep>("credentials");
  const [tenantId, setTenantIdState] = useState<string | undefined>(undefined);

  // Ref holds LATEST resolved tenantId without triggering re-renders — eliminates
  // the race condition where handleLogin captures a stale tenantId before LoginView's
  // useEffect can update it.
  const tenantIdRef = useRef<string | undefined>(undefined);
  const hasTriggeredRedirect = useRef(false);

  // 🔒 Guard: clear stale impersonation flags on login page mount.
  // Runs once in the ViewModel (data-layer concern) — never in the View.
  useEffect(() => {
    getAuthContainer().authRepository.clearSessionOnLoginMount();
  }, []);

  const loginMutation = useAuthLogin();
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const hasHydrated = useAppStore((state) => state._hasHydrated);
  // Backend-authoritative redirect path (stored after login by useAuthLogin)
  const backendRedirectPath = useAppStore((state) => state.defaultRedirectPath);
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  // URL ?redirect= param overrides backend path (deep-link scenario)
  const rawRedirect = searchParams.get("redirect") || backendRedirectPath;
  const redirectPath = !rawRedirect || rawRedirect === "/" ? "/overview" : rawRedirect;

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

  const setTenantId = useCallback((id: string | undefined) => {
    tenantIdRef.current = id;
    setTenantIdState(id);
  }, []);

  // ── 2FA handler ─────────────────────────────────────────────────────────
  const twoFA = use2FAHandler({
    redirectPath,
    formIdentifier: formData.identifier,
    formPassword: formData.password,
    tenantId: tenantId,
    setLoginStep,
    setError,
    hasTriggeredRedirect,
  });

  // ── Workspace selector ────────────────────────────────────────────────────
  const workspaceSelector = useWorkspaceSelector({
    redirectPath,
    formIdentifier: formData.identifier,
    formPassword: formData.password,
    loginMutateAsync: (params) => loginMutation.mutateAsync(params),
    setIsRedirecting,
    setLoginStep,
    setError,
    setTenantId,
    hasTriggeredRedirect,
    handleRedirect,
    enterTwoFactor: twoFA.enterTwoFactor,
    onTenantResolved: (id) => {
      tenantIdRef.current = id;
    },
  });

  // ── Magic link handler ─────────────────────────────────────────────────
  const magicLink = useMagicLinkHandler({
    setLoginStep,
    setError,
  });

  // ── Auth redirect check ────────────────────────────────────────────────
  const checkAndRedirect = useCallback(() => {
    if (!hasHydrated) return false;
    if (isRedirecting || hasTriggeredRedirect.current) return false;
    const hasToken = !!secureTokenService.getAccessToken();
    if (isAuthenticated && hasToken) {
      hasTriggeredRedirect.current = true;
      setIsRedirecting(true);
      const mustChange = useAppStore.getState().mustChangePassword;
      handleRedirect(mustChange ? "/change-password" : redirectPath);
      return true;
    }
    return false;
  }, [hasHydrated, isAuthenticated, isRedirecting, redirectPath, handleRedirect]);

  // ── Login submission ────────────────────────────────────────────────────
  const handleLogin = useCallback(
    async (tenantIdOverride?: string) => {
      const validationResults = validateForm(formData, VALIDATION_SETS.LOGIN_FORM);
      if (!isFormValid(validationResults)) {
        const firstError = Object.values(validationResults).find((r) => !r.isValid);
        setErrorWithShake(firstError?.message || t("auth.validationError"));
        return;
      }

      setError("");
      const resolvedTenantId = tenantIdOverride ?? tenantIdRef.current ?? tenantId;

      try {
        const rawDevCode =
          typeof window !== "undefined"
            ? (new URLSearchParams(window.location.search).get("_tenant") ?? undefined)
            : undefined;
        const devTenantCode = rawDevCode ? rawDevCode.toUpperCase() : undefined;

        await loginMutation.mutateAsync({
          identifier: formData.identifier,
          password: formData.password,
          tenantId: resolvedTenantId,
          tenantCode: devTenantCode,
          staySignedIn: formData.staySignedIn,
        });

        setIsRedirecting(true);
        if (!hasTriggeredRedirect.current) {
          hasTriggeredRedirect.current = true;
          const mustChange = useAppStore.getState().mustChangePassword;
          // Use requestAnimationFrame to ensure Zustand store persistence flush completes
          // before navigation, preventing RouteGuard from seeing stale state.
          requestAnimationFrame(() => {
            handleRedirect(mustChange ? "/change-password" : redirectPath);
          });
        }
      } catch (err: unknown) {
        // instanceof + name fallback: some bundlers break Error prototype chains
        if (
          err instanceof TwoFactorRequiredError ||
          (err instanceof Error && err.name === "TwoFactorRequiredError")
        ) {
          twoFA.enterTwoFactor();
          return;
        }
        if (
          err instanceof WorkspaceSelectionRequiredError ||
          (err instanceof Error && err.name === "WorkspaceSelectionRequiredError") ||
          // Ultimate duck-typing fallback: if it has availableWorkspaces array, it IS a workspace selection error
          (err instanceof Error &&
            "availableWorkspaces" in err &&
            Array.isArray((err as any).availableWorkspaces))
        ) {
          const workspaces =
            (err as WorkspaceSelectionRequiredError).availableWorkspaces ??
            ((err as any).availableWorkspaces as WorkspaceChoice[]);
          workspaceSelector.showWorkspaces(workspaces);
          return;
        }
        setErrorWithShake(err instanceof Error ? err.message : "Login failed");
      }
    },
    [
      formData,
      loginMutation,
      handleRedirect,
      redirectPath,
      t,
      tenantId,
      twoFA,
      workspaceSelector,
      setErrorWithShake,
    ]
  );

  // ── Form helpers ───────────────────────────────────────────────────────
  const updateField = useCallback(
    (field: keyof LoginFormData, value: string | boolean) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (error) setError("");
    },
    [error]
  );

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const goBackToCredentials = useCallback(() => {
    setLoginStep("credentials");
    twoFA.reset2FA();
    workspaceSelector.clearWorkspaces();
    setError("");
    hasTriggeredRedirect.current = false;
  }, [twoFA, workspaceSelector]);

  const resetForm = useCallback(() => {
    setFormData({ identifier: "", password: "", staySignedIn: false });
    setShowPassword(false);
    setError("");
    setIsRedirecting(false);
    setLoginStep("credentials");
    twoFA.reset2FA();
    workspaceSelector.clearWorkspaces();
    hasTriggeredRedirect.current = false;
  }, [twoFA, workspaceSelector]);

  const isLoading = loginMutation.isPending || isRedirecting || twoFA.isVerifying2FA;
  const isTrulyAuthenticated = hasHydrated && isAuthenticated && secureTokenService.hasToken();

  return {
    formData,
    showPassword,
    isLoading,
    error,
    shakeKey,
    isAuthenticated: isTrulyAuthenticated,
    hasHydrated,
    isRedirecting,
    loginStep,
    twoFactorCode: twoFA.twoFactorCode,
    setTwoFactorCode: twoFA.setTwoFactorCode,
    useBackupCode: twoFA.useBackupCode,
    isVerifying2FA: twoFA.isVerifying2FA,
    availableWorkspaces: workspaceSelector.availableWorkspaces,
    updateField,
    togglePasswordVisibility,
    handleLogin,
    handleVerify2FA: twoFA.handleVerify2FA,
    goBackToCredentials,
    toggleBackupCode: twoFA.toggleBackupCode,
    checkAndRedirect,
    resetForm,
    selectWorkspace: workspaceSelector.selectWorkspace,
    unlockWorkspace: workspaceSelector.unlockWorkspace,
    setTenantId,
    isFormValid: isFormValid(validateForm(formData, VALIDATION_SETS.LOGIN_FORM)),
    // Magic link
    requestMagicLink: magicLink.requestMagicLink,
    resendMagicLink: magicLink.resendMagicLink,
    magicLinkEmail: magicLink.magicLinkEmail,
    resetMagicLink: magicLink.resetMagicLink,
    isMagicLinkSending: magicLink.isSending,
    // Auth method switching
    setLoginStep,
  };
}
