/** Stage-level commercial forecast bucket. */
export interface CrmStageReportItem {
  stageKey: string;
  labelEn: string;
  labelAr: string | null;
  sortOrder: number;
  probabilityPercent: number;
  requiresVerifiedParty: boolean;
  dealCount: number;
  totalAmount?: number | null;
  weightedForecastAmount?: number | null;
}

/** Alias preserved for legacy callers. */
export type CrmStageReportBucket = CrmStageReportItem;

/** Currency-isolated pipeline report breakdown. */
export interface CrmCurrencyPipelineBreakdown {
  currencyCode: string;
  openDealsCount: number;
  wonDealsCount: number;
  lostDealsCount: number;
  totalOpenValue?: number | null;
  totalWeightedForecastValue?: number | null;
  totalWonValue?: number | null;
  totalLostValue?: number | null;
  stages: CrmStageReportItem[];
}

/** Lead conversion funnel telemetry. */
export interface CrmLeadFunnelReport {
  totalLeads: number;
  newCount: number;
  workingCount: number;
  qualifiedCount: number;
  convertedCount: number;
  disqualifiedCount: number;
  qualificationRatePercent: number;
  conversionRatePercent: number;
}

/** Win/loss deal velocity summary. */
export interface CrmWinLossSummary {
  totalClosedDeals: number;
  wonCount: number;
  lostCount: number;
  openCount?: number;
  winRatePercent: number;
  avgCycleDays: number;
}

/** Commercial activity touchpoint summary. */
export interface CrmActivitySummary {
  totalActivitiesCount: number;
  notesCount?: number;
  callsCount: number;
  meetingsCount: number;
  communicationsSentCount: number;
  followUpsCreatedCount: number;
}

/** Normalized CRM pipeline analytics report data shape. */
export interface CrmPipelineReport {
  generatedAtUtc: string;
  pipelineId?: string;
  pipelineCode?: string;
  pipelineNameEn: string;
  pipelineNameAr: string | null;
  isAmountMasked: boolean;
  currencyBreakdowns: CrmCurrencyPipelineBreakdown[];
  leadFunnel: CrmLeadFunnelReport;
  winLoss: CrmWinLossSummary;
  activities: CrmActivitySummary;
}

/** Alias preserved for report components. */
export type CrmCommercialReport = CrmPipelineReport;

/**
 * Rich Domain Entity representing the CRM commercial pipeline & funnel analytics report.
 */
export class CrmReportEntity implements CrmPipelineReport {
  constructor(private readonly data: CrmPipelineReport) {}

  /** ISO-8601 UTC timestamp when the report snapshot was generated. */
  get generatedAtUtc(): string {
    return this.data.generatedAtUtc;
  }

  /** Optional pipeline identifier scoping the report. */
  get pipelineId(): string | undefined {
    return this.data.pipelineId;
  }

  /** Optional pipeline code scoping the report. */
  get pipelineCode(): string | undefined {
    return this.data.pipelineCode;
  }

  /** English display name of the reported commercial pipeline. */
  get pipelineNameEn(): string {
    return this.data.pipelineNameEn;
  }

  /** Optional Arabic display name of the reported commercial pipeline. */
  get pipelineNameAr(): string | null {
    return this.data.pipelineNameAr;
  }

  /** Whether monetary amounts are masked for the current actor's permissions. */
  get isAmountMasked(): boolean {
    return this.data.isAmountMasked;
  }

  /** Currency-isolated pipeline forecast breakdowns. */
  get currencyBreakdowns(): CrmCurrencyPipelineBreakdown[] {
    return this.data.currencyBreakdowns;
  }

  /** Lead qualification and conversion funnel telemetry. */
  get leadFunnel(): CrmLeadFunnelReport {
    return this.data.leadFunnel;
  }

  /** Closed-deal win/loss rate and sales cycle summary. */
  get winLoss(): CrmWinLossSummary {
    return this.data.winLoss;
  }

  /** Commercial activity touchpoint counts across the reporting window. */
  get activities(): CrmActivitySummary {
    return this.data.activities;
  }

  /** Total deal count across all currency buckets. */
  get totalDealsCount(): number {
    return this.data.currencyBreakdowns.reduce(
      (sum, b) => sum + b.openDealsCount + b.wonDealsCount + b.lostDealsCount,
      0
    );
  }

  /** Indicates whether at least one currency bucket is present. */
  get hasBreakdowns(): boolean {
    return this.data.currencyBreakdowns.length > 0;
  }

  /** Returns a new `CrmReportEntity` with merged partial updates. */
  copyWith(updates: Partial<CrmPipelineReport>): CrmReportEntity {
    return new CrmReportEntity({ ...this.data, ...updates });
  }
}
