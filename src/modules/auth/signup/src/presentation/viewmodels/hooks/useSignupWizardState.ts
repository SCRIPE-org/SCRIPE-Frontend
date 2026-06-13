"use client";

// ═══════════════════════════════════════════════════════════════════════════
// useSignupWizardState — Core Wizard State Hook
//
// Owns: step, wizardData, error, isLoading, selectedPlan,
//       checkoutCanceled, provisioningStep.
//
// Handles: field updates, plan selection, discovery answers, category
//          selection, navigation (goBack/editPlan), Stripe cancel-url
//          restoration.
//
// Does NOT: make API calls (that is the responsibility of the other hooks).
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { INITIAL_WIZARD_DATA } from "../../../domain/constants/signupConstants";
import { readPersistedWizardState } from "../../../data/helpers/wizardStorage";
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

const CURRENCY_TO_COUNTRY: Record<string, string> = {
  USD: "US", EUR: "DE", GBP: "GB", SAR: "SA", AED: "AE",
  EGP: "EG", KWD: "KW", QAR: "QA", BHD: "BH", OMR: "OM",
  JOD: "JO", TRY: "TR", PKR: "PK", INR: "IN", CNY: "CN",
  JPY: "JP", KRW: "KR", MYR: "MY", SGD: "SG", AUD: "AU",
  CAD: "CA", CHF: "CH", SEK: "SE", NOK: "NO", DKK: "DK",
  MAD: "MA", TND: "TN", DZD: "DZ", NGN: "NG", ZAR: "ZA",
  BRL: "BR", MXN: "MX", ARS: "AR", CLP: "CL", COP: "CO",
};

  // ── Currency (user-overridable; prevents geo-detection re-applying) ──────
  const setCurrency = useCallback((currency: string) => {
    hasAppliedPricingContext.current = true;
    const region = CURRENCY_TO_COUNTRY[currency.toUpperCase()] || null;
    setWizardData((prev) => ({ ...prev, currency, region }));
  }, []);

  // ── Apply geo-detected currency once (from pricingContext) ───────────────
  const applyRecommendedCurrency = useCallback((recommendedCurrency: string, detectedCountry?: string | null) => {
    if (hasAppliedPricingContext.current) return;
    hasAppliedPricingContext.current = true;
    const region = detectedCountry || CURRENCY_TO_COUNTRY[recommendedCurrency.toUpperCase()] || null;
    setWizardData((prev) => ({ ...prev, currency: recommendedCurrency, region }));
  }, []);

  // ── Discovery (Q1/Q2/Q3) ────────────────────────────────────────────────
  const setDiscovery = useCallback(
    (answers: {
      businessType: string | null;
      teamSize: string | null;
      primaryPriority: string | null;
      categoryCount: number;
      recommendedTier?: string | null;
    }) => {
      setWizardData((prev) => ({
        ...prev,
        businessType: answers.businessType,
        teamSize: answers.teamSize,
        primaryPriority: answers.primaryPriority,
        recommendedTier: answers.recommendedTier ?? null,
        categoryKey: answers.businessType,
      }));
      setNavigationDirection(1);
      // Go directly to plans if businessType is already selected (highly optimal UI/UX)
      const nextStep = (answers.businessType || answers.categoryCount <= 1) ? "plan" : "category";
      setStep(nextStep);
    },
    []
  );

  // ── Category selection ───────────────────────────────────────────────────
  const selectCategory = useCallback((categoryKey: string | null) => {
    setWizardData((prev) => ({ ...prev, categoryKey }));
    setNavigationDirection(1);
    setStep("plan");
  }, []);

  const skipCategoryStep = useCallback(() => {
    setNavigationDirection(1);
    setStep((current) => (current === "category" ? "plan" : current));
  }, []);

  // ── Plan selection ───────────────────────────────────────────────────────
  const selectPlan = useCallback(
    (edition: PublicEdition, billingCycle: "monthly" | "annual") => {
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
        billingCycle: edition.checkoutMode !== "contact-sales"
          ? (billingCycle === "monthly" ? "Monthly" : "Annual")
          : prev.billingCycle,
      }));
      setNavigationDirection(1);
      setStep(edition.checkoutMode === "contact-sales" ? "contact-sales" : "account");
    },
    []
  );

  // ── Navigation ───────────────────────────────────────────────────────────
  const goBack = useCallback(() => {
    setError("");
    setNavigationDirection(-1);  // ← batched with setStep in React 18 → single render
    switch (step) {
      case "category":    setStep("discovery"); break;
      case "plan":        setStep("category"); break;
      case "account":
      case "contact-sales": setStep("plan"); break;
      case "verification": setStep("account"); break;
      case "workspace":   setStep("verification"); break;
      case "review":      setStep("workspace"); break;
      default: break;
    }
  }, [step]);

  const editPlan = useCallback(() => {
    setError("");
    setNavigationDirection(-1);  // editing plan = going backward
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
    selectCategory,
    skipCategoryStep,
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
