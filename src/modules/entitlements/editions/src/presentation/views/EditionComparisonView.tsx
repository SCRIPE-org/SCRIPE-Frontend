/**
 * EditionComparisonView — Industry-standard pricing comparison page.
 *
 * Layout (industry best practice — Vercel/Linear/Notion pattern):
 * 1. Global billing cycle toggle (Monthly / Yearly / Lifetime) at the top
 * 2. Pricing cards grid — prices update based on selected cycle
 * 3. Feature comparison matrix — expandable
 *
 * Architecture: View → ViewModel → Repository → Service → HTTP
 */
"use client";

import { useRef, useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import {
  Table, TableBody, TableHead, TableHeader, TableRow, TableCell,
} from "@core/ui/table";
import { Card, CardContent } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Eye, Sparkles, ChevronDown, ChevronUp, LayoutList, Loader2 } from "lucide-react";
import type { Edition } from "../../domain/entities/Edition";
import {
  useEditionComparisonViewModel,
  type BillingCycle,
  type FeatureRow,
} from "../viewmodels/useEditionComparisonViewModel";
import {
  BooleanIndicator,
  ComparisonColumnHeader,
  CategorySectionHeader,
} from "../components/comparison";
import { EditionPricingCard } from "../components/comparison/EditionPricingCard";

