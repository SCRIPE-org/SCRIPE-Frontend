/**
 * PricingTab — Editable multi-currency pricing matrix for TenantPlan.
 *
 * Supports:
 * - Add/edit/remove price rows
 * - Currency + Billing Cycle + Amount + Original Amount
 * - Promotional flag
 * - Change tracking with save
 * - Stripe-ready: price entries become Stripe Price objects in Phase 10
 *
 * Extracted sub-components: PriceRow, AddPriceForm
 */
"use client";

import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { DollarSign, Plus, Save, Loader2 } from "lucide-react";
import type { TenantPlan, TenantPlanPriceData } from "../../domain/entities/TenantPlan";
import type { UpsertTenantPlanPriceRequest } from "../../domain/entities/TenantPlanRequests";
import { formatAmount, type TFn } from "./shared-helpers";
import { PriceRow } from "./pricing-tab/PriceRow";
import { AddPriceForm } from "./pricing-tab/AddPriceForm";

interface PricingTabProps {
  plan: TenantPlan;
  onSavePrices: (prices: UpsertTenantPlanPriceRequest[]) => void;
  isSaving: boolean;
  t: TFn;
}

export function PricingTab({ plan, onSavePrices, isSaving, t }: PricingTabProps) {
  // ── Local editable price list ──
  const [localPrices, setLocalPrices] = useState<UpsertTenantPlanPriceRequest[]>(
    () => (plan.prices || []).map((p) => ({
      currency: p.currency || "USD",
      billingCycle: p.billingCycle,
      amount: p.amount,
      originalAmount: p.originalAmount,
      isPromotional: p.isPromotional,
    })),
  );

  const [showAddForm, setShowAddForm] = useState(false);

  // ── Change tracking ──
  const hasChanges = useMemo(() => {
    const original = (plan.prices || []).map((p) => `${p.currency}:${p.billingCycle}:${p.amount}`).sort();
    const current = localPrices.map((p) => `${p.currency}:${p.billingCycle}:${p.amount}`).sort();
    return JSON.stringify(original) !== JSON.stringify(current);
  }, [localPrices, plan.prices]);

  // ── Handlers ──
  const updatePrice = useCallback((index: number, updates: Partial<UpsertTenantPlanPriceRequest>) => {
    setLocalPrices((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      return next;
    });
  }, []);

  const removePrice = useCallback((index: number) => {
    setLocalPrices((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const addPrice = useCallback((price: UpsertTenantPlanPriceRequest) => {
    setLocalPrices((prev) => [...prev, price]);
    setShowAddForm(false);
  }, []);

  const handleSave = useCallback(() => {
    onSavePrices(localPrices);
  }, [localPrices, onSavePrices]);

  // ── Group by currency ──
  const byCurrency = useMemo(() => {
    const groups: Record<string, Array<{ price: UpsertTenantPlanPriceRequest; index: number }>> = {};
    localPrices.forEach((price, index) => {
      const cur = price.currency || "USD";
      if (!groups[cur]) groups[cur] = [];
      groups[cur].push({ price, index });
    });
    return groups;
  }, [localPrices]);

  return (
    <div className="space-y-4">
      {/* ─────── TOOLBAR ─────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-emerald-500" />
          <h2 className="text-lg font-semibold">
            {t("entitlements.tenantPlans.tabPricing") || "Pricing"}
          </h2>
          <Badge variant="secondary" className="text-xs">
            {localPrices.length} {localPrices.length === 1 ? t("entitlements.tenantPlans.priceCount") : t("entitlements.tenantPlans.priceCountPlural")}
          </Badge>
          {hasChanges && (
            <Badge variant="outline" className="text-xs text-amber-600 border-amber-500/30 bg-amber-500/5">
              {t("common.unsavedChanges") || "Unsaved Changes"}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 me-1" />
            {t("entitlements.tenantPlans.addPrice") || "Add Price"}
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!hasChanges || isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin me-1" /> : <Save className="h-4 w-4 me-1" />}
            {t("common.save") || "Save"}
          </Button>
        </div>
      </div>

      {/* ─────── ADD PRICE FORM ─────── */}
      {showAddForm && (
        <AddPriceForm
          plan={plan}
          onAdd={addPrice}
          onCancel={() => setShowAddForm(false)}
          t={t}
        />
      )}

      {/* ─────── PRICE GROUPS ─────── */}
      {localPrices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <DollarSign className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">{t("entitlements.tenantPlans.noPricing")}</p>
            <p className="text-xs text-muted-foreground mt-1">{t("entitlements.tenantPlans.noPricingHint")}</p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(byCurrency).map(([currency, items]) => (
          <Card key={currency}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-500" />
                <CardTitle className="text-base">{currency}</CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {items.length} {items.length === 1 ? t("entitlements.tenantPlans.priceCount") : t("entitlements.tenantPlans.priceCountPlural")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {items.map(({ price, index }) => (
                  <PriceRow
                    key={`${currency}-${price.billingCycle}-${index}`}
                    price={price}
                    currency={currency}
                    onUpdate={(updates) => updatePrice(index, updates)}
                    onRemove={() => removePrice(index)}
                    t={t}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
