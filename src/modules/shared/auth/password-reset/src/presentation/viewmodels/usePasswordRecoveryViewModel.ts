/**
 * usePasswordRecoveryViewModel — Consolidated state machine for `/forgot-password`
 * and `/reset-password` recovery flows.
 *
 * Delegates policy/cooldown/session-purge to `useRecoveryPolicyAndSession` and
 * pure URL/error utilities to `recovery-helpers`.
 *
 * @module auth/password-reset/presentation/viewmodels
 */
"use client";

import type { FormEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { useServices } from "@core/providers/service-provider";
import { useAppStore } from "@core/store/useAppStore";
import { secureTokenService } from "@core/common/secure-token-service";
import { isSafeRedirectTarget } from "@core/common/redirect-safety";
import {
  DEFAULT_PASSWORD_MAX_LENGTH,
  evaluatePasswordPolicy,
  type PasswordPolicyDto,
  type PasswordPolicyModel,
} from "@core/common/password-policy";
import type { ResetWorkspaceOption } from "@modules/auth/core/domain/interfaces/IPasswordResetRepository";
import {
  buildRecoveryNavigationUrl,
  extractRecoveryApiError,
  extractRecoveryUrlContext,
  formatRecoveryApiError,
  mergePasswordPolicies,
  normalizePolicyInput,
  type RecoveryApiErrorInfo,
  type RecoveryUrlContext,
  type ResetMethod,
} from "../utils/recovery-helpers";
import { useRecoveryPolicyAndSession } from "./useRecoveryPolicyAndSession";

export {
  buildRecoveryNavigationUrl,
  extractRecoveryApiError,
  extractRecoveryUrlContext,
  mergePasswordPolicies,
  type RecoveryApiErrorInfo,
  type RecoveryUrlContext,
  type ResetMethod,
};

/** Recovery flow mode: multi-step `/forgot-password` or direct link `/reset-password`. */
export type PasswordRecoveryMode = "forgot" | "reset";

/** Canonical unified steps across forgot-password and reset-password flows. */
export type PasswordRecoveryStep =
  | "request"
  | "method"
  | "otp"
  | "verifying-link"
  | "workspaces"
  | "new-password"
  | "success"
  | "invalid-link";

/** Re-exported workspace option model. */
export type WorkspaceOption = ResetWorkspaceOption;

export interface UsePasswordRecoveryOptions {
  mode: PasswordRecoveryMode;
  tenantId?: string | null;
  tenantCode?: string | null;
  brandingPolicy?: PasswordPolicyDto | PasswordPolicyModel | null;
  initialEmail?: string;
  initialOtp?: string;
  initialMethod?: ResetMethod | null;
  fallbackErrorMessage?: string;
}

export interface UsePasswordRecoveryViewModelReturn {
  mode: PasswordRecoveryMode;
  step: PasswordRecoveryStep;
  successReason: "magic-link-sent" | "password-reset";
  email: string;
  method: ResetMethod;
  otp: string;
  resetGrantToken: string | null;
  newPassword: string;
  confirmPassword: string;
  isLoading: boolean;
  error: string;
  cooldown: number;
  workspaces: WorkspaceOption[];
  selectedWorkspaces: WorkspaceOption[];
  selectedWorkspace: WorkspaceOption | null;
  allSelected: boolean;
  effectivePolicy: PasswordPolicyModel | null;
  isPolicyLoading: boolean;
  policyError: string | null;
  retryPolicy: () => void;
  tenantCode?: string;
  safeRedirect: string | null;
  loginHref: string;
  forgotPasswordHref: string;
  hasActiveSession: boolean;
  activeSessionEmail: string;
  isSigningOutSession: boolean;
  signOutActiveSession: () => Promise<void>;
  returnToDashboard: () => void;
  goToLogin: () => Promise<void>;
  setEmail: (v: string) => void;
  setOtp: (v: string) => void;
  setNewPassword: (v: string) => void;
  setConfirmPassword: (v: string) => void;
  submitEmail: (e?: FormEvent) => Promise<void>;
  chooseMethod: (m: ResetMethod) => Promise<void>;
  submitOtp: (e?: FormEvent) => Promise<void>;
  toggleWorkspace: (w: WorkspaceOption) => void;
  selectAllWorkspaces: () => void;
  deselectAllWorkspaces: () => void;
  confirmWorkspaceSelection: () => void;
  submitNewPassword: (e?: FormEvent) => Promise<void>;
  resendCode: () => Promise<void>;
  goBack: () => void;
  restart: () => void;
  canSubmitEmail: boolean;
  canSubmitOtp: boolean;
  canSubmitNewPassword: boolean;
  canConfirmWorkspaces: boolean;
  passwordsMatch: boolean;
}

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

  const mountedRecoveryRef = useRef(false);
  const resetCredentialMethodRef = useRef<ResetMethod>(queryMethod);

  const policySession = useRecoveryPolicyAndSession({
    step,
    selectedWorkspaces,
    verifyPolicy,
    brandingPolicy,
    tenantId,
    effectiveTenantCode,
  });
  const { startCooldown, clearCooldown, effectivePolicy, purgeClientAndServerSession } =
    policySession;

  useEffect(() => {
    if (mountedRecoveryRef.current) return;
    mountedRecoveryRef.current = true;

    const urlCtx =
      typeof window !== "undefined"
        ? extractRecoveryUrlContext(window.location.href, { stripEmailFromQuery: mode === "reset" })
        : null;

    if (urlCtx && typeof window !== "undefined" && urlCtx.hasSensitiveParams) {
      window.history.replaceState({}, document.title, urlCtx.cleanRelativeUrl);
    }
    if (urlCtx?.tenantCode) setUrlTenantCode(urlCtx.tenantCode);
    if (urlCtx?.redirect) setSafeRedirectState(urlCtx.redirect);

    const resolvedEmail = (initialEmail || urlCtx?.email || queryEmail).trim();
    const resolvedCredential = (initialOtp || urlCtx?.otp || queryOtp).trim();
    const detectedMethod: ResetMethod =
      initialMethod ??
      urlCtx?.method ??
      (urlCtx?.token && urlCtx.token === resolvedCredential ? "magic-link" : "otp");

    resetCredentialMethodRef.current = detectedMethod;
    if (resolvedEmail) setEmail(resolvedEmail);
    if (resolvedCredential) setOtp(resolvedCredential);
    setMethod(detectedMethod);

    if (mode !== "reset") return;
    if (!resolvedCredential || !resolvedEmail) {
      setStep("invalid-link");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const result = await repoRef.current.verifyOtp(resolvedEmail, resolvedCredential, {
          method: detectedMethod,
          tenantId: tenantId ?? undefined,
        });
        if (cancelled) return;
        if (result.isValid === false) {
          setStep("invalid-link");
          return;
        }
        if (result.resetGrantToken) setResetGrantToken(result.resetGrantToken);
        if (result.passwordPolicy) setVerifyPolicy(normalizePolicyInput(result.passwordPolicy));
        if (result.workspaces && result.workspaces.length > 1) {
          setWorkspaces(result.workspaces);
          setSelectedWorkspaces(result.workspaces);
          setStep("workspaces");
        } else {
          if (result.workspaces?.length === 1) {
            setWorkspaces(result.workspaces);
            setSelectedWorkspaces(result.workspaces);
          }
          setStep("new-password");
        }
      } catch {
        if (!cancelled) setStep("invalid-link");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mode, initialEmail, initialOtp, initialMethod, queryEmail, queryOtp, tenantId]);

  const submitEmail = useCallback(
    async (e?: FormEvent) => {
      e?.preventDefault();
      if (!email.trim() || !email.includes("@")) return;
      setError("");
      setStep("method");
    },
    [email]
  );

  const chooseMethod = useCallback(
    async (m: ResetMethod) => {
      setMethod(m);
      setIsLoading(true);
      setError("");
      try {
        const res = await repoRef.current.requestReset(email.trim(), m, tenantId ?? undefined);
        if (m === "magic-link") {
          setSuccessReason("magic-link-sent");
          setStep("success");
        } else {
          startCooldown(res?.retryAfterSeconds ?? 60);
          setStep("otp");
        }
      } catch (err) {
        const parsed = formatRecoveryApiError(
          err,
          tRef.current("auth.recoveryNetworkError"),
          tRef.current
        );
        if (parsed.isRateLimitOrNetwork) {
          if (parsed.retryAfter) startCooldown(parsed.retryAfter);
          setError(parsed.message);
        } else if (m === "magic-link") {
          setSuccessReason("magic-link-sent");
          setStep("success");
        } else {
          startCooldown(60);
          setStep("otp");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [email, tenantId, startCooldown]
  );

  const submitOtp = useCallback(
    async (e?: FormEvent) => {
      e?.preventDefault();
      if (otp.length !== 6 || isLoading) return;
      setIsLoading(true);
      setError("");
      try {
        const result = await repoRef.current.verifyOtp(email.trim(), otp, {
          method: "otp",
          tenantId: tenantId ?? undefined,
        });
        if (result.isValid === false) {
          setError(tRef.current("auth.otpInvalidOrExpired"));
          return;
        }
        if (result.resetGrantToken) setResetGrantToken(result.resetGrantToken);
        if (result.passwordPolicy) setVerifyPolicy(normalizePolicyInput(result.passwordPolicy));
        if (result.workspaces && result.workspaces.length > 1) {
          setWorkspaces(result.workspaces);
          setSelectedWorkspaces(result.workspaces);
          setStep("workspaces");
        } else {
          const single = result.workspaces?.length === 1 ? result.workspaces : [];
          setWorkspaces(single);
          setSelectedWorkspaces(single);
          setStep("new-password");
        }
      } catch (err) {
        const parsed = formatRecoveryApiError(
          err,
          tRef.current("auth.otpInvalidOrExpired"),
          tRef.current
        );
        if (parsed.retryAfter) startCooldown(parsed.retryAfter);
        setError(parsed.message);
      } finally {
        setIsLoading(false);
      }
    },
    [otp, isLoading, email, tenantId, startCooldown]
  );

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
      !policySession.isPolicyLoading
  );

  const submitNewPassword = useCallback(
    async (e?: FormEvent) => {
      e?.preventDefault();
      if (!canSubmitNewPassword) return;
      setIsLoading(true);
      setError("");
      try {
        await repoRef.current.resetPassword({
          email: email.trim(),
          otp,
          method: mode === "reset" ? resetCredentialMethodRef.current : "otp",
          resetGrantToken: resetGrantToken ?? undefined,
          newPassword,
          tenantIds:
            selectedWorkspaces.length > 0 ? selectedWorkspaces.map((w) => w.tenantId) : undefined,
        });
        await purgeClientAndServerSession(
          Boolean(secureTokenService.hasToken() || useAppStore.getState().isAuthenticated)
        );
        setSuccessReason("password-reset");
        setStep("success");
      } catch (err) {
        const parsed = formatRecoveryApiError(
          err,
          fallbackErrorMessage || tRef.current("auth.resetPasswordFailedError"),
          tRef.current
        );
        setError(parsed.message);
      } finally {
        setIsLoading(false);
      }
    },
    [
      canSubmitNewPassword,
      email,
      otp,
      mode,
      resetGrantToken,
      newPassword,
      selectedWorkspaces,
      purgeClientAndServerSession,
      fallbackErrorMessage,
    ]
  );

  const resendCode = useCallback(async () => {
    if (policySession.cooldown > 0 || isLoading) return;
    setIsLoading(true);
    setError("");
    try {
      const res = await repoRef.current.requestReset(email.trim(), "otp", tenantId ?? undefined);
      startCooldown(res?.retryAfterSeconds ?? 60);
    } catch (err) {
      const parsed = formatRecoveryApiError(
        err,
        tRef.current("auth.recoveryNetworkError"),
        tRef.current
      );
      if (parsed.isRateLimitOrNetwork) {
        if (parsed.retryAfter) startCooldown(parsed.retryAfter);
        setError(parsed.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [policySession.cooldown, isLoading, email, tenantId, startCooldown]);

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
    policySession.setPolicyError(null);
  }, [clearCooldown, policySession]);

  return {
    mode,
    step,
    successReason,
    email,
    method,
    otp,
    resetGrantToken,
    newPassword,
    confirmPassword,
    isLoading,
    error,
    cooldown: policySession.cooldown,
    workspaces,
    selectedWorkspaces,
    selectedWorkspace: selectedWorkspaces[0] ?? null,
    allSelected: workspaceCount > 0 && selectedWorkspacesCount === workspaceCount,
    effectivePolicy,
    isPolicyLoading: policySession.isPolicyLoading,
    policyError: policySession.policyError,
    retryPolicy: policySession.retryPolicy,
    tenantCode: effectiveTenantCode,
    safeRedirect: safeRedirectState,
    loginHref,
    forgotPasswordHref,
    hasActiveSession: policySession.hasActiveSession,
    activeSessionEmail: policySession.activeSessionEmail,
    isSigningOutSession: policySession.isSigningOutSession,
    signOutActiveSession: policySession.signOutActiveSession,
    returnToDashboard: policySession.returnToDashboard,
    goToLogin,
    setEmail,
    setOtp,
    setNewPassword,
    setConfirmPassword,
    submitEmail,
    chooseMethod,
    submitOtp,
    toggleWorkspace,
    selectAllWorkspaces,
    deselectAllWorkspaces,
    confirmWorkspaceSelection,
    submitNewPassword,
    resendCode,
    goBack,
    restart,
    canSubmitEmail: email.trim().length > 3 && email.includes("@"),
    canSubmitOtp: otp.length === 6,
    canSubmitNewPassword,
    canConfirmWorkspaces: selectedWorkspacesCount > 0,
    passwordsMatch,
  };
}
