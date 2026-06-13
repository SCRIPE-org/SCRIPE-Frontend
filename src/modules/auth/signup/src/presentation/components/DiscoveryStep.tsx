"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "@core/providers/i18n-provider";
import { BRAND_TOKENS } from "@core/ui/tokens/brand";
import type { PublicCategory } from "../../domain/entities";
import { DiscoveryHeader } from "./discovery/DiscoveryHeader";
import { DiscoveryQ1Business } from "./discovery/DiscoveryQ1Business";
import { DiscoveryQ2Team } from "./discovery/DiscoveryQ2Team";
import { DiscoveryQ3Priority } from "./discovery/DiscoveryQ3Priority";
import { getPrioritiesForBusinessType } from "./discovery/discoveryConstants";
import {
  computeRecommendedTier,
  type RecommendedTier,
} from "../../data/helpers/recommendationEngine";
import { authContainer } from "@modules/auth/di";

// ─── Props ────────────────────────────────────────────────────────────────────
export interface DiscoveryStepProps {
  /** Categories loaded by the ViewModel — never fetched here */
  categories: PublicCategory[];
  isCategoriesLoading: boolean;
  /** Called when the user finishes all 3 questions (or skips) */
  onComplete: (answers: {
    businessType: string | null;
    teamSize: string | null;
    primaryPriority: string | null;
    categoryCount: number;
    recommendedTier: RecommendedTier;
  }) => void;
  /** Pre-populated from persisted wizard state (Stripe round-trip resume) */
  initialAnswers?: {
    businessType: string | null;
    teamSize: string | null;
    primaryPriority: string | null;
  };
}

const TOTAL_QUESTIONS = 3;

// ─── Orchestrator ─────────────────────────────────────────────────────────────
/**
 * DiscoveryStep — ORCHESTRATOR ONLY (~100 lines)
 *
 * Responsibilities:
 *   • Manages local question index (0 / 1 / 2) + slide direction
 *   • Drives the typewriter headline animation
 *   • Computes the recommendation hint string
 *   • Computes recommendedTier via the recommendation engine after Q3
 *   • Delegates all rendering to focused sub-components under discovery/
 *   • Q3 priorities are dynamic — computed from Q1 business type
 *
 * Data contract:
 *   • Receives `categories` + `isCategoriesLoading` from the ViewModel (never from DI)
 *   • All i18n text via t() — zero hardcoded English
 */
