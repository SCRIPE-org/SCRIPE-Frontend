/**
 * Report Mapper — Model ↔ Entity conversion.
 * Repositories MUST use this mapper. Never construct entities directly.
 */
import { ComplianceReport } from "../../domain/entities/ComplianceReport";
import type { ComplianceReportData } from "../../domain/entities/ComplianceReport";
import type { ReportModel } from "../models/ReportModels";

export class ReportMapper {
  static toEntity(model: ReportModel): ComplianceReport {
    const data: ComplianceReportData = {
      id: model.id,
      reportType: model.reportType ?? "",
      regulationCode: model.regulationCode ?? "",
      periodStart: model.periodStart,
      periodEnd: model.periodEnd,
      status: (model.status ?? "Pending") as ComplianceReportData["status"],
      generatedAt: model.generatedAt ?? null,
      downloadUrl: model.downloadUrl ?? null,
      requestedBy: model.requestedBy,
      requestedAt: model.requestedAt,
    };
    return new ComplianceReport(data);
  }
}
