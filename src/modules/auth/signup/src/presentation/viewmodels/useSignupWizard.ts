"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { useAppStore } from "@core/store/useAppStore";
import { secureTokenService } from "@core/common/secure-token-service";
import { authContainer } from "@modules/auth/di";
import type { ContactSalesPayload } from "../../domain/interfaces/ISignupRepository";
import type {
  PublicEdition,
  ResumeSessionResult,
  SelectedPlan,
  SignupStep,
  SignupWizardData,
  SubdomainCheckResult,
} from "../../domain/entities";
import type {
  OnboardingRecommendation,
  SignupRecommendationRequest,
  WelcomeContent,
} from "../../domain/entities/OnboardingEntities";
import { INITIAL_WIZARD_DATA } from "../../domain/constants/signupConstants";
import { calcPasswordStrengthScore } from "../helpers/accountLogic";
import { useSignupOtp } from "./hooks/useSignupOtp";
import { useSignupSubdomain } from "./hooks/useSignupSubdomain";
import { useSignupProvisioning } from "./hooks/useSignupProvisioning";
import { shouldShowResumeModal } from "./helpers/reviewLogic";

/** Industry/vertical answer key (Q1) — mirrors useDiscovery.BUSINESS_TYPE_KEY. */
const BUSINESS_TYPE_KEY = "business_type";

/**
 * Maps the legacy SignupStep (returned by setStep inside the reused OTP /
 * subdomain hooks) onto the new phase machine. The hooks advance the flow by
 * calling setStep("verification" | "workspace" | "review"); we translate that
 * to setPhase so the proven orchestration drives the Elevate phases unchanged.
 */
const LEGACY_STEP_TO_PHASE: Partial<Record<SignupStep, SignupPhase>> = {
  account: "account",
  verification: "verification",
  workspace: "workspace",
  review: "review",
  // F8–F10: the reused provisioning hook drives the free-flow tail by calling
  // setStep("provisioning"/"complete") and rolls back to "review"/"workspace" on
  // error — all of which must map onto the new phase machine.
  "contact-sales": "contact-sales",
  provisioning: "provisioning",
  complete: "complete",
};

// ═══════════════════════════════════════════════════════════════════════════
// useSignupWizard — NEW orchestrator viewmodel for the Elevate redesign.
//
// This is intentionally a DISTINCT hook from the legacy useSignupWizardViewModel
// so the old wizard keeps compiling untouched while the new presentation layer
// is built phase-by-phase. It owns:
//   • the phase state machine (linear order + navigation helpers)
//   • the navigation direction (for slide transitions, mirrored under RTL)
//   • the Welcome screen's data fetch (welcome + trust content)
//
// Architecture: this is the ONLY layer that touches authContainer.signupRepository.
// Views and components receive everything they need as props / return values.
// Later phases (discovery, plan, account, …) are filled in subsequently; the
// skeleton below is deliberately clean and extensible.
// ═══════════════════════════════════════════════════════════════════════════

/** Linear phase machine for the new signup flow. */
export type SignupPhase =
  | "welcome"
  | "discovery"
  | "plan"
  | "account"
  | "verification"
  | "workspace"
  | "review"
  | "contact-sales"
  | "provisioning"
  | "complete";

/**
 * The canonical happy-path order. `contact-sales` is a branch target (entered
 * from `plan`), not part of the linear sequence, so it is excluded here; next()
 * / back() walk this list and individual phases can divert explicitly later.
 */
const PHASE_ORDER: readonly SignupPhase[] = [
  "welcome",
  "discovery",
  "plan",
  "account",
  "verification",
  "workspace",
  "review",
  "provisioning",
  "complete",
] as const;

/** Forward = 1, backward = -1. Consumed by slide transitions (mirrored in RTL). */
export type NavigationDirection = 1 | -1;

export interface SignupWizardViewModel {
  /** Current phase of the flow. */
  phase: SignupPhase;
  /** Direction of the last navigation — drives slide animations. */
  navigationDirection: NavigationDirection;
  initialCountry?: string | null;
  initialCurrency?: string;

