/**
 * usePasswordRecoveryViewModel — Consolidated state machine for `/forgot-password`
 * and `/reset-password` recovery flows.
 *
 * Delegates policy/cooldown/session-purge to `useRecoveryPolicyAndSession`,
 * submission handlers to `useRecoveryStepActions`, and URL/error helpers to
 * `recovery-helpers`.
 *
 * @module auth/password-reset/presentation/viewmodels
 */
"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { useServices } from "@core/providers/service-provider";
import { useAppStore } from "@core/store/useAppStore";
import { isSafeRedirectTarget } from "@core/common/redirect-safety";
import {
  DEFAULT_PASSWORD_MAX_LENGTH,
  evaluatePasswordPolicy,
  type PasswordPolicyModel,
} from "@core/common/password-policy";
import {
  buildRecoveryNavigationUrl,
  extractRecoveryApiError,
  extractRecoveryUrlContext,
  mergePasswordPolicies,
  type RecoveryApiErrorInfo,
  type RecoveryUrlContext,
  type ResetMethod,
} from "../utils/recovery-helpers";
import type {
  PasswordRecoveryMode,
  PasswordRecoveryStep,
  UsePasswordRecoveryOptions,
  UsePasswordRecoveryViewModelReturn,
  WorkspaceOption,
} from "../utils/recovery-types";
import { useRecoveryInitialLink } from "./useRecoveryInitialLink";
import { useRecoveryPolicyAndSession } from "./useRecoveryPolicyAndSession";
import { useRecoveryStepActions } from "./useRecoveryStepActions";

export {
  buildRecoveryNavigationUrl, extractRecoveryApiError, extractRecoveryUrlContext, mergePasswordPolicies,
  type RecoveryApiErrorInfo, type RecoveryUrlContext, type ResetMethod, type PasswordRecoveryMode,
  type PasswordRecoveryStep, type WorkspaceOption, type UsePasswordRecoveryOptions,
  type UsePasswordRecoveryViewModelReturn,
};

