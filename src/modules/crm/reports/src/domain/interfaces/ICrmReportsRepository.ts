import type { CrmReportEntity } from "../entities/CrmReportEntity";

/** Repository contract returning mapped `CrmReportEntity` domain models. */
export interface ICrmReportsRepository {
  /** Retrieves and normalizes the commercial pipeline & funnel report. */
  getPipelineReport(currencyCode?: string): Promise<CrmReportEntity>;
}
