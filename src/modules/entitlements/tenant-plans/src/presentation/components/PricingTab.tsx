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
  Loader2,
  Undo2,
  Info,
  TrendingDown,
  Globe,
  Zap,
  Eye,
  Percent,
  ArrowRight,
} from "lucide-react";
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
            <div className="rounded-lg bg-emerald-500/10 p-1.5">
              <DollarSign className="h-4 w-4 text-emerald-500" />
            </div>
            <h2 className="text-lg font-semibold">
              {t("entitlements.tenantPlans.tabPricing") || "Pricing"}
            </h2>
            {overrides.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {overrides.length + 1}{" "}
                {t("entitlements.tenantPlans.currencyCountPlural") || "currencies"}
              </Badge>
            )}
            {hasChanges && (
              <Badge
                variant="outline"
                className="border-amber-500/30 bg-amber-500/5 text-xs text-amber-600"
              >
                {t("common.unsavedChanges") || "Unsaved Changes"}
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
              <Eye className="h-3.5 w-3.5" />
              {t("entitlements.tenantPlans.livePreview") || "Live Preview"}
            </Button>
            {hasChanges && (
              <Button variant="ghost" size="sm" onClick={onDiscard} className="gap-1.5">
                <Undo2 className="h-3.5 w-3.5" />
                {t("common.discard") || "Discard"}
              </Button>
            )}
            <Button size="sm" onClick={onSave} disabled={!hasChanges} loading={isSaving}>
              {!isSaving && <Save className="me-1 h-4 w-4" />}
              {t("common.save") || "Save"}
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
                <span className="text-lg">🇺🇸</span>
                <CardTitle className="text-sm font-semibold">
                  {t("entitlements.tenantPlans.basePricing") || "Base Pricing (USD)"}
                </CardTitle>
                <Badge variant="secondary" className="text-[10px]">
                  {t("entitlements.tenantPlans.anchorCurrency") || "Anchor"}
                </Badge>
              </div>
              {usdSavings > 0 && (
                <Badge
                  variant="outline"
                  className="border-emerald-500/30 bg-emerald-500/5 text-[10px] text-emerald-600 dark:text-emerald-400"
                >
                  <TrendingDown className="me-0.5 h-2.5 w-2.5" />
                  {t("entitlements.tenantPlans.yearlySave") || "Save"} {usdSavings}%
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Info Banner */}
            <div className="flex items-start gap-2 rounded-lg border border-blue-500/10 bg-blue-500/5 p-2.5">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />
              <p className="text-[11px] leading-relaxed text-blue-600 dark:text-blue-400">
                {t("entitlements.tenantPlans.basePricingInfo") ||
                  "USD is the anchor currency. All other currencies auto-calculate from exchange rates unless explicitly overridden."}
              </p>
            </div>

            {/* Price Inputs */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Monthly */}
              {plan.allowMonthly && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {t("entitlements.tenantPlans.monthly") || "Monthly"}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                      $
                    </span>
                    <Input
                      type="number"
                      value={usdMonthly || ""}
                      onChange={(e) => setUsdMonthly(parseFloat(e.target.value) || 0)}
                      className="h-10 pl-7 text-right font-semibold tabular-nums"
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
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {t("entitlements.tenantPlans.yearly") || "Yearly"}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                      $
                    </span>
                    <Input
                      type="number"
                      value={usdYearly || ""}
                      onChange={(e) => setUsdYearly(parseFloat(e.target.value) || 0)}
                      className="h-10 pl-7 text-right font-semibold tabular-nums"
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
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {t("entitlements.tenantPlans.lifetime") || "Lifetime"}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                      $
                    </span>
                    <Input
                      type="number"
                      value={usdLifetime || ""}
                      onChange={(e) => setUsdLifetime(parseFloat(e.target.value) || 0)}
                      className="h-10 pl-7 text-right font-semibold tabular-nums"
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
              <div className="flex items-center gap-3 rounded-lg border border-emerald-500/10 bg-emerald-500/5 p-3">
                <Percent className="h-4 w-4 shrink-0 text-emerald-600" />
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <span className="whitespace-nowrap text-xs text-emerald-700 dark:text-emerald-400">
                    {t("entitlements.tenantPlans.yearlyDiscount") || "Yearly Discount:"}
                  </span>
                  <Input
                    type="number"
                    value={yearlyDiscountPercent}
                    onChange={(e) => setYearlyDiscountPercent(parseInt(e.target.value) || 0)}
                    className="h-7 w-16 text-center text-xs"
                    min={0}
                    max={90}
                  />
                  <span className="text-xs text-emerald-700 dark:text-emerald-400">%</span>
                  <ArrowRight className="h-3 w-3 text-emerald-600" />
                  <span className="text-xs font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                    ${suggestedYearly.toFixed(2)}/yr
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={applyDiscountToYearly}
                  className="h-7 shrink-0 border-emerald-500/30 text-xs text-emerald-700 hover:bg-emerald-500/10"
                >
                  <Zap className="me-1 h-3 w-3" />
                  {t("entitlements.tenantPlans.applyDiscount") || "Apply"}
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
                <Globe className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-semibold">
                  {t("entitlements.tenantPlans.currencyOverrides") || "Currency Overrides"}
                </CardTitle>
                {overrides.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {overrides.length}
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
                <Plus className="h-3.5 w-3.5" />
                {t("entitlements.tenantPlans.addCurrency") || "Add Currency"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {overrides.length === 0 ? (
              <div className="flex items-start gap-2 rounded-lg border border-dashed bg-muted/30 p-4">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t("entitlements.tenantPlans.noOverrides") ||
                      "No currency overrides set. Prices in other currencies are auto-calculated from USD exchange rates."}
                  </p>
                  {ratesLoading && (
                    <p className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      {t("entitlements.tenantPlans.loadingRates") || "Loading exchange rates..."}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {overrides.map((row) => {
                  const info = getCurrencyInfo(row.currency);
                  const savings = yearlySavingsPercent(row.currency);

                  return (
                    <div
                      key={row.currency}
                      className="group space-y-2 rounded-lg border p-3 transition-colors hover:border-primary/20"
                    >
                      {/* Currency Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg leading-none">{info?.flag || "💱"}</span>
                          <span className="text-sm font-semibold">{row.currency}</span>
                          <span className="text-xs text-muted-foreground">
                            {info?.name || row.currency}
                          </span>
                          {savings > 0 && (
                            <Badge
                              variant="outline"
                              className="h-5 border-emerald-500/30 bg-emerald-500/5 px-1.5 py-0 text-[10px] text-emerald-600 dark:text-emerald-400"
                            >
                              <TrendingDown className="me-0.5 h-2.5 w-2.5" />
                              {t("entitlements.tenantPlans.yearlySave") || "Save"} {savings}%
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                          onClick={() => removeOverride(row.currency)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      {/* Price Inputs */}
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        {plan.allowMonthly && (
                          <div className="space-y-1">
                            <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                              {t("entitlements.tenantPlans.monthly") || "Monthly"}
                            </label>
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                                {info?.symbol || row.currency}
                              </span>
                              <Input
                                type="number"
                                value={row.monthlyAmount || ""}
                                onChange={(e) =>
                                  updateOverride(
                                    row.currency,
                                    "monthly",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="h-8 pl-8 text-right text-sm tabular-nums"
                                min={0}
                                step="0.01"
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                        )}
                        {plan.allowYearly && (
                          <div className="space-y-1">
                            <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                              {t("entitlements.tenantPlans.yearly") || "Yearly"}
                            </label>
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                                {info?.symbol || row.currency}
                              </span>
                              <Input
                                type="number"
                                value={row.yearlyAmount || ""}
                                onChange={(e) =>
                                  updateOverride(
                                    row.currency,
                                    "yearly",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="h-8 pl-8 text-right text-sm tabular-nums"
                                min={0}
                                step="0.01"
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                        )}
                        {plan.allowLifetime && (
                          <div className="space-y-1">
                            <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                              {t("entitlements.tenantPlans.lifetime") || "Lifetime"}
                            </label>
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                                {info?.symbol || row.currency}
                              </span>
                              <Input
                                type="number"
                                value={row.lifetimeAmount || ""}
                                onChange={(e) =>
                                  updateOverride(
                                    row.currency,
                                    "lifetime",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="h-8 pl-8 text-right text-sm tabular-nums"
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
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-semibold">
                  {t("entitlements.tenantPlans.livePreview") || "Live Preview"}
                </CardTitle>
                <Badge variant="outline" className="text-[10px]">
                  {preview.length}{" "}
                  {t("entitlements.tenantPlans.currencyCountPlural") || "currencies"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-start gap-2 rounded-lg border border-violet-500/10 bg-violet-500/5 p-2.5">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-500" />
                <p className="text-[11px] leading-relaxed text-violet-600 dark:text-violet-400">
                  {t("entitlements.tenantPlans.previewInfo") ||
                    "This preview shows what your users would pay in each currency. 'Auto' prices are converted from USD via live exchange rates."}
                </p>
              </div>

              {/* Preview Table */}
              <div className="overflow-hidden rounded-lg border">
                {/* Header */}
                <div className="grid grid-cols-[160px_1fr_1fr_1fr_80px] gap-3 bg-muted/30 px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <span>{t("entitlements.tenantPlans.currency") || "Currency"}</span>
                  {plan.allowMonthly && (
                    <span>{t("entitlements.tenantPlans.monthly") || "Monthly"}</span>
                  )}
                  {plan.allowYearly && (
                    <span>{t("entitlements.tenantPlans.yearly") || "Yearly"}</span>
                  )}
                  {plan.allowLifetime && (
                    <span>{t("entitlements.tenantPlans.lifetime") || "Lifetime"}</span>
                  )}
                  <span>{t("entitlements.tenantPlans.source") || "Source"}</span>
                </div>

                {/* Rows */}
                <div className="divide-y">
                  {preview.map((row) => {
                    const info = getCurrencyInfo(row.currency);
                    return (
                      <div
                        key={row.currency}
                        className={`grid grid-cols-[160px_1fr_1fr_1fr_80px] items-center gap-3 px-4 py-2.5 text-sm ${
                          row.source === "auto" ? "bg-muted/10" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base leading-none">{info?.flag || "💱"}</span>
                          <span className="font-medium">{row.currency}</span>
                          {row.rate && (
                            <span className="text-[10px] text-muted-foreground">
                              ×{row.rate.toFixed(2)}
                            </span>
                          )}
                        </div>
                        {plan.allowMonthly && (
                          <span className="font-medium tabular-nums">
                            {formatPrice(row.monthlyAmount, row.currency)}
                          </span>
                        )}
                        {plan.allowYearly && (
                          <span className="font-medium tabular-nums">
                            {formatPrice(row.yearlyAmount, row.currency)}
                          </span>
                        )}
                        {plan.allowLifetime && (
                          <span className="font-medium tabular-nums">
                            {row.lifetimeAmount > 0
                              ? formatPrice(row.lifetimeAmount, row.currency)
                              : "—"}
                          </span>
                        )}
                        <Badge
                          variant={row.source === "explicit" ? "default" : "secondary"}
                          className="w-fit text-[10px]"
                        >
                          {row.source === "explicit"
                            ? t("entitlements.tenantPlans.sourceExplicit") || "Explicit"
                            : t("entitlements.tenantPlans.sourceAuto") || "Auto"}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ═══════ ADD CURRENCY DIALOG ═══════ */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              {t("entitlements.tenantPlans.addCurrency") || "Add Currency Override"}
            </DialogTitle>
            <DialogDescription>
              {t("entitlements.tenantPlans.addCurrencyOverrideDesc") ||
                "Select a currency to add explicit pricing. Amounts will be pre-filled from current exchange rates."}
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
                className="flex w-full items-center gap-3 rounded-lg border-2 border-transparent p-3 text-start transition-all hover:border-muted-foreground/20 hover:bg-accent/50"
              >
                <span className="text-lg">{curr.flag}</span>
                <div className="flex-1">
                  <span className="text-sm font-semibold">{curr.code}</span>
                  <span className="ms-2 text-xs text-muted-foreground">{curr.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">{curr.symbol}</span>
              </button>
            ))}
            {availableCurrencies.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                {t("entitlements.tenantPlans.allCurrenciesAdded") ||
                  "All supported currencies have been added."}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAddDialog(false)}>
              {t("common.cancel") || "Cancel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
});
