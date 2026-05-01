import type { ComplianceReport } from "../entities/ComplianceReport";
import type { PagedResult } from "@modules/identity/core/domain/types";
import type { GenerateReportRequest } from "../entities/ComplianceReport";
import type { ReportParams } from "./IReportService";

export interface IReportRepository {
  getAll(params: ReportParams): Promise<PagedResult<ComplianceReport>>;
  generate(data: GenerateReportRequest): Promise<string>;
  download(id: string): Promise<Blob>;
}
