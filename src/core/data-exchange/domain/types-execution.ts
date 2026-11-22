/**
 * Execution, dry-run validation, export, saved presets, job telemetry, and UI configuration
 * contracts for SCRIPE Data Exchange Studio.
 */
import type {
  DataExchangeColumnMapping,
  DataExchangeFileFormat,
  DataExchangeIdentityOnboardingMode,
  DataExchangeImportMode,
  DataTransferJobKind,
  DataTransferJobStatus,
} from "./types-common";

/** Per-sheet mapping payload for multi-sheet tenant migration batches. */
export interface DataExchangeSheetMappingInputDto {
  sheetName: string;
  entityKey: string;
  mode: DataExchangeImportMode;
  mappings: DataExchangeColumnMapping[];
}

/** Request payload for pre-flight dry-run validation and quota verification. */
export interface DataExchangeDryRunRequestDto {
  uploadId: string;
  format: string;
  entityKey: string;
  isMultiSheet: boolean;
  mode: DataExchangeImportMode;
  onboardingMode: DataExchangeIdentityOnboardingMode;
  allowCreateMissingLookups: boolean;
  timeZoneId?: string | null;
  mappings?: DataExchangeColumnMapping[] | null;
  sheetMappings?: DataExchangeSheetMappingInputDto[] | null;
}

/** Per-sheet pre-flight dry-run and quota summary. */
export interface DataExchangeDryRunSheetSummaryDto {
  sheetName: string;
  entityKey: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  estimatedNewInserts: number;
  estimatedUpdates: number;
  quotaMaxLimit?: number | null;
  quotaRemainingSlots?: number | null;
  quotaPassed: boolean;
  quotaDenialReason?: string | null;
}

/** Cell-level validation failure identified during dry-run or execution. */
export interface DataExchangeRowValidationError {
  rowNumber: number;
  sheetName: string;
  columnKey: string;
  errorCode: string;
  errorMessage: string;
}

/** Aggregate response returned by POST /api/v1/data-transfer/dry-run. */
export interface DataExchangeDryRunResponseDto {
  uploadId: string;
  canExecute: boolean;
  executedSyncEligible: boolean;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  estimatedNewInserts: number;
  estimatedUpdates: number;
  quotaPassed: boolean;
  quotaDenialReason?: string | null;
  sheetSummaries: DataExchangeDryRunSheetSummaryDto[];
  sampleErrors: DataExchangeRowValidationError[];
}

/** Request payload to commit an inspected workbook import batch. */
export interface DataExchangeExecuteImportRequestDto {
  uploadId: string;
  format: string;
  originalFileName: string;
  entityKey: string;
  isMultiSheet: boolean;
  mode: DataExchangeImportMode;
  onboardingMode: DataExchangeIdentityOnboardingMode;
  allowCreateMissingLookups: boolean;
  timeZoneId?: string | null;
  mappings?: DataExchangeColumnMapping[] | null;
  sheetMappings?: DataExchangeSheetMappingInputDto[] | null;
  runInBackground?: boolean;
}

export type ExecuteImportPayload = DataExchangeExecuteImportRequestDto;

/** Ephemeral one-time credential issued during OneTimeAutoPassword identity import. */
export interface DataExchangeGeneratedCredential {
  rowNumber: number;
  email: string;
  username: string;
  oneTimePassword: string;
}

/** Import execution result returned by POST /api/v1/data-transfer/import. */
export interface DataExchangeExecuteImportResponseDto {
  jobId: string;
  status: DataTransferJobStatus;
  executedSynchronously: boolean;
  totalRows: number;
  processedRows?: number;
  committedRows: number;
  createdRows: number;
  updatedRows: number;
  rejectedRows: number;
  cascadeDeferredRows: number;
  hasRejectedWorkbook: boolean;
  rejectedDownloadPath?: string | null;
  errorSummary?: string | null;
  ephemeralCredentials?: DataExchangeGeneratedCredential[] | null;
}

export type DataExchangeExecuteImportResponse = DataExchangeExecuteImportResponseDto;

/** Export query specification for formula-safe .xlsx/.csv/.tsv generation. */
export interface DataExchangeExportRequestDto {
  entityKey: string;
  format: DataExchangeFileFormat;
  locale: string;
  search?: string | null;
  selectedColumns?: string[] | null;
  filters?: Record<string, string> | null;
}

export type ExportDataPayload = DataExchangeExportRequestDto;

/** Saved column mapping preset persisted per tenant and entity. */
export interface DataExchangeSavedPresetDto {
  id: string;
  entityKey: string;
  name: string;
  importMode: DataExchangeImportMode;
  mappings: DataExchangeColumnMapping[];
  isDefault: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export type DataExchangeSavedPreset = DataExchangeSavedPresetDto;

/** Payload to create or update a saved mapping preset. */
export interface SaveMappingPresetRequestDto {
  id?: string | null;
  entityKey: string;
  name: string;
  importMode: DataExchangeImportMode;
  mappings: DataExchangeColumnMapping[];
  isDefault?: boolean;
}

export type SaveMappingPresetRequest = SaveMappingPresetRequestDto;

/** Historical or queued data exchange job entry. */
export interface DataTransferJobDto {
  id: string;
  kind: DataTransferJobKind;
  entityKey: string;
  isMultiSheet: boolean;
  importMode: string;
  onboardingMode: string;
  fileFormat: string;
  originalFileName?: string | null;
  status: DataTransferJobStatus;
  totalRows: number;
  processedRows: number;
  progressPercent: number;
  validRows: number;
  committedRows: number;
  createdRows: number;
  updatedRows: number;
  rejectedRows: number;
  errorSummary?: string | null;
  hasRejectedWorkbook: boolean;
  hasExportWorkbook: boolean;
  createdAt: string;
  startedAtUtc?: string | null;
  completedAtUtc?: string | null;
  expiresAtUtc: string;
}

export type DataTransferJob = DataTransferJobDto;

/** Query parameters for downloading a smart template workbook. */
export interface DownloadTemplateParams {
  entityKey: string;
  format?: DataExchangeFileFormat;
  locale?: string;
  multiSheet?: boolean;
  entityKeys?: string[];
}

/** Configuration attached to CrudConfig or toolbar actions to enable Data Exchange Studio. */
export interface DataExchangeFeatureConfig {
  entityKey: string;
  enableMultiSheetMigration?: boolean;
  multiSheetEntityKeys?: string[];
  initialPresetId?: string;
  activeSearch?: string;
  activeFilters?: Record<string, string>;
  /** Set true when rendered in a custom section header to avoid duplicate toolbar buttons. */
  hideToolbarActions?: boolean;
}

/** Local client-side validation diagnostic for a column mapping pair. */
export interface MappingCompatibilityIssue {
  sourceColumnHeader: string;
  targetFieldKey: string;
  reasonCode: "TYPE_MISMATCH" | "NON_NUMERIC_VALUES" | "INVALID_BOOL" | "INVALID_DATE" | "READ_ONLY" | "RESTRICTED";
  sampleValue?: string;
}
