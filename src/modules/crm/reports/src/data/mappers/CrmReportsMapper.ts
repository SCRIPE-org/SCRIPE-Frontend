import { CrmReportEntity, type CrmCurrencyPipelineBreakdown } from "../../domain/entities/CrmReportEntity";
import type { CrmPipelineReportRawDto } from "../models/CrmReportsModel";

/** Mapper transforming raw backend report DTOs into `CrmReportEntity` domain instances. */
export class CrmReportsMapper {
  /** Maps a raw pipeline report DTO to a normalized `CrmReportEntity`. */
  static toEntity(raw: CrmPipelineReportRawDto): CrmReportEntity {
    const currencyBreakdowns: CrmCurrencyPipelineBreakdown[] = Array.isArray(raw.currencyBreakdowns)
      ? raw.currencyBreakdowns.map((b) => ({
          currencyCode: b.currencyCode || "SAR",
          openDealsCount: b.openDealsCount ?? 0,
          wonDealsCount: b.wonDealsCount ?? 0,
          lostDealsCount: b.lostDealsCount ?? 0,
          totalOpenValue: b.totalOpenValue ?? b.totalOpenAmount ?? 0,
          totalWeightedForecastValue: b.totalWeightedForecastValue ?? b.totalWeightedAmount ?? 0,
          totalWonValue: b.totalWonValue ?? b.totalWonAmount ?? 0,
          totalLostValue: b.totalLostValue ?? b.totalLostAmount ?? 0,
          stages: Array.isArray(b.stages)
            ? b.stages.map((s) => ({
                stageKey: s.stageKey ?? "default.discovery",
                labelEn: s.labelEn ?? s.stageKey ?? "Stage",
                labelAr: s.labelAr ?? null,
                sortOrder: s.sortOrder ?? 0,
                probabilityPercent: s.probabilityPercent ?? s.winProbabilityPercent ?? 0,
                requiresVerifiedParty: Boolean(s.requiresVerifiedParty),
                dealCount: s.dealCount ?? 0,
                totalAmount: s.totalAmount ?? 0,
                weightedForecastAmount: s.weightedForecastAmount ?? s.weightedAmount ?? 0,
              }))
            : [],
        }))
      : [];

    const wonCount = raw.winLoss?.wonCount ?? 0;
    const lostCount = raw.winLoss?.lostCount ?? 0;

    return new CrmReportEntity({
      generatedAtUtc: raw.generatedAtUtc || new Date().toISOString(),
      pipelineId: raw.pipelineId,
      pipelineCode: raw.pipelineCode || "default",
      pipelineNameEn: raw.pipelineNameEn || "Standard Commercial Pipeline",
      pipelineNameAr: raw.pipelineNameAr ?? null,
      isAmountMasked: Boolean(raw.isAmountMasked),
      currencyBreakdowns,
      leadFunnel: {
        totalLeads: raw.leadFunnel?.totalLeads ?? 0,
        newCount: raw.leadFunnel?.newCount ?? 0,
        workingCount: raw.leadFunnel?.workingCount ?? 0,
        qualifiedCount: raw.leadFunnel?.qualifiedCount ?? 0,
        convertedCount: raw.leadFunnel?.convertedCount ?? 0,
        disqualifiedCount: raw.leadFunnel?.disqualifiedCount ?? 0,
        qualificationRatePercent: raw.leadFunnel?.qualificationRatePercent ?? 0,
        conversionRatePercent: raw.leadFunnel?.conversionRatePercent ?? 0,
      },
      winLoss: {
        totalClosedDeals: raw.winLoss?.totalClosedDeals ?? raw.winLoss?.totalClosedCount ?? wonCount + lostCount,
        wonCount,
        lostCount,
        openCount:
          raw.winLoss?.openCount ??
          currencyBreakdowns.reduce((acc, curr) => acc + curr.openDealsCount, 0),
        winRatePercent: raw.winLoss?.winRatePercent ?? 0,
        avgCycleDays: raw.winLoss?.avgCycleDays ?? raw.winLoss?.averageDealCycleDays ?? 0,
      },
      activities: {
        totalActivitiesCount: raw.activities?.totalActivitiesCount ?? 0,
        notesCount: raw.activities?.notesCount ?? 0,
        callsCount: raw.activities?.callsCount ?? 0,
        meetingsCount: raw.activities?.meetingsCount ?? 0,
        communicationsSentCount: raw.activities?.communicationsSentCount ?? 0,
        followUpsCreatedCount: raw.activities?.followUpsCreatedCount ?? raw.activities?.followUpsScheduledCount ?? 0,
      },
    });
  }
}
