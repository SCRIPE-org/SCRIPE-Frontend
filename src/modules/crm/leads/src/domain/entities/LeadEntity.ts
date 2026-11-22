export * from "../models/crm-lead.types";
import type { CrmLead } from "../models/crm-lead.types";

/**
 * Rich domain entity wrapping CrmLead data with computed invariants.
 */
export class LeadEntity {
  constructor(private readonly data: CrmLead) {}

  /** Unique identifier of the CRM Lead record. */
  get id(): string {
    return this.data.id;
  }

  /** Display title or subject of the commercial Lead. */
  get title(): string {
    return this.data.title;
  }

  /** Current qualification lifecycle status of the Lead. */
  get status(): CrmLead["status"] {
    return this.data.status;
  }

  /**
   * Returns a new LeadEntity instance with updated properties.
   */
  copyWith(updates: Partial<CrmLead>): LeadEntity {
    return new LeadEntity({ ...this.data, ...updates });
  }

  /** Serializes back to a plain `CrmLead` domain model. */
  toDto(): CrmLead {
    return this.data;
  }
}
