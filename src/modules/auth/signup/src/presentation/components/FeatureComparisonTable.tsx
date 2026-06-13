"use client";

import { useState } from "react";
import { CheckCircle, X, Minus } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { BRAND_TOKENS } from "@core/ui/tokens/brand";
import type { ComparisonCategory, ComparisonFeatureRow, PlanEdition } from "../../domain/entities";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FeatureComparisonTableProps {
  /** Category sections from buildComparisonCategories() — already grouped + sorted */
  comparisonCategories: ComparisonCategory[];
  /** Editions in tier order — the columns */
  comparisonEditions: PlanEdition[];
  /** billing cycle — for price row display in header */
  billingCycle: "monthly" | "annual";
  /** currency code */
  currencyCode: string;
  /** Whether prices are FX-converted from USD */
  isFxConverted: boolean;
  /** Q3 selected priorities (comma-joined or single) — used to highlight matching rows */
  selectedPriorities?: string | null;
  /** Tier recommended by the backend scorer — used to highlight the matching edition column */
  recommendedTier?: string | null;
}

// ─── Priority → feature category mapping ──────────────────────────────────────
// Maps Q3 priority keys to the feature category label that should be highlighted

const PRIORITY_TO_CATEGORY: Record<string, string> = {
  security:      "Security",
  compliance:    "Security",
  sso:           "Security",
  analytics:     "General",
  automation:    "Modules",
  collaboration: "Users & Access",
  scale:         "Quotas",
  performance:   "Performance",
  api:           "General",
  support:       "Support",
};

// ─── Cell value renderer ──────────────────────────────────────────────────────

function CellValue({
  valueType,
  value,
  displayLabel,
}: {
  valueType: string;
  value: string;
  displayLabel: string | null;
}) {
  const { t } = useI18n();

  if (displayLabel) {
    return (
      <span className="text-xs font-medium" style={{ color: BRAND_TOKENS.text.primary }}>
        {displayLabel}
      </span>
    );
  }

  if (valueType === "Boolean") {
    if (value === "true") {
      // a11y: role+aria-label so screen readers announce "Included" not a bare icon
      return (
        <CheckCircle
          className="mx-auto h-4 w-4"
          style={{ color: BRAND_TOKENS.text.success }}
          role="img"
          aria-label={t("signup.plan.included") || "Included"}
        />
      );
    }
    return (
      <X
        className="mx-auto h-4 w-4 opacity-30"
        style={{ color: BRAND_TOKENS.text.ghost }}
        role="img"
        aria-label={t("signup.plan.notIncluded") || "Not included"}
      />
    );
  }

  if (valueType === "Numeric") {
    if (value === "-1") {
      // a11y: outer span carries the semantic label; ∞ glyph is purely visual
      return (
        <span
          className="inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-bold"
          style={{
            background: "rgba(34,211,238,0.1)",
            color: BRAND_TOKENS.text.cyan,
            border: "1px solid rgba(34,211,238,0.15)",
          }}
          aria-label={t("signup.plan.unlimited") || "Unlimited"}
        >
          <span aria-hidden="true">∞</span>
        </span>
      );
    }
    if (value === "0") {
      // a11y: decorative dash — screen reader skips it; Boolean false already conveys meaning
      return <Minus className="mx-auto h-3.5 w-3.5 opacity-25" aria-hidden="true" style={{ color: BRAND_TOKENS.text.ghost }} />;
    }
    return (
      <span className="text-xs font-semibold" style={{ color: BRAND_TOKENS.text.primary }}>
        {Number(value).toLocaleString()}
      </span>
    );
  }

  // Text type
  if (!value || value === "false" || value === "none") {
    return <Minus className="mx-auto h-3.5 w-3.5 opacity-25" aria-hidden="true" style={{ color: BRAND_TOKENS.text.ghost }} />;
  }
  return (
    <span className="text-[11px] leading-tight" style={{ color: BRAND_TOKENS.text.secondary }}>
      {value}
    </span>
  );
}

