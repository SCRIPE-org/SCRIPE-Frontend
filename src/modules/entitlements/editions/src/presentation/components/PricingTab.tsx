/**
 * Pricing Tab — Multi-Currency Pricing Management
 *
 * Premium UI for managing edition pricing across multiple currencies.
 * Features inline editing, add/remove currencies, yearly savings badges,
 * and a sticky save bar matching the existing EditionDetailView pattern.
 */
"use client";

import { useState, memo } from "react";
import { useEditionPricingViewModel } from "../viewmodels/useEditionPricingViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Badge } from "@core/ui/badge";
import { Skeleton } from "@core/ui/skeleton";
import {
      Dialog, DialogContent, DialogDescription, DialogFooter,
      DialogHeader, DialogTitle,
} from "@core/ui/dialog";
import {
      Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@core/ui/select";
import {
      DollarSign, Plus, Trash2, Loader2, Undo2, Save,
      TrendingDown, Coins, AlertCircle,
} from "lucide-react";
import {
      SUPPORTED_CURRENCIES, getCurrencyInfo, formatPrice,
} from "../../domain/entities/EditionPricing";

interface PricingTabProps {
      editionId: string;
}

export const PricingTab = memo(function PricingTab({ editionId }: PricingTabProps) {
      const { t } = useI18n();
      const vm = useEditionPricingViewModel(editionId);
      const [showAddDialog, setShowAddDialog] = useState(false);
      const [selectedCurrency, setSelectedCurrency] = useState("");

      // Available currencies = all supported - already used
      const availableCurrencies = SUPPORTED_CURRENCIES.filter(
            (c) => !vm.usedCurrencies.includes(c.code)
      );

      const handleAddCurrency = () => {
            if (selectedCurrency) {
                  vm.addCurrency(selectedCurrency);
                  setSelectedCurrency("");
                  setShowAddDialog(false);
            }
      };

      // ── Loading ──
      if (vm.isLoading) {
            return (
                  <Card>
                        <CardHeader className="pb-3">
                              <div className="flex items-center gap-2">
                                    <Skeleton className="h-5 w-5 rounded" />
                                    <Skeleton className="h-5 w-32" />
                              </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                              {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center gap-4">
                                          <Skeleton className="h-8 w-24" />
                                          <Skeleton className="h-8 flex-1" />
                                          <Skeleton className="h-8 flex-1" />
                                          <Skeleton className="h-8 w-8" />
                                    </div>
                              ))}
                        </CardContent>
                  </Card>
            );
      }

      // ── Error ──
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

      return (
            <>
                  <Card className="overflow-hidden">
                        <CardHeader className="py-3">
                              <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                          <div className="rounded-lg p-1.5 bg-emerald-500/10">
                                                <Coins className="h-4 w-4 text-emerald-500" />
                                          </div>
                                          <CardTitle className="text-sm font-medium">
                                                {t("entitlements.pricing.title") || "Multi-Currency Pricing"}
                                          </CardTitle>
                                          {vm.prices.length > 0 && (
                                                <Badge variant="secondary" className="text-xs">
                                                      {vm.prices.length} {vm.prices.length === 1 ? "currency" : "currencies"}
                                                </Badge>
                                          )}
                                    </div>
                                    <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => setShowAddDialog(true)}
                                          disabled={availableCurrencies.length === 0}
                                          className="gap-1.5"
                                    >
                                          <Plus className="h-3.5 w-3.5" />
                                          {t("entitlements.pricing.addCurrency") || "Add Currency"}
                                    </Button>
                              </div>
                        </CardHeader>

                        <CardContent className="pt-0">
                              {vm.prices.length === 0 ? (
                                    /* ── Empty State ── */
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                          <div className="rounded-full bg-muted/50 p-4 mb-4">
                                                <DollarSign className="h-8 w-8 text-muted-foreground/50" />
                                          </div>
                                          <h3 className="font-medium text-sm mb-1">
                                                {t("entitlements.pricing.noPrices") || "No Pricing Configured"}
                                          </h3>
                                          <p className="text-xs text-muted-foreground max-w-xs mb-4">
                                                {t("entitlements.pricing.noPricesDesc") ||
                                                      "Add your first currency to start configuring pricing for this edition."}
                                          </p>
                                          <Button
                                                size="sm"
                                                onClick={() => setShowAddDialog(true)}
                                                className="gradient-primary gap-1.5"
                                          >
                                                <Plus className="h-3.5 w-3.5" />
                                                {t("entitlements.pricing.addCurrency") || "Add Currency"}
                                          </Button>
                                    </div>
                              ) : (
                                    /* ── Pricing Table ── */
                                    <div className="border rounded-lg overflow-hidden">
                                          {/* Table Header */}
                                          <div className="grid grid-cols-[140px_1fr_1fr_60px] gap-3 px-4 py-2.5 bg-muted/30 border-b text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                <span>{t("entitlements.pricing.currency") || "Currency"}</span>
                                                <span>{t("entitlements.pricing.monthly") || "Monthly"}</span>
                                                <span>{t("entitlements.pricing.yearly") || "Yearly"}</span>
                                                <span />
                                          </div>

                                          {/* Table Rows */}
                                          <div className="divide-y">
                                                {vm.prices.map((row) => {
                                                      const info = getCurrencyInfo(row.currency);
                                                      const savings = vm.yearlySavingsPercent(row.currency);

                                                      return (
                                                            <div
                                                                  key={row.currency}
                                                                  className="grid grid-cols-[140px_1fr_1fr_60px] gap-3 px-4 py-3 items-center group hover:bg-accent/30 transition-colors"
                                                            >
                                                                  {/* Currency Label */}
                                                                  <div className="flex items-center gap-2">
                                                                        <span className="text-lg leading-none">{info?.flag || "💱"}</span>
                                                                        <div>
                                                                              <span className="text-sm font-semibold">{row.currency}</span>
                                                                              <p className="text-[10px] text-muted-foreground leading-tight">{info?.name}</p>
                                                                        </div>
                                                                  </div>

                                                                  {/* Monthly Price Input */}
                                                                  <div className="relative">
                                                                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                                                                              {info?.symbol || "$"}
                                                                        </span>
                                                                        <Input
                                                                              type="number"
                                                                              value={row.monthlyAmount || ""}
                                                                              onChange={(e) => vm.updatePrice(row.currency, "monthly", parseFloat(e.target.value) || 0)}
                                                                              className="h-8 pl-8 text-right tabular-nums text-sm"
                                                                              min={0}
                                                                              step="0.01"
                                                                              placeholder="0.00"
                                                                        />
                                                                  </div>

                                                                  {/* Yearly Price Input + Savings Badge */}
                                                                  <div className="flex items-center gap-2">
                                                                        <div className="relative flex-1">
                                                                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                                                                                    {info?.symbol || "$"}
                                                                              </span>
                                                                              <Input
                                                                                    type="number"
                                                                                    value={row.yearlyAmount || ""}
                                                                                    onChange={(e) => vm.updatePrice(row.currency, "yearly", parseFloat(e.target.value) || 0)}
                                                                                    className="h-8 pl-8 text-right tabular-nums text-sm"
                                                                                    min={0}
                                                                                    step="0.01"
                                                                                    placeholder="0.00"
                                                                              />
                                                                        </div>
                                                                        {savings > 0 && (
                                                                              <Badge
                                                                                    variant="outline"
                                                                                    className="text-[10px] px-1.5 py-0 h-5 shrink-0 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/5"
                                                                              >
                                                                                    <TrendingDown className="h-2.5 w-2.5 me-0.5" />
                                                                                    {savings}%
                                                                              </Badge>
                                                                        )}
                                                                  </div>

                                                                  {/* Delete */}
                                                                  <div className="flex justify-center">
                                                                        <Button
                                                                              variant="ghost"
                                                                              size="icon"
                                                                              className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                                              onClick={() => vm.removeCurrency(row.currency)}
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

                  {/* ═══════ STICKY SAVE BAR ═══════ */}
                  {vm.isDirty && (
                        <div className="fixed bottom-0 inset-x-0 z-50">
                              <div className="border-t bg-background/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.15)]">
                                    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3">
                                          <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3 min-w-0">
                                                      <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                                                      <div className="min-w-0">
                                                            <p className="text-sm font-medium">
                                                                  {t("entitlements.pricing.unsavedChanges") || "Unsaved pricing changes"}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                  {t("entitlements.pricing.unsavedChangesDesc") || "Save to apply your pricing changes."}
                                                            </p>
                                                      </div>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                      <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={vm.discard}
                                                            disabled={vm.isSaving}
                                                      >
                                                            <Undo2 className="h-4 w-4 me-1" />
                                                            {t("common.discard") || "Discard"}
                                                      </Button>
                                                      <Button
                                                            size="sm"
                                                            onClick={vm.save}
                                                            disabled={vm.isSaving}
                                                            className="gradient-primary"
                                                      >
                                                            {vm.isSaving ? (
                                                                  <Loader2 className="h-4 w-4 animate-spin me-1" />
                                                            ) : (
                                                                  <Save className="h-4 w-4 me-1" />
                                                            )}
                                                            {t("common.save") || "Save"}
                                                      </Button>
                                                </div>
                                          </div>
                                    </div>
                              </div>
                        </div>
                  )}

                  {/* ═══════ ADD CURRENCY DIALOG ═══════ */}
                  <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                        <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                          <Plus className="h-5 w-5 text-primary" />
                                          {t("entitlements.pricing.addCurrency") || "Add Currency"}
                                    </DialogTitle>
                                    <DialogDescription>
                                          {t("entitlements.pricing.addCurrencyDesc") ||
                                                "Select a currency to add pricing for. Both monthly and yearly prices will be configured."}
                                    </DialogDescription>
                              </DialogHeader>

                              <div className="py-3">
                                    <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                                          <SelectTrigger>
                                                <SelectValue placeholder={t("entitlements.pricing.selectCurrency") || "Select currency..."} />
                                          </SelectTrigger>
                                          <SelectContent>
                                                {availableCurrencies.map((c) => (
                                                      <SelectItem key={c.code} value={c.code}>
                                                            <span className="flex items-center gap-2">
                                                                  <span>{c.flag}</span>
                                                                  <span className="font-medium">{c.code}</span>
                                                                  <span className="text-muted-foreground">— {c.name}</span>
                                                            </span>
                                                      </SelectItem>
                                                ))}
                                          </SelectContent>
                                    </Select>
                              </div>

                              <DialogFooter>
                                    <Button variant="ghost" onClick={() => setShowAddDialog(false)}>
                                          {t("common.cancel") || "Cancel"}
                                    </Button>
                                    <Button
                                          onClick={handleAddCurrency}
                                          disabled={!selectedCurrency}
                                          className="gradient-primary"
                                    >
                                          <Plus className="h-4 w-4 me-1" />
                                          {t("common.add") || "Add"}
                                    </Button>
                              </DialogFooter>
                        </DialogContent>
                  </Dialog>
            </>
      );
});
