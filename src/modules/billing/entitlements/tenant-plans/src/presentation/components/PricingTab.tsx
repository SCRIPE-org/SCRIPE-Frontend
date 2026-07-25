// FILE-EXCEPTION: file length
// UI-EXCEPTION: compact studio layout
/**
 * PricingTab — Hybrid Pricing Model (mirrors Edition PricingTab)
 *
 * 3-Section Layout:
 * 1. Base Pricing (USD) — Anchor currency with yearly discount calculator
 * 2. Currency Overrides — Optional, with auto-suggest from exchange rates
 * 3. Live Preview — Shows what tenants would actually pay
 *
 * All state is lifted in the ViewModel (persists across tab switches).
 */
"use client";

import { useState, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@core/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import {
  DollarSign,
  Plus,
  Trash2,
  Save,
  Undo2,
  Info,
  TrendingDown,
  Globe,
  Zap,
  Eye,
  Percent,
  ArrowRight,
} from "lucide-react";
import { cn } from "@core/common/utils";
import { getCurrencyInfo, formatPrice } from "@core/constants/currencies";
import type { PreviewRow } from "../viewmodels/useTenantPlanDetailViewModel";
import type { TenantPlan } from "../../domain/entities/TenantPlan";
import type { TFn } from "./shared-helpers";

interface PricingTabProps {
  plan: TenantPlan;
  // ── USD Base ──
  usdMonthly: number;
  usdYearly: number;
  usdLifetime: number;
  setUsdMonthly: (v: number) => void;
  setUsdYearly: (v: number) => void;
  setUsdLifetime: (v: number) => void;
  suggestedYearly: number;
  yearlyDiscountPercent: number;
  setYearlyDiscountPercent: (v: number) => void;
  applyDiscountToYearly: () => void;
  // ── Currency Overrides ──
  overrides: Array<{
    currency: string;
    monthlyAmount: number;
    yearlyAmount: number;
    lifetimeAmount: number;
  }>;
  addOverride: (code: string) => void;
  removeOverride: (code: string) => void;
  updateOverride: (
    currency: string,
    field: "monthly" | "yearly" | "lifetime",
    amount: number
  ) => void;
  availableCurrencies: Array<{ code: string; symbol: string; flag: string; name: string }>;
  // ── Preview ──
  preview: PreviewRow[];
  yearlySavingsPercent: (currency: string) => number;
  // ── State ──
  hasChanges: boolean;
  onSave: () => void;
  onDiscard: () => void;
  isSaving: boolean;
  ratesLoading: boolean;
  t: TFn;
}

/**
 * Exported constant defining parameters and fields for pricing tab configurations.
 */
export const PricingTab = memo(function PricingTab(props: PricingTabProps) {
  const {
    plan,
    usdMonthly,
    usdYearly,
    usdLifetime,
    setUsdMonthly,
    setUsdYearly,
    setUsdLifetime,
    suggestedYearly,
    yearlyDiscountPercent,
    setYearlyDiscountPercent,
    applyDiscountToYearly,
    overrides,
    addOverride,
    removeOverride,
    updateOverride,
    availableCurrencies,
    preview,
    yearlySavingsPercent,
    hasChanges,
    onSave,
    onDiscard,
    isSaving,
    ratesLoading,
    t,
  } = props;

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const usdSavings = yearlySavingsPercent("USD");

  return (
    <>
      <div className="space-y-5">
        {/* ─────── TOOLBAR ─────── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-nx-md bg-success/10 p-1.5">
              <DollarSign className="h-4 w-4 text-success" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-semibold">{t("entitlements.tenantPlans.tabPricing")}</h2>
            {overrides.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {(overrides.length + 1).toLocaleString()}{" "}
                {t("entitlements.tenantPlans.currencyCountPlural")}
              </Badge>
            )}
            {hasChanges && (
              <Badge variant="warning" className="text-xs">
                {t("common.unsavedChanges")}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="gap-1.5"
            >
              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
              {t("entitlements.tenantPlans.livePreview")}
            </Button>
            {hasChanges && (
              <Button variant="ghost" size="sm" onClick={onDiscard} className="gap-1.5">
                <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
                {t("common.discard")}
              </Button>
            )}
            <Button size="sm" onClick={onSave} disabled={!hasChanges} loading={isSaving}>
              {!isSaving && <Save className="me-1 h-4 w-4" aria-hidden="true" />}
              {t("common.save")}
            </Button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SECTION 1: USD BASE PRICING                                   */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg" aria-hidden="true">
                  🇺🇸
                </span>
                <CardTitle className="text-sm font-semibold">
                  {t("entitlements.tenantPlans.basePricing")}
                </CardTitle>
                <Badge variant="secondary" className="text-[10px]">
                  {t("entitlements.tenantPlans.anchorCurrency")}
                </Badge>
              </div>
              {usdSavings > 0 && (
                <Badge variant="success" className="text-[10px]">
                  <TrendingDown className="me-0.5 h-2.5 w-2.5" aria-hidden="true" />
                  {t("entitlements.tenantPlans.yearlySave")} {usdSavings}%
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Info Banner */}
            <div className="flex items-start gap-2 rounded-nx-md border border-info/10 bg-info/5 p-2.5">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-info" aria-hidden="true" />
              <p className="text-[11px] leading-relaxed text-info">
                {t("entitlements.tenantPlans.basePricingInfo")}
              </p>
            </div>

            {/* Price Inputs */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Monthly */}
              {plan.allowMonthly && (
                <div className="space-y-1.5">
                  <Label
                    htmlFor="usd-monthly"
                    className="text-xs font-medium uppercase tracking-wider text-nx-ink-3"
                  >
                    {t("entitlements.tenantPlans.monthly")}
                  </Label>
                  <div className="relative">
                    <span
                      className="absolute start-3 top-1/2 -translate-y-1/2 text-sm font-medium text-nx-ink-3"
                      aria-hidden="true"
                    >
                      $
                    </span>
                    <Input
                      id="usd-monthly"
                      type="number"
                      value={usdMonthly || ""}
                      onChange={(e) => setUsdMonthly(parseFloat(e.target.value) || 0)}
                      className="h-10 ps-7 text-end font-semibold tabular-nums"
                      min={0}
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              )}

              {/* Yearly */}
              {plan.allowYearly && (
                <div className="space-y-1.5">
                  <Label
                    htmlFor="usd-yearly"
                    className="text-xs font-medium uppercase tracking-wider text-nx-ink-3"
                  >
                    {t("entitlements.tenantPlans.yearly")}
                  </Label>
                  <div className="relative">
                    <span
                      className="absolute start-3 top-1/2 -translate-y-1/2 text-sm font-medium text-nx-ink-3"
                      aria-hidden="true"
                    >
                      $
                    </span>
                    <Input
                      id="usd-yearly"
                      type="number"
                      value={usdYearly || ""}
                      onChange={(e) => setUsdYearly(parseFloat(e.target.value) || 0)}
                      className="h-10 ps-7 text-end font-semibold tabular-nums"
                      min={0}
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              )}

              {/* Lifetime */}
              {plan.allowLifetime && (
                <div className="space-y-1.5">
                  <Label
                    htmlFor="usd-lifetime"
                    className="text-xs font-medium uppercase tracking-wider text-nx-ink-3"
                  >
                    {t("entitlements.tenantPlans.lifetime")}
                  </Label>
                  <div className="relative">
                    <span
                      className="absolute start-3 top-1/2 -translate-y-1/2 text-sm font-medium text-nx-ink-3"
                      aria-hidden="true"
                    >
                      $
                    </span>
                    <Input
                      id="usd-lifetime"
                      type="number"
                      value={usdLifetime || ""}
                      onChange={(e) => setUsdLifetime(parseFloat(e.target.value) || 0)}
                      className="h-10 ps-7 text-end font-semibold tabular-nums"
                      min={0}
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Yearly Discount Calculator */}
            {plan.allowMonthly && plan.allowYearly && usdMonthly > 0 && (
              <div className="flex items-center gap-3 rounded-nx-md border border-success/10 bg-success/5 p-3">
                <Percent className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <Label
                    htmlFor="yearly-discount-percent"
                    className="whitespace-nowrap text-xs text-success"
                  >
                    {t("entitlements.tenantPlans.yearlyDiscount")}
                  </Label>
                  <Input
                    id="yearly-discount-percent"
                    type="number"
                    value={yearlyDiscountPercent}
                    onChange={(e) => setYearlyDiscountPercent(parseInt(e.target.value) || 0)}
                    className="h-7 w-16 text-center text-xs"
                    min={0}
                    max={90}
                  />
                  <span className="text-xs text-success">%</span>
                  <ArrowRight className="h-3 w-3 text-success" aria-hidden="true" />
                  <span className="text-xs font-semibold tabular-nums text-success">
                    ${suggestedYearly.toFixed(2)}/yr
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={applyDiscountToYearly}
                  className="h-7 shrink-0 border-success/30 text-xs text-success hover:bg-success/10"
                >
                  <Zap className="me-1 h-3 w-3" aria-hidden="true" />
                  {t("entitlements.tenantPlans.applyDiscount")}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SECTION 2: CURRENCY OVERRIDES                                  */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-nx-accent" aria-hidden="true" />
                <CardTitle className="text-sm font-semibold">
                  {t("entitlements.tenantPlans.currencyOverrides")}
                </CardTitle>
                {overrides.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {overrides.length.toLocaleString()}
                  </Badge>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddDialog(true)}
                disabled={availableCurrencies.length === 0}
                className="gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                {t("entitlements.tenantPlans.addCurrency")}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {overrides.length === 0 ? (
              <div className="flex items-start gap-2 rounded-nx-md border border-dashed border-nx-line bg-nx-raised p-4">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-nx-ink-3" aria-hidden="true" />
                <div>
                  <p className="text-xs text-nx-ink-2">
                    {t("entitlements.tenantPlans.noOverrides")}
                  </p>
                  {ratesLoading && (
                    <p className="mt-1 flex items-center gap-1 text-[10px] text-nx-ink-3">
                      <LoadingSpinner size="inline" showText={false} />
                      {t("entitlements.tenantPlans.loadingRates")}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {overrides.map((row) => {
                  const info = getCurrencyInfo(row.currency);
                  const savings = yearlySavingsPercent(row.currency);
                  const rowId = `override-${row.currency}`;

                  return (
                    <div
                      key={row.currency}
                      className="group space-y-2 rounded-nx-md border border-nx-line p-3 transition-colors duration-nx-micro ease-nx-enter hover:border-nx-line-hi motion-reduce:transition-none"
                    >
                      {/* Currency Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg leading-none" aria-hidden="true">
                            {info?.flag || "💱"}
                          </span>
                          <span className="text-sm font-semibold">{row.currency}</span>
                          <span className="text-xs text-nx-ink-2">
                            {info?.name || row.currency}
                          </span>
                          {savings > 0 && (
                            <Badge variant="success" className="h-5 px-1.5 py-0 text-[10px]">
                              <TrendingDown className="me-0.5 h-2.5 w-2.5" aria-hidden="true" />
                              {t("entitlements.tenantPlans.yearlySave")} {savings}%
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-nx-ink-2 opacity-0 transition-opacity duration-nx-micro ease-nx-enter hover:text-nx-danger group-hover:opacity-100 motion-reduce:transition-none"
                          onClick={() => removeOverride(row.currency)}
                          aria-label={t("common.remove")}
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </Button>
                      </div>

                      {/* Price Inputs */}
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        {plan.allowMonthly && (
                          <div className="space-y-1">
                            <Label
                              htmlFor={`${rowId}-monthly`}
                              className="text-[10px] font-medium uppercase tracking-wider text-nx-ink-3"
                            >
                              {t("entitlements.tenantPlans.monthly")}
                            </Label>
                            <div className="relative">
                              <span
                                className="absolute start-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-nx-ink-3"
                                aria-hidden="true"
                              >
                                {info?.symbol || row.currency}
                              </span>
                              <Input
                                id={`${rowId}-monthly`}
                                type="number"
                                value={row.monthlyAmount || ""}
                                onChange={(e) =>
                                  updateOverride(
                                    row.currency,
                                    "monthly",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="h-8 ps-8 text-end text-sm tabular-nums"
                                min={0}
                                step="0.01"
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                        )}
                        {plan.allowYearly && (
                          <div className="space-y-1">
                            <Label
                              htmlFor={`${rowId}-yearly`}
                              className="text-[10px] font-medium uppercase tracking-wider text-nx-ink-3"
                            >
                              {t("entitlements.tenantPlans.yearly")}
                            </Label>
                            <div className="relative">
                              <span
                                className="absolute start-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-nx-ink-3"
                                aria-hidden="true"
                              >
                                {info?.symbol || row.currency}
                              </span>
                              <Input
                                id={`${rowId}-yearly`}
                                type="number"
                                value={row.yearlyAmount || ""}
                                onChange={(e) =>
                                  updateOverride(
                                    row.currency,
                                    "yearly",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="h-8 ps-8 text-end text-sm tabular-nums"
                                min={0}
                                step="0.01"
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                        )}
                        {plan.allowLifetime && (
                          <div className="space-y-1">
                            <Label
                              htmlFor={`${rowId}-lifetime`}
                              className="text-[10px] font-medium uppercase tracking-wider text-nx-ink-3"
                            >
                              {t("entitlements.tenantPlans.lifetime")}
                            </Label>
                            <div className="relative">
                              <span
                                className="absolute start-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-nx-ink-3"
                                aria-hidden="true"
                              >
                                {info?.symbol || row.currency}
                              </span>
                              <Input
                                id={`${rowId}-lifetime`}
                                type="number"
                                value={row.lifetimeAmount || ""}
                                onChange={(e) =>
                                  updateOverride(
                                    row.currency,
                                    "lifetime",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="h-8 ps-8 text-end text-sm tabular-nums"
                                min={0}
                                step="0.01"
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SECTION 3: LIVE PREVIEW                                        */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {showPreview && (
          <Card className="border-[color:color-mix(in_srgb,var(--nx-accent)_20%,transparent)]">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-nx-accent" aria-hidden="true" />
                <CardTitle className="text-sm font-semibold">
                  {t("entitlements.tenantPlans.livePreview")}
                </CardTitle>
                <Badge variant="outline" className="text-[10px]">
                  {preview.length.toLocaleString()}{" "}
                  {t("entitlements.tenantPlans.currencyCountPlural")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-start gap-2 rounded-nx-md border border-[color:color-mix(in_srgb,var(--nx-accent)_10%,transparent)] bg-nx-accent-wash p-2.5">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-nx-accent" aria-hidden="true" />
                <p className="text-[11px] leading-relaxed text-nx-accent">
                  {t("entitlements.tenantPlans.previewInfo")}
                </p>
              </div>

              {/* Preview Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("entitlements.tenantPlans.currency")}</TableHead>
                    {plan.allowMonthly && (
                      <TableHead variant="numeric">
                        {t("entitlements.tenantPlans.monthly")}
                      </TableHead>
                    )}
                    {plan.allowYearly && (
                      <TableHead variant="numeric">
                        {t("entitlements.tenantPlans.yearly")}
                      </TableHead>
                    )}
                    {plan.allowLifetime && (
                      <TableHead variant="numeric">
                        {t("entitlements.tenantPlans.lifetime")}
                      </TableHead>
                    )}
                    <TableHead>{t("entitlements.tenantPlans.source")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.map((row) => {
                    const info = getCurrencyInfo(row.currency);
                    return (
                      <TableRow
                        key={row.currency}
                        className={cn(
                          "border-b border-nx-line",
                          row.source === "auto" && "bg-nx-raised"
                        )}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-base leading-none" aria-hidden="true">
                              {info?.flag || "💱"}
                            </span>
                            <span className="font-medium">{row.currency}</span>
                            {row.rate && (
                              <span className="text-[10px] text-nx-ink-3">
                                ×{row.rate.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        {plan.allowMonthly && (
                          <TableCell variant="numeric" className="font-medium">
                            {formatPrice(row.monthlyAmount, row.currency)}
                          </TableCell>
                        )}
                        {plan.allowYearly && (
                          <TableCell variant="numeric" className="font-medium">
                            {formatPrice(row.yearlyAmount, row.currency)}
                          </TableCell>
                        )}
                        {plan.allowLifetime && (
                          <TableCell variant="numeric" className="font-medium">
                            {row.lifetimeAmount > 0
                              ? formatPrice(row.lifetimeAmount, row.currency)
                              : "—"}
                          </TableCell>
                        )}
                        <TableCell>
                          <Badge variant={row.source === "explicit" ? "default" : "secondary"}>
                            {row.source === "explicit"
                              ? t("entitlements.tenantPlans.sourceExplicit")
                              : t("entitlements.tenantPlans.sourceAuto")}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ═══════ ADD CURRENCY DIALOG ═══════ */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-nx-accent" aria-hidden="true" />
              {t("entitlements.tenantPlans.addCurrency")}
            </DialogTitle>
            <DialogDescription>
              {t("entitlements.tenantPlans.addCurrencyOverrideDesc")}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[300px] space-y-2 overflow-y-auto py-3">
            {availableCurrencies.map((curr) => (
              <button
                key={curr.code}
                type="button"
                onClick={() => {
                  addOverride(curr.code);
                  setShowAddDialog(false);
                }}
                className="flex w-full items-center gap-3 rounded-nx-md border-2 border-transparent p-3 text-start transition-colors duration-nx-micro ease-nx-enter hover:border-nx-line-hi hover:bg-nx-hover focus-visible:shadow-nx-focus focus-visible:outline-none motion-reduce:transition-none"
              >
                <span className="text-lg" aria-hidden="true">
                  {curr.flag}
                </span>
                <div className="flex-1">
                  <span className="text-sm font-semibold">{curr.code}</span>
                  <span className="ms-2 text-xs text-nx-ink-2">{curr.name}</span>
                </div>
                <span className="text-xs text-nx-ink-2">{curr.symbol}</span>
              </button>
            ))}
            {availableCurrencies.length === 0 && (
              <p className="py-4 text-center text-sm text-nx-ink-2">
                {t("entitlements.tenantPlans.allCurrenciesAdded")}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAddDialog(false)}>
              {t("common.cancel")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
});
