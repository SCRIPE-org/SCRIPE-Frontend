/**
 * EditionComparisonView — Page-level view for side-by-side edition comparison.
 *
 * Architecture: View → ViewModel (useEditionComparisonViewModel) → Repository → Service → HTTP
 *
 * This is a View (not a Component) because:
 * - It has its own ViewModel
 * - It calls useModuleLocales (locale initialization is a view responsibility)
 * - It's the root of the /editions/compare route
 */
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@core/ui/table";
import { Infinity, Sparkles } from "lucide-react";
import type { Edition } from "../../domain/entities/Edition";
import { useEditionComparisonViewModel } from "../viewmodels/useEditionComparisonViewModel";
import {
  BooleanIndicator,
  FeatureValueCell,
  ComparisonSectionRow,
  ComparisonColumnHeader,
  ComparisonDataRow,
  PriceCell,
} from "../components/comparison";

export function EditionComparisonView() {
  useModuleLocales(() => import("../../../locales"), "editions");
  const { t, language } = useI18n();
  const { editions, allFeatureNames, recommendedIdx, isLoading, isEmpty } =
    useEditionComparisonViewModel();

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // ── Empty state ──
  if (isEmpty) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          {t("entitlements.editions.noEditions") || "No active editions to compare."}
        </CardContent>
      </Card>
    );
  }

  const colSpan = editions.length + 1;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary" />
          {t("entitlements.editions.comparison") || "Edition Comparison"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          {/* ── Header: Edition columns ── */}
          <TableHeader>
            <TableRow className="border-b bg-muted/30">
              <TableHead className="w-48">
                {t("entitlements.editions.feature") || "Feature"}
              </TableHead>
              {editions.map((ed: Edition, idx: number) => (
                <ComparisonColumnHeader
                  key={ed.id}
                  displayName={ed.getDisplayName(language) || ed.name}
                  tierLevel={ed.tierLevel}
                  isRecommended={idx === recommendedIdx}
                  recommendedLabel={t("entitlements.editions.recommended") || "Recommended"}
                />
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {/* ── Pricing Row ── */}
            <TableRow className="border-b bg-muted/10">
              <TableCell className="font-medium">
                {t("entitlements.pricing.price") || "Price"}
              </TableCell>
              {editions.map((ed: Edition, idx: number) => (
                <PriceCell
                  key={ed.id}
                  price={ed.baseMonthlyPriceUsd}
                  freeLabel={t("common.free") || "Free"}
                  isRecommended={idx === recommendedIdx}
                />
              ))}
            </TableRow>

            {/* ── Billing Controls ── */}
            <ComparisonSectionRow
              label={t("entitlements.editions.billingControls") || "Billing Controls"}
              colSpan={colSpan}
            />
            <ComparisonDataRow
              label={t("entitlements.editions.allowMonthly") || "Monthly"}
              editions={editions}
              recommendedIdx={recommendedIdx}
              renderCell={(e) => <BooleanIndicator value={e.allowMonthly} />}
            />
            <ComparisonDataRow
              label={t("entitlements.editions.allowYearly") || "Yearly"}
              editions={editions}
              recommendedIdx={recommendedIdx}
              renderCell={(e) => <BooleanIndicator value={e.allowYearly} />}
            />
            <ComparisonDataRow
              label={t("entitlements.editions.allowLifetime") || "Lifetime"}
              editions={editions}
              recommendedIdx={recommendedIdx}
              renderCell={(e) => <BooleanIndicator value={e.allowLifetime} />}
            />
            <ComparisonDataRow
              label={t("entitlements.editions.allowTrial") || "Trial"}
              editions={editions}
              recommendedIdx={recommendedIdx}
              renderCell={(e) => <BooleanIndicator value={e.allowTrial} />}
            />

            {/* ── Trial & Grace Settings ── */}
            <ComparisonSectionRow
              label={t("entitlements.editions.trialSettings") || "Trial & Grace Settings"}
              colSpan={colSpan}
            />
            <ComparisonDataRow
              label={t("entitlements.editions.trialDays") || "Trial Days"}
              editions={editions}
              recommendedIdx={recommendedIdx}
              renderCell={(e) => (
                <span className="tabular-nums font-medium">{e.trialDurationDays}d</span>
              )}
            />
            <ComparisonDataRow
              label={t("entitlements.editions.trialFree") || "Free Trial"}
              editions={editions}
              recommendedIdx={recommendedIdx}
              renderCell={(e) => <BooleanIndicator value={e.trialIsFree} />}
            />
            <ComparisonDataRow
              label={t("entitlements.editions.gracePeriod") || "Grace Period"}
              editions={editions}
              recommendedIdx={recommendedIdx}
              renderCell={(e) => (
                <span className="tabular-nums font-medium">
                  {e.gracePeriodDays > 0 ? `${e.gracePeriodDays}d` : "—"}
                </span>
              )}
            />
            <ComparisonDataRow
              label={t("entitlements.editions.maxSubs") || "Max Active Subs"}
              editions={editions}
              recommendedIdx={recommendedIdx}
              renderCell={(e) => (
                <span className="tabular-nums font-medium">
                  {e.maxActiveSubscriptions === -1 ? (
                    <Infinity className="h-4 w-4 text-primary inline" />
                  ) : (
                    e.maxActiveSubscriptions
                  )}
                </span>
              )}
            />

            {/* ── Feature Rows ── */}
            {allFeatureNames.length > 0 && (
              <>
                <ComparisonSectionRow
                  label={t("entitlements.editions.features") || "Features"}
                  colSpan={colSpan}
                />
                {allFeatureNames.map((featureName) => (
                  <ComparisonDataRow
                    key={featureName}
                    label={featureName}
                    editions={editions}
                    recommendedIdx={recommendedIdx}
                    renderCell={(ed) => (
                      <FeatureValueCell
                        feature={ed.features.find((f) => f.featureName === featureName)}
                      />
                    )}
                  />
                ))}
              </>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
