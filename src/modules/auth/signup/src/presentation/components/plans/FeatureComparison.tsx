"use client";

import { useMemo, useState, useEffect } from "react";
import { Check, Minus, ChevronDown } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useSignupTheme } from "@core/providers/signup-theme";
import type {
  ComparisonCategory,
  ComparisonCellData,
} from "../../../domain/entities";
import type { PlanPickerEdition } from "../../viewmodels/usePlanPicker";
import { formatCurrency } from "../../../data/helpers/planPickerLogic";

// ═══════════════════════════════════════════════════════════════════════════
// FeatureComparison — a real, collapsible "Compare all features" matrix.
//
//   • Columns = the active vertical's editions (tier order).
//   • Rows grouped by feature category; cells show ✓ / ✗ / value.
//   • Rows in categories matching the user's Q3 PRIORITIES are highlighted.
//   • Enterprise / contact-sales column header shows "Custom" — never a price.
//   • Sticky header row; horizontal scroll on small screens.
//   • Light + dark via theme tokens; RTL via logical properties.
//
// Pure UI — matrix + priorities come from the viewmodel.
// ═══════════════════════════════════════════════════════════════════════════

// Q3 priority value → feature category label that should be highlighted.
const PRIORITY_TO_CATEGORY: Record<string, string> = {
  security: "Security",
  compliance: "Security",
  hipaa: "Security",
  sso: "Security",
  audit: "Security",
  patientData: "Security",
  analytics: "General",
  automation: "Modules",
  collaboration: "Users & Access",
  scale: "Quotas",
  speed: "Performance",
  performance: "Performance",
  integrations: "General",
  apiAccess: "General",
  api: "General",
  support: "Support",
  dedicatedSupport: "Support",
};

interface FeatureComparisonProps {
  categories: ComparisonCategory[];
  editions: PlanPickerEdition[];
  billingCycle: "monthly" | "annual";
  currency: string;
  locale: string;
  isFxConverted: boolean;
  /** Q3 priority values (lowercased) — drive row highlighting. */
  priorityKeys: string[];
}

