/**
 * useForgotPasswordViewModel — 5-step password reset flow state machine.
 *
 * Steps:
 *   1. request   — Enter email + pick delivery method (OTP or Magic Link)
 *   2. method    — Choose OTP or Magic Link (after email validated)
 *   3. otp       — Enter 6-digit OTP (if OTP method chosen)
 *   4. workspaces — Pick which workspace to reset (if multi-tenant)
 *   5. newPassword — Enter new password (after OTP + workspace verified)
 *   6. success   — Done!
 *
 * Anti-enumeration: Step 1 always shows "if account exists, instructions sent"
 * regardless of whether email exists. Step 3/4 errors are generic.
 *
 * Architecture: Pure ViewModel — no direct API/service imports.
 * All HTTP goes through `getAuthContainer().passwordResetRepository`.
 */
"use client";

import type { FormEvent } from "react";
import type { ResetWorkspaceOption } from "@modules/auth/core/domain/interfaces/IPasswordResetRepository";
import { useCallback, useState, useRef } from "react";
import { getAuthContainer } from "@modules/auth/di";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ForgotPasswordStep =
  | "request" // Step 1: enter email
  | "method" // Step 2: pick OTP or Magic Link
  | "otp" // Step 3: enter 6-digit code
  | "workspaces" // Step 4: pick workspace (multi-tenant)
  | "newPassword" // Step 5: enter new password
  | "success"; // Step 6: done!

export type ResetMethod = "otp" | "magic-link";

// Re-export the domain type under a convenient alias for the view
export type WorkspaceOption = ResetWorkspaceOption;

export interface UseForgotPasswordViewModelReturn {
  // State
  step: ForgotPasswordStep;
  email: string;
  method: ResetMethod;
  otp: string;
  newPassword: string;
  confirmPassword: string;
  isLoading: boolean;
  error: string;
  cooldown: number;
  workspaces: WorkspaceOption[];
  selectedWorkspace: WorkspaceOption | null;

  // Actions
  setEmail: (v: string) => void;
  setOtp: (v: string) => void;
  setNewPassword: (v: string) => void;
  setConfirmPassword: (v: string) => void;
  submitEmail: (e: FormEvent) => void;
  chooseMethod: (m: ResetMethod) => void;
  submitOtp: (e: FormEvent) => void;
  selectWorkspace: (w: WorkspaceOption) => void;
  submitNewPassword: (e: FormEvent) => void;
  resendCode: () => void;
  goBack: () => void;
  restart: () => void;

  // Computed
  canSubmitEmail: boolean;
  canSubmitOtp: boolean;
  canSubmitNewPassword: boolean;
  passwordStrength: number; // 0-4
  passwordsMatch: boolean;
}

// Password strength helper
function calcStrength(pwd: string): number {
  if (pwd.length === 0) return 0;
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
}

// ─── ViewModel ────────────────────────────────────────────────────────────────

