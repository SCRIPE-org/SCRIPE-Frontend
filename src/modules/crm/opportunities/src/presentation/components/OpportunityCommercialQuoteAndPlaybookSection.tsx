"use client";

import React, { useState } from "react";
import { FileSpreadsheet, Plus, ShieldAlert, Trash2 } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import { Input } from "@core/ui/input";
import {
  useCrmCurrency,
  useCrmSettingsStore,
  type CrmDealCommercialPackage,
  type CrmDealQuoteLineItem,
} from "@modules/crm";
import type { CrmOpportunity, CrmOpportunityStageHistory } from "../../domain/entities/OpportunityEntity";
import { buildDefaultQuoteItems, computeQuoteFinancialTotals } from "../utils/quoteCalculationHelpers";
import { OpportunityStagePlaybookCard } from "./OpportunityStagePlaybookCard";
import { OpportunityQuoteTotalsFooter } from "./OpportunityQuoteTotalsFooter";

export type QuoteLineItem = CrmDealQuoteLineItem;

export function OpportunityCommercialQuoteAndPlaybookSection({
  opp,
  isRtl = false,
  mode = "all",
}: {
  opp: CrmOpportunity;
  isRtl?: boolean;
  stageHistory?: CrmOpportunityStageHistory[];
  mode?: "all" | "quote" | "playbook";
}) {
  const { t } = useI18n();
  const { baseCurrency, convertAmount } = useCrmCurrency();
  const persistedPkg = useCrmSettingsStore((s) => s.dealCommercialPackages?.[opp.id]);
  const setDealCommercialPackage = useCrmSettingsStore((s) => s.setDealCommercialPackage);

  const quoteItems =
    persistedPkg?.quoteItems && persistedPkg.quoteItems.length > 0
      ? persistedPkg.quoteItems
      : buildDefaultQuoteItems(opp.estimatedAmount, t);
  const venueHoldStatus = persistedPkg?.venueHoldStatus ?? "idle";
  const academyCohortStatus = persistedPkg?.academyCohortStatus ?? "idle";

  const [newItemName, setNewItemName] = useState("");
  const [newItemQty, setNewItemQty] = useState("1");
  const [newItemPrice, setNewItemPrice] = useState("25000");
  const [newItemDiscount, setNewItemDiscount] = useState("");
  const [taxRatePct, setTaxRatePct] = useState("0");

  const persistPackage = (next: CrmDealCommercialPackage) => {
    setDealCommercialPackage(opp.id, next);
  };

  const handleAddQuoteItem = () => {
    if (!newItemName.trim()) return;
    const nextItems: QuoteLineItem[] = [
      ...quoteItems,
      {
        id: `q-${Date.now()}`,
        itemName: newItemName.trim(),
        quantity: Math.max(1, Math.round(Number(newItemQty) || 1)),
        unitPrice: Math.max(0, Number(newItemPrice) || 0),
        discountPct: Math.max(0, Math.min(100, Number(newItemDiscount) || 0)),
      },
    ];
    persistPackage({ quoteItems: nextItems, venueHoldStatus, academyCohortStatus });
    setNewItemName("");
    setNewItemQty("1");
    setNewItemDiscount("");
  };

  const handleUpdateItemField = (
    itemId: string,
    field: "quantity" | "unitPrice" | "discountPct",
    rawValue: string
  ) => {
    const parsed = Number(rawValue);
    const sanitized = !Number.isFinite(parsed)
      ? 0
      : field === "quantity"
        ? Math.max(1, Math.round(parsed))
        : field === "discountPct"
          ? Math.max(0, Math.min(100, parsed))
          : Math.max(0, parsed);
    const nextItems = quoteItems.map((it) => (it.id === itemId ? { ...it, [field]: sanitized } : it));
    persistPackage({ quoteItems: nextItems, venueHoldStatus, academyCohortStatus });
  };

  const handleRemoveQuoteItem = (itemId: string) => {
    const nextItems = quoteItems.filter((it) => it.id !== itemId);
    persistPackage({ quoteItems: nextItems, venueHoldStatus, academyCohortStatus });
  };

  const { grossSubtotal, discountAmount, taxAmount, grandTotal, requiresDiscountApproval } =
    computeQuoteFinancialTotals(quoteItems, taxRatePct);
  const showConvertedTotal = (opp.currencyCode || "SAR").toUpperCase() !== baseCurrency.toUpperCase();
  const convertedTotal = showConvertedTotal
    ? Math.round(convertAmount(grandTotal, opp.currencyCode || "SAR", baseCurrency))
    : null;

  const showQuote = mode === "all" || mode === "quote";
  const showPlaybook = mode === "all" || mode === "playbook";

  return (
    <>
      {showQuote && (
        <Card className="p-4 border-nx-line bg-nx-surface space-y-3" data-testid="deal-quote-builder-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="size-4 text-info" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-nx-ink">{t("crmOpportunities.commercialSuite.quoteTitle")}</h3>
            </div>
            <span className="text-xs font-mono font-bold text-nx-ink tabular-nums">
              {opp.currencyCode} {Math.round(grandTotal).toLocaleString()}
            </span>
          </div>

          {requiresDiscountApproval && (
            <div className="rounded-md border border-warning-strong/40 bg-warning/10 px-2.5 py-1.5 flex items-center gap-2 text-[11px] text-nx-warning-strong font-semibold" data-testid="quote-discount-approval-gate">
              <ShieldAlert className="size-3.5 shrink-0" />
              <span>{t("crmOpportunities.commercialSuite.discountApprovalWarning")}</span>
            </div>
          )}

          <div className="space-y-1.5">
            {quoteItems.map((item) => {
              const lineTotal = Math.round(item.quantity * item.unitPrice * (1 - item.discountPct / 100));
              return (
                <div key={item.id} className="rounded-md border border-nx-line bg-nx-raised/40 px-2.5 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-medium text-nx-ink truncate flex-1 min-w-32">{item.itemName}</span>
                  <div className="flex items-center gap-1.5 shrink-0 font-mono text-[11px]">
                    <Input
                      type="number"
                      min={1}
                      value={String(item.quantity)}
                      onChange={(e) => handleUpdateItemField(item.id, "quantity", e.target.value)}
                      aria-label={t("crmOpportunities.commercialSuite.qtyPlaceholder")}
                      className="h-6 w-14 text-[11px] px-1.5 text-center"
                    />
                    <Input
                      type="number"
                      min={0}
                      value={String(item.unitPrice)}
                      onChange={(e) => handleUpdateItemField(item.id, "unitPrice", e.target.value)}
                      aria-label={t("crmOpportunities.commercialSuite.unitPricePlaceholder")}
                      className="h-6 w-24 text-[11px] px-1.5 text-end"
                    />
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={String(item.discountPct)}
                      onChange={(e) => handleUpdateItemField(item.id, "discountPct", e.target.value)}
                      aria-label={t("crmOpportunities.commercialSuite.discountPlaceholder")}
                      className="h-6 w-14 text-[11px] px-1.5 text-center"
                    />
                    <Badge variant="outline" className="text-[10px] tabular-nums">
                      {opp.currencyCode} {lineTotal.toLocaleString()}
                    </Badge>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-destructive"
                      onClick={() => handleRemoveQuoteItem(item.id)}
                      aria-label={t("crmOpportunities.commercialSuite.removeItemLabel")}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-1.5 pt-1">
            <Input
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder={t("crmOpportunities.commercialSuite.lineItemPlaceholder")}
              className="h-7 text-xs sm:col-span-2"
              data-testid="quote-item-name-input"
            />
            <Input
              type="number"
              min={1}
              value={newItemQty}
              onChange={(e) => setNewItemQty(e.target.value)}
              placeholder={t("crmOpportunities.commercialSuite.qtyPlaceholder")}
              className="h-7 text-xs font-mono"
              data-testid="quote-item-qty-input"
            />
            <Input
              type="number"
              min={0}
              value={newItemPrice}
              onChange={(e) => setNewItemPrice(e.target.value)}
              placeholder={t("crmOpportunities.commercialSuite.unitPricePlaceholder")}
              className="h-7 text-xs font-mono"
              data-testid="quote-item-price-input"
            />
            <div className="flex items-center gap-1">
              <Input
                type="number"
                min={0}
                max={100}
                value={newItemDiscount}
                onChange={(e) => setNewItemDiscount(e.target.value)}
                placeholder={t("crmOpportunities.commercialSuite.discountPlaceholder")}
                className="h-7 text-xs font-mono"
                data-testid="quote-item-discount-input"
              />
              <Button size="sm" variant="outline" className="h-7 px-2 text-xs shrink-0" onClick={handleAddQuoteItem} data-testid="quote-add-item-btn">
                <Plus className="size-3 me-1" />{t("crmOpportunities.commercialSuite.addItemBtn")}
              </Button>
            </div>
          </div>

          <OpportunityQuoteTotalsFooter
            currencyCode={opp.currencyCode}
            baseCurrency={baseCurrency}
            grossSubtotal={grossSubtotal}
            discountAmount={discountAmount}
            taxRatePct={taxRatePct}
            onTaxRateChange={setTaxRatePct}
            taxAmount={taxAmount}
            grandTotal={grandTotal}
            convertedTotal={convertedTotal}
            t={t}
          />
        </Card>
      )}

      {showPlaybook && (
        <OpportunityStagePlaybookCard
          opp={opp}
          isRtl={isRtl}
          venueHoldStatus={venueHoldStatus}
          academyCohortStatus={academyCohortStatus}
          onVenueHold={() => persistPackage({ quoteItems, venueHoldStatus: "reserved", academyCohortStatus })}
          onAcademyCohort={() => persistPackage({ quoteItems, venueHoldStatus, academyCohortStatus: "provisioned" })}
        />
      )}
    </>
  );
}
