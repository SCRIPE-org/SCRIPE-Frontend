export * from "../models/crm-opportunity.types";
import type { CrmOpportunity, DealKind, OpportunityStatus } from "../models/crm-opportunity.types";

/** Domain entity wrapper providing computed lifecycle helpers for `CrmOpportunity`. */
export class OpportunityEntity {
  constructor(public readonly data: CrmOpportunity) {}

  /** Unique identifier of the Opportunity record. */
  get id(): string { return this.data.id; }
  /** Commercial deal title. */
  get title(): string { return this.data.title; }
  /** Current pipeline stage key. */
  get stageKey(): string { return this.data.stageKey; }
  /** Current lifecycle outcome status (`Open`, `Won`, or `Lost`). */
  get status(): OpportunityStatus { return this.data.status; }
  /** Estimated commercial deal amount, if specified. */
  get estimatedAmount(): number | null | undefined { return this.data.estimatedAmount; }
  /** ISO currency code associated with the deal amount. */
  get currencyCode(): string { return this.data.currencyCode; }
  /** Commercial classification of the deal (`NewBusiness`, `Expansion`, etc.). */
  get dealKind(): DealKind { return this.data.dealKind; }
  /** Whether the deal is currently active and open. */
  get isOpen(): boolean { return this.data.status === "Open"; }
  /** Whether the deal has been closed as won. */
  get isWon(): boolean { return this.data.status === "Won"; }
  /** Whether the deal has been closed as lost. */
  get isLost(): boolean { return this.data.status === "Lost"; }

  /** Returns a new `OpportunityEntity` with merged partial updates. */
  copyWith(updates: Partial<CrmOpportunity>): OpportunityEntity {
    return new OpportunityEntity({ ...this.data, ...updates });
  }
}
