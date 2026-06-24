"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";
import { useSignupTheme } from "@core/providers/signup-theme";
import { useI18n } from "@core/providers/i18n-provider";
import type { OnboardingQuestion } from "../../../domain/entities/OnboardingEntities";

// ═══════════════════════════════════════════════════════════════════════════
// ProfilePreview — the live "we're building your profile" panel.
//
// Reflects the user's answers back as human-readable chips, updating with each
// pick. It reads the question label + the SELECTED option labels (both already
// localized from the backend) and groups them per answered question, so the
// reader literally watches their profile take shape. The first multi-select
// pick wears a subtle "top" star, mirroring the option grid.
//
// Tone is calm and on-brand — a single restrained surface (NOT a glass card,
// NOT a glow). It teases that a tailored recommendation is coming once they
// finish; before any answer it shows a quiet, confident placeholder.
//
// Layout: a sidebar on desktop (trailing column of the stage), a compact inline
// summary on mobile (the stage drops `variant="inline"`).
//
// Pure UI — questions + answers come from the viewmodel via props.
// ═══════════════════════════════════════════════════════════════════════════

const prefersReducedMotion =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

const chipTransition = prefersReducedMotion
  ? { duration: 0 }
  : { duration: 0.2, ease: [0.16, 1, 0.3, 1] as const };

interface ProfileLine {
  questionKey: string;
  questionLabel: string;
  /** Resolved option labels in selection order; first = top priority for multi. */
  values: { value: string; label: string }[];
  isMulti: boolean;
}

interface ProfilePreviewProps {
  /** Visible questions (ordered) — used to resolve labels + grouping. */
  questions: OnboardingQuestion[];
  /** questionKey → selected option values. */
  answers: Record<string, string[]>;
  /** "sidebar" (desktop trailing column) or "inline" (mobile compact summary). */
  variant?: "sidebar" | "inline";
}

/**
 * React presentation component representing the profile preview UI element.
 */
export function ProfilePreview({ questions, answers, variant = "sidebar" }: ProfilePreviewProps) {
  const { tokens } = useSignupTheme();
  const { t } = useI18n();

  // Resolve each answered question into labelled chips, preserving pick order.
  const lines = useMemo<ProfileLine[]>(() => {
    return questions
      .map((q) => {
        const selected = answers[q.key] ?? [];
        if (selected.length === 0) return null;
        const byValue = new Map(q.options.map((o) => [o.value, o.label]));
        const values = selected.map((value) => ({
          value,
          label: byValue.get(value) ?? value,
        }));
        return {
          questionKey: q.key,
          questionLabel: q.label,
          values,
          isMulti: q.questionType === "multi_select",
        } satisfies ProfileLine;
      })
      .filter((l): l is ProfileLine => l !== null);
  }, [questions, answers]);

  const hasAnswers = lines.length > 0;
  const isInline = variant === "inline";

  return (
    <aside
      aria-label={t("signup.discovery.stage.profileTitle")}
      className="flex flex-col rounded-2xl p-6 sm:p-7"
      style={{
        background: tokens.surfaceCard,
        border: tokens.borderCard,
        boxShadow: isInline ? "none" : tokens.shadowCard,
      }}
    >
      <div className="flex flex-col gap-1.5">
        <h3 className="text-[0.9375rem] font-semibold" style={{ color: tokens.ink }}>
          {t("signup.discovery.stage.profileTitle")}
        </h3>
        <p className="text-[0.8125rem] leading-relaxed" style={{ color: tokens.inkMuted }}>
          {hasAnswers
            ? t("signup.discovery.stage.profileBuilding")
            : t("signup.discovery.stage.profileEmpty")}
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-4" aria-live="polite">
        <AnimatePresence initial={false}>
          {lines.map((line) => (
            <motion.div
              key={line.questionKey}
              layout={!prefersReducedMotion}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
              transition={chipTransition}
              className="flex flex-col gap-2"
            >
              <span className="text-[0.75rem] font-medium" style={{ color: tokens.inkFaint }}>
                {line.questionLabel}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {line.values.map((v, i) => {
                  const isTop = line.isMulti && i === 0;
                  return (
                    <span
                      key={v.value}
                      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[0.8125rem] font-medium"
                      style={{
                        background: isTop ? `${tokens.accent}1f` : tokens.surfaceRaised,
                        border: isTop ? tokens.borderActive : `1px solid ${tokens.border}`,
                        color: isTop ? tokens.accent : tokens.ink,
                      }}
                    >
                      {isTop && <Star size={11} strokeWidth={2.5} aria-hidden />}
                      {v.label}
                    </span>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Tease the recommendation — a quiet promise, not a hero metric. */}
      <div
        className="mt-6 border-t pt-5 text-[0.8125rem] leading-relaxed"
        style={{ borderColor: tokens.border, color: tokens.inkMuted }}
      >
        {t("signup.discovery.stage.profileTease")}
      </div>
    </aside>
  );
}

export default ProfilePreview;