/** Consolidated ViewModel powering `/forgot-password` and `/reset-password`. */
export function usePasswordRecoveryViewModel(
  options: UsePasswordRecoveryOptions
): UsePasswordRecoveryViewModelReturn {
  const {
    mode,
    tenantId,
    tenantCode: optionTenantCode,
    brandingPolicy,
    initialEmail,
    initialOtp,
    initialMethod,
    fallbackErrorMessage,
  } = options;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const { passwordResetRepository } = useServices();

  const repoRef = useRef(passwordResetRepository);
  repoRef.current = passwordResetRepository;
  const tRef = useRef(t);
  tRef.current = t;
  const storeTenantCode = useAppStore((s) => s.tenantCode);

  const queryEmail = (initialEmail || searchParams?.get("email") || "").trim();
  const queryOtp = (
    initialOtp ||
    searchParams?.get("otp") ||
    searchParams?.get("code") ||
    searchParams?.get("token") ||
    ""
  ).trim();
  const queryMethodRaw = searchParams?.get("method")?.trim();
  const queryMethod: ResetMethod =
    initialMethod ?? (queryMethodRaw === "magic-link" ? "magic-link" : "otp");

  const [step, setStep] = useState<PasswordRecoveryStep>(
    mode === "reset" ? "verifying-link" : "request"
  );
  const [email, setEmail] = useState(queryEmail);
  const [method, setMethod] = useState<ResetMethod>(queryMethod);
  const [successReason, setSuccessReason] = useState<"magic-link-sent" | "password-reset">(
    "password-reset"
  );
  const [otp, setOtp] = useState(queryOtp);
  const [resetGrantToken, setResetGrantToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [workspaces, setWorkspaces] = useState<WorkspaceOption[]>([]);
  const [selectedWorkspaces, setSelectedWorkspaces] = useState<WorkspaceOption[]>([]);
  const [verifyPolicy, setVerifyPolicy] = useState<PasswordPolicyModel | null>(null);

  const rawQueryTenant = searchParams?.get("_tenant")?.trim();
  const [urlTenantCode, setUrlTenantCode] = useState<string | undefined>(
    rawQueryTenant ? rawQueryTenant.toUpperCase() : undefined
  );
  const rawQueryRedirect = searchParams?.get("redirect")?.trim() || null;
  const [safeRedirectState, setSafeRedirectState] = useState<string | null>(
    rawQueryRedirect && isSafeRedirectTarget(rawQueryRedirect) ? rawQueryRedirect : null
  );

  const effectiveTenantCode =
    urlTenantCode ||
    (optionTenantCode ? optionTenantCode.toUpperCase() : undefined) ||
    storeTenantCode ||
    undefined;

  const resetCredentialMethodRef = useRef<ResetMethod>(queryMethod);

  const {
    cooldown,
    startCooldown,
    clearCooldown,
    effectivePolicy,
    isPolicyLoading,
    policyError,
    retryPolicy,
    setPolicyError,
    hasActiveSession,
    activeSessionEmail,
    isSigningOutSession,
    signOutActiveSession,
    returnToDashboard,
    purgeClientAndServerSession,
  } = useRecoveryPolicyAndSession({
    step,
    selectedWorkspaces,
    verifyPolicy,
    brandingPolicy,
    tenantId,
    effectiveTenantCode,
  });

  useRecoveryInitialLink({
    mode,
    tenantId,
    initialEmail,
    initialOtp,
    initialMethod,
    queryEmail,
    queryOtp,
    repoRef,
    resetCredentialMethodRef,
    setUrlTenantCode,
    setSafeRedirectState,
    setEmail,
    setOtp,
    setMethod,
    setStep,
    setResetGrantToken,
    setVerifyPolicy,
    setWorkspaces,
    setSelectedWorkspaces,
  });

  const toggleWorkspace = useCallback((w: WorkspaceOption) => {
    setSelectedWorkspaces((prev) =>
      prev.some((s) => s.tenantId === w.tenantId)
        ? prev.filter((s) => s.tenantId !== w.tenantId)
        : [...prev, w]
    );
  }, []);

  const selectAllWorkspaces = useCallback(() => {
    setSelectedWorkspaces((prev) => (prev.length === workspaces.length ? [] : workspaces));
  }, [workspaces]);

  const deselectAllWorkspaces = useCallback(() => {
    setSelectedWorkspaces([]);
  }, []);

  const selectedWorkspacesCount = selectedWorkspaces.length;
  const confirmWorkspaceSelection = useCallback(() => {
    if (selectedWorkspacesCount === 0) return;
    setError("");
    setStep("new-password");
  }, [selectedWorkspacesCount]);

  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const policyEvaluation = effectivePolicy
    ? evaluatePasswordPolicy(newPassword, effectivePolicy)
    : null;
  const canSubmitNewPassword = Boolean(
    effectivePolicy &&
      policyEvaluation?.allMet &&
      newPassword.length <= (effectivePolicy.maxLength || DEFAULT_PASSWORD_MAX_LENGTH) &&
      passwordsMatch &&
      !isLoading &&
      !isPolicyLoading
  );

  const { submitEmail, chooseMethod, submitOtp, submitNewPassword, resendCode } =
    useRecoveryStepActions({
      mode,
      tenantId,
      email,
      otp,
      cooldown,
      isLoading,
      canSubmitNewPassword,
      resetGrantToken,
      newPassword,
      selectedWorkspaces,
      fallbackErrorMessage,
      repoRef,
      tRef,
      resetCredentialMethodRef,
      setStep,
      setMethod,
      setSuccessReason,
      setResetGrantToken,
      setWorkspaces,
      setSelectedWorkspaces,
      setVerifyPolicy,
      setIsLoading,
      setError,
      startCooldown,
      purgeClientAndServerSession,
    });

  const loginHref = buildRecoveryNavigationUrl("/login", {
    email: step === "success" && successReason === "password-reset" ? email : undefined,
    tenantCode: effectiveTenantCode,
    redirect: safeRedirectState,
    resetSuccess: step === "success" && successReason === "password-reset",
  });

  const forgotPasswordHref = buildRecoveryNavigationUrl("/forgot-password", {
    email: email || undefined,
    tenantCode: effectiveTenantCode,
    redirect: safeRedirectState,
  });

  const goToLogin = useCallback(async () => {
    if (step === "success" && successReason === "password-reset") {
      await purgeClientAndServerSession(false);
    }
    router.push(loginHref);
  }, [step, successReason, purgeClientAndServerSession, router, loginHref]);

  const workspaceCount = workspaces.length;
  const goBack = useCallback(() => {
    setError("");
    if (step === "method") setStep("request");
    else if (step === "otp") setStep("method");
    else if (step === "workspaces") setStep("otp");
    else if (step === "new-password") {
      if (workspaceCount > 1) setStep("workspaces");
      else if (mode === "forgot") setStep("otp");
    } else setStep("request");
  }, [step, workspaceCount, mode]);

  const restart = useCallback(() => {
    clearCooldown();
    setStep("request");
    setEmail("");
    setOtp("");
    setResetGrantToken(null);
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setWorkspaces([]);
    setSelectedWorkspaces([]);
    setVerifyPolicy(null);
    setPolicyError(null);
  }, [clearCooldown, setPolicyError]);

  return {
    mode, step, successReason, email, method, otp, resetGrantToken, newPassword, confirmPassword,
    isLoading, error, cooldown, workspaces, selectedWorkspaces,
    selectedWorkspace: selectedWorkspaces[0] ?? null,
    allSelected: workspaceCount > 0 && selectedWorkspacesCount === workspaceCount,
    effectivePolicy, isPolicyLoading, policyError, retryPolicy,
    tenantCode: effectiveTenantCode, safeRedirect: safeRedirectState, loginHref, forgotPasswordHref,
    hasActiveSession, activeSessionEmail, isSigningOutSession, signOutActiveSession,
    returnToDashboard, goToLogin, setEmail, setOtp, setNewPassword, setConfirmPassword,
    submitEmail, chooseMethod, submitOtp, toggleWorkspace, selectAllWorkspaces,
    deselectAllWorkspaces, confirmWorkspaceSelection, submitNewPassword, resendCode, goBack, restart,
    canSubmitEmail: email.trim().length > 3 && email.includes("@"),
    canSubmitOtp: otp.length === 6,
    canSubmitNewPassword,
    canConfirmWorkspaces: selectedWorkspacesCount > 0,
    passwordsMatch,
  };
}
