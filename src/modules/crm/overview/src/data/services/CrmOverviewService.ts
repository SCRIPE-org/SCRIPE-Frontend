import type { IApiService } from "@/core/interfaces/api.interface";
import type { ICrmOverviewService } from "../../domain/interfaces/ICrmOverviewService";
import type {
  CrmEntitySearchItem,
  CrmEntitySearchRequest,
  CrmOverviewData,
  CrmPipelineOverview,
  CrmStageSummary,
  CrmRecentDeal,
  CrmStageKey,
  CrmPipelineReport,
  CrmQuickCreateEntityInput,
  CrmSettingsResponseData,
  CrmTenantSettingsPayload,
  CrmUserPreferencePayload,
} from "../../domain/models/crm-overview.types";
import { CRM_ENDPOINTS } from "./crm-overview.endpoints";
import { quickCreateCrmEntity, searchCrmEntities } from "./CrmEntitySearchServiceHelper";
import {
  normalizeCrmPipelineReportResponse,
  normalizeCrmSettingsResponse,
} from "./CrmOverviewNormalizationHelper";

interface RawPipelineStage { stageId: string; stageKey: string; sortOrder: number; labelEn: string; labelAr?: string; probabilityPercent?: number; requiresVerifiedParty: boolean; }
interface RawPipelineResponse { pipelineId?: string; code?: string; nameEn?: string; nameAr?: string; stages?: RawPipelineStage[]; }
interface RawOpportunityItem {
  id: string;
  title: string;
  partyId?: string;
  partyDisplayName?: string;
  accountDisplayName?: string;
  primaryContactName?: string;
  partyName?: string;
  ownerDisplayName?: string;
  ownerName?: string;
  stageKey: string;
  estimatedAmount?: number | null;
  currencyCode?: string;
  createdAt?: string;
}
interface RawOpportunitiesResponse { items?: RawOpportunityItem[]; totalCount?: number; }

/**
 * Concrete HTTP service for CRM overview, pipeline analytics, entity search, and server-side CRM settings.
 */
export class CrmOverviewService implements ICrmOverviewService {
  constructor(private readonly api: IApiService) {}

  async getSettings(): Promise<CrmSettingsResponseData> {
    const res = await this.api.get<Record<string, any>>(CRM_ENDPOINTS.SETTINGS);
    return normalizeCrmSettingsResponse(res);
  }

  async updateTenantSettings(input: Partial<CrmTenantSettingsPayload>): Promise<CrmSettingsResponseData> {
    const idempotencyKey = `crm-set-tenant-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const res = await this.api.put<Record<string, any>>(CRM_ENDPOINTS.SETTINGS_TENANT, input, undefined, {
      idempotencyKey,
      headers: { "Idempotency-Key": idempotencyKey, "X-Idempotency-Key": idempotencyKey },
    });
    return normalizeCrmSettingsResponse(res);
  }

  async updateUserPreferences(input: Partial<CrmUserPreferencePayload>): Promise<CrmSettingsResponseData> {
    const idempotencyKey = `crm-set-user-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const res = await this.api.put<Record<string, any>>(CRM_ENDPOINTS.SETTINGS_USER, input, undefined, {
      idempotencyKey,
      headers: { "Idempotency-Key": idempotencyKey, "X-Idempotency-Key": idempotencyKey },
    });
    return normalizeCrmSettingsResponse(res);
  }

  async getPipelineReport(currencyCode?: string): Promise<CrmPipelineReport> {
    const query = currencyCode ? `?currencyCode=${encodeURIComponent(currencyCode)}` : "";
    const res = await this.api.get<Record<string, any>>(`${CRM_ENDPOINTS.PIPELINE_REPORT}${query}`);
    return normalizeCrmPipelineReportResponse(res);
  }

  async searchEntities(input: CrmEntitySearchRequest): Promise<CrmEntitySearchItem[]> {
    return searchCrmEntities(this.api, input);
  }

  async quickCreateEntity(input: CrmQuickCreateEntityInput): Promise<CrmEntitySearchItem> {
    return quickCreateCrmEntity(this.api, input);
  }

  async getOverviewData(searchQuery?: string): Promise<CrmOverviewData> {
    let pipelineData: RawPipelineResponse | null = null;
    let oppsData: RawOpportunitiesResponse | null = null;
    let reportData: CrmPipelineReport | null = null;
    const trimmedSearch = searchQuery?.trim();
    const oppQuery = trimmedSearch ? `?pageSize=50&search=${encodeURIComponent(trimmedSearch)}` : "?pageSize=50";

    try {
      const pipelineRes = await this.api.get<RawPipelineResponse | { data: RawPipelineResponse }>(CRM_ENDPOINTS.PIPELINE_DEFAULT);
      pipelineData = pipelineRes && typeof pipelineRes === "object" && "data" in pipelineRes && pipelineRes.data ? pipelineRes.data : (pipelineRes as RawPipelineResponse);
    } catch { pipelineData = null; }

    try {
      const oppsRes = await this.api.get<RawOpportunitiesResponse | { data: RawOpportunitiesResponse }>(`${CRM_ENDPOINTS.OPPORTUNITIES}${oppQuery}`);
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
      partyName: deal.partyDisplayName || deal.accountDisplayName || deal.primaryContactName || deal.partyName || "",
      partyVerified: Boolean(deal.partyId),
      stageKey: deal.stageKey as CrmStageKey,
      amount: deal.estimatedAmount ?? 0,
      currency: deal.currencyCode || currency,
      ownerName: deal.ownerDisplayName || deal.ownerName || "",
      updatedAt: deal.createdAt || new Date().toISOString(),
    }));

    const wonCount = reportData?.winLoss?.wonCount ?? 0;
    const lostCount = reportData?.winLoss?.lostCount ?? 0;
    const closedTotal = reportData?.winLoss?.totalClosedDeals ?? (wonCount + lostCount);
    const winRatePercent = reportData?.winLoss?.winRatePercent ?? 0;
    const avgCycleDaysVal = reportData?.winLoss?.avgCycleDays ?? 0;

    return {
      stats: [
        { id: "active-deals", title: "Active Deals", value: totalDeals.toString(), change: "", changeType: totalDeals > 0 ? "positive" : "neutral", description: `Scoped (${currency} bucket)` },
        { id: "pipeline-value", title: "Pipeline Value", value: `${currency} ${totalPipelineValue.toLocaleString()}`, change: "", changeType: totalPipelineValue > 0 ? "positive" : "neutral", description: `Active ${currency} commercial pipeline` },
        { id: "win-rate", title: "Win Rate", value: `${winRatePercent}%`, change: closedTotal > 0 ? `${wonCount}/${closedTotal}` : "", changeType: wonCount > 0 ? "positive" : "neutral", description: "Trailing 90 days" },
        { id: "avg-cycle", title: "Avg Deal Cycle", value: `${avgCycleDaysVal} ${avgCycleDaysVal === 1 ? "Day" : "Days"}`, change: "", changeType: "neutral", description: "From Intake to Won" },
      ],
      pipeline,
      recentDeals,
    };
  }
}
