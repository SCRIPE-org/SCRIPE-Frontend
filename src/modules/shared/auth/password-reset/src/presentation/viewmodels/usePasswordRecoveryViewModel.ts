/**
 * usePasswordRecoveryViewModel — Consolidated state machine for `/forgot-password`
 * and `/reset-password` recovery flows.
 *
 * SSR-safe (`#token=` fragments extracted & scrubbed after hydration), React 19 compiler-safe,
 * fail-closed on PasswordPolicy, anti-enumeration on request while surfacing 429/network errors,
 * and guarantees full client+server session purge on active-session sign-out and reset completion.
 *
 * @module auth/password-reset/presentation/viewmodels
 */
"use client";

import type { FormEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { useServices } from "@core/providers/service-provider";
import { useAppStore } from "@core/store/useAppStore";
import { secureTokenService } from "@core/common/secure-token-service";
import { authBroadcast } from "@core/common/broadcast-auth";
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
  const { mode, tenantId, brandingPolicy, fallbackErrorMessage } = options;
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const { passwordResetRepository, authRepository } = useServices();

  const repoRef = useRef(passwordResetRepository);
  repoRef.current = passwordResetRepository;
  const authRepoRef = useRef(authRepository);
  authRepoRef.current = authRepository;
  const tRef = useRef(t);
  tRef.current = t;

  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const hasHydrated = useAppStore((s) => s._hasHydrated);
  const storeUser = useAppStore((s) => s.user);
  const storeTenantCode = useAppStore((s) => s.tenantCode);

  const queryEmail = (options.initialEmail || searchParams?.get("email") || "").trim();
  const queryOtp = (
    options.initialOtp ||
    searchParams?.get("otp") ||
    searchParams?.get("code") ||
    searchParams?.get("token") ||
    ""
  ).trim();
  const queryMethodRaw = searchParams?.get("method")?.trim();
  const queryMethod: ResetMethod =
    options.initialMethod ??
    (queryMethodRaw === "magic-link" ? "magic-link" : "otp");

  // Deterministic SSR + initial client render (hash fragments resolved post-mount to avoid hydration mismatch)
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
  const [cooldown, setCooldown] = useState(0);
  const [workspaces, setWorkspaces] = useState<WorkspaceOption[]>([]);
  const [selectedWorkspaces, setSelectedWorkspaces] = useState<WorkspaceOption[]>([]);
  const [verifyPolicy, setVerifyPolicy] = useState<PasswordPolicyModel | null>(null);
  const [fetchedPolicy, setFetchedPolicy] = useState<PasswordPolicyModel | null>(null);
  const [isPolicyLoading, setIsPolicyLoading] = useState(false);
  const [policyError, setPolicyError] = useState<string | null>(null);
  const [policyRetrySeed, setPolicyRetrySeed] = useState(0);
  const [sessionDismissed, setSessionDismissed] = useState(false);
  const [isSigningOutSession, setIsSigningOutSession] = useState(false);

  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRecoveryRef = useRef(false);
  const resetCredentialMethodRef = useRef<ResetMethod>(queryMethod);

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
    (options.tenantCode ? options.tenantCode.toUpperCase() : undefined) ||
    storeTenantCode ||
    undefined;

  const hasActiveSession =
    !sessionDismissed && hasHydrated && isAuthenticated && secureTokenService.hasToken();
  const activeSessionEmail = storeUser?.email || storeUser?.username || "";

  useEffect(() => {
    return () => {
      if (cooldownRef.current) {
        clearInterval(cooldownRef.current);
        cooldownRef.current = null;
      }
    };
  }, []);

  const startCooldown = useCallback((seconds: number) => {
    const safeSeconds = Math.max(1, Math.ceil(seconds));
    setCooldown(safeSeconds);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          if (cooldownRef.current) {
            clearInterval(cooldownRef.current);
            cooldownRef.current = null;
          }
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }, []);

  const purgeClientAndServerSession = useCallback(
    async (callServerLogout: boolean) => {
      if (callServerLogout || secureTokenService.hasToken() || useAppStore.getState().isAuthenticated) {
        try {
          await authRepoRef.current.logout();
        } catch {
          // Local cleanup still runs deterministically below.
        }
      }
      authRepoRef.current.clearSessionOnLoginMount();
      useAppStore.getState().logout();
      queryClient.clear();
      authBroadcast.broadcastLogout();
      setSessionDismissed(true);
    },
    [queryClient]
  );

  const signOutActiveSession = useCallback(async () => {
    setIsSigningOutSession(true);
    try {
      await purgeClientAndServerSession(true);
    } finally {
      setIsSigningOutSession(false);
    }
  }, [purgeClientAndServerSession]);

  const returnToDashboard = useCallback(() => {
    router.replace("/");
  }, [router]);

  const effectivePolicy =
    mergePasswordPolicies(selectedWorkspaces.map((w) => w.passwordPolicy)) ??
    verifyPolicy ??
    normalizePolicyInput(brandingPolicy) ??
    fetchedPolicy;

  const targetPolicyTenantId =
    selectedWorkspaces.length === 1 ? selectedWorkspaces[0].tenantId : tenantId ?? undefined;

  useEffect(() => {
    if (step !== "new-password" || effectivePolicy) return;
    let cancelled = false;
    (async () => {
      setIsPolicyLoading(true);
      setPolicyError(null);
      try {
        const fetched = await authRepoRef.current.getPasswordPolicy({
          isPublic: true,
          tenantId: targetPolicyTenantId,
          tenantCode: effectiveTenantCode,
        });
        if (!cancelled) setFetchedPolicy(fetched);
      } catch {
        if (!cancelled) setPolicyError(tRef.current("auth.recoveryPolicyLoadError"));
      } finally {
        if (!cancelled) setIsPolicyLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [step, effectivePolicy, targetPolicyTenantId, effectiveTenantCode, policyRetrySeed]);

  const retryPolicy = useCallback(() => {
    setPolicyError(null);
    setPolicyRetrySeed((n) => n + 1);
  }, []);

  // Client mount: extract `#token=` fragment + query fallbacks, scrub URL immediately, and verify link in reset mode
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

    const resolvedEmail = (options.initialEmail || urlCtx?.email || queryEmail).trim();
    const resolvedCredential = (options.initialOtp || urlCtx?.otp || queryOtp).trim();
    const detectedMethod: ResetMethod =
      options.initialMethod ??
      urlCtx?.method ??
      (urlCtx?.token && urlCtx.token === resolvedCredential ? "magic-link" : "otp");

    resetCredentialMethodRef.current = detectedMethod;
    if (resolvedEmail) setEmail(resolvedEmail);
    if (resolvedCredential) setOtp(resolvedCredential);
    if (detectedMethod) setMethod(detectedMethod);

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
  }, [mode, options.initialEmail, options.initialOtp, options.initialMethod, queryEmail, queryOtp, tenantId]);

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
        } else if (result.workspaces && result.workspaces.length === 1) {
          setWorkspaces(result.workspaces);
          setSelectedWorkspaces(result.workspaces);
          setStep("new-password");
        } else {
          setWorkspaces([]);
          setSelectedWorkspaces([]);
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

  const confirmWorkspaceSelection = useCallback(() => {
    if (selectedWorkspaces.length === 0) return;
    setError("");
    setStep("new-password");
  }, [selectedWorkspaces.length]);

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
    if (cooldown > 0 || isLoading) return;
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
  }, [cooldown, isLoading, email, tenantId, startCooldown]);

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
    switch (step) {
      case "method":
        setStep("request");
        break;
      case "otp":
        setStep("method");
        break;
      case "workspaces":
        setStep("otp");
        break;
      case "new-password":
        if (workspaceCount > 1) setStep("workspaces");
        else if (mode === "forgot") setStep("otp");
        break;
      default:
        setStep("request");
    }
  }, [step, workspaceCount, mode]);

  const restart = useCallback(() => {
    if (cooldownRef.current) {
      clearInterval(cooldownRef.current);
      cooldownRef.current = null;
    }
    setStep("request");
    setEmail("");
    setOtp("");
    setResetGrantToken(null);
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setCooldown(0);
    setWorkspaces([]);
    setSelectedWorkspaces([]);
    setVerifyPolicy(null);
    setPolicyError(null);
  }, []);

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
    cooldown,
    workspaces,
    selectedWorkspaces,
    selectedWorkspace: selectedWorkspaces[0] ?? null,
    allSelected: workspaceCount > 0 && selectedWorkspaces.length === workspaceCount,
    effectivePolicy,
    isPolicyLoading,
    policyError,
    retryPolicy,
    tenantCode: effectiveTenantCode,
    safeRedirect: safeRedirectState,
    loginHref,
    forgotPasswordHref,
    hasActiveSession,
    activeSessionEmail,
    isSigningOutSession,
    signOutActiveSession,
    returnToDashboard,
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
    canConfirmWorkspaces: selectedWorkspaces.length > 0,
    passwordsMatch,
  };
}
