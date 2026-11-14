import type {
  DataExchangeExecuteImportResponseDto,
  DataTransferJobDto,
} from "../../domain/types";

/**
 * Constructs a DataTransferJobDto model from execute import API response
 * for immediate tracking in the DataExchangeJobsStore floating dock.
 */
export function buildJobFromExecution(
  result: DataExchangeExecuteImportResponseDto,
  inspectResult: { entityKey?: string; format?: string; fileName?: string } | null | undefined,
  entityKey: string,
  isMultiSheet: boolean,
  importMode: string,
  onboardingMode: string,
  polledJob: DataTransferJobDto | null
): DataTransferJobDto {
  if (polledJob) return polledJob;
  return {
    id: result.jobId,
    kind: "Import",
    entityKey: inspectResult?.entityKey ?? entityKey,
    isMultiSheet,
    importMode,
    onboardingMode,
    fileFormat: inspectResult?.format ?? "xlsx",
    originalFileName: inspectResult?.fileName ?? null,
    status: result.status,
    totalRows: result.totalRows,
    processedRows: result.processedRows ?? 0,
    progressPercent: 0,
    validRows: result.committedRows,
    committedRows: result.committedRows,
    createdRows: result.createdRows,
    updatedRows: result.updatedRows,
    rejectedRows: result.rejectedRows,
    errorSummary: result.errorSummary ?? null,
    hasRejectedWorkbook: result.hasRejectedWorkbook,
    hasExportWorkbook: false,
    createdAt: new Date().toISOString(),
    startedAtUtc: new Date().toISOString(),
    completedAtUtc: null,
    expiresAtUtc: new Date(Date.now() + 86400000).toISOString(),
  };
}
