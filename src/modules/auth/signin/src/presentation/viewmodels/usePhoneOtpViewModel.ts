"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { authContainer } from "@modules/auth/di";
import type { LoginResponseModel } from "@modules/auth/core/domain/types/AuthTypes";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PhoneOtpStep = "phone" | "code";

export interface UsePhoneOtpViewModelReturn {
  // State
  step: PhoneOtpStep;
  phone: string;
  code: string;
  isLoading: boolean;
  error: string;
  cooldown: number;
  shakeKey: number;

  // Actions
  setPhone: (value: string) => void;
  setCode: (value: string) => void;
  requestOtp: () => Promise<void>;
  verifyOtp: () => Promise<void>;
  resendOtp: () => Promise<void>;
  changeNumber: () => void;
}

// ─── ViewModel ────────────────────────────────────────────────────────────────

/**
 * usePhoneOtpViewModel — Business logic for Phone/SMS OTP sign-in.
 *
 * Extracted from PhoneOtpForm.tsx to enforce SCRIPE MVVM architecture:
 * View → ViewModel → Repository → Service → HTTP
 *
 * Only the ViewModel touches `authContainer` — the component is a pure render.
 *
 * Multi-workspace: If the OTP verify returns `requiresWorkspaceSelection`,
 * `onWorkspaceSelection` is called so the parent can show the workspace picker.
 *
 * Security:
 * - Rate limited (per-user policy)
 * - OTP expires after 5 minutes
 * - Enumeration-safe: always shows "Code sent" even if phone not found
 * - Cooldown prevents rapid resend (30s)
 */
export function usePhoneOtpViewModel(
  onSuccess: (result: { accessToken: string; refreshToken: string }) => void,
  onWorkspaceSelection?: (response: LoginResponseModel) => void
): UsePhoneOtpViewModelReturn {
  const { t } = useI18n();
  const { authRepository } = authContainer;

  // ── State ──
  const [step, setStep] = useState<PhoneOtpStep>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
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

  // ── Request OTP ──
  const requestOtp = useCallback(async () => {
    if (!phone.trim()) {
      setErrorWithShake(t("auth.phoneOtp.phoneRequired") || "Please enter your phone number.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await authRepository.requestPhoneOtp(phone.trim());
      setCooldown(result?.retryAfterSeconds ?? 30);
      setStep("code");
    } catch (err) {
      setErrorWithShake(
        err instanceof Error
          ? err.message
          : t("auth.phoneOtp.requestFailed") || "Failed to send code. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }, [phone, authRepository, t, setErrorWithShake]);

  // ── Verify OTP ──
  const verifyOtp = useCallback(async () => {
    if (code.length !== 6) {
      setErrorWithShake(t("auth.phoneOtp.invalidCode") || "Please enter the 6-digit code.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await authRepository.verifyPhoneOtp(phone.trim(), code);

      // ── Multi-workspace: show workspace picker ───────────────────────
      if (result.requiresWorkspaceSelection && result.availableWorkspaces?.length) {
        if (onWorkspaceSelection) {
          onWorkspaceSelection(result);
        }
        return;
      }

      // ── Single workspace: direct login ───────────────────────────────
      onSuccess({ accessToken: result.accessToken, refreshToken: result.refreshToken ?? "" });
    } catch (err) {
      setErrorWithShake(
        err instanceof Error
          ? err.message
          : t("auth.phoneOtp.verifyFailed") || "Invalid or expired code."
      );
    } finally {
      setIsLoading(false);
    }
  }, [phone, code, authRepository, onSuccess, onWorkspaceSelection, t, setErrorWithShake]);

  // ── Resend ──
  const resendOtp = useCallback(async () => {
    if (cooldown > 0) return;
    setIsLoading(true);
    try {
      const result = await authRepository.requestPhoneOtp(phone.trim());
      setCooldown(result?.retryAfterSeconds ?? 30);
    } catch {
      /* silent — enumeration-safe */
    } finally {
      setIsLoading(false);
    }
  }, [phone, cooldown, authRepository]);

  // ── Change number (go back to phone step) ──
  const changeNumber = useCallback(() => {
    setStep("phone");
    setCode("");
    setError("");
  }, []);

  return {
    step,
    phone,
    code,
    isLoading,
    error,
    cooldown,
    shakeKey,
    setPhone,
    setCode,
    requestOtp,
    verifyOtp,
    resendOtp,
    changeNumber,
  };
}
