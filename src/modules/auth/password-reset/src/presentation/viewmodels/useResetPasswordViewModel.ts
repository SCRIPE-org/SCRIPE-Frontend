"use client";

import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getAuthContainer } from "@modules/auth/di";
import type { ResetWorkspaceOption } from "@modules/auth/core/domain/interfaces/IPasswordResetRepository";

/**
 * Step machine for the magic-link password reset page (/reset-password?otp=CODE&email=EMAIL).
 *
 *   verifying  → calls verifyOtp on mount (PeekOtp — does NOT consume the code)
 *   workspaces → multi-tenant: user picks which workspaces to reset
 *   password   → enter new password
 *   success    → done
 *   invalid    → OTP expired / missing params
 */
export type ResetPasswordStep = "verifying" | "workspaces" | "password" | "success" | "invalid";

export function useResetPasswordViewModel(params: {
  email: string;
  otp: string;
  fallbackErrorMessage: string;
}) {
  const { email, otp, fallbackErrorMessage } = params;

  const [step, setStep] = useState<ResetPasswordStep>("verifying");
  const [workspaces, setWorkspaces] = useState<ResetWorkspaceOption[]>([]);
  const [selectedWorkspaces, setSelectedWorkspaces] = useState<ResetWorkspaceOption[]>([]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const verifiedRef = useRef(false);

  // On mount: peek at the OTP to validate the link and discover workspaces.
  // PeekOtpAsync does NOT consume the code — the final reset step does that.
  useEffect(() => {
    if (verifiedRef.current) return;
    verifiedRef.current = true;

    if (!otp || !email) {
      setStep("invalid");
      return;
    }

    getAuthContainer()
      .passwordResetRepository.verifyOtp(email, otp)
      .then((result) => {
        if (result.workspaces && result.workspaces.length > 1) {
          setWorkspaces(result.workspaces);
          setSelectedWorkspaces(result.workspaces); // pre-select all
          setStep("workspaces");
        } else {
          if (result.workspaces?.length === 1) {
            setWorkspaces(result.workspaces);
            setSelectedWorkspaces(result.workspaces);
          }
          setStep("password");
        }
      })
      .catch(() => setStep("invalid"));
  }, [email, otp]);

  const isValid = useMemo(
    () => password.length >= 8 && password === confirmPassword,
    [confirmPassword, password]
  );

  // ── Workspace selection ────────────────────────────────────────────────────

  const toggleWorkspace = useCallback((w: ResetWorkspaceOption) => {
    setSelectedWorkspaces((prev) =>
      prev.some((s) => s.tenantId === w.tenantId)
        ? prev.filter((s) => s.tenantId !== w.tenantId)
        : [...prev, w]
    );
  }, []);

  const selectAllWorkspaces = useCallback(() => setSelectedWorkspaces(workspaces), [workspaces]);
  const deselectAllWorkspaces = useCallback(() => setSelectedWorkspaces([]), []);

  const confirmWorkspaceSelection = useCallback(() => {
    if (selectedWorkspaces.length === 0) return;
    setStep("password");
  }, [selectedWorkspaces]);

  const allSelected = workspaces.length > 0 && selectedWorkspaces.length === workspaces.length;
  const canConfirmWorkspaces = selectedWorkspaces.length > 0;

  // ── Submit new password ────────────────────────────────────────────────────

  const submit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      if (!isValid) return;

      setIsSubmitting(true);
      setError(null);

      try {
        await getAuthContainer().passwordResetRepository.resetPassword({
          email,
          otp,
          newPassword: password,
          // Pass selected tenantIds so the backend resets only those workspaces.
          // Empty/omitted → backend resets ALL (fallback for single-tenant accounts).
          tenantIds:
            selectedWorkspaces.length > 0
              ? selectedWorkspaces.map((w) => w.tenantId)
              : undefined,
        });
        setStep("success");
      } catch (err) {
        setError(err instanceof Error ? err.message : fallbackErrorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, fallbackErrorMessage, isValid, otp, password, selectedWorkspaces]
  );

  return {
    step,
    workspaces,
    selectedWorkspaces,
    allSelected,
    canConfirmWorkspaces,
    toggleWorkspace,
    selectAllWorkspaces,
    deselectAllWorkspaces,
    confirmWorkspaceSelection,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    isSubmitting,
    error,
    isValid,
    submit,
  };
}
