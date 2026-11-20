"use client";

import { ArrowRightLeft } from "lucide-react";

interface OpportunityConversionPreviewBannerProps {
  baseCurrency: string;
  formattedConverted: string;
  rateSummary: string;
  label: string;
}

/** Displays base-currency conversion preview when a new Opportunity uses a foreign currency. */
export function OpportunityConversionPreviewBanner({
  baseCurrency,
  formattedConverted,
  rateSummary,
  label,
}: OpportunityConversionPreviewBannerProps) {
  return (
    <div
      data-testid="create-opp-conversion-preview"
      className="flex items-center justify-between rounded-nx-md border border-nx-line bg-nx-raised px-3 py-2 text-xs"
    >
      <div className="flex items-center gap-2 text-nx-ink-2">
        <ArrowRightLeft className="size-3.5 text-nx-accent shrink-0" />
        <span>
          {label} (<strong>{baseCurrency}</strong>):
        </span>
      </div>
      <div className="text-end font-mono">
        <span className="font-bold text-nx-accent">{formattedConverted}</span>
        <span className="ms-2 text-[10px] text-nx-ink-3">({rateSummary})</span>
      </div>
    </div>
  );
}
