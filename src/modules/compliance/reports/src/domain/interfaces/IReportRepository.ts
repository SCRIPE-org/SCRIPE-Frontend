import type { ComplianceReport } from "../entities/ComplianceReport";
import type { PagedResult } from "@core/interfaces/common.interface";
import type { GenerateReportRequest } from "../entities/ComplianceReport";
import type { ReportParams } from "./IReportService";

export interface IReportRepository {
  getAll(params: ReportParams): Promise<PagedResult<ComplianceReport>>;
  generate(data: GenerateReportRequest): Promise<string>;
  getById(id: string): Promise<ComplianceReport>;
  download(id: string, format?: string): Promise<Blob>;
}
