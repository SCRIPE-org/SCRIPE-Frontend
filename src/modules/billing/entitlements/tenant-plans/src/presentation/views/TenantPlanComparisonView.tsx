// FILE-EXCEPTION: file length
/**
 * TenantPlanComparisonView — Premium dual-view comparison for end-users.
 *
 * Section 1: Pricing Cards Hero
 * Section 2: Core Billing Comparison (always visible)
 * Section 3: Full Feature Comparison Matrix (expandable)
 *
 * Architecture: View → ViewModel → Repository → Service → HTTP
 */
"use client";

import { useMemo, useRef, useState } from "react";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@core/ui/table";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { EmptyState } from "@core/ui/empty-state";
import { MatrixCell } from "@core/ui/matrix-cell";
import { PageHeader } from "@core/ui/page-header";
import { Skeleton } from "@core/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@core/ui/toggle-group";
import { Eye, Sparkles, ChevronDown, ChevronUp, LayoutList } from "lucide-react";
import type { TenantPlan } from "../../domain/entities/TenantPlan";
import { useTenantPlanComparisonViewModel } from "../viewmodels/useTenantPlanComparisonViewModel";
import type { FeatureRow } from "../viewmodels/useTenantPlanComparisonViewModel";
import { TenantPlanPricingCard } from "../components/TenantPlanPricingCard";
import {
  ComparisonColumnHeader,
  CategorySectionHeader,
  comparisonHighlightClasses,
} from "@modules/entitlements/editions/src/presentation/components/comparison";

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

// ─── Feature Value Cell ─────────────────────────────────────────────────────
/**
 * Wraps the shared MatrixCell in the column chrome this table owns: the
 * recommended-column band. The value reading itself — boolean glyph, tabular
 * figure, spoken em-dash for an absent value — belongs to the shared cell so
 * every comparison surface in the product renders it identically.
 */
function FeatureMatrixCell({
  value,
  valueType,
  isHighlighted,
}: {
  value: string | undefined;
  valueType: string;
  isHighlighted: boolean;
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
        <div className="flex justify-center">
          <MatrixCell value={value === "true"} />
        </div>
      </TableCell>
    );
  }

  if (valueType === "Numeric") {
    const num = parseInt(value, 10);
    return (
      <TableCell className={cellClasses}>
        {num === -1 ? (
          // The infinity glyph is the reading; screen readers get the word.
          <span className="text-sm font-semibold text-nx-accent">
            <span aria-hidden="true">∞</span>
            <span className="sr-only">{t("entitlements.tenantPlans.unlimitedUsers")}</span>
          </span>
        ) : num === 0 ? (
          <MatrixCell value={null} />
        ) : (
          <MatrixCell value={num} />
        )}
      </TableCell>
    );
  }

  return (
    <TableCell className={cellClasses}>
      <MatrixCell value={value} />
    </TableCell>
  );
}

// ─── Loading State ─────────────────────────────────────────────────────────
/**
 * Mirrors the real layout — one control-height toggle over a three-card grid —
 * so nothing jumps when the plans land.
 */
