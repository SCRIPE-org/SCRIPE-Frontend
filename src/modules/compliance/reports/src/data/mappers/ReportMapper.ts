/**
 * Report Mapper — Model ↔ Entity conversion.
 * Derives status string from backend's isReady boolean.
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
      periodStart: model.periodStart ?? "",
      periodEnd: model.periodEnd ?? "",
      // Derive status from isReady — backend doesn't have a status string field
      status: model.isReady ? "Ready" : "Pending",
      generatedAt: model.generatedAt ?? null,
      downloadUrl: model.fileUrl ?? null,
    };
    return new ComplianceReport(data);
  }
}
