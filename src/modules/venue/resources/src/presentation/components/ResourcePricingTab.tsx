"use client";

import { useState } from "react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { useI18n } from "@core/providers/i18n-provider";
import type { useResourceDetailViewModel } from "../viewmodels/useResourceDetailViewModel";

interface Props {
  vm: ReturnType<typeof useResourceDetailViewModel>;
}

/**
 * Documentation for module export
 */
export function ResourcePricingTab({ vm }: Props) {
  const { t } = useI18n();

  const [unitPrice, setUnitPrice] = useState<number>(vm.priceConfig?.unitPrice ?? 800);
  const [currencyCode, setCurrencyCode] = useState<string>(vm.priceConfig?.currencyCode ?? "EGP");
  const [taxCategoryId, setTaxCategoryId] = useState<string>(vm.priceConfig?.taxCategoryId ?? "");

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
        <CardTitle>{t("resources.pricing.title", { defaultValue: "Pricing" })}</CardTitle>
        <CardDescription>
          {t("resources.pricing.description", {
            defaultValue: "Standard authoritative price per booking slot from Catalog Pricing.",
          })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
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
                  className="pr-12 rtl:pr-3 rtl:pl-12 text-sm font-semibold"
                  required
                />
                <span className="absolute right-3 rtl:right-auto rtl:left-3 top-2 text-xs font-bold text-nx-ink-3">
                  {currencyCode}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="res-curr">
                {t("resources.pricing.currency", { defaultValue: "Currency" })}
              </Label>
              <Select value={currencyCode} onValueChange={setCurrencyCode}>
                <SelectTrigger id="res-curr" className="h-9 w-full text-xs font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EGP">{t("resources.pricing.currencies.EGP", { defaultValue: "EGP (Egyptian Pound)" })}</SelectItem>
                  <SelectItem value="SAR">{t("resources.pricing.currencies.SAR", { defaultValue: "SAR (Saudi Riyal)" })}</SelectItem>
                  <SelectItem value="AED">{t("resources.pricing.currencies.AED", { defaultValue: "AED (UAE Dirham)" })}</SelectItem>
                  <SelectItem value="USD">{t("resources.pricing.currencies.USD", { defaultValue: "USD (US Dollar)" })}</SelectItem>
                  <SelectItem value="EUR">{t("resources.pricing.currencies.EUR", { defaultValue: "EUR (Euro)" })}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="res-tax">
              {t("resources.pricing.taxCategory", { defaultValue: "Tax Category" })}
            </Label>
            <Select value={taxCategoryId || "none"} onValueChange={(value) => setTaxCategoryId(value === "none" ? "" : value)}>
              <SelectTrigger id="res-tax" className="w-full text-xs font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  {t("resources.pricing.noTax", { defaultValue: "Standard (No extra tax)" })}
                </SelectItem>
                {vm.taxCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name} ({cat.ratePercentage}%)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
