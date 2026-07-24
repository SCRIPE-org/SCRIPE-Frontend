// FILE-EXCEPTION: file length
/**
 * EditionComparisonView — the admin preview of the public pricing page.
 *
 * Layout:
 * 1. Global billing cycle toggle (Monthly / Yearly / Lifetime) at the top
 * 2. Pricing cards grid — prices update based on selected cycle
 * 3. Feature comparison matrix — expandable
 *
 * Architecture: View → ViewModel → Repository → Service → HTTP
 */
"use client";

import { useRef, useState } from "react";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@core/ui/table";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { EmptyState } from "@core/ui/empty-state";
import { MatrixCell } from "@core/ui/matrix-cell";
import { PageHeader } from "@core/ui/page-header";
import { Skeleton } from "@core/ui/skeleton";
import { Eye, Sparkles, ChevronDown, ChevronUp, LayoutList } from "lucide-react";
import type { Edition } from "../../domain/entities/Edition";
import {
  useEditionComparisonViewModel,
  type BillingCycle,
  type FeatureRow,
} from "../viewmodels/useEditionComparisonViewModel";
import {
  ComparisonColumnHeader,
  CategorySectionHeader,
  comparisonHighlightClasses,
} from "../components/comparison";
import { EditionPricingCard } from "../components/comparison/EditionPricingCard";
import {
  formatComparisonMessage,
  getLocalizedCycleName,
  getLocalizedCyclePeriod,
  type ComparisonTranslator,
} from "../components/comparison/comparisonFormatting";

/**
 * A TableRow that is handed a className opts out of the primitive's built-in
 * hover, so the matrix rows restate it — one hover tint, one micro duration.
 */
const MATRIX_ROW =
  "group border-b border-nx-line transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none hover:bg-nx-hover";

/**
 * The sticky feature column needs its own opaque fill so the value cells scroll
 * under it, which means it cannot inherit the row's translucent hover tint —
 * it steps to the raised fill instead, the same value that tint resolves to.
 */
const STICKY_LABEL_COLUMN =
  "sticky start-0 bg-nx-surface transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none group-hover:bg-nx-raised";

/** Marketing sub-labels sit under the figure they qualify, never beside it. */
const CELL_SUBLABEL = "max-w-[120px] text-center text-[10px] leading-tight";

function formatPrice(amount: number, language: string, currency = "USD"): string {
  const locale = language === "ar" ? "ar-EG" : "en-US";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return amount.toLocaleString(locale);
  }
}

