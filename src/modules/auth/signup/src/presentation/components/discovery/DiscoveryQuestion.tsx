"use client";

import { motion } from "framer-motion";
import { Briefcase } from "lucide-react";
import { useSignupTheme } from "@core/providers/signup-theme";
import type {
  OnboardingQuestion,
  OnboardingAnswerOption,
} from "../../../domain/entities/OnboardingEntities";
import { LUCIDE_MAP } from "./discoveryConstants";

// ─── Props ────────────────────────────────────────────────────────────────────

interface DiscoveryQuestionProps {
  question: OnboardingQuestion;
  selectedValues: string[];
  onToggle: (value: string) => void;
  isLoading?: boolean;
}

// ─── Option stagger container ─────────────────────────────────────────────────

const gridVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};

const optionVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 340, damping: 26 } },
};

// ─── DiscoveryQuestion ────────────────────────────────────────────────────────

export function DiscoveryQuestion({
  question,
  selectedValues,
  onToggle,
  isLoading = false,
}: DiscoveryQuestionProps) {
  const { tokens } = useSignupTheme();
  const isSingleSelect = question.questionType === "single_select";
  const maxReached =
    !isSingleSelect &&
    question.maxSelections > 0 &&
    selectedValues.length >= question.maxSelections;

  // Handle click — single_select deselects others automatically
  function handleClick(option: OnboardingAnswerOption) {
    if (isLoading) return;
    if (isSingleSelect) {
      // Toggle off if already selected, otherwise replace selection
      onToggle(option.value);
    } else {
      // Multi: block new selections when max reached and this isn't selected
      if (maxReached && !selectedValues.includes(option.value)) return;
      onToggle(option.value);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ── Question label ── */}
      <div className="space-y-1">
        <h2
          className="text-xl font-semibold leading-snug sm:text-2xl"
          style={{ color: tokens.ink }}
        >
          {question.label}
        </h2>
        {question.hint && (
          <p className="text-sm" style={{ color: tokens.inkFaint }}>
            {question.hint}
          </p>
        )}
      </div>

      {/* ── Options grid ── */}
      <motion.div
        className="grid grid-cols-2 gap-3 sm:grid-cols-3"
        variants={gridVariants}
        initial="hidden"
        animate="visible"
      >
        {question.options
          .slice()
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((option) => {
            const isSelected = selectedValues.includes(option.value);
            const isDisabled = isLoading || (maxReached && !isSelected);
            const IconComponent: React.ElementType =
              (option.iconKey ? LUCIDE_MAP[option.iconKey] : null) ?? Briefcase;

            return (
              <motion.div key={option.value} variants={optionVariants}>
                <motion.button
                  type="button"
                  aria-pressed={isSelected}
                  disabled={isDisabled}
                  onClick={() => handleClick(option)}
                  whileTap={isDisabled ? {} : { scale: 0.96 }}
                  className="w-full rounded-xl p-3 text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
                  style={{
                    background: isSelected
                      ? "rgba(168,85,247,0.15)"
                      : tokens.surfaceRaised,
                    border: isSelected ? tokens.borderActive : tokens.borderCard,
                  }}
                >
                  {/* Icon */}
                  <IconComponent
                    size={24}
                    aria-hidden="true"
                    className="mb-2 shrink-0"
                    style={{ color: isSelected ? tokens.accent : tokens.inkMuted }}
                  />
                  {/* Label */}
                  <p
                    className="text-sm font-semibold leading-tight"
                    style={{ color: tokens.ink }}
                  >
                    {option.label}
                  </p>
                  {/* Sublabel */}
                  {option.sublabel && (
                    <p
                      className="mt-0.5 text-xs leading-snug"
                      style={{ color: tokens.inkFaint }}
                    >
                      {option.sublabel}
                    </p>
                  )}
                </motion.button>
              </motion.div>
            );
          })}
      </motion.div>
    </div>
  );
}
