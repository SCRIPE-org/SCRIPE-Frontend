"use client";

import { motion } from "framer-motion";
import { Check, ChevronRight } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { BRAND_TOKENS } from "@core/ui/tokens/brand";
import { TEAM_SIZES, slideVariants } from "./discoveryConstants";

interface DiscoveryQ2TeamProps {
  selected: string | null;
  direction: number;
  onSelect: (size: string) => void;
  onBack: () => void;
  onSkip: () => void;
}

/**
 * Q2 — "How big is your team?"
 *
 * Option labels and sub-labels come from t() using keys defined in discoveryConstants.
 * All interaction callbacks flow up to the DiscoveryStep orchestrator.
 */
export function DiscoveryQ2Team({
  selected,
  direction,
  onSelect,
  onBack,
  onSkip,
}: DiscoveryQ2TeamProps) {
  const { t } = useI18n();

  return (
    <motion.div
      key="q2"
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
    >
      <div className="flex flex-wrap justify-center gap-3">
        {TEAM_SIZES.map((size) => {
          const isSelected = selected === size.value;
          return (
            <motion.button
              key={size.value}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(size.value)}
              aria-pressed={isSelected}
              className="group relative flex flex-col items-center gap-2 rounded-2xl border p-5 text-center transition-all w-full sm:w-[180px] md:w-[190px]"
              style={{
                background: isSelected ? `${BRAND_TOKENS.palette.violet}18` : BRAND_TOKENS.bg.card,
                borderColor: isSelected
                  ? BRAND_TOKENS.palette.violet
                  : BRAND_TOKENS.border.card.replace("1px solid ", ""),
                boxShadow: isSelected
                  ? `0 0 0 1px ${BRAND_TOKENS.palette.violet}, 0 4px 24px ${BRAND_TOKENS.palette.violet}18`
                  : BRAND_TOKENS.shadow.card,
              }}
            >
              {/* a11y: emoji is decorative — label comes from the text below */}
              <span className="text-3xl" aria-hidden="true">{size.icon}</span>
              <span className="text-sm font-semibold" style={{ color: BRAND_TOKENS.text.primary }}>
                {t(size.labelKey)}
              </span>
              <span className="text-xs leading-tight" style={{ color: BRAND_TOKENS.text.secondary }}>
                {t(size.sublabelKey)}
              </span>

              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-2 -top-2 rounded-full p-0.5"
                  style={{ background: BRAND_TOKENS.palette.violet }}
                >
                  <Check className="h-3 w-3 text-white" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Back + skip */}
      <div className="flex items-center justify-between mt-6">
        <button
          type="button"
          onClick={onBack}
          className="text-xs transition-colors hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-1 rounded"
          style={{ color: BRAND_TOKENS.text.secondary }}
        >
          {t("signup.common.back") || "← Back"}
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="text-xs transition-colors hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-1 rounded"
          style={{ color: BRAND_TOKENS.text.secondary }}
        >
          {t("signup.discovery.skipQ") || "Skip · I'll choose later"}
          <ChevronRight className="inline h-3 w-3 ml-0.5" aria-hidden="true" />
        </button>
      </div>
    </motion.div>
  );
}