  // ── Welcome screen data ──────────────────────────────────────────────────
  welcomeContent: WelcomeContent | undefined;
  isWelcomeLoading: boolean;
  isWelcomeError: boolean;
  /** Re-fetch welcome content after a transient failure. */
  retryWelcome: () => void;

  // ── Discovery result (consumed by the plan phase, F4) ─────────────────────
  /** Collected discovery answers (questionKey → selected values). */
  discoveryAnswers: Record<string, string[]>;
  /** Derived industry/vertical (Q1) — null when discovery was skipped. */
  businessType: string | null;
  /** The server recommendation, or undefined when not (yet) available. */
  recommendation: OnboardingRecommendation | undefined;
  /** True while the recommendation request is in flight. */
  isRecommendationLoading: boolean;
  /**
   * True when the recommendation call failed. The plan phase degrades
   * gracefully (shows all tiers, no recommended badge) — never blocks.
   */
  isRecommendationError: boolean;

  // ── Plan selection (produced by the plan phase, F4 → consumed by F5) ───────
  /**
   * Snapshot of the chosen plan, captured verbatim from the server edition at
   * selectPlan() time. Drives the account/review copy and provisioning branch.
   * Null until the user picks a self-service plan.
   */
  selectedPlan: SelectedPlan | null;
  /** Billing cycle chosen on the plan phase. Persisted alongside selectedPlan. */
  selectedBillingCycle: "monthly" | "annual";

  // ── Account / Verify / Workspace shared state (F5–F7) ──────────────────────
  /**
   * The collected wizard data (account fields, email-verification token,
   * workspace fields). Shared verbatim with the legacy `SignupWizardData` shape
   * so the reused OTP / subdomain hooks (and a later review/finalize phase, F8)
   * keep working against the same registration model.
   */
  wizardData: SignupWizardData;
  /** Patch a single wizard-data field (account + workspace inputs). */
  updateField: <K extends keyof SignupWizardData>(field: K, value: SignupWizardData[K]) => void;
  /** Convenience setter for the password field (mirrors the legacy VM). */
  updatePassword: (value: string) => void;
  /** Password strength bucket (0–5), derived from wizardData.password. */
  passwordStrength: number;
  /** Server/flow error surfaced to the current phase (shared across F5–F7). */
  error: string;
  /** True while an account-submit / OTP-verify / register call is in flight. */
  isSubmitting: boolean;

  // ── Account phase (F5) ─────────────────────────────────────────────────────
  /**
   * Submit the account: sends the email OTP and advances to `verification`.
   * Enumeration-safe (always advances) — the proven `useSignupOtp` owns this.
   */
  submitAccount: (validatedEmail: string) => void;

  // ── Verification phase (F6) ────────────────────────────────────────────────
  /** Current OTP value (controlled by the segmented input). */
  otpCode: string;
  /** Update the OTP value. */
  setOtpCode: (value: string) => void;
  /** Verify the OTP. On success advances to `workspace`. */
  verifyOtp: () => void;
  /** Resend the OTP (no-op while cooling down). */
  resendOtp: () => void;
  /** Seconds remaining before resend is allowed again (0 = ready). */
  otpResendCooldown: number;
  /** Whether the OTP send has been triggered at least once. */
  otpSent: boolean;
  /** Return to the account phase to change the email (clears the OTP). */
  changeEmail: () => void;

  // ── Workspace phase (F7) ───────────────────────────────────────────────────
  /** Debounced subdomain availability check (also writes wizardData.subdomain). */
  checkSubdomain: (subdomain: string) => void;
  /** Latest availability result, or null while idle / checking. */
  subdomainResult: SubdomainCheckResult | null;
  /** True while a subdomain availability request is in flight. */
  isCheckingSubdomain: boolean;
  /** Confirm the workspace; on a valid subdomain + token advances to `review`. */
  submitWorkspace: () => void;

  // ── Review phase (F8) ──────────────────────────────────────────────────────
  /**
   * Server-decided checkout mode for the selected plan ("free" | "trial" |
   * "checkout" | "contact-sales"), defaulting to "free" until a plan is picked.
   * Drives the Review CTA + copy contract and the provisioning branch.
   */
  checkoutMode: SelectedPlan["checkoutMode"];
  /**
   * Confirm the review: registers the tenant/session (reused provisioning hook),
   * then branches — free runs in-page provisioning → complete; trial/checkout
   * redirects to Stripe (the finalize route handles the return).
   */
  submitRegister: () => void;
  /** Jump back to the plan phase to change the chosen plan (review/sales edit). */
  editPlan: () => void;
  /** True when the user returned from a canceled Stripe checkout (?canceled=1). */
  checkoutCanceled: boolean;
  /** Dismiss the checkout-canceled banner. */
  dismissCheckoutCanceled: () => void;

