"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { authContainer } from "@modules/auth/di";
import type { WelcomeContent } from "../../domain/entities/OnboardingEntities";

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

  // ── Navigation ───────────────────────────────────────────────────────────
  /** Primary CTA on the Welcome screen → enter the flow. */
  goToDiscovery: () => void;
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

  return useMemo(
    () => ({
      phase,
      navigationDirection,
      welcomeContent,
      isWelcomeLoading,
      isWelcomeError,
      retryWelcome,
      goToDiscovery,
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
      goToDiscovery,
      next,
      back,
      goToPhase,
    ]
  );
}
