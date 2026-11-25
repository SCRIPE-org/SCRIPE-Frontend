/**
 * useRecoveryStepActions — Encapsulates password recovery submission callbacks
 * (request email, choose method, verify OTP, reset password, resend OTP).
 *
 * @module auth/password-reset/presentation/viewmodels
 */
"use client";

import type { Dispatch, FormEvent, MutableRefObject, SetStateAction } from "react";
import { useCallback } from "react";
import { useAppStore } from "@core/store/useAppStore";
import { secureTokenService } from "@core/common/secure-token-service";
import type { PasswordPolicyModel } from "@core/common/password-policy";
import type { IPasswordResetRepository } from "@modules/auth/core/domain/interfaces/IPasswordResetRepository";
import {
  formatRecoveryApiError,
  normalizePolicyInput,
  type ResetMethod,
} from "../utils/recovery-helpers";
import type {
  PasswordRecoveryMode,
  PasswordRecoveryStep,
  WorkspaceOption,
} from "../utils/recovery-types";

/** Input dependencies and state setters required by {@link useRecoveryStepActions}. */
export interface UseRecoveryStepActionsParams {
  mode: PasswordRecoveryMode;
  tenantId?: string | null;
  email: string;
  otp: string;
  cooldown: number;
  isLoading: boolean;
  canSubmitNewPassword: boolean;
  resetGrantToken: string | null;
  newPassword: string;
  selectedWorkspaces: WorkspaceOption[];
  fallbackErrorMessage?: string;
  repoRef: MutableRefObject<IPasswordResetRepository>;
  tRef: MutableRefObject<(key: string, params?: Record<string, string | number>) => string>;
  resetCredentialMethodRef: MutableRefObject<ResetMethod>;
  setStep: Dispatch<SetStateAction<PasswordRecoveryStep>>;
  setMethod: Dispatch<SetStateAction<ResetMethod>>;
  setSuccessReason: Dispatch<SetStateAction<"magic-link-sent" | "password-reset">>;
  setResetGrantToken: Dispatch<SetStateAction<string | null>>;
  setWorkspaces: Dispatch<SetStateAction<WorkspaceOption[]>>;
  setSelectedWorkspaces: Dispatch<SetStateAction<WorkspaceOption[]>>;
  setVerifyPolicy: Dispatch<SetStateAction<PasswordPolicyModel | null>>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  setError: Dispatch<SetStateAction<string>>;
  startCooldown: (seconds: number) => void;
  purgeClientAndServerSession: (shouldCallLogout: boolean) => Promise<void>;
}

/** Provides React-19-safe recovery submission handlers for {@link usePasswordRecoveryViewModel}. */
export function useRecoveryStepActions({
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
}: UseRecoveryStepActionsParams) {
  const submitEmail = useCallback(
    async (e?: FormEvent) => {
      e?.preventDefault();
      if (!email.trim() || !email.includes("@")) return;
      setError("");
      setStep("method");
    },
    [email, setError, setStep]
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
    [
      email,
      tenantId,
      repoRef,
      tRef,
      startCooldown,
      setMethod,
      setIsLoading,
      setError,
      setSuccessReason,
      setStep,
    ]
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
    [
      otp,
      isLoading,
      email,
      tenantId,
      repoRef,
      tRef,
      startCooldown,
      setIsLoading,
      setError,
      setResetGrantToken,
      setVerifyPolicy,
      setWorkspaces,
      setSelectedWorkspaces,
      setStep,
    ]
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
      fallbackErrorMessage,
      repoRef,
      tRef,
      resetCredentialMethodRef,
      purgeClientAndServerSession,
      setIsLoading,
      setError,
      setSuccessReason,
      setStep,
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
  }, [cooldown, isLoading, email, tenantId, repoRef, tRef, startCooldown, setIsLoading, setError]);

  return { submitEmail, chooseMethod, submitOtp, submitNewPassword, resendCode };
}
