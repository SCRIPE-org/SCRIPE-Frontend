export * from "../models/crm-overview.types";
import type { CrmOverviewData } from "../models/crm-overview.types";

/**
 * Rich domain entity wrapping CrmOverviewData with computed invariants.
 */
export class OverviewEntity {
  constructor(private readonly data: CrmOverviewData) {}

  get totalDeals(): number {
    return this.data.pipeline.totalDeals;
  }

  get totalPipelineValue(): number {
    return this.data.pipeline.totalPipelineValue;
  }

  /**
   * Returns a new OverviewEntity instance with updated properties.
   */
  copyWith(updates: Partial<CrmOverviewData>): OverviewEntity {
    return new OverviewEntity({ ...this.data, ...updates });
  }
}
