export * from "../models/crm-overview.types";
import type {
  CrmKpiStat,
  CrmOverviewData,
  CrmPipelineOverview,
  CrmRecentDeal,
} from "../models/crm-overview.types";

/**
 * Rich domain entity wrapping CrmOverviewData with computed invariants.
 */
export class OverviewEntity {
  constructor(private readonly data: CrmOverviewData) {}

  /** Executive KPI cards for the CRM command center. */
  get stats(): CrmKpiStat[] {
    return this.data.stats;
  }

  /** Commercial pipeline velocity breakdown. */
  get pipeline(): CrmPipelineOverview {
    return this.data.pipeline;
  }

  /** Scoped recent commercial deals. */
  get recentDeals(): CrmRecentDeal[] {
    return this.data.recentDeals;
  }

  /** Total active deals in the primary pipeline. */
  get totalDeals(): number {
    return this.data.pipeline.totalDeals;
  }

  /** Total monetary value of open pipeline deals. */
  get totalPipelineValue(): number {
    return this.data.pipeline.totalPipelineValue;
  }

  /** Serializes entity back into a plain CrmOverviewData object. */
  toDto(): CrmOverviewData {
    return this.data;
  }

  /**
   * Returns a new OverviewEntity instance with updated properties.
   */
  copyWith(updates: Partial<CrmOverviewData>): OverviewEntity {
    return new OverviewEntity({ ...this.data, ...updates });
  }
}
