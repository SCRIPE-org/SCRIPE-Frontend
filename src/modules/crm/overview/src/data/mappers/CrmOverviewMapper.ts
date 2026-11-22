/**
 * CRM Overview Data Mapper
 * Converts between raw backend DTO payloads and `OverviewEntity`.
 */

import {
  OverviewEntity,
  type CrmOverviewData,
  type CrmRecentDeal,
  type CrmStageKey,
  type CrmStageSummary,
} from "../../domain/entities/OverviewEntity";
import type { CrmOverviewCompositeDto, RawOverviewOpportunityItemDto } from "../models/OverviewModel";

function isCompositeDto(
  dto: CrmOverviewCompositeDto | CrmOverviewData
): dto is CrmOverviewCompositeDto {
  return "pipelineData" in dto || "opportunitiesData" in dto || "reportData" in dto;
}

/**
 * Mapper for converting Overview composite or plain DTOs to `OverviewEntity`.
 */
export class CrmOverviewMapper {
  /**
   * Convert raw service DTO (or pre-normalized overview data) into `OverviewEntity`.
   *
   * @param dto - Composite raw API DTO or pre-normalized `CrmOverviewData`.
   * @returns Hydrated `OverviewEntity`.
   */
  static toEntity(dto: CrmOverviewCompositeDto | CrmOverviewData): OverviewEntity {
    if (!isCompositeDto(dto)) {
      return new OverviewEntity(dto);
    }

    const items: RawOverviewOpportunityItemDto[] = Array.isArray(dto.opportunitiesData?.items)
      ? dto.opportunitiesData.items
      : [];
    const primaryBucket = dto.reportData?.currencyBreakdowns?.[0] ?? null;
    const currency = primaryBucket?.currencyCode || items[0]?.currencyCode || "SAR";
    const currencyItems = items.filter(
      (item) => (item.currencyCode || "SAR").toUpperCase() === currency.toUpperCase()
    );
    const totalDeals = primaryBucket?.openDealsCount ?? currencyItems.length;
    const totalPipelineValue =
      primaryBucket?.totalOpenValue ??
      currencyItems.reduce((sum, item) => sum + (item.estimatedAmount ?? 0), 0);

    const rawStages = Array.isArray(dto.pipelineData?.stages) ? dto.pipelineData.stages : [];
    const stages: CrmStageSummary[] = rawStages.map((stage) => {
      const reportStage = primaryBucket?.stages?.find((rs) => rs.stageKey === stage.stageKey);
      const stageDeals = currencyItems.filter((deal) => deal.stageKey === stage.stageKey);
      const stageVal =
        reportStage?.totalAmount ??
        stageDeals.reduce((sum, deal) => sum + (deal.estimatedAmount ?? 0), 0);
      return {
        key: stage.stageKey as CrmStageKey,
        name: stage.labelEn || stage.stageKey,
        count: reportStage?.dealCount ?? stageDeals.length,
        value: stageVal,
        sortOrder: stage.sortOrder,
        requiresVerifiedParty: Boolean(stage.requiresVerifiedParty),
      };
    });

    const wonCount = dto.reportData?.winLoss?.wonCount ?? 0;
    const lostCount = dto.reportData?.winLoss?.lostCount ?? 0;
    const closedTotal = dto.reportData?.winLoss?.totalClosedDeals ?? wonCount + lostCount;
    const winRatePercent = dto.reportData?.winLoss?.winRatePercent ?? 0;
    const avgCycleDaysVal = dto.reportData?.winLoss?.avgCycleDays ?? 0;

    const recentDeals: CrmRecentDeal[] = items.slice(0, 10).map((deal) => ({
      id: deal.id,
      title: deal.title,
      partyId: deal.partyId,
      partyName:
        deal.partyDisplayName ||
        deal.accountDisplayName ||
        deal.primaryContactName ||
        deal.partyName ||
        "",
      partyVerified: Boolean(deal.partyId),
      stageKey: deal.stageKey as CrmStageKey,
      amount: deal.estimatedAmount ?? 0,
      currency: deal.currencyCode || currency,
      ownerName: deal.ownerDisplayName || deal.ownerName || "",
      updatedAt: deal.createdAt || new Date().toISOString(),
    }));

    return new OverviewEntity({
      stats: [
        {
          id: "active-deals",
          title: "Active Deals",
          value: totalDeals.toString(),
          change: "",
          changeType: totalDeals > 0 ? "positive" : "neutral",
          description: `Scoped (${currency} bucket)`,
        },
        {
          id: "pipeline-value",
          title: "Pipeline Value",
          value: `${currency} ${totalPipelineValue.toLocaleString()}`,
          change: "",
          changeType: totalPipelineValue > 0 ? "positive" : "neutral",
          description: `Active ${currency} commercial pipeline`,
        },
        {
          id: "win-rate",
          title: "Win Rate",
          value: `${winRatePercent}%`,
          change: closedTotal > 0 ? `${wonCount}/${closedTotal}` : "",
          changeType: wonCount > 0 ? "positive" : "neutral",
          description: "Trailing 90 days",
        },
        {
          id: "avg-cycle",
          title: "Avg Deal Cycle",
          value: `${avgCycleDaysVal} ${avgCycleDaysVal === 1 ? "Day" : "Days"}`,
          change: "",
          changeType: "neutral",
          description: "From Intake to Won",
        },
      ],
      pipeline: {
        id: dto.pipelineData?.pipelineId || "default",
        name: dto.pipelineData?.nameEn || "Standard Commercial Pipeline",
        stages:
          stages.length > 0
            ? stages
            : [
                { key: "default.discovery", name: "Discovery", count: 0, value: 0, sortOrder: 1, requiresVerifiedParty: false },
                { key: "default.qualification", name: "Qualification", count: currencyItems.length, value: totalPipelineValue, sortOrder: 2, requiresVerifiedParty: false },
                { key: "default.solution_fit", name: "Solution Fit", count: 0, value: 0, sortOrder: 3, requiresVerifiedParty: false },
                { key: "default.proposal", name: "Proposal", count: 0, value: 0, sortOrder: 4, requiresVerifiedParty: true },
                { key: "default.negotiation", name: "Negotiation", count: 0, value: 0, sortOrder: 5, requiresVerifiedParty: true },
              ],
        totalDeals,
        totalPipelineValue,
        currency,
      },
      recentDeals,
    });
  }
}
