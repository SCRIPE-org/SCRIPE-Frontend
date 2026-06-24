import type { ReportModel } from "../../data/models/ReportModels";
import type { PagedResult } from "@core/interfaces/common.interface";
import type { GenerateReportRequest } from "../entities/ComplianceReport";

/**
 * Interface defining property specifications, keys types, and structural contract rules for report params.
 */
export interface ReportParams {
  page?: number;
  pageSize?: number;
}

/**
 * Http API network service for i report.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export interface IReportService {
  getAll(params: ReportParams): Promise<PagedResult<ReportModel>>;
  generate(data: GenerateReportRequest): Promise<{ id: string }>;
  getById(id: string): Promise<ReportModel>;
  download(id: string, format?: string): Promise<Blob>;
}
