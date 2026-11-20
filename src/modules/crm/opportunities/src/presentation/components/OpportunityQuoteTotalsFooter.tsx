"use client";

import { Input } from "@core/ui/input";

interface OpportunityQuoteTotalsFooterProps {
  currencyCode: string;
  baseCurrency: string;
  grossSubtotal: number;
  discountAmount: number;
  taxRatePct: string;
  onTaxRateChange: (val: string) => void;
  taxAmount: number;
  grandTotal: number;
  convertedTotal: number | null;
  t: (key: string) => string;
}

/** Displays subtotal, discount, tax rate editor, grand total, and base-currency conversion for Quote Builder. */
export function OpportunityQuoteTotalsFooter({
  currencyCode,
  baseCurrency,
  grossSubtotal,
  discountAmount,
  taxRatePct,
  onTaxRateChange,
  taxAmount,
  grandTotal,
  convertedTotal,
  t,
}: OpportunityQuoteTotalsFooterProps) {
  return (
    <div className="border-t border-nx-line pt-2 space-y-1 text-[11px] font-mono tabular-nums">
      <div className="flex items-center justify-between text-nx-ink-2">
        <span>{t("crmOpportunities.commercialSuite.subtotalLabel")}</span>
        <span>{currencyCode} {Math.round(grossSubtotal).toLocaleString()}</span>
      </div>
      {discountAmount > 0 && (
        <div className="flex items-center justify-between text-nx-warning-strong">
          <span>{t("crmOpportunities.commercialSuite.discountLabel")}</span>
          <span>-{currencyCode} {Math.round(discountAmount).toLocaleString()}</span>
        </div>
      )}
      <div className="flex items-center justify-between text-nx-ink-2">
        <span className="flex items-center gap-1.5">
          {t("crmOpportunities.commercialSuite.taxRateLabel")}
          <Input
            type="number"
            min={0}
            max={100}
            value={taxRatePct}
            onChange={(e) => onTaxRateChange(e.target.value)}
            className="h-5 w-14 text-[10px] px-1"
          />
        </span>
        <span>{currencyCode} {Math.round(taxAmount).toLocaleString()}</span>
      </div>
      <div className="flex items-center justify-between font-bold text-nx-ink pt-1 border-t border-nx-line/60">
        <span>{t("crmOpportunities.commercialSuite.netTotalLabel")}</span>
        <span>{currencyCode} {Math.round(grandTotal).toLocaleString()}</span>
      </div>
      {convertedTotal !== null && (
        <div className="flex items-center justify-between text-nx-ink-3 text-[10px]">
          <span>{t("crmOpportunities.commercialSuite.convertedTotalLabel")}</span>
          <span>{baseCurrency} {convertedTotal.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}
