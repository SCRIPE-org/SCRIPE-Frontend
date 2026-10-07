"use client";

import { useState } from "react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { useI18n } from "@core/providers/i18n-provider";
import type { useResourceDetailViewModel } from "../viewmodels/useResourceDetailViewModel";

interface Props {
  vm: ReturnType<typeof useResourceDetailViewModel>;
}

export function ResourcePricingTab({ vm }: Props) {
  const { t } = useI18n();

  const [unitPrice, setUnitPrice] = useState<number>(vm.priceConfig?.unitPrice ?? 800);
  const [currencyCode, setCurrencyCode] = useState<string>(
    vm.priceConfig?.currencyCode ?? "EGP"
  );
  const [taxCategoryId, setTaxCategoryId] = useState<string>(
    vm.priceConfig?.taxCategoryId ?? ""
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void vm.updatePricing({
      unitPrice,
      currencyCode,
      taxCategoryId: taxCategoryId || null,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("resources.pricing.title", { defaultValue: "Court Rental Pricing" })}</CardTitle>
        <CardDescription>
          {t("resources.pricing.description", {
            defaultValue: "Standard authoritative price per booking slot from Catalog Pricing.",
          })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="res-price">
                {t("resources.pricing.pricePerSlot", { defaultValue: "Price per Slot" })}
              </Label>
              <div className="relative">
                <Input
                  id="res-price"
                  type="number"
                  min={0}
                  step={10}
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(Number(e.target.value) || 0)}
                  className="pr-12 text-sm font-semibold"
                  required
                />
                <span className="absolute right-3 top-2 text-xs font-bold text-nx-ink-3">
                  {currencyCode}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="res-curr">
                {t("resources.pricing.currency", { defaultValue: "Currency" })}
              </Label>
              <select
                id="res-curr"
                className="w-full h-9 rounded-nx-md border border-nx-line bg-nx-surface px-3 py-1.5 text-xs font-semibold text-nx-ink"
                value={currencyCode}
                onChange={(e) => setCurrencyCode(e.target.value)}
              >
                <option value="EGP">EGP (Egyptian Pound)</option>
                <option value="SAR">SAR (Saudi Riyal)</option>
                <option value="AED">AED (UAE Dirham)</option>
                <option value="USD">USD (US Dollar)</option>
                <option value="EUR">EUR (Euro)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="res-tax">
              {t("resources.pricing.taxCategory", { defaultValue: "Tax Category" })}
            </Label>
            <select
              id="res-tax"
              className="w-full rounded-nx-md border border-nx-line bg-nx-surface px-3 py-2 text-xs font-medium text-nx-ink"
              value={taxCategoryId}
              onChange={(e) => setTaxCategoryId(e.target.value)}
            >
              <option value="">
                {t("resources.pricing.noTax", { defaultValue: "Standard (No extra tax)" })}
              </option>
              {vm.taxCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({cat.ratePercentage}%)
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={vm.saving} loading={vm.saving}>
              {t("resources.pricing.save", { defaultValue: "Save Pricing" })}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
