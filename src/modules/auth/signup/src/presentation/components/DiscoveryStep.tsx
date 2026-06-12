"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "@core/providers/i18n-provider";
import { BRAND_TOKENS } from "@core/ui/tokens/brand";
import type { PublicCategory } from "../../domain/entities";
import { DiscoveryHeader } from "./discovery/DiscoveryHeader";
import { DiscoveryQ1Business } from "./discovery/DiscoveryQ1Business";
import { DiscoveryQ2Team } from "./discovery/DiscoveryQ2Team";
import { DiscoveryQ3Priority } from "./discovery/DiscoveryQ3Priority";

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
 * DiscoveryStep — ORCHESTRATOR ONLY (~90 lines)
 *
 * Responsibilities:
 *   • Manages local question index (0 / 1 / 2) + slide direction
 *   • Drives the typewriter headline animation
 *   • Computes the recommendation hint string
 *   • Delegates all rendering to focused sub-components under discovery/
 *
 * Data contract:
 *   • Receives `categories` + `isCategoriesLoading` from the ViewModel (never from DI)
 *   • All i18n text via t() — zero hardcoded English
 */
export function DiscoveryStep({ categories, isCategoriesLoading, onComplete, initialAnswers }: DiscoveryStepProps) {
  const { t } = useI18n();

  const [question, setQuestion] = useState(0);
  const [direction, setDirection] = useState(1);
  const [businessType, setBusinessType] = useState<string | null>(initialAnswers?.businessType ?? null);
  const [teamSize, setTeamSize] = useState<string | null>(initialAnswers?.teamSize ?? null);
  const [primaryPriority, setPrimaryPriority] = useState<string | null>(initialAnswers?.primaryPriority ?? null);

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
    return () => { if (typingRef.current) clearTimeout(typingRef.current); };
  }, [question]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Recommendation hint (computed, not fetched) ───────────────────────────
  const recommendationHint = useCallback((): string | null => {
    if (!businessType && !teamSize) return null;
    const sizeLabels: Record<string, string> = {
      solo: t("signup.discovery.hint.starter") || "Starter",
      "2-10": t("signup.discovery.hint.team") || "Team",
      "11-50": t("signup.discovery.hint.business") || "Business",
      "51-200": t("signup.discovery.hint.professional") || "Professional",
      "200+": t("signup.discovery.hint.enterprise") || "Enterprise",
    };
    const plan = sizeLabels[teamSize ?? ""] ?? (t("signup.discovery.hint.business") || "Business");
    return t("signup.discovery.hint.message", { plan }) ||
      `Based on your profile, we'll highlight our ${plan} plan for you.`;
  }, [businessType, teamSize, t]);

  // ── Navigation helpers ────────────────────────────────────────────────────
  const advance = useCallback((next: number) => { setDirection(1); setQuestion(next); }, []);
  const goBack   = useCallback((prev: number) => { setDirection(-1); setQuestion(prev); }, []);

  const complete = useCallback((bt: string | null, ts: string | null, pp: string | null) => {
    onComplete({ businessType: bt, teamSize: ts, primaryPriority: pp, categoryCount: categories.length });
  }, [categories.length, onComplete]);

  const handleQ1 = useCallback((key: string) => { setBusinessType(key); setTimeout(() => advance(1), 220); }, [advance]);
  const handleQ2 = useCallback((size: string) => { setTeamSize(size); setTimeout(() => advance(2), 220); }, [advance]);
  const handleQ3 = useCallback((p: string) => {
    setPrimaryPriority(p);
    setTimeout(() => complete(businessType, teamSize, p), 350);
  }, [businessType, teamSize, complete]);

  const progressPct = ((question + 1) / TOTAL_QUESTIONS) * 100;

  return (
    <div className="relative w-full max-w-4xl mx-auto px-4 py-8 md:py-16">
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
            onSkip={() => { setBusinessType(null); advance(1); }}
          />
        )}
        {question === 1 && (
          <DiscoveryQ2Team
            key="q2"
            selected={teamSize}
            direction={direction}
            onSelect={handleQ2}
            onBack={() => goBack(0)}
            onSkip={() => { setTeamSize(null); advance(2); }}
          />
        )}
        {question === 2 && (
          <DiscoveryQ3Priority
            key="q3"
            selected={primaryPriority}
            direction={direction}
            recommendationHint={recommendationHint()}
            onSelect={handleQ3}
            onBack={() => goBack(1)}
            onSkip={() => complete(businessType, teamSize, null)}
          />
        )}
      </AnimatePresence>

      {/* Global skip — always visible */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex justify-center mt-10"
      >
        <button
          onClick={() => complete(null, null, null)}
          className="text-[11px] underline-offset-2 hover:underline"
          style={{ color: BRAND_TOKENS.text.ghost }}
        >
          {t("signup.discovery.skipAll") || "Skip all questions · Take me straight to plans"}
        </button>
      </motion.div>
    </div>
  );
}
