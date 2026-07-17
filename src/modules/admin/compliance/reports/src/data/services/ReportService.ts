/**
 * Report Service — HTTP calls only, no business logic.
 * Implements IReportService, uses IApiService.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import type { IReportService, ReportParams } from "../../domain/interfaces/IReportService";
import type { ReportModel } from "../models/ReportModels";
import type { PagedResult } from "@core/interfaces/common.interface";
import type { GenerateReportRequest } from "../../domain/entities/ComplianceReport";
import { REPORTS_ENDPOINTS } from "./reports.endpoints";

/**
 * Http API network service for report.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class ReportService implements IReportService {
  constructor(private readonly api: IApiService) {}

  getAll(params: ReportParams): Promise<PagedResult<ReportModel>> {
    const url = buildUrl(REPORTS_ENDPOINTS.REPORTS, {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
    });
    return this.api.get<PagedResult<ReportModel>>(url);
  }

  generate(data: GenerateReportRequest): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(REPORTS_ENDPOINTS.GENERATE_REPORT, data);
  }

  getById(id: string): Promise<ReportModel> {
    return this.api.get<ReportModel>(`${REPORTS_ENDPOINTS.REPORTS}/${id}`);
  }

  download(id: string, format: string = "csv"): Promise<Blob> {
    return this.api.getBlob(`${REPORTS_ENDPOINTS.REPORTS}/${id}/download?format=${format}`);
  }
}
