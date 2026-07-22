// FILE-EXCEPTION: file length
/**
 * TenantPlanComparisonView — Premium dual-view comparison for end-users.
 *
 * Section 1: Glassmorphic Pricing Cards Hero
 * Section 2: Core Billing Comparison (always visible)
 * Section 3: Full Feature Comparison Matrix (expandable)
 *
 * Architecture: View → ViewModel → Repository → Service → HTTP
 */
"use client";

import { useRef, useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@core/ui/table";
import { Card, CardContent } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@core/ui/toggle-group";
import { Eye, Sparkles, ChevronDown, ChevronUp, LayoutList, Loader2 } from "lucide-react";
import type { TenantPlan } from "../../domain/entities/TenantPlan";
import { useTenantPlanComparisonViewModel } from "../viewmodels/useTenantPlanComparisonViewModel";
import type { FeatureRow } from "../viewmodels/useTenantPlanComparisonViewModel";
import { TenantPlanPricingCard } from "../components/TenantPlanPricingCard";
import {
  BooleanIndicator,
  ComparisonColumnHeader,
  CategorySectionHeader,
} from "@modules/entitlements/editions/src/presentation/components/comparison";

// ─── Feature Value Cell ────────────────────────────────────────────────────
function MatrixCell({
  value,
  valueType,
  isHighlighted,
}: {
  value: string | undefined;
  valueType: string;
  isHighlighted: boolean;
}) {
  const cls = `text-center py-3.5 px-3 ${isHighlighted ? "bg-primary/5" : ""}`;

  if (value === undefined || value === null || value === "") {
    return (
      <TableCell className={cls}>
        <span className="text-muted-foreground/40">—</span>
      </TableCell>
    );
  }

  if (valueType === "Boolean") {
    return (
      <TableCell className={cls}>
        <div className="flex justify-center">
          <BooleanIndicator value={value === "true"} />
        </div>
      </TableCell>
    );
  }

  if (valueType === "Numeric") {
    const num = parseInt(value, 10);
    return (
      <TableCell className={cls}>
        <span className="text-sm font-semibold tabular-nums">
          {num === -1 ? (
            <span className="font-bold text-primary">∞</span>
          ) : num === 0 ? (
            <span className="text-muted-foreground/50">—</span>
          ) : (
            num.toLocaleString()
          )}
        </span>
      </TableCell>
    );
  }

  return (
    <TableCell className={cls}>
      <span className="text-center text-sm">{value || "—"}</span>
    </TableCell>
  );
}

// ─── Loading State ─────────────────────────────────────────────────────────
function LoadingState() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-96 animate-pulse rounded-xl border border-border/40 bg-muted/20"
          />
        ))}
      </div>
      <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading feature data…</span>
      </div>
    </div>
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

  if (isLoading) return <LoadingState />;

  if (isEmpty) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <Sparkles className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
          <p className="text-muted-foreground">
            {t("entitlements.tenantPlans.noPlans") || "No active plans to compare."}
          </p>
        </CardContent>
      </Card>
    );
  }

  const colCount = plans.length;
  const colSpan = colCount + 1;

  // Only highlight a plan if it explicitly has a badge — NO fallback
  const recommendedPlanId = plans.find((p: TenantPlan) => !!p.badgeText)?.id ?? "";

  return (
    <div className="space-y-8">
      {/* ══════════════════════════════════════════════════
          SECTION 1 — PRICING CARDS HERO
      ══════════════════════════════════════════════════ */}
      <section className="space-y-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-4.5 w-4.5 text-primary" />
            </div>
            <h2 className="text-xl font-bold">
              {t("entitlements.tenantPlans.comparison.heroTitle") || "Compare Plans"}
            </h2>
          </div>
          <div className="ml-10.5 flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5 text-muted-foreground/60" />
            <p className="text-sm text-muted-foreground">
              {t("entitlements.tenantPlans.comparison.heroSubtitle") ||
                "Preview of the pricing page shown to your end users"}
            </p>
          </div>
        </div>

        {/* ── Cycle Toggle ── */}
        {availableCycles.length > 1 && (
          <div className="mb-8 mt-6 flex justify-center">
            <ToggleGroup
              type="single"
              value={selectedCycle}
              onValueChange={(val) => {
                if (val === "Monthly" || val === "Yearly" || val === "Lifetime")
                  setSelectedCycle(val);
              }}
              className="rounded-full border border-border/40 bg-muted/50 p-1"
            >
              {availableCycles.includes("Monthly") && (
                <ToggleGroupItem
                  value="Monthly"
                  className="rounded-full px-6 data-[state=on]:bg-background data-[state=on]:shadow-sm"
                >
                  {t("entitlements.tenantPlans.allowMonthly") || "Monthly"}
                </ToggleGroupItem>
              )}
              {availableCycles.includes("Yearly") && (
                <ToggleGroupItem
                  value="Yearly"
                  className="rounded-full px-6 data-[state=on]:bg-background data-[state=on]:shadow-sm"
                >
                  {t("entitlements.tenantPlans.allowYearly") || "Yearly"}
                  <span className="ml-2 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold uppercase text-success">
                    Save ~20%
                  </span>
                </ToggleGroupItem>
              )}
              {availableCycles.includes("Lifetime") && (
                <ToggleGroupItem
                  value="Lifetime"
                  className="rounded-full px-6 data-[state=on]:bg-background data-[state=on]:shadow-sm"
                >
                  {t("entitlements.tenantPlans.allowLifetime") || "Lifetime"}
                </ToggleGroupItem>
              )}
            </ToggleGroup>
          </div>
        )}

        {/* Pricing Cards Grid */}
        <div
          className={`grid gap-5 ${
            colCount === 1
              ? "max-w-sm grid-cols-1"
              : colCount === 2
                ? "max-w-2xl grid-cols-1 md:grid-cols-2"
                : colCount === 3
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          }`}
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
                allHighlightsLabel={
                  t("entitlements.tenantPlans.comparison.allPreviousPlus") ||
                  "All {prev} features, plus:"
                }
                priceLabel={t("entitlements.pricing.perMonth") || "/month"}
                freeLabel={t("common.free") || "Free"}
                customLabel={t("entitlements.tenantPlans.comparison.customPricing") || "Custom"}
                previewLabel={
                  t("entitlements.tenantPlans.comparison.adminPreview") || "Admin Preview Only"
                }
              />
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 2 — COMPARISON TABLE
      ══════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-bold">
            {t("entitlements.tenantPlans.comparison.matrixTitle") || "Feature Comparison"}
          </h2>
        </div>

        <div className="overflow-hidden rounded-xl border border-border/60 shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b bg-muted/40">
                  <TableHead className="sticky left-0 z-10 w-64 bg-muted/40 font-semibold">
                    {t("entitlements.tenantPlans.feature") || "Feature"}
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
                  label={t("entitlements.tenantPlans.comparison.categoryBilling") || "Billing"}
                  colSpan={colSpan}
                />
                {/* Price */}
                <TableRow className="transition-colors hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background py-3.5 text-sm font-medium">
                    {t("entitlements.pricing.price") || "Price"}
                  </TableCell>
                  {plans.map((plan: TenantPlan) => {
                    const isHL = plan.id === recommendedPlanId;

                    let priceAmount: string;
                    let priceSuffix = "";
                    if (plan.isContactSalesOnly) {
                      priceAmount =
                        t("entitlements.tenantPlans.comparison.customPricing") || "Custom";
                    } else if (!plan.hasPrices) {
                      priceAmount = t("common.free") || "Free";
                    } else {
                      const cyclePrices = plan.prices.filter(
                        (p) => p.billingCycle === selectedCycle
                      );
                      if (cyclePrices.length > 0) {
                        const cheapest = cyclePrices.reduce(
                          (min, p) => (p.amount < min.amount ? p : min),
                          cyclePrices[0]
                        );
                        priceAmount = new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: cheapest.currency || "USD",
                          minimumFractionDigits: 0,
                        }).format(cheapest.amount);

                        if (selectedCycle === "Monthly") priceSuffix = "/mo";
                        else if (selectedCycle === "Yearly") priceSuffix = "/yr";
                        else if (selectedCycle === "Lifetime") priceSuffix = " one-time";
                      } else {
                        priceAmount = "—";
                      }
                    }

                    return (
                      <TableCell
                        key={plan.id}
                        className={`py-3.5 text-center font-bold ${isHL ? "bg-primary/5" : ""}`}
                      >
                        {priceAmount === "—" ? (
                          <span className="text-muted-foreground/40">—</span>
                        ) : plan.isContactSalesOnly ? (
                          <span className="text-sm text-muted-foreground">{priceAmount}</span>
                        ) : !plan.hasPrices ? (
                          <span className="font-bold text-success">{priceAmount}</span>
                        ) : (
                          <span>
                            {priceAmount}
                            <span className="text-xs font-normal text-muted-foreground">
                              {priceSuffix}
                            </span>
                          </span>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
                {/* Trial */}
                <TableRow className="transition-colors hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background py-3.5 text-sm font-medium">
                    {t("entitlements.tenantPlans.allowTrial") || "Free Trial"}
                  </TableCell>
                  {plans.map((plan: TenantPlan) => (
                    <TableCell
                      key={plan.id}
                      className={`py-3.5 text-center ${plan.id === recommendedPlanId ? "bg-primary/5" : ""}`}
                    >
                      <div className="flex justify-center">
                        {plan.hasTrial ? (
                          <span className="text-sm font-medium">{plan.trialDays}d Free</span>
                        ) : (
                          <BooleanIndicator value={false} />
                        )}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
                {/* Billing Cycles */}
                <TableRow className="transition-colors hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background py-3.5 text-sm font-medium">
                    {t("entitlements.tenantPlans.allowMonthly") || "Monthly Billing"}
                  </TableCell>
                  {plans.map((plan: TenantPlan) => (
                    <TableCell
                      key={plan.id}
                      className={`py-3.5 text-center ${plan.id === recommendedPlanId ? "bg-primary/5" : ""}`}
                    >
                      <div className="flex justify-center">
                        <BooleanIndicator value={plan.allowMonthly} />
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow className="transition-colors hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background py-3.5 text-sm font-medium">
                    {t("entitlements.tenantPlans.allowYearly") || "Annual Billing"}
                  </TableCell>
                  {plans.map((plan: TenantPlan) => (
                    <TableCell
                      key={plan.id}
                      className={`py-3.5 text-center ${plan.id === recommendedPlanId ? "bg-primary/5" : ""}`}
                    >
                      <div className="flex justify-center">
                        <BooleanIndicator value={plan.allowYearly} />
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow className="transition-colors hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background py-3.5 text-sm font-medium">
                    {t("entitlements.tenantPlans.allowLifetime") || "Lifetime"}
                  </TableCell>
                  {plans.map((plan: TenantPlan) => (
                    <TableCell
                      key={plan.id}
                      className={`py-3.5 text-center ${plan.id === recommendedPlanId ? "bg-primary/5" : ""}`}
                    >
                      <div className="flex justify-center">
                        <BooleanIndicator value={plan.allowLifetime} />
                      </div>
                    </TableCell>
                  ))}
                </TableRow>

                {/* ── Users Category (always visible) ── */}
                <CategorySectionHeader
                  label={t("entitlements.tenantPlans.comparison.categoryUsers") || "Users"}
                  colSpan={colSpan}
                />
                <TableRow className="transition-colors hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background py-3.5 text-sm font-medium">
                    {t("entitlements.tenantPlans.maxUsers") || "Max Users"}
                  </TableCell>
                  {plans.map((plan: TenantPlan) => (
                    <MatrixCell
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
          </div>

          {/* ── Expand / Collapse Toggle ── */}
          {totalFeatureCount > 0 && (
            <div className="flex items-center justify-center border-t border-border/40 bg-muted/20 px-4 py-3">
              <Button
                variant="ghost"
                size="sm"
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
                <LayoutList className="h-4 w-4" />
                {showAllFeatures
                  ? t("entitlements.tenantPlans.comparison.hideFeatures") ||
                    "Hide detailed features"
                  : t("entitlements.tenantPlans.comparison.showAllFeatures") ||
                    `Show all ${totalFeatureCount} features`}
                {showAllFeatures ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
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
        colSpan={colSpan}
      />
      {rows.map((row: FeatureRow) => {
        const featureLabel =
          language === "ar" && row.displayNameAr
            ? row.displayNameAr
            : row.displayNameEn || row.featureKey;
        return (
          <TableRow key={row.featureKey} className="group transition-colors hover:bg-muted/30">
            <TableCell className="sticky left-0 bg-background py-3.5 text-sm font-medium transition-colors group-hover:bg-muted/30">
              {featureLabel}
            </TableCell>
            {plans.map((plan: TenantPlan) => (
              <MatrixCell
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
