import type { IApiService } from "@/core/interfaces/api.interface";
import type { ICrmOverviewService } from "../../domain/interfaces/ICrmOverviewService";
import type {
  CrmOverviewData,
  CrmPipelineOverview,
  CrmStageSummary,
  CrmRecentDeal,
  CrmStageKey,
  CrmPipelineReport,
  CrmSettingsResponseData,
  CrmTenantSettingsPayload,
  CrmUserPreferencePayload,
} from "../../domain/models/crm-overview.types";
import { CRM_ENDPOINTS } from "./crm-overview.endpoints";

interface RawPipelineStage { stageId: string; stageKey: string; sortOrder: number; labelEn: string; labelAr?: string; probabilityPercent?: number; requiresVerifiedParty: boolean; }
interface RawPipelineResponse { pipelineId?: string; code?: string; nameEn?: string; nameAr?: string; stages?: RawPipelineStage[]; }
interface RawOpportunityItem { id: string; title: string; partyId?: string; stageKey: string; estimatedAmount?: number | null; currencyCode?: string; createdAt?: string; }
interface RawOpportunitiesResponse { items?: RawOpportunityItem[]; totalCount?: number; }

/**
 * Concrete HTTP service for CRM overview, pipeline analytics, and server-side CRM settings.
 */
export class CrmOverviewService implements ICrmOverviewService {
  constructor(private readonly api: IApiService) {}

  private normalizeSettingsResponse(res: unknown): CrmSettingsResponseData {
    const raw: Record<string, any> =
      res && typeof res === "object" && "data" in (res as Record<string, any>) && (res as Record<string, any>).data
        ? (res as Record<string, any>).data
        : ((res as Record<string, any>) ?? {});
    const tenant = raw.tenantSettings ?? {};
    const user = raw.userPreferences ?? {};
    const allowOverride = Boolean(tenant.allowUserCurrencyOverride ?? true);
    return {
      effectiveBaseCurrencyCode: raw.effectiveBaseCurrencyCode || (allowOverride && user.overrideCurrencyCode ? user.overrideCurrencyCode : tenant.baseCurrencyCode) || "SAR",
      effectiveAutoConvertToBase: Boolean(raw.effectiveAutoConvertToBase ?? user.autoConvertAmountsOverride ?? tenant.autoConvertAmountsToBase ?? true),
      effectiveShowDualCurrencyBadges: Boolean(raw.effectiveShowDualCurrencyBadges ?? user.showDualCurrencyBadgesOverride ?? tenant.showDualCurrencyBadges ?? true),
      tenantSettings: {
        baseCurrencyCode: tenant.baseCurrencyCode || "SAR",
        defaultDealCurrencyCode: tenant.defaultDealCurrencyCode || "SAR",
        autoConvertAmountsToBase: Boolean(tenant.autoConvertAmountsToBase ?? true),
        showDualCurrencyBadges: Boolean(tenant.showDualCurrencyBadges ?? true),
        allowUserCurrencyOverride: allowOverride,
        snapshotExchangeRateOnDealCreation: Boolean(tenant.snapshotExchangeRateOnDealCreation ?? true),
        stageGateStrictness: tenant.stageGateStrictness || "strict",
        requireVerifiedPartyOnProposal: Boolean(tenant.requireVerifiedPartyOnProposal ?? true),
        requireCloseNotesOnWin: Boolean(tenant.requireCloseNotesOnWin ?? true),
        defaultLeadSource: tenant.defaultLeadSource || "Inbound",
        slaLeadResponseHours: Number(tenant.slaLeadResponseHours ?? 4),
        stalledDealThresholdDays: Number(tenant.stalledDealThresholdDays ?? 14),
        duplicateDetectionMode: tenant.duplicateDetectionMode || "strict",
        leadAutoAssignmentRule: tenant.leadAutoAssignmentRule || "round_robin",
        enableCatalogPricingQuoteHandoff: Boolean(tenant.enableCatalogPricingQuoteHandoff ?? true),
        enableVenueAcademyCommercialHandoff: Boolean(tenant.enableVenueAcademyCommercialHandoff ?? true),
        autoCreateWorkItemsOnStageMove: Boolean(tenant.autoCreateWorkItemsOnStageMove ?? true),
        defaultCommunicationChannel: tenant.defaultCommunicationChannel || "email",
        autoSyncPartyKernelOnConvert: Boolean(tenant.autoSyncPartyKernelOnConvert ?? true),
        customFieldsConfigJson: tenant.customFieldsConfigJson ?? null,
        workflowCanvasConfigJson: tenant.workflowCanvasConfigJson ?? null,
        rowVersion: tenant.rowVersion,
      },
      userPreferences: {
        overrideCurrencyCode: user.overrideCurrencyCode ?? null,
        defaultDealViewMode: user.defaultDealViewMode === "Table" ? "Table" : user.defaultDealViewMode === "SplitPane" ? "SplitPane" : "Kanban",
        defaultPipelineCode: user.defaultPipelineCode || "default",
        cardDensity: user.cardDensity === "Compact" ? "Compact" : "Comfortable",
        autoConvertAmountsOverride: user.autoConvertAmountsOverride ?? null,
        showDualCurrencyBadgesOverride: user.showDualCurrencyBadgesOverride ?? null,
        dailyDigestEnabled: Boolean(user.dailyDigestEnabled ?? true),
        stageMoveNotificationsEnabled: Boolean(user.stageMoveNotificationsEnabled ?? true),
        rowVersion: user.rowVersion,
      },
      exchangeRatesUsdBase: raw.exchangeRatesUsdBase ?? { USD: 1.0, SAR: 3.75, AED: 3.6725, EGP: 49.5, EUR: 0.92, GBP: 0.79, KWD: 0.307, QAR: 3.64 },
    };
  }