export function DiscoveryStep({
  categories,
  isCategoriesLoading,
  onComplete,
  initialAnswers,
}: DiscoveryStepProps) {
  const { t } = useI18n();

  const [question, setQuestion] = useState(0);
  const [direction, setDirection] = useState(1);
  const [businessType, setBusinessType] = useState<string | null>(
    initialAnswers?.businessType ?? null
  );
  const [teamSize, setTeamSize] = useState<string | null>(initialAnswers?.teamSize ?? null);
  // Q3: stored as string[] internally; joined to comma-string at complete() for wizard-state compat
  const [primaryPriorities, setPrimaryPriorities] = useState<string[]>(
    initialAnswers?.primaryPriority ? initialAnswers.primaryPriority.split(",").filter(Boolean) : []
  );
  // Brief loading state while waiting for backend scorer (200–400 ms typically)
  const [isScorerLoading, setIsScorerLoading] = useState(false);

  // ── Dynamic Q3 priorities — changes with Q1 answer ──────────────────────
  const dynamicPriorities = useMemo(
    () => getPrioritiesForBusinessType(businessType),
    [businessType]
  );

  // ── Typewriter animation ──────────────────────────────────────────────────
  const headlines = [
    t("signup.discovery.q1Title") || "What kind of business are you?",
    t("signup.discovery.q2Title") || "How big is your team?",
    t("signup.discovery.q3Title") || "What matters most to you?",
  ];
  const [displayedText, setDisplayedText] = useState("");
  const typingRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const target = headlines[question] ?? "";
    setDisplayedText("");
    let i = 0;
    const tick = () => {
      if (i <= target.length) {
        setDisplayedText(target.slice(0, i));
        i++;
        typingRef.current = setTimeout(tick, 28);
      }
    };
    tick();
    return () => {
      if (typingRef.current) clearTimeout(typingRef.current);
    };
  }, [question]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Recommendation hint (computed, not fetched) ───────────────────────────
  const recommendationHint = useCallback((): string | null => {
    if (!businessType && !teamSize) return null;
    const sizeLabels: Record<string, string> = {
      solo: t("signup.discovery.hint.free") || "Free",
      "2-10": t("signup.discovery.hint.pro") || "Pro",
      "11-50": t("signup.discovery.hint.pro") || "Pro",
      "51-200": t("signup.discovery.hint.ultra") || "Ultra",
      "200+": t("signup.discovery.hint.ultra") || "Ultra",
    };
    const plan = sizeLabels[teamSize ?? ""] ?? (t("signup.discovery.hint.pro") || "Pro");
    return (
      t("signup.discovery.hint.message", { plan }) ||
      `Based on your profile, we'll highlight our ${plan} plan for you.`
    );
  }, [businessType, teamSize, t]);

  // ── Navigation helpers ────────────────────────────────────────────────────
  const advance = useCallback((next: number) => {
    setDirection(1);
    setQuestion(next);
  }, []);
  const goBack = useCallback((prev: number) => {
    setDirection(-1);
    setQuestion(prev);
  }, []);

  /**
   * complete() — async so we can call the backend scorer.
   *
   * Flow:
   *   1. Pre-compute local tier (instant, zero network) as fallback
   *   2. If any answer exists, call backend scorer (GET /auth/signup/recommendation)
   *   3. Map backend tier label → local RecommendedTier type
   *   4. On ANY error (network, 5xx, timeout) → silently use local tier
   *   5. Fire onComplete with the best available tier
   *
   * Backend tier map:
   *   "free"       → "free"
   *   "standard"   → "pro"
   *   "enterprise" → "ultra"
   *   "ultimate"   → "enterprise"
   */
  const complete = useCallback(
    async (bt: string | null, ts: string | null, pp: string | null) => {
      // 1. Local fallback — always ready, no network required
      const localTier = computeRecommendedTier({
        businessType: bt,
        teamSize: ts,
        primaryPriority: pp,
      });
      let finalTier: RecommendedTier = localTier;

      // 2. Backend scorer — only if we have something to score
      if (bt || ts || pp) {
        setIsScorerLoading(true);
        try {
          const result = await authContainer.signupRepository.getRecommendation({
            vertical: bt ?? undefined,
            teamSize: ts ?? undefined,
            priorities: pp ?? undefined,
            lang: "en",
          });
          const tierMap: Record<string, RecommendedTier> = {
            free: "free",
            standard: "pro",
            enterprise: "ultra",
            ultimate: "enterprise",
          };
          finalTier = tierMap[result.recommendedTier] ?? localTier;
        } catch {
          // Network failure / backend offline — use local tier, zero disruption
          finalTier = localTier;
        } finally {
          setIsScorerLoading(false);
        }
      }

      onComplete({
        businessType: bt,
        teamSize: ts,
        primaryPriority: pp,
        categoryCount: categories.length,
        recommendedTier: finalTier,
      });
    },
    [categories.length, onComplete]
  );

  const handleQ1 = useCallback(
    (key: string) => {
      setBusinessType(key);
      setTimeout(() => advance(1), 220);
    },
    [advance]
  );
  const handleQ2 = useCallback(
    (size: string) => {
      setTeamSize(size);
      setTimeout(() => advance(2), 220);
    },
    [advance]
  );

  // Toggle a priority in/out of the multi-select array (max 3, sliding queue)
  const handleQ3Toggle = useCallback((p: string) => {
    setPrimaryPriorities((prev) => {
      if (prev.includes(p)) {
        return prev.filter((x) => x !== p);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), p]; // Slide: drop oldest, add new
      }
      return [...prev, p];
    });
  }, []);

  // Confirm multi-select and advance (void-wrapped because complete is async)
  const handleQ3Confirm = useCallback(() => {
    const ppString = primaryPriorities.length > 0 ? primaryPriorities.join(",") : null;
    void complete(businessType, teamSize, ppString);
  }, [businessType, teamSize, primaryPriorities, complete]);

  const progressPct = ((question + 1) / TOTAL_QUESTIONS) * 100;

  return (
    <div className="relative mx-auto w-full max-w-4xl px-4 py-8 md:py-16">
      <DiscoveryHeader
        question={question}
        displayedText={displayedText}
        progressPct={progressPct}
        totalQuestions={TOTAL_QUESTIONS}
      />

      <AnimatePresence custom={direction} mode="wait">
        {question === 0 && (
          <DiscoveryQ1Business
            key="q1"
            categories={categories}
            isCategoriesLoading={isCategoriesLoading}
            selected={businessType}
            direction={direction}
            onSelect={handleQ1}
            onSkip={() => {
              setBusinessType(null);
              advance(1);
            }}
          />
        )}
        {question === 1 && (
          <DiscoveryQ2Team
            key="q2"
            selected={teamSize}
            direction={direction}
            onSelect={handleQ2}
            onBack={() => goBack(0)}
            onSkip={() => {
              setTeamSize(null);
              advance(2);
            }}
          />
        )}
        {question === 2 && (
          <DiscoveryQ3Priority
            key="q3"
            selected={primaryPriorities}
            direction={direction}
            recommendationHint={recommendationHint()}
            priorities={dynamicPriorities}
            onToggle={handleQ3Toggle}
            onConfirm={handleQ3Confirm}
            onBack={() => goBack(1)}
            onSkip={() => void complete(businessType, teamSize, null)}
          />
        )}
      </AnimatePresence>

      {/* Global skip — always visible */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-10 flex justify-center"
      >
        <button
          type="button"
          onClick={() => {
            setPrimaryPriorities([]);
            void complete(null, null, null);
          }}
          disabled={isScorerLoading}
          className="text-[11px] underline-offset-2 hover:underline disabled:cursor-wait disabled:opacity-40"
          style={{ color: BRAND_TOKENS.text.ghost }}
        >
          {isScorerLoading
            ? t("signup.discovery.scoring") || "Finding your best plan…"
            : t("signup.discovery.skipAll") || "Skip all questions · Take me straight to plans"}
        </button>
      </motion.div>
    </div>
  );
}
