import { DataTransferJob } from "../../domain/entities/DataTransferJob";
import type { DataTransferJobModel } from "../models/DataTransferJobModel";

/**
 * Pure mapper transforming between DataTransferJobModel and DataTransferJob domain entity.
 */
export class DataTransferJobMapper {
  /**
   * Maps an API model to a domain entity.
   */
  static toDomain(model: DataTransferJobModel): DataTransferJob {
    return new DataTransferJob({
      jobId: model.id,
      kind: model.kind,
      entityKey: model.entityKey,
      isMultiSheet: model.isMultiSheet,
      importMode: model.importMode,
      onboardingMode: model.onboardingMode,
      fileFormat: model.fileFormat,
      originalFileName: model.originalFileName,
      status: model.status,
      totalRows: model.totalRows,
      processedRows: model.processedRows,
      progressPercent: model.progressPercent,
      validRows: model.validRows,
      committedRows: model.committedRows,
      createdRows: model.createdRows,
      updatedRows: model.updatedRows,
      rejectedRows: model.rejectedRows,
      errorSummary: model.errorSummary,
      hasRejectedWorkbook: model.hasRejectedWorkbook,
      hasExportWorkbook: model.hasExportWorkbook,
      createdAt: model.createdAt,
      startedAtUtc: model.startedAtUtc,
      completedAtUtc: model.completedAtUtc,
      expiresAtUtc: model.expiresAtUtc,
    });
  }

  /**
   * Maps a domain entity back to an API model.
   */
  static toModel(entity: DataTransferJob): DataTransferJobModel {
    return {
      id: entity.jobId,
      kind: entity.kind,
      entityKey: entity.entityKey,
      isMultiSheet: entity.isMultiSheet,
      importMode: entity.importMode,
      onboardingMode: entity.onboardingMode,
      fileFormat: entity.fileFormat,
      originalFileName: entity.originalFileName,
      status: entity.status,
      totalRows: entity.totalRows,
      processedRows: entity.processedRows,
      progressPercent: entity.progressPercent,
      validRows: entity.validRows,
      committedRows: entity.committedRows,
      createdRows: entity.createdRows,
      updatedRows: entity.updatedRows,
      rejectedRows: entity.rejectedRows,
      errorSummary: entity.errorSummary,
      hasRejectedWorkbook: entity.hasRejectedWorkbook,
      hasExportWorkbook: entity.hasExportWorkbook,
      createdAt: entity.createdAt,
      startedAtUtc: entity.startedAtUtc,
      completedAtUtc: entity.completedAtUtc,
      expiresAtUtc: entity.expiresAtUtc,
    };
  }
}
