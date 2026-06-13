"use client";

// ═══════════════════════════════════════════════════════════════════════════
// useSignupWizardViewModel — Orchestrator ViewModel
//
// This is the ONLY file views/components import for the signup wizard.
// It:
//   1. Fetches pricingContext + categories via TanStack Query
//   2. Composes the four focused sub-hooks
//   3. Returns a flat, stable API (no prop drilling)
//
// Architecture rules enforced here:
//   - authContainer is accessed ONLY here (one DI access point)
//   - Views never import sub-hooks directly
//   - All repository calls go through sub-hooks (not directly from this hook)
// ═══════════════════════════════════════════════════════════════════════════

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { authContainer } from "@modules/auth/di";
import type { PublicCategory, PricingContext, SupportedCurrency } from "../../domain/entities";
import { useSignupWizardState } from "./hooks/useSignupWizardState";
import { useSignupOtp } from "./hooks/useSignupOtp";
import { useSignupSubdomain } from "./hooks/useSignupSubdomain";
import { useSignupProvisioning } from "./hooks/useSignupProvisioning";
import {
  getPersistedSignupRef,
  clearPersistedWizardState,
  readPersistedWizardState,
} from "../../data/helpers/wizardStorage";

// ── Password strength calculator (pure — no state dep) ─────────────────────
function calcPasswordStrengthScore(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(score, 5);
}

// ─────────────────────────────────────────────────────────────────────────────

