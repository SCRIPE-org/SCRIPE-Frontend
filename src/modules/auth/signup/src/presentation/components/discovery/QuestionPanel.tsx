"use client";

import { useSignupTheme } from "@core/providers/signup-theme";
import type {
  OnboardingQuestion,
  OnboardingAnswerOption,
} from "../../../domain/entities/OnboardingEntities";
import { OptionGrid } from "./OptionGrid";

// ═══════════════════════════════════════════════════════════════════════════
// QuestionPanel — the current question's prompt + answer grid.
//
// The prompt uses a confident editorial scale (capped ~2.4rem per the Elevate
// typography rules), solid ink, balanced wrapping. The hint sits below in a
// muted-but-legible ink. The OptionGrid renders the visible+ranked options.
//
// Pure UI — all data + state + handlers come from the viewmodel via props.
// Question/option TEXT arrives already-localized from the backend; only the
// chrome (top-priority marker) is localized here via props.
// ═══════════════════════════════════════════════════════════════════════════

interface QuestionPanelProps {
  question: OnboardingQuestion;
  /** Visible + ranked options (from the viewmodel). */
  options: OnboardingAnswerOption[];
  selectedValues: string[];
  isSingleSelect: boolean;
  isMaxReached: boolean;
  topPriority: string | null;
  /** Localized "top priority" marker label. */
  topLabel: string;
  onToggle: (value: string) => void;
}

export function QuestionPanel({
  question,
  options,
  selectedValues,
  isSingleSelect,
  isMaxReached,
  topPriority,
  topLabel,
  onToggle,
}: QuestionPanelProps) {
  const { tokens } = useSignupTheme();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2
          className="text-balance font-semibold"
          style={{
            color: tokens.ink,
            fontSize: "clamp(1.5rem, 1.2rem + 1.4vw, 2.4rem)",
            lineHeight: 1.1,
            letterSpacing: "-0.025em",
          }}
        >
          {question.label}
        </h2>
        {question.hint && (
          <p
            className="max-w-[52ch] text-pretty"
            style={{
              color: tokens.inkMuted,
              fontSize: "clamp(0.9375rem, 0.9rem + 0.2vw, 1.0625rem)",
              lineHeight: 1.55,
            }}
          >
            {question.hint}
          </p>
        )}
      </div>

      <OptionGrid
        options={options}
        selectedValues={selectedValues}
        isSingleSelect={isSingleSelect}
        isMaxReached={isMaxReached}
        topPriority={topPriority}
        topLabel={topLabel}
        onToggle={onToggle}
      />
    </div>
  );
}

export default QuestionPanel;
