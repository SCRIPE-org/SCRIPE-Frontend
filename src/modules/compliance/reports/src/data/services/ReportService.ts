/**
 * Report Service — HTTP calls only, no business logic.
 * Implements IReportService, uses IApiService.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import type { IReportService, ReportParams } from "../../domain/interfaces/IReportService";
import type { ReportModel } from "../models/ReportModels";
import type { PagedResult } from "@modules/identity/core/domain/types";
import type { GenerateReportRequest } from "../../domain/entities/ComplianceReport";

export class ReportService implements IReportService {
  constructor(private readonly api: IApiService) {}

  getAll(params: ReportParams): Promise<PagedResult<ReportModel>> {
    const url = buildUrl(API_ENDPOINTS.COMPLIANCE.REPORTS, {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
    });
    return this.api.get<PagedResult<ReportModel>>(url);
  }

  generate(data: GenerateReportRequest): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(API_ENDPOINTS.COMPLIANCE.GENERATE_REPORT, data);
  }

  download(id: string): Promise<Blob> {
    return this.api.get<Blob>(`${API_ENDPOINTS.COMPLIANCE.REPORTS}/${id}/download`);
  }
}
