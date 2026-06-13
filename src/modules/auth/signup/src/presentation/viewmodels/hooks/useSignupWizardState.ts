"use client";

// ═══════════════════════════════════════════════════════════════════════════
// useSignupWizardState — Core Wizard State Hook
//
// Owns: step, wizardData, error, isLoading, selectedPlan,
//       checkoutCanceled, provisioningStep.
//
// Handles: field updates, plan selection, discovery answers,
//          navigation (goBack/editPlan), Stripe cancel-url restoration.
//
// Does NOT: make API calls (that is the responsibility of the other hooks).
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { INITIAL_WIZARD_DATA } from "../../../domain/constants/signupConstants";
import { readPersistedWizardState } from "../../../data/helpers/wizardStorage";
import { CURRENCY_TO_COUNTRY } from "../../../data/helpers/currencyGeo";
import type {
  SignupStep,
  SignupWizardData,
  SelectedPlan,
  PublicEdition,
  CheckoutMode,
  ResumeSessionResult,
} from "../../../domain/entities";

interface UseSignupWizardStateOptions {
  /** Current i18n language — used to set defaultLocale on first load */
  language: string;
}

export function useSignupWizardState({ language }: UseSignupWizardStateOptions) {
  const searchParams = useSearchParams();

  const [step, setStep] = useState<SignupStep>("discovery");
  const [navigationDirection, setNavigationDirection] = useState<1 | -1>(1);
  const [wizardData, setWizardData] = useState<SignupWizardData>(() => ({
    ...INITIAL_WIZARD_DATA,
    defaultLocale: language === "ar" ? "ar" : "en",
  }));
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SelectedPlan | null>(null);
  const [checkoutCanceled, setCheckoutCanceled] = useState(false);
  const [provisioningStep, setProvisioningStep] = useState(0);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [pendingResumeInfo, setPendingResumeInfo] = useState<ResumeSessionResult | null>(null);

  // ── Ref so the pricing-context effect can check whether user already set a currency ──
  const hasAppliedPricingContext = useRef(false);

  // ── Restore persisted wizard state on Stripe cancel-url round-trip ──────
  useEffect(() => {
    const canceled = searchParams?.get("canceled") === "1";
    const changePlan = searchParams?.get("change-plan") === "1";

    if (changePlan) {
      // User clicked "Change plan" from the finalize page — restore state and jump to plan step
      const persisted = readPersistedWizardState();
      if (persisted?.wizardData) {
        setWizardData((prev) => ({ ...prev, ...persisted.wizardData }));
      }
      setNavigationDirection(-1);
      setStep("plan");
      return;
    }

    if (!canceled) return;

    const persisted = readPersistedWizardState();
    if (persisted?.wizardData.emailVerificationToken) {
      setWizardData((prev) => ({ ...prev, ...persisted.wizardData }));
      setSelectedPlan(persisted.selectedPlan);
      setStep("review");
    }
    setCheckoutCanceled(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Field update ─────────────────────────────────────────────────────────
  const updateField = useCallback(
    <K extends keyof SignupWizardData>(field: K, value: SignupWizardData[K]) => {
      setWizardData((prev) => ({ ...prev, [field]: value }));
      if (error) setError("");
    },
    [error]
  );

  // ── Currency (user-overridable; prevents geo-detection re-applying) ──────
  const setCurrency = useCallback((currency: string) => {
    hasAppliedPricingContext.current = true;
    const region = CURRENCY_TO_COUNTRY[currency.toUpperCase()] || null;
    setWizardData((prev) => ({ ...prev, currency, region }));
  }, []);

  // ── Apply geo-detected currency once (from pricingContext) ───────────────
  const applyRecommendedCurrency = useCallback(
    (recommendedCurrency: string, detectedCountry?: string | null) => {
      if (hasAppliedPricingContext.current) return;
      hasAppliedPricingContext.current = true;
      const region =
        detectedCountry || CURRENCY_TO_COUNTRY[recommendedCurrency.toUpperCase()] || null;
      setWizardData((prev) => ({ ...prev, currency: recommendedCurrency, region }));
    },
    []
  );

  // ── Discovery (Q1/Q2/Q3) ────────────────────────────────────────────────
  const setDiscovery = useCallback(
    (answers: {
      businessType: string | null;
      teamSize: string | null;
      primaryPriority: string | null;
      categoryCount: number;
      recommendedTier?: string | null;
      recommendationReasons?: string[] | null;
    }) => {
      setWizardData((prev) => ({
        ...prev,
        businessType: answers.businessType,
        teamSize: answers.teamSize,
        primaryPriority: answers.primaryPriority,
        recommendedTier: answers.recommendedTier ?? null,
        recommendationReasons: answers.recommendationReasons ?? null,
        categoryKey: answers.businessType,
      }));
      setNavigationDirection(1);
      // Go directly to plans step after discovery (highly optimal UI/UX)
      setStep("plan");
    },
    []
  );

  // ── Plan selection ───────────────────────────────────────────────────────
  const selectPlan = useCallback((edition: PublicEdition, billingCycle: "monthly" | "annual") => {
    const plan: SelectedPlan = {
      id: edition.id,
      name: edition.name,
      trialDays: edition.trialDays > 0 ? edition.trialDays : null,
      checkoutMode: edition.checkoutMode,
      monthlyPrice: edition.monthlyPrice,
      annualPrice: edition.annualPrice,
      currency: edition.currency,
      priceDisplay: edition.priceDisplay,
    };
    setSelectedPlan(plan);
    setWizardData((prev) => ({
      ...prev,
      editionId: edition.id || null,
      billingCycle:
        edition.checkoutMode !== "contact-sales"
          ? billingCycle === "monthly"
            ? "Monthly"
            : "Annual"
          : prev.billingCycle,
    }));
    setNavigationDirection(1);
    setStep(edition.checkoutMode === "contact-sales" ? "contact-sales" : "account");
  }, []);

  // ── Navigation ───────────────────────────────────────────────────────────
  const goBack = useCallback(() => {
    setError("");
    setNavigationDirection(-1); // ← batched with setStep in React 18 → single render
    switch (step) {
      // "plan" is the first interactive step after Discovery — back returns to Discovery.
      // (The standalone "category" step was retired; the vertical is asked once in Q1.)
      case "plan":
        setStep("discovery");
        break;
      case "account":
      case "contact-sales":
        setStep("plan");
        break;
      case "verification":
        setStep("account");
        break;
      case "workspace":
        setStep("verification");
        break;
      case "review":
        setStep("workspace");
        break;
      default:
        break;
    }
  }, [step]);

  const editPlan = useCallback(() => {
    setError("");
    setNavigationDirection(-1); // editing plan = going backward
    setStep("plan");
  }, []);

  const dismissCheckoutCanceled = useCallback(() => setCheckoutCanceled(false), []);

  return {
    // State
    step,
    setStep,
    navigationDirection,
    wizardData,
    setWizardData,
    error,
    setError,
    isLoading,
    setIsLoading,
    selectedPlan,
    setSelectedPlan,
    checkoutCanceled,
    provisioningStep,
    setProvisioningStep,
    showResumeModal,
    setShowResumeModal,
    pendingResumeInfo,
    setPendingResumeInfo,
    // Derived
    selectedCheckoutMode: (selectedPlan?.checkoutMode ?? "free") as CheckoutMode,
    selectedCategory: wizardData.categoryKey,
    // Actions
    updateField,
    setCurrency,
    applyRecommendedCurrency,
    setDiscovery,
    selectPlan,
    goBack,
    editPlan,
    dismissCheckoutCanceled,
    discoveryAnswers: {
      businessType: wizardData.businessType,
      teamSize: wizardData.teamSize,
      primaryPriority: wizardData.primaryPriority,
    },
  };
}
