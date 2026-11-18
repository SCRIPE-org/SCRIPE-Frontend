/** Kind of executed data transfer job. */
export type DataTransferJobKind = "Import" | "Export" | "MultiSheetMigration";

/** Execution lifecycle status of a data transfer job. */
export type DataTransferJobStatus =
  | "Queued"
  | "Running"
  | "Completed"
  | "CompletedWithErrors"
  | "Failed"
  | "Cancelled";

/** Downloadable artifact kinds produced by a data transfer job. */
export type DataTransferArtifactKind = "rejected" | "export";

/**
 * Domain entity representing a data transfer execution job.
 */
export class DataTransferJob {
  readonly jobId: string;
  readonly kind: DataTransferJobKind;
  readonly entityKey: string;
  readonly isMultiSheet: boolean;
  readonly importMode: string;
  readonly onboardingMode: string;
  readonly fileFormat: string;
  readonly originalFileName?: string | null;
  readonly status: DataTransferJobStatus;
  readonly totalRows: number;
  readonly processedRows: number;
  readonly progressPercent: number;
  readonly validRows: number;
  readonly committedRows: number;
  readonly createdRows: number;
  readonly updatedRows: number;
  readonly rejectedRows: number;
  readonly errorSummary?: string | null;
  readonly hasRejectedWorkbook: boolean;
  readonly hasExportWorkbook: boolean;
  readonly createdAt: string;
  readonly startedAtUtc?: string | null;
  readonly completedAtUtc?: string | null;
  readonly expiresAtUtc: string;

  constructor(init: {
    jobId: string;
    kind: DataTransferJobKind;
    entityKey: string;
    isMultiSheet?: boolean;
    importMode?: string;
    onboardingMode?: string;
    fileFormat?: string;
    originalFileName?: string | null;
    status: DataTransferJobStatus;
    totalRows?: number;
    processedRows?: number;
    progressPercent?: number;
    validRows?: number;
    committedRows?: number;
    createdRows?: number;
    updatedRows?: number;
    rejectedRows?: number;
    errorSummary?: string | null;
    hasRejectedWorkbook?: boolean;
    hasExportWorkbook?: boolean;
    createdAt: string;
    startedAtUtc?: string | null;
    completedAtUtc?: string | null;
    expiresAtUtc: string;
  }) {
    this.jobId = init.jobId;
    this.kind = init.kind;
    this.entityKey = init.entityKey;
    this.isMultiSheet = init.isMultiSheet ?? false;
    this.importMode = init.importMode ?? "Insert";
    this.onboardingMode = init.onboardingMode ?? "SkipExisting";
    this.fileFormat = init.fileFormat ?? "xlsx";
    this.originalFileName = init.originalFileName;
    this.status = init.status;
    this.totalRows = init.totalRows ?? 0;
    this.processedRows = init.processedRows ?? 0;
    this.progressPercent = init.progressPercent ?? 0;
    this.validRows = init.validRows ?? 0;
    this.committedRows = init.committedRows ?? 0;
    this.createdRows = init.createdRows ?? 0;
    this.updatedRows = init.updatedRows ?? 0;
    this.rejectedRows = init.rejectedRows ?? 0;
    this.errorSummary = init.errorSummary;
    this.hasRejectedWorkbook = init.hasRejectedWorkbook ?? false;
    this.hasExportWorkbook = init.hasExportWorkbook ?? false;
    this.createdAt = init.createdAt;
    this.startedAtUtc = init.startedAtUtc;
    this.completedAtUtc = init.completedAtUtc;
    this.expiresAtUtc = init.expiresAtUtc;
  }

  /**
   * Primary identifier matching GenericCrudView requirement.
   */
  get id(): string {
    return this.jobId;
  }

  /**
   * Whether the job is actively queued or executing.
   */
  get isActive(): boolean {
    return this.status === "Queued" || this.status === "Running";
  }

  /**
   * Whether the job reached a terminal state.
   */
  get isTerminal(): boolean {
    return (
      this.status === "Completed" ||
      this.status === "CompletedWithErrors" ||
      this.status === "Failed" ||
      this.status === "Cancelled"
    );
  }

  /**
   * Immutable copy method.
   */
  copyWith(changes: Partial<DataTransferJob>): DataTransferJob {
    return new DataTransferJob({
      jobId: changes.jobId ?? this.jobId,
      kind: changes.kind ?? this.kind,
      entityKey: changes.entityKey ?? this.entityKey,
      isMultiSheet: changes.isMultiSheet ?? this.isMultiSheet,
      importMode: changes.importMode ?? this.importMode,
      onboardingMode: changes.onboardingMode ?? this.onboardingMode,
      fileFormat: changes.fileFormat ?? this.fileFormat,
      originalFileName:
        changes.originalFileName !== undefined
          ? changes.originalFileName
          : this.originalFileName,
      status: changes.status ?? this.status,
      totalRows: changes.totalRows ?? this.totalRows,
      processedRows: changes.processedRows ?? this.processedRows,
      progressPercent: changes.progressPercent ?? this.progressPercent,
      validRows: changes.validRows ?? this.validRows,
      committedRows: changes.committedRows ?? this.committedRows,
      createdRows: changes.createdRows ?? this.createdRows,
      updatedRows: changes.updatedRows ?? this.updatedRows,
      rejectedRows: changes.rejectedRows ?? this.rejectedRows,
      errorSummary:
        changes.errorSummary !== undefined
          ? changes.errorSummary
          : this.errorSummary,
      hasRejectedWorkbook:
        changes.hasRejectedWorkbook ?? this.hasRejectedWorkbook,
      hasExportWorkbook: changes.hasExportWorkbook ?? this.hasExportWorkbook,
      createdAt: changes.createdAt ?? this.createdAt,
      startedAtUtc:
        changes.startedAtUtc !== undefined
          ? changes.startedAtUtc
          : this.startedAtUtc,
      completedAtUtc:
        changes.completedAtUtc !== undefined
          ? changes.completedAtUtc
          : this.completedAtUtc,
      expiresAtUtc: changes.expiresAtUtc ?? this.expiresAtUtc,
    });
  }
}
