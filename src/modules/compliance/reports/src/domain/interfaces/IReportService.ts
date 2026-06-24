import type { ReportModel } from "../../data/models/ReportModels";
import type { PagedResult } from "@core/interfaces/common.interface";
import type { GenerateReportRequest } from "../entities/ComplianceReport";

/**
 * Interface structure detailing the properties and attributes of Report Params.
 */
export interface ReportParams {
  page?: number;
  pageSize?: number;
}

/**
 * Interface defining operations for the Report network service.
 */
export interface IReportService {
  getAll(params: ReportParams): Promise<PagedResult<ReportModel>>;
  generate(data: GenerateReportRequest): Promise<{ id: string }>;
  getById(id: string): Promise<ReportModel>;
  download(id: string, format?: string): Promise<Blob>;
}
