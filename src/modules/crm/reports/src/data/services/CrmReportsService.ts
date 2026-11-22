import { buildUrl } from "@/core/config/api-endpoints/_shared";
import { stripHtmlTags } from "@core/common/sanitize";
import type { IApiService } from "@/core/interfaces/api.interface";
import type { ICrmReportsService } from "../../domain/interfaces/ICrmReportsService";
import type {
  CrmPipelineReportRawDto,
  CrmReportsApiEnvelope,
} from "../models/CrmReportsModel";
import { CRM_REPORTS_ENDPOINTS } from "./crm-reports.endpoints";

/** HTTP service retrieving CRM pipeline and funnel analytics from the backend API. */
export class CrmReportsService implements ICrmReportsService {
  constructor(private readonly api: IApiService) {}

  /** Fetches the pipeline analytics report optionally scoped by currency code. */
  async getPipelineReport(currencyCode?: string): Promise<CrmPipelineReportRawDto> {
    const cleanCode = stripHtmlTags(currencyCode ?? "").trim().toUpperCase();
    const url = buildUrl(CRM_REPORTS_ENDPOINTS.PIPELINE_REPORT, {
      currencyCode: cleanCode || undefined,
    });
    const res = await this.api.get<CrmReportsApiEnvelope<CrmPipelineReportRawDto> | CrmPipelineReportRawDto>(url);
    if (res && typeof res === "object" && "data" in res && res.data) {
      return res.data;
    }
    return (res as CrmPipelineReportRawDto) ?? {};
  }
}
