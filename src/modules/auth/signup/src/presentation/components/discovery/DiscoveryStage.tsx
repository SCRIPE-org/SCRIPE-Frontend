// FILE-EXCEPTION: file length
// UI-EXCEPTION: compact studio layout
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useSignupTheme } from "@core/providers/signup-theme";
import { useDiscovery } from "../../../presentation/viewmodels/useDiscovery";
import { ProgressDots } from "./ProgressDots";
import { QuestionPanel } from "./QuestionPanel";
import { ProfilePreview } from "./ProfilePreview";

// ═══════════════════════════════════════════════════════════════════════════
// DiscoveryStage — the adaptive Discovery phase layout (the centerpiece).
//
// Industry (Q1) → themed scale (Q2) → priorities (Q3), each re-filtering and
// re-ranking LIVE as earlier answers change, with a live "profile forming"
// preview, ending in the server recommendation (fired by the parent wizard via
// onComplete → completeDiscovery).
//
// Layout: ASYMMETRIC split on desktop — interaction on the leading column,
// ProfilePreview on the trailing column; single column on mobile with the
// preview rendered inline beneath the question. One question at a time with
// slide transitions, mirrored under RTL, reduced-motion safe. NO progress bar
// (discovery is pre-stepper) — just ProgressDots.
//
// This component owns the useDiscovery viewmodel instance (the in-phase
// interaction) and reports the collected result up. It NEVER touches the
// repository directly — the recommendation fetch lives in useSignupWizard.
// ═══════════════════════════════════════════════════════════════════════════

const prefersReducedMotion =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

// Horizontal slide between questions; `dir` is pre-mirrored for RTL by the stage.
const slideVariants = {
  enter: (dir: number) =>
    prefersReducedMotion ? { opacity: 0 } : { x: dir > 0 ? 48 : -48, opacity: 0 },
  center: prefersReducedMotion
    ? { opacity: 1 }
    : {
        x: 0,
        opacity: 1,
        transition: { duration: 0.24, ease: [0.16, 1, 0.3, 1] as const },
      },
  exit: (dir: number) =>
    prefersReducedMotion
      ? { opacity: 0 }
      : {
          x: dir > 0 ? -48 : 48,
          opacity: 0,
          transition: { duration: 0.18, ease: [0.4, 0, 1, 1] as const },
        },
};

interface DiscoveryStageProps {
  /**
   * Finish discovery → hand the collected answers + derived vertical to the
   * wizard (which fires the recommendation and advances to `plan`).
   */
  onComplete: (result: { answers: Record<string, string[]>; businessType: string | null }) => void;
}

/**
 * React presentation component representing the discovery stage UI element.
 */
