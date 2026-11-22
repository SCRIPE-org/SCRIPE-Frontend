/** Commercial quote line item scoped to a specific opportunity. */
export interface CrmDealQuoteLineItem {
  id: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  discountPct: number;
}

/** Opportunity-scoped commercial package (quote items + Venue/Academy handoff status). */
export interface CrmDealCommercialPackage {
  quoteItems: CrmDealQuoteLineItem[];
  venueHoldStatus: "idle" | "reserved";
  academyCohortStatus: "idle" | "provisioned";
}