// ─── Billing Cycle Toggle ───────────────────────────────────────────────────
function BillingCycleToggle({
  cycles,
  selected,
  onChange,
  savingsPercents,
  editions,
}: {
  cycles: BillingCycle[];
  selected: BillingCycle;
  onChange: (c: BillingCycle) => void;
  savingsPercents: number[];
  editions: Edition[];
}) {
  if (cycles.length <= 1) return null;

  // Find max savings across all editions (to display on Yearly button)
  const maxYearlySavings = Math.max(...savingsPercents.filter((s) => s > 0));

  return (
    <div className="flex items-center justify-center">
      <div className="inline-flex border border-border bg-muted/30 p-0.5 gap-0.5">
        {cycles.map((cycle) => {
          const isActive = selected === cycle;
          return (
            <button
              key={cycle}
              onClick={() => onChange(cycle)}
              className={`
                relative flex items-center gap-2 px-5 py-2 text-sm font-semibold
                transition-all duration-150
                ${isActive
                  ? "bg-background text-foreground shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }
              `}
            >
              {cycle}
              {cycle === "Yearly" && maxYearlySavings > 0 && (
                <span className="text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-950/40 px-1.5 py-0.5 leading-none">
                  SAVE {maxYearlySavings}%
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Matrix Cell ────────────────────────────────────────────────────────────
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
    return <TableCell className={cls}><span className="text-muted-foreground/40">—</span></TableCell>;
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
        <span className="tabular-nums font-semibold text-sm">
          {num === -1 ? (
            <span className="text-primary font-bold">∞</span>
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
      <span className="text-sm">{value || "—"}</span>
    </TableCell>
  );
}

// ─── Loading Skeleton ───────────────────────────────────────────────────────
function LoadingState() {
  return (
    <div className="space-y-8">
      {/* Cycle toggle skeleton */}
      <div className="flex justify-center">
        <div className="h-10 w-72 bg-muted/30 animate-pulse border border-border" />
      </div>
      {/* Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-96 border border-border/40 bg-muted/20 animate-pulse" />
        ))}
      </div>
      <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading edition data…</span>
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
  t: (key: string) => string;
}) {
  return (
    <>
      <CategorySectionHeader
        label={t(`entitlements.editions.comparison.category${category}`) || category}
        colSpan={colSpan}
      />
      {rows.map((row: FeatureRow) => {
        const featureLabel =
          language === "ar" && row.displayNameAr ? row.displayNameAr : row.displayNameEn || row.featureName;
        return (
          <TableRow key={row.featureName} className="hover:bg-muted/30 transition-colors group">
            <TableCell className="sticky left-0 bg-background group-hover:bg-muted/30 transition-colors font-medium text-sm py-3.5">
              {featureLabel}
            </TableCell>
            {editions.map((ed: Edition) => (
              <MatrixCell
                key={ed.id}
                value={row.values[ed.id]}
                valueType={row.valueType}
                isHighlighted={ed.id === recommendedEditionId}
              />
            ))}
          </TableRow>
        );
      })}
    </>
  );
}

// ─── Main View ──────────────────────────────────────────────────────────────
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

  if (isLoading) return <LoadingState />;

  if (isEmpty) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <Sparkles className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">
            {t("entitlements.editions.noEditions") || "No active editions to compare."}
          </p>
        </CardContent>
      </Card>
    );
  }

  const colCount = editions.length;
  const colSpan = colCount + 1;
  const recommendedEditionId = editions.find((e: Edition) => e.recommendationLabels.length > 0)?.id ?? "";

  return (
    <div className="space-y-10">
      {/* ══════════════════════════════════════════════════
          SECTION 1 — HEADER + BILLING TOGGLE
      ══════════════════════════════════════════════════ */}
      <section className="space-y-6">
        {/* Header */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-xl font-bold">
              {t("entitlements.editions.comparison.heroTitle") || "Compare Editions"}
            </h2>
          </div>
          <div className="flex items-center gap-1.5 ml-10.5">
            <Eye className="h-3.5 w-3.5 text-muted-foreground/60" />
            <p className="text-sm text-muted-foreground">
              {t("entitlements.editions.comparison.heroSubtitle") ||
                "Preview of the public pricing page shown to prospective tenants"}
            </p>
          </div>
        </div>

        {/* ── Global Billing Cycle Toggle ── */}
        <BillingCycleToggle
          cycles={availableCycles}
          selected={selectedCycle}
          onChange={setSelectedCycle}
          savingsPercents={savingsPercents}
          editions={editions}
        />

        {/* ── Pricing Cards Grid ── */}
        <div
          className={`grid gap-6 items-start ${
            colCount === 1
              ? "grid-cols-1 max-w-sm"
              : colCount === 2
              ? "grid-cols-1 md:grid-cols-2 max-w-2xl"
              : colCount === 3
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          }`}
        >
          {editions.map((ed: Edition, idx: number) => (
            <EditionPricingCard
              key={ed.id}
              edition={ed}
              language={language}
              selectedCycle={selectedCycle}
              priceInfo={cyclePrices[idx] ?? { price: undefined, isFree: true, isContactSales: false }}
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
      <section className="space-y-4">
        <h2 className="text-lg font-bold">
          {t("entitlements.editions.comparison.matrixTitle") || "Feature Comparison"}
        </h2>

        <div className="border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b bg-muted/40">
                  <TableHead className="w-64 sticky left-0 bg-muted/40 z-10 font-semibold">
                    {t("entitlements.editions.feature") || "Feature"}
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
                  label={t("entitlements.editions.comparison.categoryBilling") || "Billing"}
                  colSpan={colSpan}
                />
                <TableRow className="hover:bg-muted/30 transition-colors">
                  <TableCell className="sticky left-0 bg-background font-medium text-sm py-3.5">
                    {t("entitlements.pricing.price") || "Price"}{" "}
                    <span className="text-xs text-muted-foreground font-normal">
                      ({selectedCycle})
                    </span>
                  </TableCell>
                  {editions.map((ed: Edition, idx: number) => {
                    const info = cyclePrices[idx];
                    const isHL = ed.id === recommendedEditionId;
                    return (
                      <TableCell
                        key={ed.id}
                        className={`text-center py-3.5 font-bold ${isHL ? "bg-primary/5" : ""}`}
                      >
                        {info?.isContactSales ? (
                          <span className="text-sm text-muted-foreground">Custom</span>
                        ) : info?.isFree || info?.price === 0 ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">Free</span>
                        ) : info?.price !== undefined ? (
                          <span>
                            ${info.price.toFixed(0)}
                            <span className="text-xs font-normal text-muted-foreground">
                              /{selectedCycle === "Monthly" ? "mo" : selectedCycle === "Yearly" ? "yr" : "once"}
                            </span>
                          </span>
                        ) : (
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>

                {/* ── Trial Row ── */}
                <TableRow className="hover:bg-muted/30 transition-colors">
                  <TableCell className="sticky left-0 bg-background font-medium text-sm py-3.5">
                    {t("entitlements.editions.allowTrial") || "Free Trial"}
                  </TableCell>
                  {editions.map((ed: Edition) => (
                    <TableCell
                      key={ed.id}
                      className={`text-center py-3.5 ${ed.id === recommendedEditionId ? "bg-primary/5" : ""}`}
                    >
                      <div className="flex justify-center">
                        {ed.allowTrial && ed.trialDurationDays > 0 ? (
                          <span className="text-sm font-medium text-primary">
                            {ed.trialIsFree
                              ? `${ed.trialDurationDays}d Free`
                              : `${ed.trialDurationDays}d ${ed.trialDiscountPercent}% off`}
                          </span>
                        ) : (
                          <BooleanIndicator value={false} />
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
          </div>

          {/* ── Expand / Collapse ── */}
          {totalFeatureCount > 0 && (
            <div className="border-t border-border/40 bg-muted/20 px-4 py-3 flex items-center justify-center">
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
                  ? (t("entitlements.editions.comparison.hideFeatures") || "Hide detailed features")
                  : (t("entitlements.editions.comparison.showAllFeatures") || `Show all ${totalFeatureCount} features`)}
                {showAllFeatures ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          )}
        </div>

        <div ref={matrixRef} />
      </section>
    </div>
  );
}
