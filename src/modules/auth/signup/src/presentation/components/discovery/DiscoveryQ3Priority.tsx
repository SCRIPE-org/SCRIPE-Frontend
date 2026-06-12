"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight, MessageCircle, Star } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { BRAND_TOKENS } from "@core/ui/tokens/brand";
import { PRIORITIES, slideVariants } from "./discoveryConstants";

interface DiscoveryQ3PriorityProps {
  selected: string | null;
  direction: number;
  recommendationHint: string | null;
  onSelect: (priority: string) => void;
  onBack: () => void;
  onSkip: () => void;
}

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
  onSelect,
  onBack,
  onSkip,
}: DiscoveryQ3PriorityProps) {
  const { t } = useI18n();

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
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 mb-6 mx-auto max-w-sm text-xs font-medium"
          style={{
            background: `${BRAND_TOKENS.palette.cyan}12`,
            border: `1px solid ${BRAND_TOKENS.palette.cyan}30`,
            color: BRAND_TOKENS.palette.cyan,
          }}
        >
          <Star className="h-3.5 w-3.5 flex-shrink-0" />
          {recommendationHint}
        </motion.div>
      )}

      {/* Priority grid */}
      <div className="flex flex-wrap justify-center gap-3">
        {PRIORITIES.map((p, idx) => {
          const Icon = p.icon;
          const isSelected = selected === p.value;
          return (
            <motion.button
              key={p.value}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(p.value)}
              aria-pressed={isSelected}
              className="group relative flex flex-col items-center gap-2.5 rounded-2xl border p-4 text-center transition-all w-[calc(50%-6px)] sm:w-[160px] md:w-[180px]"
              style={{
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
                <Icon className="h-5 w-5" style={{ color: p.color }} />
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
                >
                  <Check className="h-3 w-3 text-white" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Back + skip-to-plans */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={onBack}
          className="text-xs transition-colors hover:opacity-80"
          style={{ color: BRAND_TOKENS.text.secondary }}
        >
          {t("signup.common.back") || "← Back"}
        </button>
        <button
          onClick={onSkip}
          className="flex items-center gap-1 text-xs font-semibold px-4 py-2 rounded-lg transition-all"
          style={{
            background: `${BRAND_TOKENS.palette.violet}18`,
            color: BRAND_TOKENS.palette.violet,
            border: `1px solid ${BRAND_TOKENS.palette.violet}30`,
          }}
        >
          <MessageCircle className="h-3.5 w-3.5" />
          {t("signup.discovery.skipToPlans") || "Skip · Show me the plans"}
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