// ─── Feature row ──────────────────────────────────────────────────────────────

function FeatureRow({
  row,
  editions,
  language,
  isHighlighted,
  isEven,
}: {
  row: ComparisonFeatureRow;
  editions: PlanEdition[];
  language: string;
  isHighlighted: boolean;
  isEven: boolean;
}) {
  return (
    <tr
      style={{
        background: isHighlighted
          ? "rgba(168,85,247,0.06)"
          : isEven
          ? "rgba(255,255,255,0.015)"
          : "transparent",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        ...(isHighlighted ? { outline: "1px solid rgba(168,85,247,0.15)", outlineOffset: "-1px" } : {}),
      }}
    >
      {/* Feature name */}
      <td
        className="sticky left-0 py-3 pe-4 ps-4 text-left align-middle text-xs font-medium sm:ps-6"
        style={{
          color: isHighlighted ? BRAND_TOKENS.text.brand : BRAND_TOKENS.text.secondary,
          background: isHighlighted
            ? "rgba(168,85,247,0.08)"
            : isEven
            ? "rgba(255,255,255,0.015)"
            : "#0D0D14",
          minWidth: 180,
          maxWidth: 240,
          borderRight: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        {isHighlighted && (
          <span
            className="me-1.5 inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: BRAND_TOKENS.palette.violet }}
          />
        )}
        {row.label}
      </td>

      {/* Values per edition */}
      {editions.map((edition) => {
        const cell = row.values[edition.id];
        const displayLabel =
          (language === "ar" ? cell?.displayLabelAr : cell?.displayLabelEn) ?? cell?.displayLabelEn ?? null;

        return (
          <td
            key={edition.id}
            className="px-4 py-3 text-center align-middle"
            style={{ minWidth: 110 }}
          >
            {cell ? (
              <CellValue
                valueType={cell.valueType}
                value={cell.value}
                displayLabel={displayLabel}
              />
            ) : (
              <Minus className="mx-auto h-3.5 w-3.5 opacity-20" style={{ color: BRAND_TOKENS.text.ghost }} />
            )}
          </td>
        );
      })}
    </tr>
  );
}

// ─── Section header row ───────────────────────────────────────────────────────

function SectionHeaderRow({
  label,
  colCount,
  isHighlightedSection,
}: {
  label: string;
  colCount: number;
  isHighlightedSection: boolean;
}) {
  return (
    <tr
      style={{
        background: isHighlightedSection
          ? "rgba(168,85,247,0.1)"
          : "rgba(255,255,255,0.03)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <td
        colSpan={colCount + 1}
        className="py-2.5 ps-4 text-[11px] font-bold uppercase tracking-widest sm:ps-6"
        style={{
          color: isHighlightedSection ? BRAND_TOKENS.text.brand : BRAND_TOKENS.text.ghost,
          letterSpacing: "0.12em",
        }}
      >
        {/* a11y: ★ glyph is decorative — screen reader should not announce it */}
        {isHighlightedSection && <span aria-hidden="true">★ </span>}{label}
      </td>
    </tr>
  );
}

// ─── Tier accent colours ──────────────────────────────────────────────────────

const TIER_ACCENT: Record<number, string> = {
  0: "rgba(255,255,255,0.15)",
  1: "rgba(34,211,238,0.5)",
  2: "rgba(168,85,247,0.7)",
  3: "rgba(250,204,21,0.7)",
};

// ─── Tier label → tier level map for recommendation highlight ─────────────────

const TIER_LABEL_TO_LEVEL: Record<string, number> = {
  free:       0,
  pro:        1,
  ultra:      2,
  enterprise: 3,
};

// ─── Main component ───────────────────────────────────────────────────────────

export function FeatureComparisonTable({
  comparisonCategories,
  comparisonEditions,
  billingCycle,
  currencyCode,
  isFxConverted,
  selectedPriorities,
  recommendedTier,
}: FeatureComparisonTableProps) {
  const { t, language } = useI18n();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    () => new Set(comparisonCategories.map((c) => c.key))
  );

  const toggleCategory = (key: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Derive which feature category labels are highlighted from Q3 priorities
  const highlightedCategories = new Set<string>();
  if (selectedPriorities) {
    const priorities = selectedPriorities.split(",").map((p) => p.trim().toLowerCase());
    for (const p of priorities) {
      const cat = PRIORITY_TO_CATEGORY[p];
      if (cat) highlightedCategories.add(cat);
    }
  }

  // Resolve recommended tier level so we can highlight the matching column header
  const recommendedTierLevel =
    recommendedTier != null ? (TIER_LABEL_TO_LEVEL[recommendedTier.toLowerCase()] ?? -1) : -1;

  const formatHeaderPrice = (edition: PlanEdition): string => {
    if (edition.priceDisplay === "free")   return t("signup.plan.free")         || "Free";
    if (edition.priceDisplay === "custom") return t("signup.plan.contactSales") || "Contact Sales";
    const price = billingCycle === "monthly" ? edition.monthlyPrice : edition.annualPrice;
    if (!price) return "—";
    try {
      const formatted = new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: currencyCode || "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(billingCycle === "annual" ? Math.round(price / 12) : price);
      return isFxConverted ? `≈\u202F${formatted}/mo` : `${formatted}/mo`;
    } catch {
      return `${price} ${currencyCode}/mo`;
    }
  };

  if (comparisonEditions.length === 0 || comparisonCategories.length === 0) {
    return (
      <div className="py-12 text-center text-sm" style={{ color: BRAND_TOKENS.text.ghost }}>
        {t("signup.plan.noFeaturesData") || "Feature comparison data is loading…"}
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{
        background: "linear-gradient(180deg, rgba(20,12,46,.78), rgba(10,8,28,.85))",
        border: BRAND_TOKENS.border.card,
        boxShadow: BRAND_TOKENS.shadow.card,
      }}
    >
      {/* Mobile notice */}
      <div
        className="px-4 py-2 text-center text-[10px] font-medium sm:hidden"
        style={{
          background: "rgba(168,85,247,0.06)",
          color: BRAND_TOKENS.text.ghost,
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        {t("signup.plan.scrollToCompare") || "← Scroll to compare →"}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-fixed border-collapse text-left">
          {/* ── Column header row ── */}
          <thead>
            <tr
              style={{
                background: "rgba(255,255,255,0.03)",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {/* Feature label column */}
              <th
                className="sticky left-0 py-4 pe-4 ps-4 text-left align-bottom sm:ps-6"
                style={{
                  background: "rgba(13,13,20,0.97)",
                  backdropFilter: "blur(12px)",
                  minWidth: 180,
                  maxWidth: 240,
                  borderRight: "1px solid rgba(255,255,255,0.05)",
                  color: BRAND_TOKENS.text.ghost,
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                {t("signup.plan.features") || "Features"}
              </th>

              {/* Edition columns */}
              {comparisonEditions.map((edition) => {
                const accent = TIER_ACCENT[edition.tierLevel] ?? "rgba(168,85,247,0.5)";
                const isEnterprise = edition.priceDisplay === "custom";
                const isRecommended = recommendedTierLevel >= 0 && edition.tierLevel === recommendedTierLevel;

                return (
                  <th
                    key={edition.id}
                    className="py-5 px-4 text-center align-bottom"
                    style={{
                      minWidth: 110,
                      position: "relative",
                      ...(isRecommended
                        ? {
                            background: "rgba(168,85,247,0.07)",
                            outline: "1px solid rgba(168,85,247,0.2)",
                            outlineOffset: "-1px",
                          }
                        : {}),
                    }}
                  >
                    {/* Top accent bar */}
                    <div
                      className="absolute left-0 right-0 top-0 h-0.5"
                      style={{
                        background: isRecommended
                          ? `linear-gradient(90deg, ${accent}, rgba(168,85,247,0.9))`
                          : accent,
                      }}
                    />

                    <div className="flex flex-col items-center gap-1.5">
                      <span
                        className="text-sm font-bold"
                        style={{ color: BRAND_TOKENS.text.primary }}
                      >
                        {edition.name}
                      </span>

                      {isRecommended && (
                        <span
                          className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                          style={{
                            background: "rgba(168,85,247,0.18)",
                            color: BRAND_TOKENS.text.brand,
                            border: "1px solid rgba(168,85,247,0.3)",
                          }}
                        >
                          {t("signup.plan.recommendedForYou") || "Recommended"}
                        </span>
                      )}

                      <span
                        className="text-[11px] font-semibold"
                        style={{
                          color: isEnterprise ? BRAND_TOKENS.text.brand : BRAND_TOKENS.text.cyan,
                        }}
                      >
                        {formatHeaderPrice(edition)}
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* ── Feature rows ── */}
          <tbody>
            {comparisonCategories.map((category) => {
              const isExpanded = expandedCategories.has(category.key);
              const isCategoryHighlighted = highlightedCategories.has(category.key);

              return [
                // Section header
                <SectionHeaderRow
                  key={`hdr-${category.key}`}
                  label={category.label}
                  colCount={comparisonEditions.length}
                  isHighlightedSection={isCategoryHighlighted}
                />,

                // Toggle row (collapse/expand)
                // a11y: role=button + tabIndex + onKeyDown makes this keyboard-navigable;
                // aria-expanded announces the open/closed state to screen readers
                <tr
                  key={`toggle-${category.key}`}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                  aria-label={
                    isExpanded
                      ? `${category.label} — ${t("signup.plan.collapseSection") || "Collapse"}`
                      : `${category.label} — ${t("signup.plan.expandSection") || "Expand"}`
                  }
                  onClick={() => toggleCategory(category.key)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleCategory(category.key);
                    }
                  }}
                  className="cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-500"
                  style={{
                    background: "transparent",
                    borderBottom: "1px solid rgba(255,255,255,0.03)",
                  }}
                >
                  <td
                    colSpan={comparisonEditions.length + 1}
                    className="py-1.5 ps-6 text-[10px]"
                    style={{ color: BRAND_TOKENS.text.ghost }}
                  >
                    {/* a11y: triangle glyphs are decorative — aria-label on the <tr> carries the meaning */}
                    <span aria-hidden="true">{isExpanded ? "▾ " : "▸ "}</span>
                    {isExpanded
                      ? `${t("signup.plan.collapseSection") || "Collapse"} (${category.features.length} features)`
                      : `${t("signup.plan.expandSection") || "Show"} ${category.features.length} features`}
                  </td>
                </tr>,

                // Feature rows (when expanded)
                ...(isExpanded
                  ? category.features.map((row, rowIdx) => (
                      <FeatureRow
                        key={row.featureName}
                        row={row}
                        editions={comparisonEditions}
                        language={language}
                        isHighlighted={isCategoryHighlighted}
                        isEven={rowIdx % 2 === 0}
                      />
                    ))
                  : []),
              ];
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div
        className="border-t px-6 py-3 text-center text-[10px]"
        style={{
          borderColor: "rgba(255,255,255,0.06)",
          color: BRAND_TOKENS.text.ghost,
        }}
      >
        {isFxConverted
          ? t("signup.plan.fxConvertedTooltip") || "Prices are approximate. Billed in USD at checkout."
          : t("signup.plan.comparePricesNote", { currency: currencyCode }) ||
            `All prices in ${currencyCode}. Annual billed as a single payment.`}
      </div>
    </div>
  );
}
