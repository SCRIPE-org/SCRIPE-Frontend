// FILE-EXCEPTION: file length
/**
 * Pricing Tab â€” Redesigned with Hybrid Pricing Model
 *
 * 3-Section Layout:
 * 1. Base Pricing (USD) â€” Always visible, anchor currency
 * 2. Currency Overrides â€” Optional, with auto-suggest from exchange rates
 * 3. Live Preview â€” Shows what tenants would actually pay
 */
"use client";

import { useState, memo } from "react";
import { useEditionPricingViewModel } from "../viewmodels/useEditionPricingViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Badge } from "@core/ui/badge";
import { Skeleton } from "@core/ui/skeleton";
import { Slider } from "@core/ui/slider";
import { Textarea } from "@core/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import GenericSelect from "@core/crud/components/generic-select";
import {
  DollarSign,
  Plus,
  Trash2,
  Loader2,
  Undo2,
  GitBranch,
  Bolt,
  TrendingDown,
  Coins,
  AlertCircle,
  Info,
  ChevronDown,
  Globe,
  Zap,
} from "lucide-react";
import { getCurrencyInfo, formatPrice } from "../../domain/entities/EditionPricing";
import { parseLocalizedNumber } from "@core/utils/number-parser";
import { useModuleLocales } from "@core/hooks/use-module-locales";

interface PricingTabProps {
  editionId: string;
  allowMonthly?: boolean;
  allowYearly?: boolean;
  allowLifetime?: boolean;
}

/**
 * Exported constant defining parameters and fields for pricing tab configurations.
 */