  // ── Provisioning phase (F9) ────────────────────────────────────────────────
  /** Current in-page provisioning step index (free flow), driven by the hook. */
  provisioningStep: number;

  // ── Contact-sales branch (F8) ──────────────────────────────────────────────
  /**
   * Submit the Enterprise lead. Pre-filled from discovery + account; the caller
   * supplies the collected form fields (company / phone / note). Resolves true
   * on success so the form can show its success panel. Backend sanitizes.
   */
  submitContactSalesLead: (
    form: Omit<ContactSalesPayload, "editionId" | "businessType" | "teamSize" | "primaryPriority">
  ) => Promise<boolean>;

  // ── Resume / abandon (F8) ──────────────────────────────────────────────────
  /** True when a resumable in-progress signup was detected on mount. */
  showResumeModal: boolean;
  /** Plan snapshot for the resume modal (null until resolved). */
  pendingResumeInfo: ResumeSessionResult | null;
  /** Restore the persisted wizard state and jump to `review`. */
  resume: () => void;
  /** Restore wizard data and jump to `plan` to pick a different plan. */
  changePlan: () => void;
  /** Abandon the pending session (release the subdomain) and start over. */
  startFresh: () => Promise<void>;

  // ── Complete phase (F9) ────────────────────────────────────────────────────
  /** Navigate to the workspace/login (primary CTA on the Complete screen). */
  goToLogin: () => void;

  // ── Navigation ───────────────────────────────────────────────────────────
  /** Primary CTA on the Welcome screen → enter the flow. */
  goToDiscovery: () => void;
  /**
   * Commit a chosen edition + billing cycle and advance. Self-service plans
   * (free | trial | checkout) go to `account`; contact-sales editions divert
   * to the `contact-sales` branch. The snapshot is captured verbatim from the
   * server edition — the frontend never infers free/custom/price.
   */
  selectPlan: (edition: PublicEdition, billingCycle: "monthly" | "annual") => void;
  /**
   * Finish discovery: persists the answers + derived vertical, fires the
   * adaptive recommendation request, and advances to the `plan` phase
   * immediately (the rec resolves in the background; failure never blocks).
   */
  completeDiscovery: (result: {
    answers: Record<string, string[]>;
    businessType: string | null;
  }) => void;
  /** Advance to the next phase in the linear order. */
  next: () => void;
  /** Return to the previous phase in the linear order. */
  back: () => void;
  /** Jump to an explicit phase (used by branch targets, e.g. contact-sales). */
  goToPhase: (phase: SignupPhase) => void;
}

export interface UseSignupWizardArgs {
  initialCountry?: string | null;
  initialCurrency?: string;
}

