"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { BRAND_TOKENS } from "@core/ui/tokens/brand";
import { dotVariants } from "./discoveryConstants";

interface DiscoveryHeaderProps {
  question: number;        // 0 | 1 | 2
  displayedText: string;   // typewriter output driven by parent
  progressPct: number;     // 0–100
  totalQuestions: number;  // normally 3
}

/**
 * Renders the upper portion of the Discovery step:
 *   • AI "Smart Discovery" badge
 *   • Typed headline with blinking cursor
 *   • Sub-headline (contextual per question)
 *   • Progress dots (pill-style)
 *   • Thin gradient progress bar
 *
 * All text comes from the i18n `t()` function.
 * Receives only primitive/display props — zero DI, zero data fetching.
 */
export function DiscoveryHeader({
  question,
  displayedText,
  progressPct,
  totalQuestions,
}: DiscoveryHeaderProps) {
  const { t } = useI18n();

  const subHeadlines = [
    t("signup.discovery.q1Sub") || "We'll tailor your plan recommendations to your industry.",
    t("signup.discovery.q2Sub") || "We'll match features and quotas to your team's scale.",
    t("signup.discovery.q3Sub") || "We'll pin the feature you care about most on your recommended plan.",
  ];

  return (
    <div className="mb-10">
      {/* ── AI badge ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center justify-center gap-2 mb-8"
      >
        <div
          className="flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold"
          style={{
            background: `${BRAND_TOKENS.palette.violet}18`,
            border: `1px solid ${BRAND_TOKENS.palette.violet}35`,
            color: BRAND_TOKENS.palette.violet,
          }}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>{t("signup.discovery.badge") || "Smart Discovery · Finding your perfect plan"}</span>
        </div>
      </motion.div>

      {/* ── Typewriter headline ───────────────────────────── */}
      <div className="text-center mb-2 min-h-[3.5rem]">
        <h1
          className="text-3xl font-bold tracking-tight sm:text-4xl"
          style={{ color: BRAND_TOKENS.text.primary }}
        >
          {displayedText}
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            style={{ color: BRAND_TOKENS.palette.violet }}
          >
            |
          </motion.span>
        </h1>
      </div>

      {/* ── Sub-headline ──────────────────────────────────── */}
      <motion.p
        key={question}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="text-center text-sm mb-8"
        style={{ color: BRAND_TOKENS.text.secondary }}
      >
        {subHeadlines[question]}
      </motion.p>

      {/* ── Progress dots ─────────────────────────────────── */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {Array.from({ length: totalQuestions }).map((_, i) => (
          <motion.div
            key={i}
            variants={dotVariants}
            animate={i === question ? "active" : "inactive"}
            className="rounded-full"
            style={{
              width: i === question ? 24 : 8,
              height: 8,
              background: i === question ? BRAND_TOKENS.palette.violet : BRAND_TOKENS.text.ghost,
              transition: "width 0.3s ease",
            }}
          />
        ))}
      </div>

      {/* ── Progress bar ──────────────────────────────────── */}
      <div
        className="h-0.5 rounded-full overflow-hidden"
        style={{ background: `${BRAND_TOKENS.text.ghost}25` }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: BRAND_TOKENS.palette.violet }}
          animate={{ width: `${progressPct}%` }}
          transition={{ type: "spring", stiffness: 200, damping: 30 }}
        />
      </div>
    </div>
  );
}
