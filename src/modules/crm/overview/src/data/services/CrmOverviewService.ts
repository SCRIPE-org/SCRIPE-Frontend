import { buildUrl } from "@/core/config/api-endpoints/_shared";
import { stripHtmlTags } from "@core/common/sanitize";
import type { IApiService } from "@/core/interfaces/api.interface";
import type { ICrmOverviewService } from "../../domain/interfaces/ICrmOverviewService";
import type {
  CrmOverviewCompositeDto,
  RawOverviewOpportunitiesResponseDto,
  RawOverviewPipelineReportDto,
  RawOverviewPipelineResponseDto,
} from "../models/OverviewModel";
import { CRM_OVERVIEW_ENDPOINTS } from "./crm-overview.endpoints";

interface Envelope<T> {
  data?: T;
}

function unwrapEnvelope<T>(res: T | Envelope<T> | null | undefined): T | null {
  if (!res || typeof res !== "object") return null;
  if ("data" in res && (res as Envelope<T>).data !== undefined) {
    return (res as Envelope<T>).data ?? null;
  }
  return res as T;
}

/**
 * Concrete HTTP service for fetching CRM Overview dashboard raw DTOs in parallel.
 */
export class CrmOverviewService implements ICrmOverviewService {
  constructor(private readonly api: IApiService) {}

  /** Fetches default pipeline, recent opportunities, and pipeline KPI report concurrently. */
  async getOverviewData(searchQuery?: string): Promise<CrmOverviewCompositeDto> {
    const cleanSearch = stripHtmlTags(searchQuery ?? "").trim();
    const oppUrl = buildUrl(CRM_OVERVIEW_ENDPOINTS.OPPORTUNITIES, {
      pageSize: 50,
      search: cleanSearch || undefined,
    });

    const [pipelineRes, oppsRes, reportRes] = await Promise.allSettled([
      this.api.get<RawOverviewPipelineResponseDto | Envelope<RawOverviewPipelineResponseDto>>(
        CRM_OVERVIEW_ENDPOINTS.PIPELINE_DEFAULT
      ),
      this.api.get<RawOverviewOpportunitiesResponseDto | Envelope<RawOverviewOpportunitiesResponseDto>>(
        oppUrl
      ),
      this.api.get<RawOverviewPipelineReportDto | Envelope<RawOverviewPipelineReportDto>>(
        CRM_OVERVIEW_ENDPOINTS.PIPELINE_REPORT
      ),
    ]);

    return {
      pipelineData:
        pipelineRes.status === "fulfilled" ? unwrapEnvelope(pipelineRes.value) : null,
      opportunitiesData:
        oppsRes.status === "fulfilled" ? unwrapEnvelope(oppsRes.value) : null,
      reportData:
        reportRes.status === "fulfilled" ? unwrapEnvelope(reportRes.value) : null,
    };
  }
}