// ─── Billing Cycle Toggle ───────────────────────────────────────────────────
function BillingCycleToggle({
  cycles,
  selected,
  onChange,
  savingsPercents,
  t,
}: {
  cycles: BillingCycle[];
  selected: BillingCycle;
  onChange: (cycle: BillingCycle) => void;
  savingsPercents: number[];
  t: ComparisonTranslator;
}) {
  if (cycles.length <= 1) return null;

  const maxYearlySavings = Math.max(0, ...savingsPercents.filter((saving) => saving > 0));

  return (
    <fieldset className="flex items-center justify-center">
      <legend className="sr-only">{t("entitlements.editions.comparison.billingCycle")}</legend>
      {/* The track is one surface step up behind a hairline; the selected
          segment is a real outline Button, so the pressed state is the
          system's own and never a hand-mixed fill. */}
      <div className="inline-flex gap-0.5 rounded-nx-control border border-nx-line bg-nx-raised p-0.5">
        {cycles.map((cycle) => {
          const isActive = selected === cycle;
          return (
            <Button
              type="button"
              variant={isActive ? "outline" : "ghost"}
              aria-pressed={isActive}
              key={cycle}
              onClick={() => onChange(cycle)}
              className="gap-2"
            >
              {getLocalizedCycleName(cycle, t)}
              {cycle === "Yearly" && maxYearlySavings > 0 && (
                <Badge variant="success">
                  {formatComparisonMessage(t("entitlements.editions.comparison.savePercent"), {
                    percent: maxYearlySavings,
                  })}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>
    </fieldset>
  );
}

// ─── Feature Matrix Cell ────────────────────────────────────────────────────
/**
 * Wraps the shared MatrixCell in the column chrome this table owns: the
 * recommended-column band and the optional per-edition marketing sub-label.
 * The value reading itself — boolean glyph, tabular figure, spoken em-dash for
 * an absent value — belongs to the shared cell so every comparison surface in
 * the product renders it identically.
 */
function FeatureMatrixCell({
  value,
  valueType,
  isHighlighted,
  displayLabel,
}: {
  value: string | undefined;
  valueType: string;
  isHighlighted: boolean;
  displayLabel?: string;
}) {
  const { t } = useI18n();
  const cellClasses = cn("text-center", isHighlighted && comparisonHighlightClasses);

  if (value === undefined || value === null || value === "") {
    return (
      <TableCell className={cellClasses}>
        <MatrixCell value={null} />
      </TableCell>
    );
  }

  if (valueType === "Boolean") {
    return (
      <TableCell className={cellClasses}>
        <div className="flex flex-col items-center gap-1">
          <MatrixCell value={value === "true"} />
          {displayLabel && value === "true" && (
            <span className={cn(CELL_SUBLABEL, "text-nx-accent")}>{displayLabel}</span>
          )}
        </div>
      </TableCell>
    );
  }

  if (valueType === "Numeric") {
    const num = parseInt(value, 10);
    return (
      <TableCell className={cellClasses}>
        <div className="flex flex-col items-center gap-0.5">
          {num === -1 ? (
            // The infinity glyph is the reading; screen readers get the word.
            <span className="text-sm font-semibold text-nx-accent">
              <span aria-hidden="true">∞</span>
              <span className="sr-only">
                {t("entitlements.editions.comparison.unlimited")}
              </span>
            </span>
          ) : num === 0 ? (
            <MatrixCell value={null} />
          ) : (
            <MatrixCell value={num} />
          )}
          {displayLabel && num !== 0 && (
            <span className={cn(CELL_SUBLABEL, "text-nx-ink-3")}>{displayLabel}</span>
          )}
        </div>
      </TableCell>
    );
  }

  return (
    <TableCell className={cellClasses}>
      {displayLabel ? (
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-sm font-medium text-nx-accent">{displayLabel}</span>
          <span className="text-[10px] text-nx-ink-3">{value}</span>
        </div>
      ) : (
        <MatrixCell value={value} />
      )}
    </TableCell>
  );
}

// ─── Loading Skeleton ───────────────────────────────────────────────────────
/**
 * Mirrors the real layout — one control-height toggle over a three-card grid —
 * so nothing jumps when the editions land.
 */
function LoadingState({ t }: { t: ComparisonTranslator }) {
  return (
    <div
      className="flex flex-col gap-8"
      role="status"
      aria-busy="true"
      aria-label={t("entitlements.editions.comparison.loading")}
    >
      <div className="flex justify-center">
        <Skeleton shape="control" className="w-72" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[1, 2, 3].map((placeholder) => (
          <Skeleton key={placeholder} className="h-96 rounded-nx-lg" />
        ))}
      </div>
    </div>
  );
}

// ─── Feature Category Block ─────────────────────────────────────────────────
function FeatureCategoryBlock({
  category,
  rows,
  editions,
  recommendedEditionId,
  colSpan,
  language,
  t,
}: {
  category: string;
  rows: FeatureRow[];
  editions: Edition[];
  recommendedEditionId: string;
  colSpan: number;
  language: string;
  t: ComparisonTranslator;
}) {
  return (
    <>
      <CategorySectionHeader
        label={t(`entitlements.editions.comparison.category${category}`) || category}
        colSpan={colSpan}
        category={category}
      />
      {rows.map((row: FeatureRow) => {
        const featureLabel =
          language === "ar" && row.displayNameAr
            ? row.displayNameAr
            : row.displayNameEn || row.featureName;
        return (
          <TableRow key={row.featureName} className={MATRIX_ROW}>
            <TableHead
              scope="row"
              className={cn(STICKY_LABEL_COLUMN, "text-sm font-medium text-nx-ink")}
            >
              {featureLabel}
            </TableHead>
            {editions.map((ed: Edition) => {
              // Resolve per-edition display label for current language
              const labelOverride = row.displayLabels[ed.id];
              const resolvedLabel = labelOverride
                ? language === "ar"
                  ? labelOverride.ar || labelOverride.en
                  : labelOverride.en || labelOverride.ar
                : undefined;
              return (
                <FeatureMatrixCell
                  key={ed.id}
                  value={row.values[ed.id]}
                  valueType={row.valueType}
                  isHighlighted={ed.id === recommendedEditionId}
                  displayLabel={resolvedLabel}
                />
              );
            })}
          </TableRow>
        );
      })}
    </>
  );
}

// ─── Main View ──────────────────────────────────────────────────────────────
/**
 * Presentation UI component rendering the edition comparison view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function EditionComparisonView() {
  useModuleLocales(() => import("../../../locales"), "editions");
  const { t, language } = useI18n();
  const matrixRef = useRef<HTMLDivElement>(null);
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  const {
    editions,
    categorizedFeatures,
    progressiveHighlights,
    totalFeatureCount,
    isLoading,
    isEmpty,
    selectedCycle,
    setSelectedCycle,
    availableCycles,
    cyclePrices,
    savingsPercents,
  } = useEditionComparisonViewModel();

  if (isLoading) return <LoadingState t={t} />;

  if (isEmpty) {
    return (
      <EmptyState
        icon={Sparkles}
        title={t("entitlements.editions.comparison.emptyTitle")}
        description={t("entitlements.editions.comparison.emptyDescription")}
        size="lg"
      />
    );
  }

  const colCount = editions.length;
  const colSpan = colCount + 1;
  const recommendedEditionId =
    editions.find((e: Edition) => e.recommendationLabels.length > 0)?.id ?? "";
  const selectedCycleName = getLocalizedCycleName(selectedCycle, t);

  return (
    <div className="flex flex-col gap-10">
      {/* ══════════════════════════════════════════════════
          SECTION 1 — HEADER + BILLING TOGGLE
      ══════════════════════════════════════════════════ */}
      <section className="flex flex-col gap-6">
        <PageHeader
          icon={Sparkles}
          title={t("entitlements.editions.comparison.heroTitle")}
          description={
            <span className="inline-flex items-center gap-1.5">
              <Eye aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
              {t("entitlements.editions.comparison.heroSubtitle")}
            </span>
          }
          className="mb-0"
        />

        {/* ── Global Billing Cycle Toggle ── */}
        <BillingCycleToggle
          cycles={availableCycles}
          selected={selectedCycle}
          onChange={setSelectedCycle}
          savingsPercents={savingsPercents}
          t={t}
        />

        {/* ── Pricing Cards Grid ── */}
        <div
          className={cn(
            "grid items-start gap-6",
            colCount === 1
              ? "max-w-sm grid-cols-1"
              : colCount === 2
                ? "max-w-2xl grid-cols-1 md:grid-cols-2"
                : colCount === 3
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          )}
        >
          {editions.map((ed: Edition, idx: number) => (
            <EditionPricingCard
              key={ed.id}
              edition={ed}
              language={language}
              selectedCycle={selectedCycle}
              priceInfo={
                cyclePrices[idx] ?? { price: undefined, isFree: true, isContactSales: false }
              }
              savingsPercent={savingsPercents[idx] ?? 0}
              highlights={progressiveHighlights[idx] ?? []}
              isRecommended={ed.id === recommendedEditionId}
            />
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 2 — FEATURE COMPARISON MATRIX
      ══════════════════════════════════════════════════ */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold leading-tight tracking-tight text-nx-ink">
          {t("entitlements.editions.comparison.matrixTitle")}
        </h2>

        {/* Table brings its own overflow container, so the panel only owns the
            hairline and the corner radius. */}
        <div className="overflow-hidden rounded-nx-lg border border-nx-line bg-nx-surface">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-nx-line bg-nx-raised">
                <TableHead className="sticky start-0 z-raised w-64 bg-nx-raised font-semibold text-nx-ink">
                  {t("entitlements.editions.feature")}
                </TableHead>
                {editions.map((ed: Edition) => (
                  <ComparisonColumnHeader
                    key={ed.id}
                    displayName={ed.getDisplayName(language) || ed.name}
                    tierLevel={ed.tierLevel}
                    badges={ed.recommendationLabels}
                    isRecommended={ed.id === recommendedEditionId}
                  />
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {/* ── Pricing Row (shows selected cycle price) ── */}
              <CategorySectionHeader
                label={t("entitlements.editions.comparison.categoryBilling")}
                colSpan={colSpan}
              />
              <TableRow className={MATRIX_ROW}>
                <TableCell className={cn(STICKY_LABEL_COLUMN, "text-sm font-medium text-nx-ink")}>
                  {t("entitlements.pricing.price")}{" "}
                  <span className="text-xs font-normal text-nx-ink-3">({selectedCycleName})</span>
                </TableCell>
                {editions.map((ed: Edition, idx: number) => {
                  const info = cyclePrices[idx];
                  const isHL = ed.id === recommendedEditionId;
                  return (
                    <TableCell
                      key={ed.id}
                      className={cn(
                        "text-center font-semibold tabular-nums",
                        isHL && comparisonHighlightClasses
                      )}
                    >
                      {info?.isContactSales ? (
                        <span className="text-sm font-normal text-nx-ink-2">
                          {t("entitlements.editions.comparison.customPricing")}
                        </span>
                      ) : info?.isFree || info?.price === 0 ? (
                        <span className="text-success">
                          {t("entitlements.editions.comparison.free")}
                        </span>
                      ) : info?.price !== undefined ? (
                        <span className="text-nx-ink">
                          {formatPrice(info.price, language)}
                          <span className="text-xs font-normal text-nx-ink-3">
                            /{getLocalizedCyclePeriod(selectedCycle, t)}
                          </span>
                        </span>
                      ) : (
                        <MatrixCell value={null} />
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>

              {/* ── Trial Row ── */}
              <TableRow className={MATRIX_ROW}>
                <TableCell className={cn(STICKY_LABEL_COLUMN, "text-sm font-medium text-nx-ink")}>
                  {t("entitlements.editions.comparison.trialRow")}
                </TableCell>
                {editions.map((ed: Edition) => (
                  <TableCell
                    key={ed.id}
                    className={cn(
                      "text-center",
                      ed.id === recommendedEditionId && comparisonHighlightClasses
                    )}
                  >
                    <div className="flex justify-center">
                      {ed.allowTrial && ed.trialDurationDays > 0 ? (
                        <span className="text-sm font-medium tabular-nums text-nx-accent">
                          {ed.trialIsFree
                            ? formatComparisonMessage(
                                t("entitlements.editions.comparison.trialDaysFree"),
                                { days: ed.trialDurationDays }
                              )
                            : formatComparisonMessage(
                                t("entitlements.editions.comparison.trialDaysDiscount"),
                                {
                                  days: ed.trialDurationDays,
                                  discount: ed.trialDiscountPercent,
                                }
                              )}
                        </span>
                      ) : (
                        <MatrixCell value={false} />
                      )}
                    </div>
                  </TableCell>
                ))}
              </TableRow>

              {/* ── Dynamic Feature Matrix (expandable) ── */}
              {showAllFeatures &&
                [...categorizedFeatures.entries()].map(([category, rows]) => (
                  <FeatureCategoryBlock
                    key={category}
                    category={category}
                    rows={rows}
                    editions={editions}
                    recommendedEditionId={recommendedEditionId}
                    colSpan={colSpan}
                    language={language}
                    t={t}
                  />
                ))}
            </TableBody>
          </Table>

          {/* ── Expand / Collapse ── */}
          {totalFeatureCount > 0 && (
            <div className="flex items-center justify-center border-t border-nx-line bg-nx-raised px-4 py-3">
              <Button
                variant="ghost"
                size="sm"
                aria-expanded={showAllFeatures}
                onClick={() => {
                  setShowAllFeatures((prev) => !prev);
                  if (!showAllFeatures) {
                    setTimeout(() => {
                      matrixRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }, 100);
                  }
                }}
                className="gap-2 text-sm font-medium"
              >
                <LayoutList aria-hidden="true" className="h-4 w-4" />
                {showAllFeatures
                  ? t("entitlements.editions.comparison.hideFeatures")
                  : formatComparisonMessage(
                      t("entitlements.editions.comparison.showAllFeaturesCount"),
                      { count: totalFeatureCount }
                    )}
                {showAllFeatures ? (
                  <ChevronUp aria-hidden="true" className="h-4 w-4" />
                ) : (
                  <ChevronDown aria-hidden="true" className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </div>

        <div ref={matrixRef} />
      </section>
    </div>
  );
}