export function useSignupWizard(args?: UseSignupWizardArgs): SignupWizardViewModel {
  const { initialCountry, initialCurrency } = args || {};
  const { language } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [phase, setPhase] = useState<SignupPhase>("welcome");
  const [navigationDirection, setNavigationDirection] = useState<NavigationDirection>(1);

  // ── Discovery result state ──────────────────────────────────────────────────
  const [discoveryAnswers, setDiscoveryAnswers] = useState<Record<string, string[]>>({});
  const [businessType, setBusinessType] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<OnboardingRecommendation | undefined>(
    undefined
  );
  const [isRecommendationLoading, setIsRecommendationLoading] = useState(false);
  const [isRecommendationError, setIsRecommendationError] = useState(false);

  // ── Plan selection state ──────────────────────────────────────────────────
  const [selectedPlan, setSelectedPlan] = useState<SelectedPlan | null>(null);
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<"monthly" | "annual">("annual");

  // ── Review / provisioning / resume state (F8–F10) ──────────────────────────
  const [provisioningStep, setProvisioningStep] = useState(0);
  const [checkoutCanceled, setCheckoutCanceled] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [pendingResumeInfo, setPendingResumeInfo] = useState<ResumeSessionResult | null>(null);

  // ── Account / Verify / Workspace state (F5–F7) ──────────────────────────────
  // The wizardData model + error/isSubmitting flags are kept here so the reused
  // OTP / subdomain hooks (and a later review/finalize phase) operate against the
  // same registration model the legacy wizard proved out — we did not invent a
  // new auth shape. defaultLocale is seeded from the active language.
  const [wizardData, setWizardData] = useState<SignupWizardData>(() => ({
    ...INITIAL_WIZARD_DATA,
    defaultLocale: language === "ar" ? "ar" : "en",
  }));
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = useCallback(
    <K extends keyof SignupWizardData>(field: K, value: SignupWizardData[K]) => {
      setWizardData((prev) => ({ ...prev, [field]: value }));
      // Clearing the error on edit mirrors the legacy wizard-state behavior.
      setError((prev) => (prev ? "" : prev));
    },
    []
  );

  const updatePassword = useCallback(
    (value: string) => updateField("password", value),
    [updateField]
  );

  const passwordStrength = calcPasswordStrengthScore(wizardData.password);

  // setStep adapter: the reused hooks advance the flow by calling setStep with a
  // legacy SignupStep; we translate it onto the new phase machine. Forward moves
  // (account→verification→workspace→review) set direction = 1; the explicit
  // changeEmail() handles the single backward move.
  const setStepAdapter = useCallback((step: SignupStep) => {
    const target = LEGACY_STEP_TO_PHASE[step];
    if (!target) return;
    setNavigationDirection(1);
    setPhase(target);
  }, []);

  // ── Welcome + trust content ───────────────────────────────────────────────
  // Data-access pattern mirrors the legacy DiscoveryStep useQuery usage. This is
  // the ONLY place the repository is referenced — keeps views/components dumb.
  const {
    data: welcomeContent,
    isLoading: isWelcomeLoading,
    isError: isWelcomeError,
    refetch,
  } = useQuery({
    queryKey: ["signup-welcome-content", language],
    queryFn: () => authContainer.signupRepository.getWelcomeContent(language),
    staleTime: 10 * 60 * 1000, // 10 min — welcome content is stable per session
  });

  // ── Pricing context — load early to lock the currency ──────────────────────
  const { data: pricingContext } = useQuery({
    queryKey: ["signup-pricing-context"],
    queryFn: () => authContainer.signupRepository.getPricingContext(),
    staleTime: 30 * 60 * 1000, // currency is country-locked per session
    retry: 1,
  });

  useEffect(() => {
    // Dev-only: support override
    const devCurrencyOverride =
      process.env.NODE_ENV === "development" && typeof window !== "undefined"
        ? (new URLSearchParams(window.location.search).get("__currency")?.toUpperCase() ?? null)
        : null;

    const resolvedCurrency =
      devCurrencyOverride ?? pricingContext?.recommendedCurrency ?? initialCurrency;
    const resolvedCountry = initialCountry ?? pricingContext?.detectedCountry;
    if (resolvedCurrency) {
      setWizardData((prev) => ({
        ...prev,
        currency: resolvedCurrency,
        region: resolvedCountry || prev.region,
      }));
    }
  }, [initialCurrency, initialCountry, pricingContext]);
  const retryWelcome = useCallback(() => {
    void refetch();
  }, [refetch]);

  // ── Reused orchestration hooks (F5–F7) ──────────────────────────────────────
  // These are the SAME proven hooks the legacy wizard composes — we feed them the
  // new wizard's state + setStep adapter so account-submit → OTP → subdomain →
  // advance behaves identically (enumeration-safe OTP, debounced availability,
  // emailVerificationToken capture). authContainer is touched only here.
  const { signupRepository } = authContainer;

  const otp = useSignupOtp({
    repository: signupRepository,
    email: wizardData.email,
    setStep: setStepAdapter,
    setError,
    setIsLoading: setIsSubmitting,
    updateField,
  });

  const subdomain = useSignupSubdomain({
    repository: signupRepository,
    wizardData,
    updateField,
    setStep: setStepAdapter,
    setError,
  });

  // ── Provisioning / register / contact-sales (F8–F10) ────────────────────────
  // The SAME proven hook the legacy wizard composes. It owns: the free vs
  // trial/checkout register branch, the Stripe redirect (persisting signupRef +
  // wizard state via STORAGE_KEYS), the in-page free provisioning staging, auth
  // hydration on the free path, and the contact-sales lead submit. We feed it the
  // new wizard's state + the setStep adapter so the tail behaves identically.
  const provisioning = useSignupProvisioning({
    repository: signupRepository,
    wizardData,
    selectedPlan,
    language,
    setStep: setStepAdapter,
    setError,
    setIsLoading: setIsSubmitting,
    setProvisioningStep,
  });

  // Review CTA → register + branch (free → provisioning→complete; else → Stripe).
  const submitRegister = useCallback(() => {
    void provisioning.startProvisioning();
  }, [provisioning]);

  // Edit-plan affordance (review + contact-sales): step back to the plan phase.
  const editPlan = useCallback(() => {
    setError("");
    setNavigationDirection(-1);
    setPhase("plan");
  }, []);

  const dismissCheckoutCanceled = useCallback(() => setCheckoutCanceled(false), []);

  // Primary CTA on the Complete screen — go to the workspace (if already
  // authenticated from a free signup) or fall back to /login (paid path).
  const goToLogin = useCallback(() => {
    const { isAuthenticated, defaultRedirectPath } = useAppStore.getState();
    const hasToken = secureTokenService.hasToken();

    if (hasToken && isAuthenticated) {
      // Free signup: user is already logged in — go straight to the dashboard
      router.replace(defaultRedirectPath || "/");
    } else {
      // Checkout/paid path: user needs to log in manually
      router.push("/login");
    }
  }, [router]);

  // Change-email affordance on the verification phase: clear the code + token and
  // step back to the account phase (the one backward move in this sub-flow).
  const changeEmail = useCallback(() => {
    setError("");
    otp.setOtpCode("");
    updateField("emailVerificationToken", null);
    setNavigationDirection(-1);
    setPhase("account");
  }, [otp, updateField]);

  // ── Resume / abandon (F8) ───────────────────────────────────────────────────
  // Mirrors the legacy orchestrator: on mount, if a SIGNUP_REF is persisted and
  // there's no ?canceled / ?change-plan param (handled below), probe the server
  // and surface the resume modal when the session is still resumable. All
  // repository access stays in this hook.
  useEffect(() => {
    const isCanceled = searchParams?.get("canceled") === "1";
    const isChangePlan = searchParams?.get("change-plan") === "1";

    // Stripe cancel-url round-trip: restore the persisted (password-free) state
    // and drop the user back on Review with a dismissible "canceled" banner.
    if (isCanceled) {
      const persisted = signupRepository.readPersistedWizardState();
      if (persisted?.wizardData?.emailVerificationToken) {
        setWizardData((prev) => ({ ...prev, ...persisted.wizardData }));
        if (persisted.selectedPlan) setSelectedPlan(persisted.selectedPlan);
        setPhase("review");
      }
      setCheckoutCanceled(true);
      return;
    }

    // Change-plan round-trip from the finalize page: restore + jump to plan.
    if (isChangePlan) {
      const persisted = signupRepository.readPersistedWizardState();
      if (persisted?.wizardData) {
        setWizardData((prev) => ({ ...prev, ...persisted.wizardData }));
        if (persisted.selectedPlan) setSelectedPlan(persisted.selectedPlan);
      }
      setPhase("plan");
      return;
    }

    const existingRef = signupRepository.getPersistedSignupRef();
    if (!existingRef) return;

    void signupRepository.resume(existingRef).then((info) => {
      if (shouldShowResumeModal(existingRef, info)) {
        setPendingResumeInfo(info);
        setShowResumeModal(true);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resume = useCallback(() => {
    setShowResumeModal(false);
    const persisted = signupRepository.readPersistedWizardState();
    if (persisted?.wizardData) {
      setWizardData((prev) => ({ ...prev, ...persisted.wizardData }));
      if (persisted.selectedPlan) setSelectedPlan(persisted.selectedPlan);
      setNavigationDirection(1);
      setPhase("review");
    }
  }, [signupRepository]);

  const changePlan = useCallback(() => {
    setShowResumeModal(false);
    const persisted = signupRepository.readPersistedWizardState();
    if (persisted?.wizardData) {
      setWizardData((prev) => ({ ...prev, ...persisted.wizardData }));
      if (persisted.selectedPlan) setSelectedPlan(persisted.selectedPlan);
    }
    setNavigationDirection(-1);
    setPhase("plan");
  }, [signupRepository]);

  const startFresh = useCallback(async () => {
    setShowResumeModal(false);
    const existingRef = signupRepository.getPersistedSignupRef();
    if (existingRef) {
      try {
        await signupRepository.abandon(existingRef);
      } catch {
        // best-effort — releasing the subdomain is not blocking
      }
    }
    signupRepository.clearPersistedWizardState();
    setNavigationDirection(1);
    setPhase("plan");
  }, [signupRepository]);

  // ── Navigation helpers ─────────────────────────────────────────────────────
  const goToPhase = useCallback((target: SignupPhase) => {
    setPhase((current) => {
      const from = PHASE_ORDER.indexOf(current);
      const to = PHASE_ORDER.indexOf(target);
      // Both in the linear order → derive direction; otherwise assume forward.
      setNavigationDirection(from >= 0 && to >= 0 && to < from ? -1 : 1);
      return target;
    });
  }, []);

  const next = useCallback(() => {
    setPhase((current) => {
      const idx = PHASE_ORDER.indexOf(current);
      if (idx < 0 || idx >= PHASE_ORDER.length - 1) return current;
      setNavigationDirection(1);
      return PHASE_ORDER[idx + 1];
    });
  }, []);

  const back = useCallback(() => {
    setPhase((current) => {
      const idx = PHASE_ORDER.indexOf(current);
      if (idx <= 0) return current;
      setNavigationDirection(-1);
      return PHASE_ORDER[idx - 1];
    });
  }, []);

  const goToDiscovery = useCallback(() => {
    setNavigationDirection(1);
    setPhase("discovery");
  }, []);

  // ── Select plan → snapshot + advance (self-service vs contact-sales) ─────────
  // The snapshot is captured verbatim from the server edition; the frontend
  // NEVER infers free/custom/price. Contact-sales editions divert to the lead
  // form branch; every other mode advances to the account phase.
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
    setSelectedBillingCycle(billingCycle);
    // Mirror the chosen edition + cycle into the registration model so the
    // reused provisioning hook (which reads wizardData.editionId/billingCycle)
    // registers the correct plan. Same mapping the legacy state hook applied.
    setWizardData((prev) => ({
      ...prev,
      editionId: edition.id || null,
      billingCycle:
        edition.checkoutMode === "contact-sales"
          ? prev.billingCycle
          : billingCycle === "monthly"
            ? "Monthly"
            : "Annual",
    }));
    setNavigationDirection(1);
    setPhase(edition.checkoutMode === "contact-sales" ? "contact-sales" : "account");
  }, []);

  // ── Complete discovery → request recommendation, advance to plan ─────────────
  // The vertical is derived server-side from the `business_type` answer; we pass
  // the full answer map (mapped to the E1 request form) plus the lang. We advance
  // to `plan` IMMEDIATELY so a slow/failed scorer never blocks the user — the
  // plan phase reads `recommendation` when it lands and shows all tiers meanwhile.
  const completeDiscovery = useCallback(
    (result: { answers: Record<string, string[]>; businessType: string | null }) => {
      const { answers, businessType: vertical } = result;

      // Persist the collected discovery state for the plan phase (F4).
      setDiscoveryAnswers(answers);
      const resolvedVertical = vertical ?? answers[BUSINESS_TYPE_KEY]?.[0] ?? null;
      setBusinessType(resolvedVertical);

      // Mirror the discovery CRM fields into the registration model so the reused
      // provisioning hook carries them on register + contact-sales (CRM only —
      // they never affect pricing). Mapping matches the legacy state hook.
      const teamSize =
        answers["scale_general"]?.[0] ??
        answers["scale_erp"]?.[0] ??
        answers["scale_healthcare"]?.[0] ??
        answers["team_size"]?.[0] ??
        null;
      const rawPriorities =
        answers["priorities_general"] ??
        answers["priorities_erp"] ??
        answers["priorities_healthcare"] ??
        answers["primary_priority"] ??
        [];
      const primaryPriority = rawPriorities.length > 0 ? rawPriorities.join(",") : null;
      setWizardData((prev) => ({
        ...prev,
        businessType: resolvedVertical,
        teamSize,
        primaryPriority,
        categoryKey: resolvedVertical,
      }));

      // Map answers → the request's AnswerInput[] form, dropping empty selections.
      const mappedAnswers = Object.entries(answers)
        .filter(([, values]) => values.length > 0)
        .map(([questionKey, selectedValues]) => ({ questionKey, selectedValues }));

      const request: SignupRecommendationRequest = {
        answers: mappedAnswers,
        lang: language,
      };

      // Reset prior result, advance now, resolve in the background.
      setRecommendation(undefined);
      setIsRecommendationError(false);
      setNavigationDirection(1);
      setPhase("plan");

      // Skip the call entirely when there's nothing to score (full skip).
      if (mappedAnswers.length === 0) {
        return;
      }

      setIsRecommendationLoading(true);
      authContainer.signupRepository
        .getAdaptiveRecommendation(request)
        .then((rec) => {
          setRecommendation(rec);
          setIsRecommendationError(false);
        })
        .catch(() => {
          // Graceful: plan phase shows all tiers without a recommended badge.
          setRecommendation(undefined);
          setIsRecommendationError(true);
        })
        .finally(() => {
          setIsRecommendationLoading(false);
        });
    },
    [language]
  );

  return useMemo(
    () => ({
      phase,
      navigationDirection,
      initialCountry,
      initialCurrency,
      welcomeContent,
      isWelcomeLoading,
      isWelcomeError,
      retryWelcome,
      discoveryAnswers,
      businessType,
      recommendation,
      isRecommendationLoading,
      isRecommendationError,
      selectedPlan,
      selectedBillingCycle,
      // Account / Verify / Workspace (F5–F7)
      wizardData,
      updateField,
      updatePassword,
      passwordStrength,
      error,
      isSubmitting,
      submitAccount: otp.submitAccount,
      otpCode: otp.otpCode,
      setOtpCode: otp.setOtpCode,
      verifyOtp: otp.verifyOtp,
      resendOtp: otp.resendOtp,
      otpResendCooldown: otp.otpResendCooldown,
      otpSent: otp.otpSent,
      changeEmail,
      checkSubdomain: subdomain.checkSubdomain,
      subdomainResult: subdomain.subdomainResult,
      isCheckingSubdomain: subdomain.isCheckingSubdomain,
      submitWorkspace: subdomain.submitWorkspace,
      // Review / provisioning / contact-sales / resume (F8–F10)
      checkoutMode: selectedPlan?.checkoutMode ?? "free",
      submitRegister,
      editPlan,
      checkoutCanceled,
      dismissCheckoutCanceled,
      provisioningStep,
      submitContactSalesLead: provisioning.submitContactSales,
      showResumeModal,
      pendingResumeInfo,
      resume,
      changePlan,
      startFresh,
      goToLogin,
      goToDiscovery,
      selectPlan,
      completeDiscovery,
      next,
      back,
      goToPhase,
    }),
    [
      phase,
      navigationDirection,
      initialCountry,
      initialCurrency,
      welcomeContent,
      isWelcomeLoading,
      isWelcomeError,
      retryWelcome,
      discoveryAnswers,
      businessType,
      recommendation,
      isRecommendationLoading,
      isRecommendationError,
      selectedPlan,
      selectedBillingCycle,
      wizardData,
      updateField,
      updatePassword,
      passwordStrength,
      error,
      isSubmitting,
      otp,
      changeEmail,
      subdomain,
      submitRegister,
      editPlan,
      checkoutCanceled,
      dismissCheckoutCanceled,
      provisioningStep,
      provisioning,
      showResumeModal,
      pendingResumeInfo,
      resume,
      changePlan,
      startFresh,
      goToLogin,
      goToDiscovery,
      selectPlan,
      completeDiscovery,
      next,
      back,
      goToPhase,
    ]
  );
}
