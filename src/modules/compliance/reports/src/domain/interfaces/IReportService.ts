import type { ReportModel } from "../../data/models/ReportModels";
import type { PagedResult } from "@modules/identity/core/domain/types";
import type { GenerateReportRequest } from "../entities/ComplianceReport";

export interface ReportParams {
  page?: number;
  pageSize?: number;
}

export interface IReportService {
  getAll(params: ReportParams): Promise<PagedResult<ReportModel>>;
  generate(data: GenerateReportRequest): Promise<{ id: string }>;
  getById(id: string): Promise<ReportModel>;
  download(id: string, format?: string): Promise<Blob>;
}