  async getSettings(): Promise<CrmSettingsResponseData> {
    const res = await this.api.get<Record<string, any>>(CRM_ENDPOINTS.SETTINGS);
    return this.normalizeSettingsResponse(res);
  }

  async updateTenantSettings(input: Partial<CrmTenantSettingsPayload>): Promise<CrmSettingsResponseData> {
    const res = await this.api.put<Record<string, any>>(CRM_ENDPOINTS.SETTINGS_TENANT, input);
    return this.normalizeSettingsResponse(res);
  }

  async updateUserPreferences(input: Partial<CrmUserPreferencePayload>): Promise<CrmSettingsResponseData> {
    const res = await this.api.put<Record<string, any>>(CRM_ENDPOINTS.SETTINGS_USER, input);
    return this.normalizeSettingsResponse(res);
  }

  async getPipelineReport(currencyCode?: string): Promise<CrmPipelineReport> {
    const query = currencyCode ? `?currencyCode=${encodeURIComponent(currencyCode)}` : "";
    const res = await this.api.get<Record<string, any>>(`${CRM_ENDPOINTS.PIPELINE_REPORT}${query}`);
    const raw: Record<string, any> = res && typeof res === "object" && "data" in res && res.data ? res.data : res;
    const currencyBreakdowns = Array.isArray(raw?.currencyBreakdowns)
      ? raw.currencyBreakdowns.map((b: Record<string, any>) => ({
          currencyCode: b.currencyCode || "SAR",
          openDealsCount: b.openDealsCount ?? 0,
          wonDealsCount: b.wonDealsCount ?? 0,
          lostDealsCount: b.lostDealsCount ?? 0,
          totalOpenValue: b.totalOpenValue ?? b.totalOpenAmount ?? 0,
          totalWeightedForecastValue: b.totalWeightedForecastValue ?? b.totalWeightedAmount ?? 0,
          totalWonValue: b.totalWonValue ?? b.totalWonAmount ?? 0,
          totalLostValue: b.totalLostValue ?? b.totalLostAmount ?? 0,
          stages: Array.isArray(b.stages)
            ? b.stages.map((s: Record<string, any>) => ({
                stageKey: s.stageKey,
                labelEn: s.labelEn,
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

    return {
      pipelineCode: raw?.pipelineCode || "default",
      pipelineNameEn: raw?.pipelineNameEn || "Standard Commercial Pipeline",
      pipelineNameAr: raw?.pipelineNameAr ?? null,
      isAmountMasked: Boolean(raw?.isAmountMasked),
      currencyBreakdowns,
      leadFunnel: {
        totalLeads: raw?.leadFunnel?.totalLeads ?? 0,
        newCount: raw?.leadFunnel?.newCount ?? 0,
        workingCount: raw?.leadFunnel?.workingCount ?? 0,
        qualifiedCount: raw?.leadFunnel?.qualifiedCount ?? 0,
        convertedCount: raw?.leadFunnel?.convertedCount ?? 0,
        disqualifiedCount: raw?.leadFunnel?.disqualifiedCount ?? 0,
        qualificationRatePercent: raw?.leadFunnel?.qualificationRatePercent ?? 0,
        conversionRatePercent: raw?.leadFunnel?.conversionRatePercent ?? 0,
      },
      winLoss: {
        totalClosedDeals: raw?.winLoss?.totalClosedDeals ?? raw?.winLoss?.totalClosedCount ?? (raw?.winLoss?.wonCount ?? 0) + (raw?.winLoss?.lostCount ?? 0),
        wonCount: raw?.winLoss?.wonCount ?? 0,
        lostCount: raw?.winLoss?.lostCount ?? 0,
        openCount: raw?.winLoss?.openCount ?? currencyBreakdowns.reduce((acc: number, curr: { openDealsCount: number }) => acc + curr.openDealsCount, 0),
        winRatePercent: raw?.winLoss?.winRatePercent ?? 0,
        avgCycleDays: raw?.winLoss?.avgCycleDays ?? raw?.winLoss?.averageDealCycleDays ?? 0,
      },
      activities: {
        totalActivitiesCount: raw?.activities?.totalActivitiesCount ?? 0,
        notesCount: raw?.activities?.notesCount ?? 0,
        callsCount: raw?.activities?.callsCount ?? 0,
        meetingsCount: raw?.activities?.meetingsCount ?? 0,
        communicationsSentCount: raw?.activities?.communicationsSentCount ?? 0,
        followUpsCreatedCount: raw?.activities?.followUpsCreatedCount ?? raw?.activities?.followUpsScheduledCount ?? 0,
      },
      generatedAtUtc: raw?.generatedAtUtc || new Date().toISOString(),
    };
  }

  async getOverviewData(_searchQuery?: string): Promise<CrmOverviewData> {
    let pipelineData: RawPipelineResponse | null = null;
    let oppsData: RawOpportunitiesResponse | null = null;
    let reportData: CrmPipelineReport | null = null;

    try {
      const pipelineRes = await this.api.get<RawPipelineResponse | { data: RawPipelineResponse }>(CRM_ENDPOINTS.PIPELINE_DEFAULT);
      pipelineData = pipelineRes && typeof pipelineRes === "object" && "data" in pipelineRes && pipelineRes.data ? pipelineRes.data : (pipelineRes as RawPipelineResponse);
    } catch { pipelineData = null; }

    try {
      const oppsRes = await this.api.get<RawOpportunitiesResponse | { data: RawOpportunitiesResponse }>(`${CRM_ENDPOINTS.OPPORTUNITIES}?pageSize=50`);
      oppsData = oppsRes && typeof oppsRes === "object" && "data" in oppsRes && oppsRes.data ? oppsRes.data : (oppsRes as RawOpportunitiesResponse);
    } catch { oppsData = null; }

    try { reportData = await this.getPipelineReport(); } catch { reportData = null; }

    const items: RawOpportunityItem[] = Array.isArray(oppsData?.items) ? oppsData!.items : [];
    const primaryBucket = reportData?.currencyBreakdowns?.[0] ?? null;
    const currency = primaryBucket?.currencyCode || items[0]?.currencyCode || "SAR";
    const currencyItems = items.filter((item) => (item.currencyCode || "SAR").toUpperCase() === currency.toUpperCase());
    const totalDeals = primaryBucket?.openDealsCount ?? currencyItems.length;
    const totalPipelineValue = primaryBucket?.totalOpenValue ?? currencyItems.reduce((sum, item) => sum + (item.estimatedAmount ?? 0), 0);

    const rawStages = Array.isArray(pipelineData?.stages) ? pipelineData!.stages : [];
    const stages: CrmStageSummary[] = rawStages.map((s) => {
      const reportStage = primaryBucket?.stages?.find((rs) => rs.stageKey === s.stageKey);
      const stageDeals = currencyItems.filter((d) => d.stageKey === s.stageKey);
      const stageVal = reportStage?.totalAmount ?? stageDeals.reduce((sum, d) => sum + (d.estimatedAmount ?? 0), 0);
      return {
        key: s.stageKey as CrmStageKey,
        name: s.labelEn || s.stageKey,
        count: reportStage?.dealCount ?? stageDeals.length,
        value: stageVal,
        sortOrder: s.sortOrder,
        requiresVerifiedParty: s.requiresVerifiedParty,
      };
    });

    const pipeline: CrmPipelineOverview = {
      id: pipelineData?.pipelineId || "default",
      name: pipelineData?.nameEn || "Standard Commercial Pipeline",
      stages: stages.length > 0 ? stages : [
        { key: "default.discovery", name: "Discovery", count: 0, value: 0, sortOrder: 1, requiresVerifiedParty: false },
        { key: "default.qualification", name: "Qualification", count: currencyItems.length, value: totalPipelineValue, sortOrder: 2, requiresVerifiedParty: false },
        { key: "default.solution_fit", name: "Solution Fit", count: 0, value: 0, sortOrder: 3, requiresVerifiedParty: false },
        { key: "default.proposal", name: "Proposal", count: 0, value: 0, sortOrder: 4, requiresVerifiedParty: true },
        { key: "default.negotiation", name: "Negotiation", count: 0, value: 0, sortOrder: 5, requiresVerifiedParty: true },
      ],
      totalDeals,
      totalPipelineValue,
      currency,
    };

    const recentDeals: CrmRecentDeal[] = items.slice(0, 10).map((deal) => ({
      id: deal.id,
      title: deal.title,
      partyId: deal.partyId,
      partyName: deal.title,
      partyVerified: Boolean(deal.partyId),
      stageKey: deal.stageKey as CrmStageKey,
      amount: deal.estimatedAmount ?? 0,
      currency: deal.currencyCode || currency,
      ownerName: "Commercial Lead",
      updatedAt: deal.createdAt || new Date().toISOString(),
    }));

    const winRateStr = reportData?.winLoss ? `${reportData.winLoss.winRatePercent}%` : "68.4%";
    const avgCycleDaysVal = reportData?.winLoss?.avgCycleDays ?? 24;
    const avgCycleStr = `${avgCycleDaysVal} ${avgCycleDaysVal === 1 ? "Day" : "Days"}`;

    return {
      stats: [
        { id: "active-deals", title: "Active Deals", value: totalDeals.toString(), change: "+12%", changeType: "positive", description: `Scoped (${currency} bucket)` },
        { id: "pipeline-value", title: "Pipeline Value", value: `${currency} ${totalPipelineValue.toLocaleString()}`, change: "+18%", changeType: "positive", description: `Active ${currency} commercial pipeline` },
        { id: "win-rate", title: "Win Rate", value: winRateStr, change: "+4.2%", changeType: "positive", description: "Trailing 90 days" },
        { id: "avg-cycle", title: "Avg Deal Cycle", value: avgCycleStr, change: "-3 days", changeType: "positive", description: "From Intake to Won" },
      ],
      pipeline,
      recentDeals,
    };
  }
}