export function DiscoveryStage({ onComplete }: DiscoveryStageProps) {
  const { t, direction } = useI18n();
  const { tokens } = useSignupTheme();
  const vm = useDiscovery();

  const isRtl = direction === "rtl";
  // Slide direction is "next" (forward) by default; mirror sign under RTL so the
  // motion reads correctly when the layout axis is flipped.
  const slideDir = isRtl ? -1 : 1;
  const ForwardArrow = isRtl ? ArrowLeft : ArrowRight;
  const BackArrow = isRtl ? ArrowRight : ArrowLeft;

  const skipAll = () => onComplete(vm.collectResult());
  const handleNextOrFinish = () => {
    if (vm.isLastQuestion) onComplete(vm.collectResult());
    else vm.goNext();
  };

  const nextLabel = vm.isLastQuestion
    ? t("signup.discovery.stage.seePlans")
    : t("signup.discovery.stage.next");

  const topLabel = t("signup.discovery.stage.topPriority");

  // ── Loading skeleton ─────────────────────────────────────────────────────────
  if (vm.isLoading) {
    return <DiscoverySkeleton />;
  }

  // ── Error — graceful retry + skip-to-plans (never a dead end) ────────────────
  if (vm.isError || (!vm.currentQuestion && vm.totalVisible === 0)) {
    return (
      <Centered>
        <div
          className="flex w-full max-w-md flex-col items-start gap-4 rounded-2xl p-7"
          style={{ background: tokens.surfaceCard, border: tokens.borderCard }}
        >
          <h2 className="text-lg font-semibold" style={{ color: tokens.ink }}>
            {t("signup.discovery.stage.errorTitle")}
          </h2>
          <p className="text-[0.875rem] leading-relaxed" style={{ color: tokens.inkMuted }}>
            {t("signup.discovery.stage.errorBody")}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={vm.retry}
              className="rounded-lg px-4 py-2.5 text-[0.875rem] font-semibold transition-transform duration-200 hover:-translate-y-0.5 motion-reduce:transform-none"
              style={{ background: tokens.gradientCta, color: tokens.accentContrast }}
            >
              {t("signup.discovery.stage.retry")}
            </button>
            <button
              type="button"
              onClick={skipAll}
              className="text-[0.875rem] font-semibold underline-offset-2 hover:underline"
              style={{ color: tokens.accent }}
            >
              {t("signup.discovery.stage.skipToPlans")}
            </button>
          </div>
        </div>
      </Centered>
    );
  }

  const question = vm.currentQuestion;
  if (!question) return <DiscoverySkeleton />;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 py-10 sm:px-8 sm:py-14">
      {/* Top row: progress dots + skip-all (skip-all always available). */}
      <div className="mb-8 flex items-center justify-between gap-4">
        <ProgressDots
          total={vm.totalVisible}
          current={vm.currentIndex}
          label={t("signup.discovery.stage.progressLabel")}
        />
        <button
          type="button"
          onClick={skipAll}
          className="text-[0.8125rem] font-medium underline-offset-2 transition-colors hover:underline"
          style={{ color: tokens.inkFaint }}
        >
          {t("signup.discovery.stage.skipAll")}
        </button>
      </div>

      <div className="grid flex-1 items-start gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:gap-14">
        {/* ── Leading column: question interaction + nav ── */}
        <div className="flex flex-col">
          {/*
            Stable stage height: the question region reserves a min-height sized
            for the tallest question (heading + hint + a two-row option grid), so
            switching between questions with different option counts never
            collapses the column or shifts the nav row below it. The absolute-
            positioned exiting phase (AnimatePresence mode="wait") also can't
            stretch the box. Shorter questions simply leave calm whitespace.
          */}
          <div className="relative min-h-[22rem] sm:min-h-[24rem]">
            <AnimatePresence mode="wait" custom={slideDir} initial={false}>
              <motion.div
                key={question.key}
                custom={slideDir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <QuestionPanel
                  question={question}
                  options={vm.currentVisibleOptions}
                  selectedValues={vm.currentSelection}
                  isSingleSelect={question.questionType === "single_select"}
                  isMaxReached={vm.isMaxReached}
                  topPriority={vm.topPriorityForCurrent}
                  topLabel={topLabel}
                  onToggle={vm.toggleOption}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── Nav: Back · (Skip if optional) · Next/See-plans ──
              Fixed min-height keeps the row at a STABLE vertical position across
              every question regardless of whether the optional Skip link shows. */}
          <div className="mt-8 flex min-h-[2.75rem] items-center justify-between gap-4">
            <button
              type="button"
              onClick={vm.goBack}
              disabled={!vm.canGoBack}
              className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2.5 text-[0.875rem] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40"
              style={{ color: tokens.inkMuted }}
            >
              <BackArrow size={16} aria-hidden />
              {t("signup.discovery.stage.back")}
            </button>

            <div className="flex items-center gap-3">
              {!vm.isCurrentRequired && (
                <button
                  type="button"
                  onClick={handleNextOrFinish}
                  className="text-[0.875rem] font-medium underline-offset-2 transition-colors hover:underline"
                  style={{ color: tokens.inkFaint }}
                >
                  {t("signup.discovery.stage.skipStep")}
                </button>
              )}
              <button
                type="button"
                onClick={handleNextOrFinish}
                disabled={!vm.canAdvance}
                className="group inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[0.875rem] font-semibold transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transform-none"
                style={{
                  background: tokens.gradientCta,
                  color: tokens.accentContrast,
                  boxShadow: tokens.shadowCard,
                }}
              >
                {nextLabel}
                <ForwardArrow
                  size={16}
                  aria-hidden
                  className="transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none"
                />
              </button>
            </div>
          </div>

          {/* ── Mobile: compact profile summary beneath the question ── */}
          <div className="mt-8 lg:hidden">
            <ProfilePreview questions={vm.visibleQuestions} answers={vm.answers} variant="inline" />
          </div>
        </div>

        {/* ── Trailing column: live profile preview (desktop only) ── */}
        <div className="hidden lg:sticky lg:top-24 lg:block">
          <ProfilePreview questions={vm.visibleQuestions} answers={vm.answers} />
        </div>
      </div>
    </div>
  );
}

// ─── Layout helpers ──────────────────────────────────────────────────────────

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-5 py-16 sm:px-8">
      {children}
    </div>
  );
}

function DiscoverySkeleton() {
  const { tokens } = useSignupTheme();
  const block = (cls: string, opacity = 1) => (
    <div
      className={`animate-pulse rounded-lg motion-reduce:animate-none ${cls}`}
      style={{ background: tokens.surfaceRaised, opacity }}
    />
  );

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8 sm:py-14">
      <div className="mb-8 flex items-center gap-2">
        {block("h-1.5 w-6")}
        {block("h-1.5 w-6", 0.5)}
        {block("h-1.5 w-6", 0.5)}
      </div>
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:gap-14">
        <div className="flex flex-col gap-6">
          <div className="space-y-3">
            {block("h-8 w-3/4")}
            {block("h-4 w-1/2", 0.6)}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>{block("h-24 w-full", 0.5)}</div>
            ))}
          </div>
        </div>
        <div
          className="hidden flex-col gap-4 rounded-2xl p-7 lg:flex"
          style={{ background: tokens.surfaceCard, border: tokens.borderCard }}
        >
          {block("h-4 w-1/2", 0.5)}
          {block("h-3 w-3/4", 0.4)}
          {block("h-8 w-2/3", 0.4)}
        </div>
      </div>
    </div>
  );
}

export default DiscoveryStage;
