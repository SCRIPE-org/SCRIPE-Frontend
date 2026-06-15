"use client";

import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import { useSignupTheme } from "@core/providers/signup-theme";
import type { OnboardingAnswerOption } from "../../../domain/entities/OnboardingEntities";
import { DynamicIcon } from "./DynamicIcon";

// ═══════════════════════════════════════════════════════════════════════════
// OptionGrid — the answer options for the current Discovery question as
// selectable tiles. The "feel the change" surface: when the visible/ranked
// option set shifts (e.g. choosing a team scale re-filters + re-ranks the
// priorities), the grid re-orders and tiles enter/exit live.
//
// Elevate compliance:
//   • Selected = accent RING + faint accent TINT (no glow box-shadow).
//   • A single editorial scale, solid ink. No gradient text.
//   • Disabled when a multi question hit its max and this tile isn't selected.
//   • aria-pressed on every tile; full keyboard access (native <button>).
//   • Equal-height tiles via grid auto-rows; 2 cols mobile, 3 cols desktop.
//   • Staggered entrance; reduced-motion → instant + visible.
//   • Layout animation re-orders tiles smoothly when ranking changes.
//
// Pure UI — selection state + handlers come from the viewmodel.
// ═══════════════════════════════════════════════════════════════════════════

const prefersReducedMotion =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

const gridVariants = {
  hidden: {},
  visible: {
    transition: prefersReducedMotion ? {} : { staggerChildren: 0.05 },
  },
};

const tileVariants = prefersReducedMotion
  ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
  : {
      hidden: { opacity: 0, y: 10 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const },
      },
    };

interface OptionGridProps {
  /** Already visible + ranked by the viewmodel — render in the given order. */
  options: OnboardingAnswerOption[];
  /** Currently-selected values for the host question. */
  selectedValues: string[];
  /** Single-select questions show a radio-like affordance; multi show checks. */
  isSingleSelect: boolean;
  /** True when a multi question reached maxSelections (disables unselected tiles). */
  isMaxReached: boolean;
  /** The first multi-pick value, surfaced with a subtle "top" marker. Null otherwise. */
  topPriority: string | null;
  /** Localized label for the "top priority" marker chip. */
  topLabel: string;
  /** Toggle handler — viewmodel owns single/multi semantics. */
  onToggle: (value: string) => void;
}

export function OptionGrid({
  options,
  selectedValues,
  isSingleSelect,
  isMaxReached,
  topPriority,
  topLabel,
  onToggle,
}: OptionGridProps) {
  const { tokens } = useSignupTheme();

  return (
    <motion.div
      role="group"
      className="grid auto-rows-fr grid-cols-2 gap-3 sm:grid-cols-3"
      variants={gridVariants}
      initial="hidden"
      animate="visible"
    >
      {options.map((option) => {
        const isSelected = selectedValues.includes(option.value);
        const isDisabled = isMaxReached && !isSelected;
        const isTop = !isSingleSelect && topPriority === option.value;

        return (
          <motion.button
            key={option.value}
            type="button"
            layout={!prefersReducedMotion}
            variants={tileVariants}
            aria-pressed={isSelected}
            disabled={isDisabled}
            onClick={() => onToggle(option.value)}
            whileTap={isDisabled || prefersReducedMotion ? undefined : { scale: 0.97 }}
            className="relative flex h-full flex-col items-start gap-2 rounded-xl p-4 text-start transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              background: isSelected ? `${tokens.accent}1f` : tokens.surfaceRaised,
              // Accent ring on select — a real border, never a side-stripe, never a glow.
              border: isSelected ? tokens.borderActive : tokens.borderCard,
              // @ts-expect-error — CSS custom prop for Tailwind ring color.
              "--tw-ring-color": tokens.accent,
            }}
          >
            {/* Selected affordance — top-trailing corner. Check for multi, dot for single. */}
            {isSelected && (
              <span
                aria-hidden
                className="absolute end-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full"
                style={{ background: tokens.accent, color: tokens.accentContrast }}
              >
                <Check size={12} strokeWidth={3} />
              </span>
            )}

            <DynamicIcon
              name={option.iconKey}
              className="h-6 w-6 shrink-0"
              style={{ color: isSelected ? tokens.accent : tokens.inkMuted }}
            />

            <span className="flex flex-col gap-0.5">
              <span
                className="text-[0.9375rem] font-semibold leading-tight"
                style={{ color: tokens.ink }}
              >
                {option.label}
              </span>
              {option.sublabel && (
                <span
                  className="text-[0.8125rem] leading-snug"
                  style={{ color: tokens.inkFaint }}
                >
                  {option.sublabel}
                </span>
              )}
            </span>

            {/* Subtle "top priority" marker on the first multi-select pick. */}
            {isTop && (
              <span
                className="mt-auto inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[0.6875rem] font-semibold"
                style={{ background: `${tokens.accent}1a`, color: tokens.accent }}
              >
                <Star size={10} strokeWidth={2.5} aria-hidden />
                {topLabel}
              </span>
            )}
          </motion.button>
        );
      })}
    </motion.div>
  );
}

export default OptionGrid;