export function useForgotPasswordViewModel(): UseForgotPasswordViewModelReturn {
  // ── State ──
  const [step, setStep] = useState<ForgotPasswordStep>("request");
  const [email, setEmail] = useState("");
  const [method, setMethod] = useState<ResetMethod>("otp");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [workspaces, setWorkspaces] = useState<WorkspaceOption[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<WorkspaceOption | null>(null);

  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCooldown = useCallback((seconds: number) => {
    setCooldown(seconds);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }, []);

  // ── Step 1: Submit email → go to method choice ──
  const submitEmail = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!email.trim()) return;
      // Move to method pick — the actual send happens in chooseMethod
      setError("");
      setStep("method");
    },
    [email]
  );

  // ── Step 2: Choose method → send request ──
  const chooseMethod = useCallback(
    async (m: ResetMethod) => {
      setMethod(m);
      setIsLoading(true);
      setError("");

      try {
        const { passwordResetRepository } = getAuthContainer();
        await passwordResetRepository.requestReset(email.trim(), m);

        if (m === "magic-link") {
          // Magic link — always go to "success" since user clicks the link in email
          setStep("success");
        } else {
          // OTP — go to OTP entry step
          startCooldown(60);
          setStep("otp");
        }
      } catch {
        // Anti-enumeration: always show "instructions sent" regardless
        if (m === "magic-link") {
          setStep("success");
        } else {
          startCooldown(60);
          setStep("otp");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [email, startCooldown]
  );

  // ── Step 3: Submit OTP ──
  const submitOtp = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (otp.length !== 6) return;

      setIsLoading(true);
      setError("");

      try {
        const { passwordResetRepository } = getAuthContainer();
        const result = await passwordResetRepository.verifyOtp(email.trim(), otp);

        if (result.workspaces && result.workspaces.length > 1) {
          // Multi-workspace: show picker
          setWorkspaces(result.workspaces);
          setStep("workspaces");
        } else if (result.workspaces && result.workspaces.length === 1) {
          // Single workspace: auto-select, go to new password
          setSelectedWorkspace(result.workspaces[0]);
          setStep("newPassword");
        } else {
          // No workspaces (platform admin or simple flow)
          setStep("newPassword");
        }
      } catch (err) {
        // Show the server error message if available (already localized by the backend),
        // otherwise fall back to a safe generic message.
        // The view renders vm.error directly — for a better UX the error string
        // comes from the API response body when present.
        setError(err instanceof Error && err.message ? err.message : "auth.otpInvalidOrExpired");
      } finally {
        setIsLoading(false);
      }
    },
    [email, otp]
  );

  // ── Step 4: Select workspace ──
  const selectWorkspace = useCallback((w: WorkspaceOption) => {
    setSelectedWorkspace(w);
    setStep("newPassword");
  }, []);

  // ── Step 5: Submit new password ──
  const submitNewPassword = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (newPassword !== confirmPassword || newPassword.length < 8) return;

      setIsLoading(true);
      setError("");

      try {
        const { passwordResetRepository } = getAuthContainer();
        await passwordResetRepository.resetPassword({
          email: email.trim(),
          otp,
          newPassword,
          tenantId: selectedWorkspace?.tenantId,
        });
        setStep("success");
      } catch (err) {
        // Show the server error message if available (already localized by the backend),
        // otherwise fall back to a safe generic message.
        setError(
          err instanceof Error && err.message ? err.message : "auth.resetPasswordFailedError"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [email, otp, newPassword, confirmPassword, selectedWorkspace]
  );

  // ── Resend OTP ──
  const resendCode = useCallback(async () => {
    if (cooldown > 0) return;
    setIsLoading(true);
    try {
      const { passwordResetRepository } = getAuthContainer();
      await passwordResetRepository.requestReset(email.trim(), "otp");
      startCooldown(60);
    } catch {
      /* silent — anti-enumeration */
    } finally {
      setIsLoading(false);
    }
  }, [email, cooldown, startCooldown]);

  // ── Navigation ──
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
      case "newPassword":
        if (workspaces.length > 1) setStep("workspaces");
        else setStep("otp");
        break;
      default:
        setStep("request");
    }
  }, [step, workspaces]);

  const restart = useCallback(() => {
    setStep("request");
    setEmail("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setCooldown(0);
    setWorkspaces([]);
    setSelectedWorkspace(null);
  }, []);

  // ── Computed ──
  const canSubmitEmail = email.trim().length > 3 && email.includes("@");
  const canSubmitOtp = otp.length === 6;
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const canSubmitNewPassword = newPassword.length >= 8 && passwordsMatch && !isLoading;

  return {
    step,
    email,
    method,
    otp,
    newPassword,
    confirmPassword,
    isLoading,
    error,
    cooldown,
    workspaces,
    selectedWorkspace,

    setEmail,
    setOtp,
    setNewPassword,
    setConfirmPassword,
    submitEmail,
    chooseMethod,
    submitOtp,
    selectWorkspace,
    submitNewPassword,
    resendCode,
    goBack,
    restart,

    canSubmitEmail,
    canSubmitOtp,
    canSubmitNewPassword,
    passwordStrength: calcStrength(newPassword),
    passwordsMatch,
  };
}
