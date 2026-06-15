"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { authContainer } from "@modules/auth/di";
import type { PublicEdition, SelectedPlan } from "../../domain/entities";
import type {
  OnboardingRecommendation,
  SignupRecommendationRequest,
  WelcomeContent,
} from "../../domain/entities/OnboardingEntities";

/** Industry/vertical answer key (Q1) — mirrors useDiscovery.BUSINESS_TYPE_KEY. */
const BUSINESS_TYPE_KEY = "business_type";

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

export function useSignupWizard(): SignupWizardViewModel {
  const { language } = useI18n();

  const [phase, setPhase] = useState<SignupPhase>("welcome");
  const [navigationDirection, setNavigationDirection] = useState<NavigationDirection>(1);

  // ── Discovery result state ──────────────────────────────────────────────────
  const [discoveryAnswers, setDiscoveryAnswers] = useState<Record<string, string[]>>({});
  const [businessType, setBusinessType] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<OnboardingRecommendation | undefined>(
    undefined,
  );
  const [isRecommendationLoading, setIsRecommendationLoading] = useState(false);
  const [isRecommendationError, setIsRecommendationError] = useState(false);

  // ── Plan selection state ──────────────────────────────────────────────────
  const [selectedPlan, setSelectedPlan] = useState<SelectedPlan | null>(null);
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<"monthly" | "annual">("annual");

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
    retry: 1,
  });

  const retryWelcome = useCallback(() => {
    void refetch();
  }, [refetch]);

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
      setSelectedBillingCycle(billingCycle);
      setNavigationDirection(1);
      setPhase(edition.checkoutMode === "contact-sales" ? "contact-sales" : "account");
    },
    [],
  );

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
      setBusinessType(vertical ?? answers[BUSINESS_TYPE_KEY]?.[0] ?? null);

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
    [language],
  );

  return useMemo(
    () => ({
      phase,
      navigationDirection,
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
      goToDiscovery,
      selectPlan,
      completeDiscovery,
      next,
      back,
      goToPhase,
    ]
  );
}
