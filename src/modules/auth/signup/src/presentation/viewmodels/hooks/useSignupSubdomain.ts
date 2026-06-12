"use client";

// ═══════════════════════════════════════════════════════════════════════════
// useSignupSubdomain — Subdomain Availability Check + Workspace Submission
//
// Owns: subdomainResult, isCheckingSubdomain, subdomainDebounceRef.
// Debounce: 500ms after typing stops — prevents flooding the API.
// Fail-open: network errors during check don't block the user; the server
//            validates on submit anyway.
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useCallback, useRef } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { SUBDOMAIN_REGEX, SUBDOMAIN_MIN_LENGTH } from "../../../domain/constants/signupConstants";
import type { ISignupRepository } from "../../../domain/interfaces/ISignupRepository";
import type { SubdomainCheckResult, SignupStep, SignupWizardData } from "../../../domain/entities";

const DEBOUNCE_MS = 500;

interface UseSignupSubdomainOptions {
  repository: ISignupRepository;
  wizardData: SignupWizardData;
  updateField: <K extends keyof SignupWizardData>(field: K, value: SignupWizardData[K]) => void;
  setStep: (step: SignupStep) => void;
  setError: (msg: string) => void;
}

export function useSignupSubdomain({
  repository,
  wizardData,
  updateField,
  setStep,
  setError,
}: UseSignupSubdomainOptions) {
  const { t } = useI18n();

  const [subdomainResult, setSubdomainResult] = useState<SubdomainCheckResult | null>(null);
  const [isCheckingSubdomain, setIsCheckingSubdomain] = useState(false);
  const subdomainDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Debounced availability check ─────────────────────────────────────────
  const checkSubdomain = useCallback(
    (subdomain: string) => {
      updateField("subdomain", subdomain);
      setSubdomainResult(null);

      if (subdomainDebounceRef.current) clearTimeout(subdomainDebounceRef.current);
      if (subdomain.length < SUBDOMAIN_MIN_LENGTH) return;

      if (!SUBDOMAIN_REGEX.test(subdomain)) {
        setSubdomainResult({ available: false, suggestion: null, reason: "invalid_format" });
        return;
      }

      setIsCheckingSubdomain(true);
      subdomainDebounceRef.current = setTimeout(async () => {
        try {
          const result = await repository.checkSubdomain(subdomain);
          setSubdomainResult(result);
        } catch {
          // Fail open — server validates on submit
        } finally {
          setIsCheckingSubdomain(false);
        }
      }, DEBOUNCE_MS);
    },
    [updateField, repository]
  );

  // ── Workspace step submission ─────────────────────────────────────────────
  //
  // Primary validation is from WorkspaceStep's react-hook-form + workspaceSchema.
  // These checks are a safety net for async conditions (availability + token).
  const submitWorkspace = useCallback(async () => {
    if (subdomainResult && !subdomainResult.available) {
      setError(
        t("signup.errors.subdomainUnavailable") || "Please choose an available subdomain."
      );
      return;
    }
    if (!wizardData.emailVerificationToken) {
      setError(
        t("signup.errors.emailVerificationExpired") ||
          "Email verification expired. Please go back and verify again."
      );
      return;
    }
    setStep("review");
  }, [wizardData.emailVerificationToken, subdomainResult, setStep, setError, t]);

  return {
    subdomainResult,
    isCheckingSubdomain,
    checkSubdomain,
    submitWorkspace,
  };
}
