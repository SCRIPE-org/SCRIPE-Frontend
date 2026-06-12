"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Skeleton } from "@core/ui/skeleton";
import { Building2, Factory, HeartPulse, GraduationCap, Landmark, ArrowRight } from "lucide-react";
import { BRAND_TOKENS } from "@core/ui/tokens/brand";
import type { PublicCategory } from "../../domain/entities";

const CATEGORY_ICONS: Record<string, typeof Building2> = {
  general: Building2,
  erp: Factory,
  healthcare: HeartPulse,
  education: GraduationCap,
  finance: Landmark,
};

interface CategoryStepProps {
  categories: PublicCategory[];
  isLoading: boolean;
  /** Display currency for the "from {price}/mo" signal */
  currency: string;
  onSelectCategory: (categoryKey: string | null) => void;
  selectedCategory: string | null;
}

/**
 * CategoryStep — Step 1 "Organization" of the signup wizard.
 *
 * Renders pre-fetched categories passed down from the wizard VM (same fetch
 * that DiscoveryStep uses — no duplicate requests). The parent VM is responsible
 * for auto-skipping this step when categories.length < 2.
 */
export function CategoryStep({
  categories,
  isLoading,
  currency,
  onSelectCategory,
  selectedCategory,
}: CategoryStepProps) {
  const { t, language, direction } = useI18n();

  const formatFromPrice = (cat: PublicCategory) => {
    if (cat.fromPriceMonthly == null) {
      return t("signup.category.freeAvailable") || "Free plan available";
    }
    const price = `${cat.fromPriceMonthly.toLocaleString(language === "ar" ? "ar-EG" : "en-US")} ${cat.currency}`;
    return t("signup.category.fromPrice", { price }) || `from ${price}/mo`;
  };

  if (isLoading) {
    return (
      <div className="space-y-10">
        <div className="text-center">
          <Skeleton className="mx-auto h-10 w-72" />
          <Skeleton className="mx-auto mt-3 h-5 w-96" />
        </div>
        <div className="mx-auto flex flex-wrap justify-center gap-5 max-w-4xl">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-56 rounded-2xl w-full sm:w-[calc(50%-10px)] lg:w-[280px]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12" dir={direction} style={{ animation: "sxScreenIn 0.4s ease-out" }}>
      {/* ═══ Header ═══ */}
      <div className="text-center">
        <h1
          className="text-3xl font-bold tracking-tight sm:text-4xl"
          style={{
            background: BRAND_TOKENS.gradient.heroText,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {t("signup.category.title") || "What type of organization are you?"}
        </h1>
        <p
          className="mx-auto mt-3 max-w-xl text-base"
          style={{ color: BRAND_TOKENS.text.secondary }}
        >
          {t("signup.category.subtitle") || "We'll tailor the plans to fit."}
        </p>
      </div>

      {/* ═══ Category cards ═══ */}
      <div className="mx-auto flex flex-wrap justify-center gap-5 max-w-4xl">
        {categories.map((cat, idx) => {
          const Icon = CATEGORY_ICONS[cat.key] ?? Building2;
          const isSelected = selectedCategory === cat.key;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => onSelectCategory(cat.key)}
              className="group flex flex-col items-start gap-4 rounded-2xl p-6 text-start transition-all duration-300 hover:-translate-y-1 w-full sm:w-[calc(50%-10px)] lg:w-[280px]"
              style={{
                background: isSelected
                  ? BRAND_TOKENS.gradient.planCard
                  : "rgba(255,255,255,0.02)",
                border: isSelected ? BRAND_TOKENS.border.active : BRAND_TOKENS.border.muted,
                boxShadow: isSelected ? BRAND_TOKENS.shadow.card : "none",
                animation: `sxRise 0.5s ease-out ${idx * 80}ms both`,
              }}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{
                  background: BRAND_TOKENS.gradient.step,
                  boxShadow: BRAND_TOKENS.shadow.step,
                }}
              >
                <Icon className="h-6 w-6 text-white" />
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-bold" style={{ color: BRAND_TOKENS.text.primary }}>
                  {cat.displayName}
                </h3>
                {cat.description && (
                  <p
                    className="mt-1 text-sm leading-relaxed"
                    style={{ color: BRAND_TOKENS.text.secondary }}
                  >
                    {cat.description}
                  </p>
                )}
              </div>

              <div className="flex w-full items-center justify-between">
                <span
                  className="rounded-full px-3 py-1 text-[11px] font-semibold"
                  style={{
                    background: "rgba(34,211,238,0.08)",
                    border: "1px solid rgba(34,211,238,0.2)",
                    color: BRAND_TOKENS.text.cyan,
                  }}
                >
                  {formatFromPrice(cat)}
                </span>
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                  style={{ color: BRAND_TOKENS.text.tertiary }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* ═══ Continue CTA ═══ */}
      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={() => onSelectCategory(selectedCategory)}
          className="rounded-xl px-10 py-3 text-sm font-semibold text-white transition-all duration-200"
          style={{
            background: BRAND_TOKENS.gradient.cta,
            boxShadow: BRAND_TOKENS.shadow.cta,
          }}
        >
          {t("signup.category.continue") || "Continue →"}
        </button>

        {/* Skip / not-sure link — always selects null (show all plans) */}
        <button
          type="button"
          onClick={() => onSelectCategory(null)}
          className="text-xs font-medium underline underline-offset-2 transition-colors"
          style={{ color: BRAND_TOKENS.text.tertiary }}
        >
          {t("signup.category.notSure") || "Not sure? View all plans"}
        </button>
      </div>
    </div>
  );
}
