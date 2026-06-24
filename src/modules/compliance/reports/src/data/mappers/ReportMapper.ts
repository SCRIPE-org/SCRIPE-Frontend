/**
 * Report Mapper — Model ↔ Entity conversion.
 * Derives status string from backend's isReady boolean.
 */
import { ComplianceReport } from "../../domain/entities/ComplianceReport";
import type { ComplianceReportData } from "../../domain/entities/ComplianceReport";
import type { ReportModel } from "../models/ReportModels";
import { z } from "zod";
import {
  safeParseApiResponse,
  uuidField,
  optionalString,
  optionalIsoDate,
} from "@core/common/zod-utils";

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const ReportModelSchema = z.object({
  id: uuidField(),
  reportType: optionalString(),
  regulationCode: optionalString(),
  periodStart: optionalString(),
  periodEnd: optionalString(),
  isReady: z.boolean().optional().default(false),
  generatedAt: optionalIsoDate(),
  fileUrl: z.string().optional().nullable(),
});

/**
 * Data mapper class responsible for converting data structures between DTO models and domain entities.
 */
export class ReportMapper {
  static toEntity(model: ReportModel): ComplianceReport {
    const validated = safeParseApiResponse(ReportModelSchema, model, "ComplianceReport");

    const data: ComplianceReportData = {
      id: validated.id,
      reportType: validated.reportType ?? "",
      regulationCode: validated.regulationCode ?? "",
      periodStart: validated.periodStart ?? "",
      periodEnd: validated.periodEnd ?? "",
      // Derive status from isReady — backend doesn't have a status string field
      status: validated.isReady ? "Ready" : "Pending",
      generatedAt: validated.generatedAt ?? null,
      downloadUrl: validated.fileUrl ?? null,
    };
    return new ComplianceReport(data);
  }
}
