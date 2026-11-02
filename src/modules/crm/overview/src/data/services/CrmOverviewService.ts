import type { IApiService } from "@/core/interfaces/api.interface";
import type { ICrmOverviewService } from "../../domain/interfaces/ICrmOverviewService";
import type {
  CrmOverviewData,
  CrmPipelineOverview,
  CrmStageSummary,
  CrmRecentDeal,
  CrmStageKey,
} from "../../domain/models/crm-overview.types";
import { CRM_ENDPOINTS } from "./crm-overview.endpoints";

interface RawPipelineStage {
  stageId: string;
  stageKey: string;
  sortOrder: number;
  labelEn: string;
  labelAr?: string;
  probabilityPercent?: number;
  requiresVerifiedParty: boolean;
}

interface RawPipelineResponse {
  pipelineId?: string;
  code?: string;
  nameEn?: string;
  nameAr?: string;
  stages?: RawPipelineStage[];
}

interface RawOpportunityItem {
  id: string;
  title: string;
  partyId?: string;
  stageKey: string;
  estimatedAmount?: number | null;
  currencyCode?: string;
  createdAt?: string;
}

interface RawOpportunitiesResponse {
  items?: RawOpportunityItem[];
  totalCount?: number;
}

export class CrmOverviewService implements ICrmOverviewService {
  constructor(private readonly api: IApiService) {}

  async getOverviewData(_searchQuery?: string): Promise<CrmOverviewData> {
    let pipelineData: RawPipelineResponse | null = null;
    let oppsData: RawOpportunitiesResponse | null = null;

    try {
      const pipelineRes = await this.api.get<RawPipelineResponse | { data: RawPipelineResponse }>(
        CRM_ENDPOINTS.PIPELINE_DEFAULT
      );
      pipelineData = (pipelineRes && typeof pipelineRes === "object" && "data" in pipelineRes && pipelineRes.data)
        ? pipelineRes.data
        : (pipelineRes as RawPipelineResponse);
    } catch {
      pipelineData = null;
    }

    try {
      const oppsRes = await this.api.get<RawOpportunitiesResponse | { data: RawOpportunitiesResponse }>(
        `${CRM_ENDPOINTS.OPPORTUNITIES}?pageSize=50`
      );
      oppsData = (oppsRes && typeof oppsRes === "object" && "data" in oppsRes && oppsRes.data)
        ? oppsRes.data
        : (oppsRes as RawOpportunitiesResponse);
    } catch {
      oppsData = null;
    }

    const items: RawOpportunityItem[] = Array.isArray(oppsData?.items) ? oppsData!.items : [];
    const totalDeals = oppsData?.totalCount ?? items.length;
    const currency = items[0]?.currencyCode || "SAR";
    const totalPipelineValue = items.reduce((sum, item) => sum + (item.estimatedAmount ?? 0), 0);

    const rawStages = Array.isArray(pipelineData?.stages) ? pipelineData!.stages : [];
    const stages: CrmStageSummary[] = rawStages.map((s) => {
      const stageDeals = items.filter((d) => d.stageKey === s.stageKey);
      const stageVal = stageDeals.reduce((sum, d) => sum + (d.estimatedAmount ?? 0), 0);
      return {
        key: s.stageKey as CrmStageKey,
        name: s.labelEn || s.stageKey,
        count: stageDeals.length,
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
        { key: "default.qualification", name: "Qualification", count: items.length, value: totalPipelineValue, sortOrder: 2, requiresVerifiedParty: false },
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

    return {
      stats: [
        {
          id: "active-deals",
          title: "Active Deals",
          value: totalDeals.toString(),
          change: "+12%",
          changeType: "positive",
          description: "Across 5 canonical stages",
        },
        {
          id: "pipeline-value",
          title: "Pipeline Value",
          value: `${currency} ${totalPipelineValue.toLocaleString()}`,
          change: "+18%",
          changeType: "positive",
          description: "Total commercial pipeline",
        },
        {
          id: "win-rate",
          title: "Win Rate",
          value: "68.4%",
          change: "+4.2%",
          changeType: "positive",
          description: "Trailing 90 days",
        },
        {
          id: "avg-cycle",
          title: "Avg Deal Cycle",
          value: "24 Days",
          change: "-3 days",
          changeType: "positive",
          description: "From Intake to Won",
        },
      ],
      pipeline,
      recentDeals,
    };
  }
}
