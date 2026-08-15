/**
 * AddPriceForm — Form to add a new price row to a plan.
 *
 * Uses GenericSelect for currency and billing cycle dropdowns.
 */
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import GenericSelect from "@core/crud/components/generic-select";
import type { GenericSelectOption } from "@core/crud/components/generic-select";
import { DollarSign, Check, X } from "lucide-react";
import type { TenantPlan } from "../../../domain/entities/TenantPlan";
import type { UpsertTenantPlanPriceRequest } from "../../../domain/entities/TenantPlanRequests";

interface AddPriceFormProps {
  plan: TenantPlan;
  onAdd: (price: UpsertTenantPlanPriceRequest) => void;
  onCancel: () => void;
  t: (key: string) => string;
}

const CURRENCY_OPTIONS: GenericSelectOption[] = [
  { value: "USD", label: "USD — US Dollar" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "GBP", label: "GBP — British Pound" },
  { value: "SAR", label: "SAR — Saudi Riyal" },
  { value: "AED", label: "AED — UAE Dirham" },
  { value: "EGP", label: "EGP — Egyptian Pound" },
];

/**
 * Presentation UI component rendering the add price form.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function AddPriceForm({ plan, onAdd, onCancel, t }: AddPriceFormProps) {
  const [currency, setCurrency] = useState("USD");
  const [billingCycle, setBillingCycle] = useState("Monthly");
  const [amount, setAmount] = useState(0);

  // Build billing cycle options based on plan settings
  const cycleOptions: GenericSelectOption[] = [];
  if (plan.allowMonthly)
    cycleOptions.push({
      value: "Monthly",
      label: t("entitlements.tenantPlans.monthly"),
    });
  if (plan.allowYearly)
    cycleOptions.push({ value: "Yearly", label: t("entitlements.tenantPlans.yearly") });
  if (plan.allowLifetime)
    cycleOptions.push({
      value: "Lifetime",
      label: t("entitlements.tenantPlans.lifetime"),
    });

  // Fallback if no cycles configured
  if (cycleOptions.length === 0) {
    cycleOptions.push(
      { value: "Monthly", label: t("entitlements.tenantPlans.monthly") },
      { value: "Yearly", label: t("entitlements.tenantPlans.yearly") }
    );
  }

  const handleAdd = () => {
    if (amount <= 0) return;
    onAdd({
      currency,
      billingCycle,
      amount,
      isPromotional: false,
    });
  };

  return (
    <Card className="border-dashed border-[color:color-mix(in_srgb,var(--nx-accent)_30%,transparent)]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <DollarSign className="h-4 w-4 text-nx-accent" aria-hidden="true" />
          {t("entitlements.tenantPlans.addPrice")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="space-y-1.5">
            <Label>{t("entitlements.tenantPlans.currency")}</Label>
            <GenericSelect
              type="single"
              options={CURRENCY_OPTIONS}
              value={currency}
              onValueChange={(v: string | string[]) =>
                setCurrency(typeof v === "string" ? v : v[0])
              }
              placeholder={t("entitlements.tenantPlans.selectCurrency")}
            />
          </div>

          <div className="space-y-1.5">
            <Label>{t("entitlements.tenantPlans.billingCycles")}</Label>
            <GenericSelect
              type="single"
              options={cycleOptions}
              value={billingCycle}
              onValueChange={(v: string | string[]) =>
                setBillingCycle(typeof v === "string" ? v : v[0])
              }
              placeholder={t("entitlements.tenantPlans.selectBillingCycle")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="add-price-amount">{t("entitlements.tenantPlans.amount")}</Label>
            <Input
              id="add-price-amount"
              type="number"
              value={amount || ""}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              min={0}
              step={0.01}
              placeholder="0.00"
            />
          </div>

          <div className="flex items-end gap-2">
            <Button size="sm" onClick={handleAdd} disabled={amount <= 0}>
              <Check className="me-1 h-4 w-4" aria-hidden="true" />
              {t("common.add")}
            </Button>
            <Button size="sm" variant="ghost" onClick={onCancel}>
              <X className="me-1 h-4 w-4" aria-hidden="true" />
              {t("common.cancel")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
