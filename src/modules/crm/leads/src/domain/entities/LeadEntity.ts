export * from "../models/crm-lead.types";
import type { CrmLead } from "../models/crm-lead.types";

/**
 * Rich domain entity wrapping CrmLead data with computed invariants.
 */
export class LeadEntity {
  constructor(private readonly data: CrmLead) {}

  get id(): string {
    return this.data.id;
  }

  get title(): string {
    return this.data.title;
  }

  get status(): CrmLead["status"] {
    return this.data.status;
  }

  /**
   * Returns a new LeadEntity instance with updated properties.
   */
  copyWith(updates: Partial<CrmLead>): LeadEntity {
    return new LeadEntity({ ...this.data, ...updates });
  }
}
