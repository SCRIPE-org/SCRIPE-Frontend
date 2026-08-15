"use client";

// ═══════════════════════════════════════════════════════════════════════════
// useSignupOtp — OTP Sending, Verification, Resend
//
// Owns: otpCode, otpSent, otpResendCooldown, isVerifyingOtpRef.
// Handles: cooldown timer lifecycle (cleanup on unmount).
//
// Design: Enumeration-safe — always advances to "verification" step even on
// network error, so the backend can't be used to confirm email existence.
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useCallback, useRef, useEffect } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import type { ISignupRepository } from "../../../domain/interfaces/ISignupRepository";
import type { SignupStep } from "../../../domain/entities";

interface UseSignupOtpOptions {
  repository: ISignupRepository;
  email: string;
  setStep: (step: SignupStep) => void;
  setError: (msg: string) => void;
  setIsLoading: (v: boolean) => void;
  updateField: <K extends "emailVerificationToken">(field: K, value: string | null) => void;
}

/**
 * React hook/ViewModel orchestrating state and data flows for signup otp.
 * Handles active states updates, form fields validations, and browser navigation controllers.
 */
export function useSignupOtp({
  repository,
  email,
  setStep,
  setError,
  setIsLoading,
  updateField,
}: UseSignupOtpOptions) {
  const { t } = useI18n();

  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpResendCooldown, setOtpResendCooldown] = useState(0);

  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isVerifyingOtpRef = useRef(false);

  // ── Cleanup cooldown on unmount ──────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  // ── Cooldown ticker ──────────────────────────────────────────────────────
  const startCooldown = useCallback((seconds: number) => {
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    setOtpResendCooldown(seconds);
    cooldownRef.current = setInterval(() => {
      setOtpResendCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // ── Submit account (Account step → send OTP → go to Verification) ───────
  //
  // Validation here is a final guard; the primary validation happens in
  // AccountStep's react-hook-form + Zod schema (accountSchema).
  const submitAccount = useCallback(
    async (validatedEmail: string) => {
      setIsLoading(true);
      setError("");
      try {
        const result = await repository.sendOtp(validatedEmail.trim().toLowerCase());
        setOtpSent(true);
        setStep("verification");
        startCooldown(result.retryAfterSeconds || 60);
      } catch {
        // Enumeration-safe: always advance to verification — don't reveal if email exists
        setOtpSent(true);
        setStep("verification");
        startCooldown(60);
      } finally {
        setIsLoading(false);
      }
    },
    [repository, setIsLoading, setError, setStep, startCooldown]
  );

  // ── Verify OTP ───────────────────────────────────────────────────────────
  const verifyOtp = useCallback(async () => {
    if (isVerifyingOtpRef.current) return;
    if (otpCode.length !== 6) {
      setError(t("signup.verification.enterCode") || "Please enter the 6-digit code.");
      return;
    }

    isVerifyingOtpRef.current = true;
    setIsLoading(true);
    setError("");

    try {
      const result = await repository.verifyOtp(email.trim().toLowerCase(), otpCode);
      if (result.isValid && result.verificationToken) {
        updateField("emailVerificationToken", result.verificationToken);
        setOtpCode("");
        setStep("workspace");
      } else {
        setError(
          result.error || t("signup.verification.invalidCode") || "Invalid or expired code."
        );
        isVerifyingOtpRef.current = false;
      }
    } catch {
      setError(
        t("signup.verification.verificationFailed") || "Verification failed. Please try again."
      );
      isVerifyingOtpRef.current = false;
    } finally {
      setIsLoading(false);
    }
  }, [otpCode, email, repository, updateField, setStep, setError, setIsLoading, t]);

  // ── Resend OTP ───────────────────────────────────────────────────────────
  const resendOtp = useCallback(async () => {
    if (otpResendCooldown > 0) return;
    setIsLoading(true);
    try {
      const result = await repository.sendOtp(email.trim().toLowerCase());
      startCooldown(result.retryAfterSeconds || 60);
      setOtpCode("");
    } catch {
      startCooldown(60);
    } finally {
      setIsLoading(false);
    }
  }, [otpResendCooldown, repository, email, startCooldown, setIsLoading]);

  return {
    otpCode,
    setOtpCode,
    otpSent,
    otpResendCooldown,
    submitAccount,
    verifyOtp,
    resendOtp,
  };
}
