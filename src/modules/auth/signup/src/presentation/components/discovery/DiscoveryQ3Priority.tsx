"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight, MessageCircle, Star, ChevronRight } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { BRAND_TOKENS } from "@core/ui/tokens/brand";
import { PRIORITIES_GENERAL, slideVariants, type PriorityOption } from "./discoveryConstants";

interface DiscoveryQ3PriorityProps {
  /** Multi-selected priority values (empty = none selected) */
  selected: string[];
  direction: number;
  recommendationHint: string | null;
  /** Toggles a priority value in/out of the selection */
  onToggle: (priority: string) => void;
  /** Called when user confirms their selection (or immediately if single-select desired) */
  onConfirm: () => void;
  onBack: () => void;
  onSkip: () => void;
  /** Dynamic priorities based on Q1 business type — falls back to PRIORITIES if not provided */
  priorities?: PriorityOption[];
}

const MAX_SELECTIONS = 3;

/**
 * Q3 — "What's your #1 priority?"
 *
 * Shows a personalized recommendation hint if both businessType and
 * teamSize are already answered (passed in as `recommendationHint`).
 * All string labels come from t() — zero hardcoded English.
 */
export function DiscoveryQ3Priority({
  selected,
  direction,
  recommendationHint,
  onToggle,
  onConfirm,
  onBack,
  onSkip,
  priorities: priorityOptions,
}: DiscoveryQ3PriorityProps) {
  const { t } = useI18n();
  // Use injected dynamic priorities (per Q1 category) or fall back to general list
  const options: PriorityOption[] = priorityOptions ?? PRIORITIES_GENERAL;
  const hasSelection = selected.length > 0;
  const selectionCount = selected.length;
  const isLimitReached = selectionCount >= MAX_SELECTIONS;

  return (
    <motion.div
      key="q3"
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
    >
      {/* Personalized recommendation hint */}
      {recommendationHint && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          // a11y: role=status so screen readers announce the hint without interrupting
          role="status"
          aria-live="polite"
          className="mx-auto mb-6 flex max-w-sm items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium"
          style={{
            background: `${BRAND_TOKENS.palette.cyan}12`,
            border: `1px solid ${BRAND_TOKENS.palette.cyan}30`,
            color: BRAND_TOKENS.palette.cyan,
          }}
        >
          <Star className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
          {recommendationHint}
        </motion.div>
      )}

      {/* a11y: selection counter — announced live so screen readers know the cap */}
      {hasSelection && (
        <p
          aria-live="polite"
          aria-atomic="true"
          className="mb-3 text-center text-xs"
          style={{ color: isLimitReached ? BRAND_TOKENS.palette.violet : BRAND_TOKENS.text.secondary }}
        >
          {isLimitReached
            ? t("signup.discovery.q3MaxReached") || `${MAX_SELECTIONS} of ${MAX_SELECTIONS} selected (max)`
            : t("signup.discovery.q3Count", { count: selectionCount, max: MAX_SELECTIONS }) ||
              `${selectionCount} of ${MAX_SELECTIONS} selected`}
        </p>
      )}

      {/* Priority grid — multi-select */}
      {/* a11y: group + label pairs the heading with the checkboxes for assistive technology */}
      <div
        role="group"
        aria-label={t("signup.discovery.q3GroupLabel") || "Select your top priorities (up to 3)"}
        className="flex flex-wrap justify-center gap-3"
      >
        {options.map((p: PriorityOption, idx: number) => {
          const Icon = p.icon;
          const isSelected = selected.includes(p.value);
          const isDisabled = false; // Never disabled: clicking a new option rolls off the oldest one via the sliding queue

          return (
            <motion.button
              key={p.value}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              whileHover={isDisabled ? {} : { y: -3, scale: 1.02 }}
              whileTap={isDisabled ? {} : { scale: 0.97 }}
              onClick={() => onToggle(p.value)}
              disabled={isDisabled}
              // a11y: aria-pressed marks this as a toggle button, not a generic click target
              aria-pressed={isSelected}
              // a11y: explicit label includes selected state for screen readers
              aria-label={`${t(p.labelKey)}${isSelected ? ` — ${t("signup.discovery.selected") || "selected"}` : ""}${isDisabled ? ` — ${t("signup.discovery.limitReached") || "limit reached"}` : ""}`}
              type="button"
              className="group relative flex w-[calc(50%-6px)] flex-col items-center gap-2.5 rounded-2xl border p-4 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent sm:w-[160px] md:w-[180px]"
              style={{
                opacity: isDisabled ? 0.4 : 1,
                cursor: isDisabled ? "not-allowed" : "pointer",
                background: isSelected ? `${p.color}15` : BRAND_TOKENS.bg.card,
                borderColor: isSelected
                  ? p.color
                  : BRAND_TOKENS.border.card.replace("1px solid ", ""),
                boxShadow: isSelected
                  ? `0 0 0 1px ${p.color}, 0 4px 24px ${p.color}18`
                  : BRAND_TOKENS.shadow.card,
              }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{
                  background: `${p.color}18`,
                  border: `1px solid ${p.color}30`,
                }}
              >
                {/* a11y: decorative icon — label is on the button itself */}
                <Icon className="h-5 w-5" style={{ color: p.color }} aria-hidden="true" />
              </div>
              <span
                className="text-xs font-medium leading-tight"
                style={{ color: BRAND_TOKENS.text.primary }}
              >
                {t(p.labelKey)}
              </span>

              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-2 -top-2 rounded-full p-0.5"
                  style={{ background: p.color }}
                  aria-hidden="true"
                >
                  <Check className="h-3 w-3 text-white" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Done CTA — appears after first selection */}
      {hasSelection && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={onConfirm}
          type="button"
          aria-label={t("signup.discovery.q3ConfirmLabel") || "Confirm priorities and see recommended plan"}
          className="mx-auto mt-5 flex w-full max-w-xs items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
          style={{
            background: `linear-gradient(135deg, rgba(168,85,247,0.22), rgba(124,58,237,0.18))`,
            border: "1px solid rgba(168,85,247,0.45)",
            color: "rgba(245,242,255,0.95)",
          }}
        >
          {t("signup.discovery.q3Confirm") || "Done · Show my plan →"}
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </motion.button>
      )}

      {/* Back + skip-to-plans */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={onBack}
          type="button"
          aria-label={t("signup.common.backLabel") || "Go back to previous question"}
          className="text-xs transition-colors hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-1 rounded"
          style={{ color: BRAND_TOKENS.text.secondary }}
        >
          {t("signup.common.back") || "← Back"}
        </button>
        <button
          onClick={onSkip}
          type="button"
          aria-label={t("signup.discovery.skipToPlansLabel") || "Skip priorities and go directly to plans"}
          className="flex items-center gap-1 rounded-lg px-4 py-2 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-1"
          style={{
            background: `${BRAND_TOKENS.palette.violet}18`,
            color: BRAND_TOKENS.palette.violet,
            border: `1px solid ${BRAND_TOKENS.palette.violet}30`,
          }}
        >
          <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
          {t("signup.discovery.skipToPlans") || "Skip · Show me the plans"}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </motion.div>
  );
}