export function useSignupWizardViewModel() {
  const router = useRouter();
  const { language } = useI18n();
  // Single DI access point — all sub-hooks receive repository as a prop
  const { signupRepository } = authContainer;

  // ── 1. Core wizard state ─────────────────────────────────────────────────
  const state = useSignupWizardState({ language });

  // ── 2. Pricing context (geo-detected currency + FX rates) ────────────────
  const { data: pricingContext, isLoading: isCurrencyLoading } = useQuery<PricingContext>({
    queryKey: ["signup-pricing-context"],
    queryFn: () => signupRepository.getPricingContext(),
    staleTime: 10 * 60 * 1000, // 10 min — IP doesn't change mid-session
    retry: 1,
  });

  // Apply geo-detected currency once (user manual selection blocks re-apply)
  useEffect(() => {
    if (pricingContext?.recommendedCurrency) {
      state.applyRecommendedCurrency(
        pricingContext.recommendedCurrency,
        pricingContext.detectedCountry
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pricingContext?.recommendedCurrency, pricingContext?.detectedCountry]);

  // ── 3. Categories (currency-aware refetch) ───────────────────────────────
  const { data: categories = [] as PublicCategory[], isLoading: isCategoriesLoading } = useQuery<
    PublicCategory[]
  >({
    queryKey: ["signup-categories", state.wizardData.currency, language],
    queryFn: () => signupRepository.getCategories(state.wizardData.currency, language),
    staleTime: 5 * 60 * 1000,
  });

  // ── 4. OTP sub-hook ──────────────────────────────────────────────────────
  const otp = useSignupOtp({
    repository: signupRepository,
    email: state.wizardData.email,
    setStep: state.setStep,
    setError: state.setError,
    setIsLoading: state.setIsLoading,
    updateField: state.updateField,
  });

  // ── 5. Subdomain sub-hook ────────────────────────────────────────────────
  const subdomain = useSignupSubdomain({
    repository: signupRepository,
    wizardData: state.wizardData,
    updateField: state.updateField,
    setStep: state.setStep,
    setError: state.setError,
  });

  // ── 6. Provisioning sub-hook ─────────────────────────────────────────────
  const provisioning = useSignupProvisioning({
    repository: signupRepository,
    wizardData: state.wizardData,
    selectedPlan: state.selectedPlan,
    language,
    setStep: state.setStep,
    setError: state.setError,
    setIsLoading: state.setIsLoading,
    setProvisioningStep: state.setProvisioningStep,
  });

  // ── 7. Resume detection on mount ─────────────────────────────────────────
  // If a SIGNUP_REF is in sessionStorage and there's no ?canceled/change-plan
  // param (those are handled by useSignupWizardState), probe the server to see
  // if the session is still resumable and show the modal.
  useEffect(() => {
    const searchParams = new URLSearchParams(
      typeof window !== "undefined" ? window.location.search : ""
    );
    const isCanceled = searchParams.get("canceled") === "1";
    const isChangePlan = searchParams.get("change-plan") === "1";
    if (isCanceled || isChangePlan) return;

    const existingRef = getPersistedSignupRef();
    if (!existingRef) return;

    signupRepository.resume(existingRef).then((info) => {
      if (info && (info.status === "pending" || info.status === "awaiting_payment")) {
        state.setPendingResumeInfo(info);
        state.setShowResumeModal(true);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Resume modal actions ──────────────────────────────────────────────────
  const resumeSignup = useCallback(() => {
    state.setShowResumeModal(false);
    const persisted = readPersistedWizardState();
    if (persisted?.wizardData) {
      state.setWizardData((prev) => ({ ...prev, ...persisted.wizardData }));
      if (persisted.selectedPlan) state.setSelectedPlan(persisted.selectedPlan);
      state.setStep("review");
    }
  }, [state]);

  const startFreshSignup = useCallback(async () => {
    state.setShowResumeModal(false);
    const existingRef = getPersistedSignupRef();
    if (existingRef) {
      try {
        await signupRepository.abandon(existingRef);
      } catch {
        /* best-effort */
      }
    }
    clearPersistedWizardState();
    state.setStep("discovery");
  }, [signupRepository, state]);

  const changePlanFromModal = useCallback(() => {
    state.setShowResumeModal(false);
    const persisted = readPersistedWizardState();
    if (persisted?.wizardData) {
      state.setWizardData((prev) => ({ ...prev, ...persisted.wizardData }));
    }
    state.setStep("plan");
  }, [state]);

  // ── Password strength (derived, no extra state) ─────────────────────────
  const passwordStrength = calcPasswordStrengthScore(state.wizardData.password);

  // ── updatePassword (field update + no separate state needed) ──────────
  const updatePassword = useCallback(
    (value: string) => state.updateField("password", value),
    [state]
  );

  // ── Navigation ───────────────────────────────────────────────────────────
  const goToLogin = useCallback(() => {
    router.push("/login");
  }, [router]);

  // ── Currency metadata ────────────────────────────────────────────────────
  const supportedCurrencies: SupportedCurrency[] = pricingContext?.supportedCurrencies ?? [];
  const currentCurrencyMeta: SupportedCurrency = supportedCurrencies.find(
    (c) => c.code === state.wizardData.currency
  ) ?? {
    code: state.wizardData.currency,
    symbol: "$",
    nameEn: state.wizardData.currency,
    nameAr: state.wizardData.currency,
    rateFromUsd: 1,
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Flat return — the complete API consumed by all signup views/components
  // ─────────────────────────────────────────────────────────────────────────
  return {
    // ── State ──
    step: state.step,
    navigationDirection: state.navigationDirection,
    wizardData: state.wizardData,
    error: state.error,
    isLoading: state.isLoading,
    checkoutCanceled: state.checkoutCanceled,
    dismissCheckoutCanceled: state.dismissCheckoutCanceled,
    showResumeModal: state.showResumeModal,
    pendingResumeInfo: state.pendingResumeInfo,

    // ── OTP ──
    otpCode: otp.otpCode,
    setOtpCode: otp.setOtpCode,
    otpSent: otp.otpSent,
    otpResendCooldown: otp.otpResendCooldown,

    // ── Subdomain ──
    subdomainResult: subdomain.subdomainResult,
    isCheckingSubdomain: subdomain.isCheckingSubdomain,

    // ── Password ──
    passwordStrength,

    // ── Provisioning ──
    provisioningStep: state.provisioningStep,

    // ── Plan selection (server-authoritative) ──
    selectedPlan: state.selectedPlan,
    selectedEditionName: state.selectedPlan?.name ?? "",
    selectedTrialDays: state.selectedPlan?.trialDays ?? null,
    selectedCheckoutMode: state.selectedCheckoutMode,

    // ── Category + currency ──
    selectedCategory: state.selectedCategory,
    currency: state.wizardData.currency,
    setCurrency: state.setCurrency,
    supportedCurrencies,
    currentCurrencyMeta,
    isCurrencyLoading,
    // Raw pricing context — exposed so plan picker can read detectedCountry + recommendedCurrency
    pricingContext: pricingContext ?? null,

    // ── Discovery ──
    discoveryAnswers: state.discoveryAnswers,

    // ── Categories ──
    categories,
    isCategoriesLoading,

    // ── Actions ──
    updateField: state.updateField,
    updatePassword,
    setDiscovery: state.setDiscovery,
    selectPlan: state.selectPlan,
    submitAccount: otp.submitAccount,
    verifyOtp: otp.verifyOtp,
    resendOtp: otp.resendOtp,
    checkSubdomain: subdomain.checkSubdomain,
    submitWorkspace: subdomain.submitWorkspace,
    submitContactSales: provisioning.submitContactSales,
    startProvisioning: provisioning.startProvisioning,
    goBack: state.goBack,
    editPlan: state.editPlan,
    goToLogin,

    // ── Resume modal ──
    resumeSignup,
    startFreshSignup,
    changePlanFromModal,
  };
}
