"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useAuthLogin } from "@modules/auth/core/src/presentation/viewmodels/useAuthLogin";
import { useI18n } from "@core/providers/i18n-provider";
import { useServices } from "@core/providers/service-provider";
import { buildAuthContextUrl } from "@core/common/redirect-safety";
import { validateForm, VALIDATION_SETS, isFormValid } from "@core/common/validation";
import { secureTokenService } from "@core/common/secure-token-service";
import { use2FAHandler } from "./use2FAHandler";
import { useWorkspaceSelector } from "./useWorkspaceSelector";
import { useMagicLinkHandler } from "./useMagicLinkHandler";
import { useLoginRedirect } from "./useLoginRedirect";
import { classifyLoginError, resolveDevTenantCode } from "../utils/login-error.utils";
import { resolveSsoErrorOutcome } from "../utils/ssoCallbackHandlers";
import type { LoginFormData, LoginStep } from "../types/loginTypes";

/** Re-exported login form and step types for signin consumers. */
export type { LoginFormData, LoginStep };

/**
 * React hook/ViewModel orchestrating state and data flows for login view model.
 * Handles active states updates, form fields validations, and browser navigation controllers.
 */
export function useLoginViewModel() {
  const searchParams = useSearchParams();
  const queryEmail = searchParams?.get("email")?.trim() || "";
  const queryResetSuccess = searchParams?.get("reset") === "success";
  const querySsoErrorRaw = searchParams?.get("error") ?? searchParams?.get("error_code") ?? "";
  const queryTenant = searchParams?.get("_tenant")?.trim() || undefined;
  const queryRedirect = searchParams?.get("redirect") || null;

  const [formData, setFormData] = useState<LoginFormData>(() => ({
    identifier: queryEmail,
    password: "",
    staySignedIn: false,
  }));
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [shakeKey, setShakeKey] = useState(0);
  const [loginStep, setLoginStep] = useState<LoginStep>("credentials");
  const [tenantId, setTenantIdState] = useState<string | undefined>(undefined);
  const [isAccountNotActivated, setIsAccountNotActivated] = useState(false);
  const [accountNotActivatedMessage, setAccountNotActivatedMessage] = useState("");
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [isPasswordResetSuccess, setIsPasswordResetSuccess] = useState(queryResetSuccess);
  const [isBreakGlassExpanded, setIsBreakGlassExpanded] = useState(false);
  const appliedQueryErrorRef = useRef<string | null>(null);

  const tenantIdRef = useRef<string | undefined>(undefined);
  const loginMutation = useAuthLogin();
  const { t } = useI18n();
  const { authRepository } = useServices();
  const authRepositoryRef = useRef(authRepository);
  authRepositoryRef.current = authRepository;
  const redirect = useLoginRedirect();

  const setErrorWithShake = useCallback((msg: string) => {
    setError(msg);
    if (msg) setShakeKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  useEffect(() => {
    authRepositoryRef.current?.clearSessionOnLoginMount?.();
  }, []);

  useEffect(() => {
    if (queryResetSuccess) {
      setIsPasswordResetSuccess(true);
    }
  }, [queryResetSuccess]);

  useEffect(() => {
    if (!querySsoErrorRaw) return;
    if (appliedQueryErrorRef.current === querySsoErrorRaw) return;
    appliedQueryErrorRef.current = querySsoErrorRaw;
    setError(resolveSsoErrorOutcome(querySsoErrorRaw, t).message);
  }, [querySsoErrorRaw, t]);

  const setTenantId = useCallback((id: string | undefined) => {
    tenantIdRef.current = id;
    setTenantIdState(id);
  }, []);

  const twoFA = use2FAHandler({
    redirectPath: redirect.redirectPath,
    formIdentifier: formData.identifier,
    formPassword: formData.password,
    staySignedIn: formData.staySignedIn,
    tenantId,
    setLoginStep,
    setError,
    onRedirectTriggered: redirect.onRedirectTriggered,
  });

  const workspaceSelector = useWorkspaceSelector({
    redirectPath: redirect.redirectPath,
    formIdentifier: formData.identifier,
    formPassword: formData.password,
    loginMutateAsync: (params) => loginMutation.mutateAsync(params),
    setIsRedirecting: redirect.setIsRedirecting,
    setLoginStep,
    setError,
    setTenantId,
    isRedirectTriggered: redirect.isRedirectTriggered,
    onRedirectTriggered: redirect.onRedirectTriggered,
    handleRedirect: redirect.handleRedirect,
    enterTwoFactor: twoFA.enterTwoFactor,
    onTenantResolved: (id) => {
      tenantIdRef.current = id;
    },
  });

  const magicLink = useMagicLinkHandler({
    setLoginStep,
    setError,
  });

  const handleLogin = useCallback(
    async (tenantIdOverride?: string, options?: { breakGlass?: boolean }) => {
      const validationResults = validateForm(formData, VALIDATION_SETS.LOGIN_FORM);
      if (!isFormValid(validationResults)) {
        const firstError = Object.values(validationResults).find((r) => !r.isValid);
        setErrorWithShake(firstError?.message || t("auth.validationError"));
        return;
      }

      setError("");
      setIsPasswordResetSuccess(false);
      const resolvedTenantId = tenantIdOverride ?? tenantIdRef.current ?? tenantId;

      try {
        await loginMutation.mutateAsync({
          identifier: formData.identifier,
          password: formData.password,
          tenantId: resolvedTenantId,
          tenantCode: resolveDevTenantCode(),
          staySignedIn: formData.staySignedIn,
          ...(options?.breakGlass ? { breakGlass: true } : {}),
        });
        redirect.schedulePostLoginRedirect();
      } catch (err: unknown) {
        const outcome = classifyLoginError(err);
        if (outcome.kind === "two_factor") {
          twoFA.enterTwoFactor(outcome.twoFactorPendingToken, outcome.staySignedIn);
          return;
        }
        if (outcome.kind === "workspace_selection") {
          workspaceSelector.showWorkspaces(outcome.workspaces);
          return;
        }
        if (outcome.kind === "unactivated") {
          setIsAccountNotActivated(true);
          setAccountNotActivatedMessage(outcome.message);
          setCooldownSeconds(60);
          setError("");
          return;
        }
        setIsAccountNotActivated(false);
        setErrorWithShake(outcome.message);
      }
    },
    [formData, loginMutation, redirect, setErrorWithShake, t, tenantId, twoFA, workspaceSelector]
  );

  const updateField = useCallback(
    (field: keyof LoginFormData, value: string | boolean) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (error) setError("");
      if (field === "identifier" && isAccountNotActivated) {
        setIsAccountNotActivated(false);
      }
    },
    [error, isAccountNotActivated]
  );

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const toggleBreakGlass = useCallback(() => {
    setIsBreakGlassExpanded((prev) => !prev);
    setError("");
  }, []);

  const goBackToCredentials = useCallback(() => {
    setLoginStep("credentials");
    twoFA.reset2FA();
    workspaceSelector.clearWorkspaces();
    setError("");
    setIsAccountNotActivated(false);
    redirect.resetRedirectTrigger();
  }, [redirect, twoFA, workspaceSelector]);

  const resetForm = useCallback(() => {
    setFormData({ identifier: "", password: "", staySignedIn: false });
    setShowPassword(false);
    setError("");
    redirect.setIsRedirecting(false);
    setLoginStep("credentials");
    setIsAccountNotActivated(false);
    twoFA.reset2FA();
    workspaceSelector.clearWorkspaces();
    redirect.resetRedirectTrigger();
  }, [redirect, twoFA, workspaceSelector]);

  const isLoading = loginMutation.isPending || redirect.isRedirecting || twoFA.isVerifying2FA;
  const isTrulyAuthenticated =
    redirect.hasHydrated && redirect.isAuthenticated && secureTokenService.hasToken();
  const resolvedTenantQuery = resolveDevTenantCode() ?? queryTenant;
  const { identifier } = formData;
  const forgotPasswordHref = useMemo(
    () =>
      buildAuthContextUrl("/forgot-password", {
        email: identifier || undefined,
        tenantCode: resolvedTenantQuery,
        redirect: queryRedirect,
      }),
    [identifier, resolvedTenantQuery, queryRedirect]
  );

  return {
    formData,
    showPassword,
    isLoading,
    error,
    shakeKey,
    isAccountNotActivated,
    accountNotActivatedMessage,
    cooldownSeconds,
    isPasswordResetSuccess,
    isBreakGlassExpanded,
    toggleBreakGlass,
    setIsBreakGlassExpanded,
    forgotPasswordHref,
    resendSetupEmail: () => handleLogin(tenantId ?? undefined),
    isAuthenticated: isTrulyAuthenticated,
    hasHydrated: redirect.hasHydrated,
    isRedirecting: redirect.isRedirecting,
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
    enterTwoFactor: twoFA.enterTwoFactor,
    goBackToCredentials,
    toggleBackupCode: twoFA.toggleBackupCode,
    checkAndRedirect: redirect.checkAndRedirect,
    resetForm,
    selectWorkspace: workspaceSelector.selectWorkspace,
    unlockWorkspace: workspaceSelector.unlockWorkspace,
    setTenantId,
    isFormValid: isFormValid(validateForm(formData, VALIDATION_SETS.LOGIN_FORM)),
    requestMagicLink: magicLink.requestMagicLink,
    resendMagicLink: magicLink.resendMagicLink,
    magicLinkEmail: magicLink.magicLinkEmail,
    resetMagicLink: magicLink.resetMagicLink,
    isMagicLinkSending: magicLink.isSending,
    setLoginStep,
  };
}
