"use client";

import { motion } from "framer-motion";
import { Check, ChevronRight } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { BRAND_TOKENS } from "@core/ui/tokens/brand";
import type { PublicCategory } from "../../../domain/entities";
import { DynamicIcon } from "./DynamicIcon";
import { slideVariants } from "./discoveryConstants";

interface DiscoveryQ1BusinessProps {
  categories: PublicCategory[];
  isCategoriesLoading: boolean;
  selected: string | null;
  direction: number;
  onSelect: (key: string) => void;
  onSkip: () => void;
}

/**
 * Q1 — "What does your business do?"
 *
 * Options are 100% data-driven from the `categories` prop (from the ViewModel).
 * Adapts automatically to 0, 1, or N categories.
 * All strings come from t() — zero hardcoded English.
 */
export function DiscoveryQ1Business({
  categories,
  isCategoriesLoading,
  selected,
  direction,
  onSelect,
  onSkip,
}: DiscoveryQ1BusinessProps) {
  const { t, language } = useI18n();

  return (
    <motion.div
      key="q1"
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
    >
      {isCategoriesLoading ? (
        /* Skeleton placeholders while API loads */
        <div className="flex flex-wrap justify-center gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-2xl animate-pulse w-[calc(50%-6px)] sm:w-[180px] md:w-[200px]"
              style={{ background: `${BRAND_TOKENS.text.ghost}15` }}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.key}
              category={cat}
              isSelected={selected === cat.key}
              language={language}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}

      {/* Skip Q1 */}
      <div className="flex justify-center mt-6">
        <button
          onClick={onSkip}
          className="text-xs transition-colors hover:opacity-80"
          style={{ color: BRAND_TOKENS.text.secondary }}
        >
          {t("signup.discovery.skipQ") || "Skip · I'll choose later"}
          <ChevronRight className="inline h-3 w-3 ml-0.5" />
        </button>
      </div>
    </motion.div>
  );
}

// ─── CategoryCard (private to this module) ───────────────────────────────────
interface CategoryCardProps {
  category: PublicCategory;
  isSelected: boolean;
  language: string;
  onSelect: (key: string) => void;
}

function CategoryCard({ category, isSelected, language, onSelect }: CategoryCardProps) {
  const { t } = useI18n();
  const displayName = category.displayName;
  const description =
    language === "ar" && category.descriptionAr
      ? category.descriptionAr
      : category.description;

  return (
    <motion.button
      whileHover={{ y: -4, scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onSelect(category.key)}
      aria-pressed={isSelected}
      className="group relative flex flex-col items-center gap-2.5 rounded-2xl border p-5 text-center transition-all w-[calc(50%-6px)] sm:w-[180px] md:w-[200px]"
      style={{
        background: isSelected ? `${BRAND_TOKENS.palette.violet}18` : BRAND_TOKENS.bg.card,
        borderColor: isSelected
          ? BRAND_TOKENS.palette.violet
          : BRAND_TOKENS.border.card.replace("1px solid ", ""),
        boxShadow: isSelected
          ? `0 0 0 1px ${BRAND_TOKENS.palette.violet}, 0 8px 32px ${BRAND_TOKENS.palette.violet}20`
          : BRAND_TOKENS.shadow.card,
      }}
    >
      {/* Icon */}
      <div
        className="flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
        style={{
          background: `${BRAND_TOKENS.palette.violet}15`,
          border: `1px solid ${BRAND_TOKENS.palette.violet}25`,
        }}
      >
        <DynamicIcon
          name={category.iconKey}
          className="h-6 w-6"
          style={{ color: BRAND_TOKENS.palette.violet }}
        />
      </div>

      {/* Text */}
      <div>
        <p className="text-sm font-semibold leading-tight" style={{ color: BRAND_TOKENS.text.primary }}>
          {displayName}
        </p>
        {description && (
          <p className="mt-1 text-[11px] leading-snug line-clamp-2" style={{ color: BRAND_TOKENS.text.secondary }}>
            {description}
          </p>
        )}
      </div>

      {/* Price hint */}
      {category.fromPriceMonthly != null && (
        <div className="text-[10px] font-medium" style={{ color: BRAND_TOKENS.palette.cyan }}>
          {t("signup.category.fromPrice", { price: `${category.currency} ${category.fromPriceMonthly}` }) ||
            `From ${category.currency} ${category.fromPriceMonthly}/mo`}
        </div>
      )}

      {/* Selected check badge */}
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
}
