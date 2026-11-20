"use client";

import type { CrmDealQuoteLineItem } from "../../domain/models/crm-opportunity-quote.types";

/** Builds baseline quote line items from an opportunity's estimated amount when none are persisted yet. */
export function buildDefaultQuoteItems(
  estimatedAmount: number | string | null | undefined,
  t: (key: string) => string
): CrmDealQuoteLineItem[] {
  const base = Number(estimatedAmount) || 100000;
  return [
    {
      id: "q-1",
      itemName: t("crmOpportunities.commercialSuite.quoteItemStadium"),
      quantity: 1,
      unitPrice: Math.max(25000, Math.round(base * 0.6)),
      discountPct: 5,
    },
    {
      id: "q-2",
      itemName: t("crmOpportunities.commercialSuite.quoteItemAcademy"),
      quantity: 1,
      unitPrice: Math.max(15000, Math.round(base * 0.4)),
      discountPct: 0,
    },
  ];
}

/** Computes quote gross subtotal, discount, tax, and net grand total safely. */
export function computeQuoteFinancialTotals(
  quoteItems: readonly CrmDealQuoteLineItem[],
  taxRateInput: string
) {
  const grossSubtotal = quoteItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  const netAfterDiscount = quoteItems.reduce(
    (acc, item) => acc + item.quantity * item.unitPrice * (1 - item.discountPct / 100),
    0
  );
  const discountAmount = Math.max(0, grossSubtotal - netAfterDiscount);
  const safeTaxRate = Math.max(0, Math.min(100, Number(taxRateInput) || 0));
  const taxAmount = netAfterDiscount * (safeTaxRate / 100);
  const grandTotal = netAfterDiscount + taxAmount;
  const requiresDiscountApproval = quoteItems.some((i) => i.discountPct > 15);
  return { grossSubtotal, discountAmount, taxAmount, grandTotal, requiresDiscountApproval };
}
