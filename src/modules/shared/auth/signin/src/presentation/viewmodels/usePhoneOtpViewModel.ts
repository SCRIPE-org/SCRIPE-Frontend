"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { authContainer } from "@modules/auth/di";
import { isValidPhoneNumber } from "@core/ui/phone-input";
import type { LoginResponseModel } from "@modules/auth/core/domain/types/AuthTypes";
import type { WorkspaceChoice } from "@modules/auth/core/domain/errors/AuthErrors";
import type { TokenLoginPayload } from "./useTokenLogin";

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Step union for the Phone/SMS OTP sign-in state machine.
 */
export type PhoneOtpStep = "phone" | "code" | "workspace-selection";

/**
 * Configuration options for {@link usePhoneOtpViewModel}.
 */
export interface UsePhoneOtpOptions {
  /** Optional encrypted tenant ID resolved from the active login surface. */
  tenantId?: string | null;
  /** Optional legacy callback invoked when multiple workspaces are returned. */
  onWorkspaceSelection?: (response: LoginResponseModel) => void;
  /** Invoked when Phone OTP triggers hybrid MFA with a passwordless 2FA pending token. */
  onTwoFactorRequired?: (pendingToken: string, staySignedIn: boolean) => void;
}

/**
 * Public state and action contract returned by {@link usePhoneOtpViewModel}.
 */
export interface UsePhoneOtpViewModelReturn {
  // State
  step: PhoneOtpStep;
  phone: string;
  code: string;
  isLoading: boolean;
  error: string;
  cooldown: number;
  shakeKey: number;
  availableWorkspaces: WorkspaceChoice[];

  // Actions
  setPhone: (value: string) => void;
  setCode: (value: string) => void;
  requestOtp: () => Promise<void>;
  verifyOtp: () => Promise<void>;
  selectWorkspace: (workspace: WorkspaceChoice) => Promise<void>;
  resendOtp: () => Promise<void>;
  changeNumber: () => void;
}

// ─── ViewModel ────────────────────────────────────────────────────────────────

/**
 * usePhoneOtpViewModel — Business logic for Phone/SMS OTP sign-in.
 *
 * Enforces SCRIPE MVVM architecture:
 * View -> ViewModel -> Repository -> Service -> HTTP.
 *
 * Supports tenant-scoped OTP requests/verification, multi-workspace selection
 * (re-verifying the peeked OTP against the selected workspace), and hybrid MFA
 * (`requires2FA` + `twoFactorPendingToken`).
 */
export function usePhoneOtpViewModel(
  onSuccess: (result: TokenLoginPayload) => void,
  options?: UsePhoneOtpOptions
): UsePhoneOtpViewModelReturn {
  const { t } = useI18n();
  const { authRepository } = authContainer;
  const tenantId = options?.tenantId ?? null;
  const onWorkspaceSelection = options?.onWorkspaceSelection;
  const onTwoFactorRequired = options?.onTwoFactorRequired;

  // ── State ──
  const [step, setStep] = useState<PhoneOtpStep>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [availableWorkspaces, setAvailableWorkspaces] = useState<WorkspaceChoice[]>([]);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Error shake — keyed counter, incremented at every setError() call
  const [shakeKey, setShakeKey] = useState(0);
  const setErrorWithShake = useCallback((msg: string) => {
    setError(msg);
    if (msg) setShakeKey((k) => k + 1);
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    cooldownRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, [cooldown]);

  // Auto-focus code input
  useEffect(() => {
    if (step === "code") {
      const timer = setTimeout(() => {
        document.getElementById("phone-otp-code")?.focus();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleVerifyOutcome = useCallback(
    (result: LoginResponseModel) => {
      if (result.requires2FA && result.twoFactorPendingToken) {
        onTwoFactorRequired?.(result.twoFactorPendingToken, Boolean(result.staySignedIn));
        return;
      }

      if (result.requiresWorkspaceSelection && result.availableWorkspaces?.length) {
        setAvailableWorkspaces(result.availableWorkspaces as WorkspaceChoice[]);
        setStep("workspace-selection");
        onWorkspaceSelection?.(result);
        return;
      }

      onSuccess({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken ?? "",
        mustChangePassword: result.mustChangePassword,
        requireMfaEnrollment: result.requireMfaEnrollment,
        subscriptionStatus: result.subscriptionStatus,
        gracePhase: result.gracePhase,
        editionName: result.editionName,
        defaultRedirectPath: result.defaultRedirectPath,
      });
    },
    [onSuccess, onTwoFactorRequired, onWorkspaceSelection]
  );

  // ── Request OTP ──
  const requestOtp = useCallback(async () => {
    if (!phone.trim()) {
      setErrorWithShake(t("auth.phoneOtp.phoneRequired"));
      return;
    }
    if (!isValidPhoneNumber(phone)) {
      setErrorWithShake(t("auth.phoneOtp.phoneInvalid"));
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await authRepository.requestPhoneOtp(phone.trim(), tenantId);
      setCooldown(result?.retryAfterSeconds ?? 60);
      setStep("code");
    } catch (err) {
      setErrorWithShake(err instanceof Error ? err.message : t("auth.phoneOtp.requestFailed"));
    } finally {
      setIsLoading(false);
    }
  }, [phone, tenantId, authRepository, t, setErrorWithShake]);

  // ── Verify OTP ──
  const verifyOtp = useCallback(async () => {
    if (code.length !== 6) {
      setErrorWithShake(t("auth.phoneOtp.invalidCode"));
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await authRepository.verifyPhoneOtp(phone.trim(), code, tenantId);
      handleVerifyOutcome(result);
    } catch (err) {
      setErrorWithShake(err instanceof Error ? err.message : t("auth.phoneOtp.verifyFailed"));
    } finally {
      setIsLoading(false);
    }
  }, [phone, code, tenantId, authRepository, handleVerifyOutcome, t, setErrorWithShake]);

  // ── Select workspace for multi-workspace phone ──
  const selectWorkspace = useCallback(
    async (workspace: WorkspaceChoice) => {
      if (!workspace.isActivated || workspace.isDisabled) return;

      setIsLoading(true);
      setError("");

      try {
        const chosenTenantId = workspace.isPlatformAdmin ? null : workspace.tenantId;
        const result = await authRepository.verifyPhoneOtp(
          phone.trim(),
          code,
          chosenTenantId,
          false,
          workspace.isPlatformAdmin
        );
        handleVerifyOutcome(result);
      } catch (err) {
        setErrorWithShake(err instanceof Error ? err.message : t("auth.phoneOtp.verifyFailed"));
      } finally {
        setIsLoading(false);
      }
    },
    [phone, code, authRepository, handleVerifyOutcome, t, setErrorWithShake]
  );

  // ── Resend ──
  const resendOtp = useCallback(async () => {
    if (cooldown > 0) return;
    setIsLoading(true);
    try {
      const result = await authRepository.requestPhoneOtp(phone.trim(), tenantId);
      setCooldown(result?.retryAfterSeconds ?? 60);
    } catch {
      /* silent — enumeration-safe */
    } finally {
      setIsLoading(false);
    }
  }, [phone, cooldown, tenantId, authRepository]);

  // ── Change number (go back to phone step) ──
  const changeNumber = useCallback(() => {
    setStep("phone");
    setCode("");
    setError("");
    setAvailableWorkspaces([]);
  }, []);

  return {
    step,
    phone,
    code,
    isLoading,
    error,
    cooldown,
    shakeKey,
    availableWorkspaces,
    setPhone,
    setCode,
    requestOtp,
    verifyOtp,
    selectWorkspace,
    resendOtp,
    changeNumber,
  };
}