function LoadingState({ t }: { t: (key: string) => string }) {
  return (
    <div
      className="flex flex-col gap-8"
      role="status"
      aria-busy="true"
      aria-label={t("entitlements.tenantPlans.comparison.loading")}
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

// ─── Feature Category Block ────────────────────────────────────────────────
function FeatureCategoryBlock({
  category,
  rows,
  plans,
  recommendedPlanId,
  colSpan,
  language,
  t,
}: {
  category: string;
  rows: FeatureRow[];
  plans: TenantPlan[];
  recommendedPlanId: string;
  colSpan: number;
  language: string;
  t: (key: string) => string;
}) {
  return (
    <>
      <CategorySectionHeader
        label={t(`entitlements.tenantPlans.comparison.category${category}`) || category}
        category={category}
        colSpan={colSpan}
      />
      {rows.map((row: FeatureRow) => {
        const featureLabel =
          language === "ar" && row.displayNameAr
            ? row.displayNameAr
            : row.displayNameEn || row.featureKey;
        return (
          <TableRow key={row.featureKey} className={MATRIX_ROW}>
            <TableHead
              scope="row"
              className={cn(STICKY_LABEL_COLUMN, "text-sm font-medium text-nx-ink")}
            >
              {featureLabel}
            </TableHead>
            {plans.map((plan: TenantPlan) => (
              <FeatureMatrixCell
                key={plan.id}
                value={row.values[plan.id]}
                valueType={row.valueType}
                isHighlighted={plan.id === recommendedPlanId}
              />
            ))}
          </TableRow>
        );
      })}
    </>
  );
}

// ─── Main View ─────────────────────────────────────────────────────────────
/**
 * Presentation UI component rendering the tenant plan comparison view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function TenantPlanComparisonView() {
  useModuleLocales(() => import("../../../locales"), "tenant-plans");
  const { t, language } = useI18n();
  const matrixRef = useRef<HTMLDivElement>(null);
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  const {
    plans,
    categorizedFeatures,
    progressiveHighlights,
    totalFeatureCount,
    isLoading,
    isEmpty,
    selectedCycle,
    setSelectedCycle,
    availableCycles,
  } = useTenantPlanComparisonViewModel();

  // Real Monthly-vs-Yearly savings, averaged across every plan that sells
  // both cycles — replaces a flat, un-computed marketing percentage that used
  // to sit next to the Yearly toggle. A plan without both cycles contributes
  // nothing rather than a guess.
  const yearlySavingsPercent = useMemo(() => {
    const percentages: number[] = [];
    plans.forEach((plan: TenantPlan) => {
      const monthly = plan.prices.filter((p) => p.billingCycle === "Monthly");
      const yearly = plan.prices.filter((p) => p.billingCycle === "Yearly");
      if (monthly.length === 0 || yearly.length === 0) return;

      const cheapestMonthly = monthly.reduce(
        (min, p) => (p.amount < min.amount ? p : min),
        monthly[0]
      );
      const cheapestYearly = yearly.reduce(
        (min, p) => (p.amount < min.amount ? p : min),
        yearly[0]
      );
      const annualizedMonthly = cheapestMonthly.amount * 12;
      if (annualizedMonthly <= 0) return;

      const pct = ((annualizedMonthly - cheapestYearly.amount) / annualizedMonthly) * 100;
      if (pct > 0) percentages.push(pct);
    });
    if (percentages.length === 0) return null;
    return Math.round(percentages.reduce((sum, p) => sum + p, 0) / percentages.length);
  }, [plans]);

  if (isLoading) return <LoadingState t={t} />;

  if (isEmpty) {
    return (
      <EmptyState
        icon={Sparkles}
        title={t("entitlements.tenantPlans.comparison.emptyTitle")}
        description={t("entitlements.tenantPlans.comparison.emptyDescription")}
        size="lg"
      />
    );
  }

  const colCount = plans.length;
  const colSpan = colCount + 1;

  // Only highlight a plan if it explicitly has a badge — NO fallback
  const recommendedPlanId = plans.find((p: TenantPlan) => !!p.badgeText)?.id ?? "";

  return (
    <div className="flex flex-col gap-8">
      {/* ══════════════════════════════════════════════════
          SECTION 1 — PRICING CARDS HERO
      ══════════════════════════════════════════════════ */}
      <section className="flex flex-col gap-6">
        <PageHeader
          icon={Sparkles}
          title={t("entitlements.tenantPlans.comparison.heroTitle")}
          description={
            <span className="inline-flex items-center gap-1.5">
              <Eye aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
              {t("entitlements.tenantPlans.comparison.heroSubtitle")}
            </span>
          }
          className="mb-0"
        />

        {/* ── Cycle Toggle ── */}
        {availableCycles.length > 1 && (
          <div className="flex justify-center">
            <ToggleGroup
              type="single"
              preset="segmented"
              value={selectedCycle}
              onValueChange={(val) => {
                if (val === "Monthly" || val === "Yearly" || val === "Lifetime")
                  setSelectedCycle(val);
              }}
            >
              {availableCycles.includes("Monthly") && (
                <ToggleGroupItem value="Monthly" className="gap-2 px-6">
                  {t("entitlements.tenantPlans.monthly")}
                </ToggleGroupItem>
              )}
              {availableCycles.includes("Yearly") && (
                <ToggleGroupItem value="Yearly" className="gap-2 px-6">
                  {t("entitlements.tenantPlans.yearly")}
                  {yearlySavingsPercent !== null && yearlySavingsPercent > 0 && (
                    <Badge variant="success">
                      {t("entitlements.tenantPlans.comparison.savePercent", {
                        percent: yearlySavingsPercent,
                      })}
                    </Badge>
                  )}
                </ToggleGroupItem>
              )}
              {availableCycles.includes("Lifetime") && (
                <ToggleGroupItem value="Lifetime" className="gap-2 px-6">
                  {t("entitlements.tenantPlans.lifetime")}
                </ToggleGroupItem>
              )}
            </ToggleGroup>
          </div>
        )}

        {/* Pricing Cards Grid */}
        <div
          className={cn(
            "grid items-start gap-5",
            colCount === 1
              ? "max-w-sm grid-cols-1"
              : colCount === 2
                ? "max-w-2xl grid-cols-1 md:grid-cols-2"
                : colCount === 3
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          )}
        >
          {plans.map((plan: TenantPlan, idx: number) => {
            const prevName =
              idx > 0
                ? (language === "ar"
                    ? plans[idx - 1].displayNameAr
                    : plans[idx - 1].displayNameEn) || plans[idx - 1].name
                : undefined;

            return (
              <TenantPlanPricingCard
                key={plan.id}
                plan={plan}
                language={language}
                previousPlanName={prevName}
                highlights={progressiveHighlights[idx] ?? []}
                isRecommended={plan.id === recommendedPlanId}
                selectedCycle={selectedCycle}
                allHighlightsLabel={t("entitlements.tenantPlans.comparison.allPreviousPlus")}
                freeLabel={t("common.free")}
                customLabel={t("entitlements.tenantPlans.comparison.customPricing")}
                previewLabel={t("entitlements.tenantPlans.comparison.adminPreview")}
              />
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 2 — COMPARISON TABLE
      ══════════════════════════════════════════════════ */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold leading-tight tracking-tight text-nx-ink">
          {t("entitlements.tenantPlans.comparison.matrixTitle")}
        </h2>

        {/* Table brings its own overflow container, so the panel only owns the
            hairline and the corner radius. */}
        <div className="overflow-hidden rounded-nx-lg border border-nx-line bg-nx-surface">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-nx-line bg-nx-raised">
                <TableHead className="sticky start-0 z-raised w-64 bg-nx-raised font-semibold text-nx-ink">
                  {t("entitlements.tenantPlans.feature")}
                </TableHead>
                {plans.map((plan: TenantPlan) => (
                  <ComparisonColumnHeader
                    key={plan.id}
                    displayName={
                      (language === "ar" ? plan.displayNameAr : plan.displayNameEn) || plan.name
                    }
                    tierLevel={plan.tierLevel}
                    badges={plan.badgeText ? [plan.badgeText] : []}
                    isRecommended={plan.id === recommendedPlanId}
                  />
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {/* ── Billing Category (always visible) ── */}
              <CategorySectionHeader
                label={t("entitlements.tenantPlans.comparison.categoryBilling")}
                category="Billing"
                colSpan={colSpan}
              />
              {/* Price */}
              <TableRow className={MATRIX_ROW}>
                <TableCell className={cn(STICKY_LABEL_COLUMN, "text-sm font-medium text-nx-ink")}>
                  {t("entitlements.pricing.price")}
                </TableCell>
                {plans.map((plan: TenantPlan) => {
                  const isHL = plan.id === recommendedPlanId;

                  let priceAmount: string;
                  let priceSuffix = "";
                  if (plan.isContactSalesOnly) {
                    priceAmount = t("entitlements.tenantPlans.comparison.customPricing");
                  } else if (!plan.hasPrices) {
                    priceAmount = t("common.free");
                  } else {
                    const cyclePrices = plan.prices.filter((p) => p.billingCycle === selectedCycle);
                    if (cyclePrices.length > 0) {
                      const cheapest = cyclePrices.reduce(
                        (min, p) => (p.amount < min.amount ? p : min),
                        cyclePrices[0]
                      );
                      priceAmount = new Intl.NumberFormat(language === "ar" ? "ar-EG" : "en-US", {
                        style: "currency",
                        currency: cheapest.currency || "USD",
                        minimumFractionDigits: 0,
                      }).format(cheapest.amount);

                      if (selectedCycle === "Monthly")
                        priceSuffix = t("entitlements.tenantPlans.comparison.monthShort");
                      else if (selectedCycle === "Yearly")
                        priceSuffix = t("entitlements.tenantPlans.comparison.yearShort");
                      else if (selectedCycle === "Lifetime")
                        priceSuffix = t("entitlements.tenantPlans.comparison.once");
                    } else {
                      priceAmount = "—";
                    }
                  }

                  return (
                    <TableCell
                      key={plan.id}
                      className={cn(
                        "text-center font-bold tabular-nums",
                        isHL && comparisonHighlightClasses
                      )}
                    >
                      {priceAmount === "—" ? (
                        <MatrixCell value={null} />
                      ) : plan.isContactSalesOnly ? (
                        <span className="text-sm font-normal text-nx-ink-2">{priceAmount}</span>
                      ) : !plan.hasPrices ? (
                        <span className="font-bold text-success">{priceAmount}</span>
                      ) : (
                        <span className="text-nx-ink">
                          {priceAmount}
                          <span className="text-xs font-normal text-nx-ink-3">/{priceSuffix}</span>
                        </span>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
              {/* Trial */}
              <TableRow className={MATRIX_ROW}>
                <TableCell className={cn(STICKY_LABEL_COLUMN, "text-sm font-medium text-nx-ink")}>
                  {t("entitlements.tenantPlans.allowTrial")}
                </TableCell>
                {plans.map((plan: TenantPlan) => (
                  <TableCell
                    key={plan.id}
                    className={cn(
                      "text-center",
                      plan.id === recommendedPlanId && comparisonHighlightClasses
                    )}
                  >
                    <div className="flex justify-center">
                      {plan.hasTrial ? (
                        <span className="text-sm font-medium tabular-nums text-nx-accent">
                          {t("entitlements.tenantPlans.comparison.trialDaysShort", {
                            days: plan.trialDays,
                          })}
                        </span>
                      ) : (
                        <MatrixCell value={false} />
                      )}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
              {/* Billing Cycles */}
              <TableRow className={MATRIX_ROW}>
                <TableCell className={cn(STICKY_LABEL_COLUMN, "text-sm font-medium text-nx-ink")}>
                  {t("entitlements.tenantPlans.allowMonthly")}
                </TableCell>
                {plans.map((plan: TenantPlan) => (
                  <TableCell
                    key={plan.id}
                    className={cn(
                      "text-center",
                      plan.id === recommendedPlanId && comparisonHighlightClasses
                    )}
                  >
                    <div className="flex justify-center">
                      <MatrixCell value={plan.allowMonthly} />
                    </div>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow className={MATRIX_ROW}>
                <TableCell className={cn(STICKY_LABEL_COLUMN, "text-sm font-medium text-nx-ink")}>
                  {t("entitlements.tenantPlans.allowYearly")}
                </TableCell>
                {plans.map((plan: TenantPlan) => (
                  <TableCell
                    key={plan.id}
                    className={cn(
                      "text-center",
                      plan.id === recommendedPlanId && comparisonHighlightClasses
                    )}
                  >
                    <div className="flex justify-center">
                      <MatrixCell value={plan.allowYearly} />
                    </div>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow className={MATRIX_ROW}>
                <TableCell className={cn(STICKY_LABEL_COLUMN, "text-sm font-medium text-nx-ink")}>
                  {t("entitlements.tenantPlans.allowLifetime")}
                </TableCell>
                {plans.map((plan: TenantPlan) => (
                  <TableCell
                    key={plan.id}
                    className={cn(
                      "text-center",
                      plan.id === recommendedPlanId && comparisonHighlightClasses
                    )}
                  >
                    <div className="flex justify-center">
                      <MatrixCell value={plan.allowLifetime} />
                    </div>
                  </TableCell>
                ))}
              </TableRow>

              {/* ── Users Category (always visible) ── */}
              <CategorySectionHeader
                label={t("entitlements.tenantPlans.comparison.categoryUsers")}
                category="Users"
                colSpan={colSpan}
              />
              <TableRow className={MATRIX_ROW}>
                <TableCell className={cn(STICKY_LABEL_COLUMN, "text-sm font-medium text-nx-ink")}>
                  {t("entitlements.tenantPlans.maxUsers")}
                </TableCell>
                {plans.map((plan: TenantPlan) => (
                  <FeatureMatrixCell
                    key={plan.id}
                    value={plan.maxUsers.toString()}
                    valueType="Numeric"
                    isHighlighted={plan.id === recommendedPlanId}
                  />
                ))}
              </TableRow>

              {/* ── Dynamic Feature Categories (shown when expanded) ── */}
              {showAllFeatures &&
                [...categorizedFeatures.entries()].map(([category, rows]) => (
                  <FeatureCategoryBlock
                    key={category}
                    category={category}
                    rows={rows}
                    plans={plans}
                    recommendedPlanId={recommendedPlanId}
                    colSpan={colSpan}
                    language={language}
                    t={t}
                  />
                ))}
            </TableBody>
          </Table>

          {/* ── Expand / Collapse Toggle ── */}
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
                  ? t("entitlements.tenantPlans.comparison.hideFeatures")
                  : t("entitlements.tenantPlans.comparison.showAllFeaturesCount", {
                      count: totalFeatureCount,
                    })}
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
