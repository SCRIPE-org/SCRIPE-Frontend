import type { CrmPipelineReportRawDto } from "../../data/models/CrmReportsModel";

/** Service contract for fetching CRM commercial pipeline analytics reports. */
export interface ICrmReportsService {
  /** Fetches the raw pipeline report DTO from the backend API. */
  getPipelineReport(currencyCode?: string): Promise<CrmPipelineReportRawDto>;
}
