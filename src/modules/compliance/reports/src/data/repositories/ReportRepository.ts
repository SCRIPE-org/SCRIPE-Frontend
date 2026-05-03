/**
 * Report Repository — calls service, maps models → domain entities.
 * Implements IReportRepository.
 */
import type { IReportRepository } from "../../domain/interfaces/IReportRepository";
import type { IReportService, ReportParams } from "../../domain/interfaces/IReportService";
import type { ComplianceReport } from "../../domain/entities/ComplianceReport";
import type { GenerateReportRequest } from "../../domain/entities/ComplianceReport";
import type { PagedResult } from "@modules/identity/core/domain/types";
import { ReportMapper } from "../mappers/ReportMapper";

export class ReportRepository implements IReportRepository {
  constructor(private readonly service: IReportService) {}

  async getAll(params: ReportParams): Promise<PagedResult<ComplianceReport>> {
    const result = await this.service.getAll(params);
    return {
      ...result,
      items: result.items.map(ReportMapper.toEntity),
    };
  }

  async generate(data: GenerateReportRequest): Promise<string> {
    const result = await this.service.generate(data);
    return result.id;
  }

  async getById(id: string): Promise<ComplianceReport> {
    const model = await this.service.getById(id);
    return ReportMapper.toEntity(model);
  }

  download(id: string, format?: string): Promise<Blob> {
    return this.service.download(id, format);
  }
}