export function FeatureComparison({
  categories,
  editions,
  billingCycle,
  currency,
  locale,
  isFxConverted,
  priorityKeys,
}: FeatureComparisonProps) {
  const { t, language } = useI18n();
  const { tokens, theme } = useSignupTheme();
  const [open, setOpen] = useState(false);
  const [activeCategoryLabel, setActiveCategoryLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    const observerOptions = {
      root: null,
      rootMargin: "-60px 0px -80% 0px", // triggers when row crosses below the sticky header bar
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const label = entry.target.getAttribute("data-category-label");
          if (label) {
            setActiveCategoryLabel(label);
          }
        }
      });
    }, observerOptions);

    const timer = setTimeout(() => {
      const rows = document.querySelectorAll(".category-header-row");
      rows.forEach((row) => observer.observe(row));
    }, 150);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [open]);

  const highlightedCategories = useMemo(() => {
    const set = new Set<string>();
    for (const p of priorityKeys) {
      const cat = PRIORITY_TO_CATEGORY[p] ?? PRIORITY_TO_CATEGORY[p.toLowerCase()];
      if (cat) set.add(cat);
    }
    return set;
  }, [priorityKeys]);

  const headerPrice = (edition: PlanPickerEdition): string => {
    if (edition.priceDisplay === "free") return t("signup.plans.price.free");
    if (edition.priceDisplay === "custom" || edition.checkoutMode === "contact-sales")
      return t("signup.plans.price.custom");
    const amount = billingCycle === "monthly" ? edition.monthlyPrice : edition.annualPrice;
    if (!amount) return "—";
    const monthly = billingCycle === "annual" ? Math.round(amount / 12) : amount;
    return `${formatCurrency(monthly, currency, locale, isFxConverted)}/${t("signup.plans.price.perMonth")}`;
  };

  if (editions.length === 0 || categories.length === 0) return null;

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[0.875rem] font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2"
          style={{
            background: tokens.surfaceRaised,
            border: tokens.borderCard,
            color: tokens.inkMuted,
            // @ts-expect-error — CSS custom prop for Tailwind ring color.
            "--tw-ring-color": tokens.accent,
          }}
        >
          {open ? t("signup.plans.compare.hide") : t("signup.plans.compare.show")}
          <ChevronDown
            size={16}
            aria-hidden
            className="transition-transform duration-200 motion-reduce:transition-none"
            style={{ transform: open ? "rotate(180deg)" : "none" }}
          />
        </button>
      </div>

      {open && (
        <div
          className="mt-6 overflow-hidden lg:overflow-visible rounded-2xl"
          style={{ background: tokens.surfaceCard, border: tokens.borderCard }}
        >
          <div className="overflow-x-auto lg:overflow-visible rounded-2xl lg:rounded-none">
            <table className="w-full border-collapse text-start">
              <thead className="sticky top-14 z-20">
                <tr style={{ background: tokens.surfaceRaised }}>
                  <th
                    className="sticky start-0 top-14 z-30 py-4 pe-4 ps-4 text-start text-[0.6875rem] font-semibold uppercase tracking-wider sm:ps-6"
                    style={{ color: tokens.inkFaint, background: tokens.surfaceRaised, minWidth: 180 }}
                  >
                    {activeCategoryLabel || t("signup.plans.compare.featuresColumn")}
                  </th>
                  {editions.map((edition) => (
                    <th
                      key={edition.id}
                      className="sticky top-14 z-20 px-4 py-4 text-center align-bottom"
                      style={{
                        minWidth: 120,
                        background: edition.isRecommended
                          ? (theme === "dark" ? "#1a113d" : "#f3f0ff")
                          : tokens.surfaceRaised,
                      }}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[0.8125rem] font-semibold" style={{ color: tokens.ink }}>
                          {edition.name}
                        </span>
                        {edition.isRecommended && (
                          <span
                            className="rounded-full px-2 py-0.5 text-[0.5625rem] font-bold uppercase tracking-wider"
                            style={{ background: `${tokens.accent}26`, color: tokens.accent }}
                          >
                            {t("signup.plans.badge.recommended")}
                          </span>
                        )}
                        <span className="text-[0.6875rem] font-semibold" style={{ color: tokens.cyan }}>
                          {headerPrice(edition)}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {categories.map((category) => {
                  const highlighted = highlightedCategories.has(category.key);
                  return (
                    <CategoryBlock
                      key={category.key}
                      category={category}
                      editions={editions}
                      language={language}
                      highlighted={highlighted}
                      theme={theme}
                      tokens={tokens}
                      unlimitedLabel={t("signup.plans.feature.unlimited")}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Category block (section header + its feature rows) ─────────────────────────

function CategoryBlock({
  category,
  editions,
  language,
  highlighted,
  theme,
  tokens,
  unlimitedLabel,
}: {
  category: ComparisonCategory;
  editions: PlanPickerEdition[];
  language: string;
  highlighted: boolean;
  theme: "light" | "dark";
  tokens: { ink: string; inkMuted: string; inkFaint: string; accent: string; border: string; surfaceRaised: string };
  unlimitedLabel: string;
}) {
  return (
    <>
      <tr
        className="category-header-row"
        data-category-label={category.label}
        style={{ background: highlighted ? `${tokens.accent}12` : tokens.surfaceRaised }}
      >
        <td
          colSpan={editions.length + 1}
          className="py-2.5 ps-4 text-[0.6875rem] font-bold uppercase tracking-wider sm:ps-6"
          style={{ color: highlighted ? tokens.accent : tokens.inkFaint }}
        >
          {category.label}
        </td>
      </tr>
      {category.features.map((row) => (
        <tr key={row.featureName} style={{ borderTop: `1px solid ${tokens.border}` }}>
          <td
            className="sticky start-0 py-3 pe-4 ps-4 text-start text-[0.75rem] font-medium sm:ps-6"
            style={{
              color: highlighted ? tokens.ink : tokens.inkMuted,
              background: highlighted
                ? (theme === "dark" ? "#1d0e3a" : "#f7f4ff")
                : (theme === "dark" ? "#120a2b" : "#ffffff"),
              minWidth: 180,
            }}
          >
            {row.label}
          </td>
          {editions.map((edition) => (
            <td key={edition.id} className="px-4 py-3 text-center align-middle" style={{ minWidth: 120 }}>
              <Cell
                cell={row.values[edition.id]}
                language={language}
                tokens={tokens}
                unlimitedLabel={unlimitedLabel}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ─── Single cell renderer ───────────────────────────────────────────────────────

function Cell({
  cell,
  language,
  tokens,
  unlimitedLabel,
}: {
  cell: ComparisonCellData | undefined;
  language: string;
  tokens: { ink: string; inkMuted: string; inkFaint: string; accent: string; border: string };
  unlimitedLabel: string;
}) {
  if (!cell) return <Minus size={14} className="mx-auto opacity-30" style={{ color: tokens.inkFaint }} aria-hidden />;

  const displayLabel = (language === "ar" ? cell.displayLabelAr : cell.displayLabelEn) ?? cell.displayLabelEn ?? null;
  if (displayLabel) {
    return <span className="text-[0.75rem] font-medium" style={{ color: tokens.ink }}>{displayLabel}</span>;
  }

  if (cell.valueType === "Boolean") {
    return cell.value === "true" ? (
      <Check size={15} className="mx-auto" style={{ color: tokens.accent }} aria-hidden />
    ) : (
      <Minus size={14} className="mx-auto opacity-30" style={{ color: tokens.inkFaint }} aria-hidden />
    );
  }

  if (cell.valueType === "Numeric") {
    if (cell.value === "-1") {
      return <span className="text-[0.6875rem] font-semibold" style={{ color: tokens.accent }}>{unlimitedLabel}</span>;
    }
    if (cell.value === "0") {
      return <Minus size={14} className="mx-auto opacity-30" style={{ color: tokens.inkFaint }} aria-hidden />;
    }
    return <span className="text-[0.75rem] font-semibold" style={{ color: tokens.ink }}>{Number(cell.value).toLocaleString()}</span>;
  }

  if (!cell.value || cell.value === "false" || cell.value === "none") {
    return <Minus size={14} className="mx-auto opacity-30" style={{ color: tokens.inkFaint }} aria-hidden />;
  }
  return <span className="text-[0.6875rem]" style={{ color: tokens.inkMuted }}>{cell.value}</span>;
}