export const PricingTab = memo(function PricingTab({
  editionId,
  allowMonthly = true,
  allowYearly = true,
  allowLifetime = true,
}: PricingTabProps) {
  useModuleLocales(() => import("../../../locales"), "editions");
  const { t } = useI18n();
  const vm = useEditionPricingViewModel(editionId);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [showVersionDialog, setShowVersionDialog] = useState(false);
  const [versionNotes, setVersionNotes] = useState("");
  const [showApplyDialog, setShowApplyDialog] = useState(false);

  const isBusy = vm.isSaving || vm.isCreatingVersion;

  const handleAddCurrency = () => {
    if (selectedCurrency) {
      vm.addOverride(selectedCurrency);
      setSelectedCurrency("");
      setShowAddDialog(false);
    }
  };

  // â”€â”€ Loading â”€â”€
  if (vm.isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-5 w-32" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 flex-1" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  // â”€â”€ Error â”€â”€
  if (vm.error) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="flex flex-col items-center justify-center gap-3 py-10">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <p className="text-sm text-destructive">{vm.error.message}</p>
        </CardContent>
      </Card>
    );
  }

  const usdSavings = vm.yearlySavingsPercent("USD");

  return (
    <>
      <div className="space-y-4">
        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {/* SECTION 1: BASE PRICING (USD)                     */}
        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        <Card className="overflow-hidden">
          <CardHeader className="py-3">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-success/10 p-1.5">
                <DollarSign className="h-4 w-4 text-success" />
              </div>
              <CardTitle className="text-sm font-medium">
                {t("entitlements.pricing.basePricing")}
              </CardTitle>
              <Badge variant="secondary" className="text-[10px]">
                {t("entitlements.pricing.required")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {/* Monthly */}
            <div
              className={`flex items-center gap-3 ${!allowMonthly ? "pointer-events-none opacity-40" : ""}`}
            >
              <span className="w-20 shrink-0 text-sm text-muted-foreground">
                {t("entitlements.pricing.monthly")}
              </span>
              <div className="relative max-w-xs flex-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                  $
                </span>
                <Input
                  type="number"
                  value={vm.usdMonthly || ""}
                  onChange={(e) => vm.setUsdMonthly(parseLocalizedNumber(e.target.value) ?? 0)}
                  className="h-9 pl-7 text-right text-sm tabular-nums"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  disabled={!allowMonthly}
                />
              </div>
              <span className="text-xs text-muted-foreground">/mo</span>
              {!allowMonthly && (
                <Badge
                  variant="outline"
                  className="h-5 border-muted px-1.5 py-0 text-[10px] text-muted-foreground"
                >
                  {t("common.disabled")}
                </Badge>
              )}
            </div>

            {/* Yearly */}
            <div
              className={`flex items-center gap-3 ${!allowYearly ? "pointer-events-none opacity-40" : ""}`}
            >
              <span className="w-20 shrink-0 text-sm text-muted-foreground">
                {t("entitlements.pricing.yearly")}
              </span>
              <div className="relative max-w-xs flex-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                  $
                </span>
                <Input
                  type="number"
                  value={vm.usdYearly || ""}
                  onChange={(e) => vm.setUsdYearly(parseLocalizedNumber(e.target.value) ?? 0)}
                  className="h-9 pl-7 text-right text-sm tabular-nums"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  disabled={!allowYearly}
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">/yr</span>
                {!allowYearly ? (
                  <Badge
                    variant="outline"
                    className="h-5 border-muted px-1.5 py-0 text-[10px] text-muted-foreground"
                  >
                    {t("common.disabled")}
                  </Badge>
                ) : (
                  usdSavings > 0 && (
                    <Badge
                      variant="outline"
                      className="h-5 border-success/30 bg-success/5 px-1.5 py-0 text-[10px] text-success"
                    >
                      <TrendingDown className="me-0.5 h-2.5 w-2.5" />
                      {t("entitlements.pricing.save")} {usdSavings}%
                    </Badge>
                  )
                )}
              </div>
            </div>

            {/* Dynamic Yearly Discount */}
            {allowYearly && vm.usdMonthly > 0 && (
              <div className="mt-1 space-y-2 rounded-lg border bg-muted/30 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    {t("entitlements.pricing.yearlyDiscount")}
                  </span>
                  <Badge variant="outline" className="h-5 px-1.5 py-0 text-[10px] tabular-nums">
                    {vm.yearlyDiscountPercent}%
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <Slider
                    min={0}
                    max={50}
                    step={1}
                    value={[vm.yearlyDiscountPercent]}
                    onValueChange={([value]) => vm.setYearlyDiscountPercent(value ?? 0)}
                    className="flex-1"
                  />
                  <div className="flex items-center gap-1.5">
                    <span className="whitespace-nowrap text-xs tabular-nums text-muted-foreground">
                      {t("entitlements.pricing.suggested")}: ${vm.suggestedYearly.toLocaleString()}
                      /yr
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-[10px] text-success hover:bg-success/10 hover:text-success/80"
                      onClick={vm.applyDiscountToYearly}
                    >
                      <Zap className="me-0.5 h-2.5 w-2.5" />
                      {t("entitlements.pricing.applyDiscount")}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Info banner */}
            <div className="mt-2 flex items-start gap-2 rounded-lg border border-info/10 bg-info/5 p-2.5">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-info" />
              <p className="text-[11px] leading-relaxed text-info">
                {t("entitlements.pricing.autoConvertInfo")}
              </p>
            </div>

            {/* Lifetime (one-time) */}
            <div
              className={`mt-3 flex items-center gap-3 border-t border-dashed border-border/50 pt-3 ${!allowLifetime ? "pointer-events-none opacity-40" : ""}`}
            >
              <span className="w-20 shrink-0 text-sm text-muted-foreground">
                {t("entitlements.pricing.lifetime")}
              </span>
              <div className="relative max-w-xs flex-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                  $
                </span>
                <Input
                  type="number"
                  value={vm.usdLifetime || ""}
                  onChange={(e) => vm.setUsdLifetime(parseLocalizedNumber(e.target.value) ?? 0)}
                  className="h-9 pl-7 text-right text-sm tabular-nums"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  disabled={!allowLifetime}
                />
              </div>
              {!allowLifetime ? (
                <Badge
                  variant="outline"
                  className="h-5 border-muted px-1.5 py-0 text-[10px] text-muted-foreground"
                >
                  {t("common.disabled")}
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="h-5 border-primary/30 bg-primary/5 px-1.5 py-0 text-[10px] text-primary"
                >
                  {t("entitlements.pricing.oneTime")}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {/* SECTION 2: CURRENCY OVERRIDES                     */}
        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        <Card className="overflow-hidden">
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-primary/10 p-1.5">
                  <Globe className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-sm font-medium">
                  {t("entitlements.pricing.currencyOverrides")}
                </CardTitle>
                {vm.overrides.length > 0 && (
                  <Badge variant="outline" className="text-[10px]">
                    {vm.overrides.length}
                  </Badge>
                )}
                <Badge variant="secondary" className="text-[10px]">
                  {t("entitlements.pricing.optional")}
                </Badge>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAddDialog(true)}
                disabled={vm.availableCurrencies.length === 0}
                className="gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                {t("entitlements.pricing.addOverride")}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            {vm.overrides.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="mb-3 rounded-full bg-muted/50 p-3">
                  <Globe className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <p className="max-w-xs text-xs text-muted-foreground">
                  {t("entitlements.pricing.noOverridesDesc")}
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border">
                {/* Table Header */}
                <div className="grid grid-cols-[140px_1fr_1fr_60px] gap-3 border-b bg-muted/30 px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <span>{t("entitlements.pricing.currency")}</span>
                  <span>{t("entitlements.pricing.monthly")}</span>
                  <span>{t("entitlements.pricing.yearly")}</span>
                  <span />
                </div>

                {/* Override Rows */}
                <div className="divide-y">
                  {vm.overrides.map((row) => {
                    const info = getCurrencyInfo(row.currency);
                    const savings = vm.yearlySavingsPercent(row.currency);

                    return (
                      <div
                        key={row.currency}
                        className="group grid grid-cols-[140px_1fr_1fr_60px] items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/30"
                      >
                        {/* Currency Label */}
                        <div className="flex items-center gap-2">
                          <span className="text-lg leading-none">{info?.flag || "FX"}</span>
                          <div>
                            <span className="text-sm font-semibold">{row.currency}</span>
                            <p className="text-[10px] leading-tight text-muted-foreground">
                              {info?.name}
                            </p>
                          </div>
                        </div>

                        {/* Monthly Price */}
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                            {info?.symbol || "$"}
                          </span>
                          <Input
                            type="number"
                            value={row.monthlyAmount || ""}
                            onChange={(e) =>
                              vm.updateOverride(
                                row.currency,
                                "monthly",
                                parseLocalizedNumber(e.target.value) ?? 0
                              )
                            }
                            className="h-8 pl-8 text-right text-sm tabular-nums"
                            min={0}
                            step="0.01"
                            placeholder="0.00"
                          />
                        </div>

                        {/* Yearly Price + Savings */}
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                              {info?.symbol || "$"}
                            </span>
                            <Input
                              type="number"
                              value={row.yearlyAmount || ""}
                              onChange={(e) =>
                                vm.updateOverride(
                                  row.currency,
                                  "yearly",
                                  parseLocalizedNumber(e.target.value) ?? 0
                                )
                              }
                              className="h-8 pl-8 text-right text-sm tabular-nums"
                              min={0}
                              step="0.01"
                              placeholder="0.00"
                            />
                          </div>
                          {savings > 0 && (
                            <Badge
                              variant="outline"
                              className="h-5 shrink-0 border-success/30 bg-success/5 px-1.5 py-0 text-[10px] text-success"
                            >
                              <TrendingDown className="me-0.5 h-2.5 w-2.5" />
                              {savings}%
                            </Badge>
                          )}
                        </div>

                        {/* Delete */}
                        <div className="flex justify-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                            onClick={() => vm.removeOverride(row.currency)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {/* SECTION 3: LIVE PREVIEW (Collapsible)              */}
        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {vm.usdMonthly > 0 && (
          <Card className="overflow-hidden">
            <CardHeader
              className="cursor-pointer py-3"
              onClick={() => setShowPreview(!showPreview)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-warning/10 p-1.5">
                    <Coins className="h-4 w-4 text-warning" />
                  </div>
                  <CardTitle className="text-sm font-medium">
                    {t("entitlements.pricing.livePreview")}
                  </CardTitle>
                  <Badge variant="outline" className="text-[10px]">
                    {vm.preview.length} {t("entitlements.pricing.currencies")}
                  </Badge>
                  {vm.ratesLoading && (
                    <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                  )}
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform ${showPreview ? "rotate-180" : ""}`}
                />
              </div>
            </CardHeader>

            {showPreview && (
              <CardContent className="pt-0">
                <p className="mb-3 text-[11px] text-muted-foreground">
                  {t("entitlements.pricing.previewDesc")}
                </p>
                <div className="overflow-hidden rounded-lg border">
                  <div className="grid grid-cols-[110px_1fr_1fr_80px] gap-3 border-b bg-muted/30 px-4 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <span>{t("entitlements.pricing.currency")}</span>
                    <span>{t("entitlements.pricing.monthly")}</span>
                    <span>{t("entitlements.pricing.yearly")}</span>
                    <span>{t("entitlements.pricing.source")}</span>
                  </div>
                  <div className="max-h-[300px] divide-y overflow-y-auto">
                    {vm.preview.map((row) => {
                      const info = getCurrencyInfo(row.currency);
                      return (
                        <div
                          key={row.currency}
                          className="grid grid-cols-[110px_1fr_1fr_80px] items-center gap-3 px-4 py-2.5 text-sm"
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="text-base">{info?.flag || "FX"}</span>
                            <span className="text-xs font-medium">{row.currency}</span>
                          </div>
                          <span className="text-xs tabular-nums">
                            {formatPrice(row.monthlyAmount, row.currency)}
                          </span>
                          <span className="text-xs tabular-nums">
                            {formatPrice(row.yearlyAmount, row.currency)}
                          </span>
                          <Badge
                            variant={row.source === "explicit" ? "default" : "outline"}
                            className={`h-4 px-1.5 py-0 text-[9px] ${
                              row.source === "auto"
                                ? "border-info/30 bg-info/5 text-info"
                                : ""
                            }`}
                          >
                            {row.source === "explicit"
                              ? t("entitlements.pricing.explicit")
                              : t("entitlements.pricing.autoConverted")}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        )}
      </div>

      {/* â•â•â•â•â•â•â• STICKY SAVE BAR â•â•â•â•â•â•â• */}
      {vm.isDirty && (
        <div className="fixed inset-x-0 bottom-0 z-50">
          <div className="border-t bg-background/95 shadow-nx-bar-top backdrop-blur-md">
            <div className="mx-auto max-w-screen-xl px-4 py-3 sm:px-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="h-2 w-2 shrink-0 rounded-full bg-warning" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {t("entitlements.pricing.unsavedChanges")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("entitlements.pricing.versionHint")}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {/* Discard */}
                  <Button variant="ghost" size="sm" onClick={vm.discard} disabled={isBusy}>
                    <Undo2 className="me-1 h-4 w-4" />
                    {t("common.discard")}
                  </Button>

                  {/* Apply Now (secondary) */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowApplyDialog(true)}
                    disabled={isBusy}
                    loading={vm.isSaving}
                  >
                    {!vm.isSaving && <Bolt className="me-1 h-4 w-4" />}
                    {t("entitlements.editions.directApply")}
                  </Button>

                  {/* Save as Version (primary) */}
                  <Button
                    size="sm"
                    onClick={() => setShowVersionDialog(true)}
                    disabled={isBusy}
                    loading={vm.isCreatingVersion}
                    className="gradient-primary"
                  >
                    {!vm.isCreatingVersion && <GitBranch className="me-1 h-4 w-4" />}
                    {t("entitlements.editions.saveAsVersion")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* â•â•â•â•â•â•â• ADD CURRENCY OVERRIDE DIALOG â•â•â•â•â•â•â• */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              {t("entitlements.pricing.addOverride")}
            </DialogTitle>
            <DialogDescription>{t("entitlements.pricing.addOverrideDesc")}</DialogDescription>
          </DialogHeader>

          <div className="py-3">
            <GenericSelect
              type="searchable"
              options={vm.availableCurrencies.map((c) => ({
                value: c.code,
                label: `${c.flag} ${c.code} â€” ${c.name}`,
              }))}
              value={selectedCurrency}
              onValueChange={(value: string | string[]) =>
                setSelectedCurrency(typeof value === "string" ? value : value[0] || "")
              }
              placeholder={t("entitlements.pricing.selectCurrency")}
              searchPlaceholder={t("entitlements.pricing.searchCurrency")}
            />
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAddDialog(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleAddCurrency}
              disabled={!selectedCurrency}
              className="gradient-primary"
            >
              <Plus className="me-1 h-4 w-4" />
              {t("common.add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* â•â•â•â•â•â•â• SAVE AS VERSION DIALOG â•â•â•â•â•â•â• */}
      <Dialog open={showVersionDialog} onOpenChange={setShowVersionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-primary" />
              {t("entitlements.editions.saveAsVersion")}
            </DialogTitle>
            <DialogDescription>{t("entitlements.pricing.saveAsVersionDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                {t("entitlements.editions.versionNotesLabel")}
              </Label>
              <Textarea
                placeholder={t("entitlements.editions.versions.changeNotesPlaceholder")}
                value={versionNotes}
                onChange={(e) => setVersionNotes(e.target.value)}
                className="min-h-[80px] resize-none"
              />
            </div>
            <div className="flex items-center gap-2 rounded-md bg-muted/50 p-2.5 text-xs text-muted-foreground">
              <DollarSign className="h-3.5 w-3.5 shrink-0" />
              <span>{t("entitlements.pricing.versionChangesIncluded")}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowVersionDialog(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={() => {
                vm.createVersionWithPricing(versionNotes || undefined);
                setShowVersionDialog(false);
                setVersionNotes("");
              }}
              disabled={isBusy}
              loading={vm.isCreatingVersion}
              className="gradient-primary"
            >
              {!vm.isCreatingVersion && <GitBranch className="me-1 h-4 w-4" />}
              {t("entitlements.editions.createAndPublish")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* â•â•â•â•â•â•â• APPLY NOW CONFIRMATION DIALOG â•â•â•â•â•â•â• */}
      <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-warning">
              <Bolt className="h-5 w-5" />
              {t("entitlements.pricing.applyNowTitle")}
            </DialogTitle>
            <DialogDescription>{t("entitlements.pricing.applyNowDesc")}</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 rounded-md border border-warning/20 bg-warning/5 p-2.5 text-xs text-muted-foreground">
            <Bolt className="h-3.5 w-3.5 shrink-0 text-warning" />
            <span>{t("entitlements.pricing.applyWarning")}</span>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowApplyDialog(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                vm.save();
                setShowApplyDialog(false);
              }}
              disabled={isBusy}
              loading={vm.isSaving}
            >
              {!vm.isSaving && <Bolt className="me-1 h-4 w-4" />}
              {t("entitlements.editions.applyNow")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
});
