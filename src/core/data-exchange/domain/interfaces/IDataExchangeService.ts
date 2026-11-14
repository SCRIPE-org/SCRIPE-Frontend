import type { PagedResult } from "@core/interfaces/common.interface";
import type {
  DataExchangeArtifactKind,
  DataExchangeDescriptorResponseDto,
  DataExchangeDryRunRequestDto,
  DataExchangeDryRunResponseDto,
  DataExchangeEntitySummaryDto,
  DataExchangeExecuteImportRequestDto,
  DataExchangeExecuteImportResponseDto,
  DataExchangeExportRequestDto,
  DataExchangeInspectResponseDto,
  DataExchangeSavedPresetDto,
  DataTransferJobDto,
  DownloadTemplateParams,
  SaveMappingPresetRequestDto,
} from "../types";

/**
 * Low-level HTTP service contract for SCRIPE Data Exchange Studio endpoints.
 */
export interface IDataExchangeService {
  /** Lists all entities permitted for data exchange in the current tenant. */
  listEntities(signal?: AbortSignal): Promise<DataExchangeEntitySummaryDto[]>;

  /** Retrieves dynamic columns, quota telemetry, permissions, and FLS restrictions for an entity. */
  getEntityDescriptor(
    entityKey: string,
    signal?: AbortSignal
  ): Promise<DataExchangeDescriptorResponseDto>;

  /** Downloads a smart bilingual template workbook as a Blob. */
  downloadTemplate(params: DownloadTemplateParams, signal?: AbortSignal): Promise<Blob>;

  /** Uploads a spreadsheet file for OWASP safety validation and column inspection. */
  inspectUpload(
    entityKey: string,
    file: File,
    multiSheet: boolean,
    signal?: AbortSignal
  ): Promise<DataExchangeInspectResponseDto>;

  /** Executes a non-mutating validation and quota pre-flight dry-run. */
  dryRun(
    request: DataExchangeDryRunRequestDto,
    signal?: AbortSignal
  ): Promise<DataExchangeDryRunResponseDto>;

  /** Commits or enqueues an inspected import batch. */
  executeImport(
    request: DataExchangeExecuteImportRequestDto,
    signal?: AbortSignal
  ): Promise<DataExchangeExecuteImportResponseDto>;

  /** Generates a formula-safe spreadsheet export Blob. */
  executeExport(request: DataExchangeExportRequestDto, signal?: AbortSignal): Promise<Blob>;

  /** Enqueues a formula-safe spreadsheet export job to run asynchronously in the background. */
  enqueueExport(
    request: DataExchangeExportRequestDto,
    signal?: AbortSignal
  ): Promise<DataTransferJobDto>;

  /** Requests cancellation of a queued or running data exchange job. */
  cancelJob(jobId: string, signal?: AbortSignal): Promise<DataTransferJobDto>;

  /** Lists saved column mapping presets scoped by optional entity key. */
  listPresets(entityKey?: string, signal?: AbortSignal): Promise<DataExchangeSavedPresetDto[]>;

  /** Creates or updates a saved column mapping preset. */
  savePreset(
    request: SaveMappingPresetRequestDto,
    signal?: AbortSignal
  ): Promise<DataExchangeSavedPresetDto>;

  /** Deletes a saved mapping preset by identifier. */
  deletePreset(id: string, signal?: AbortSignal): Promise<void>;

  /** Lists paginated job history entries scoped by optional entity key. */
  listJobs(
    page: number,
    pageSize: number,
    entityKey?: string,
    signal?: AbortSignal
  ): Promise<PagedResult<DataTransferJobDto>>;

  /** Fetches the latest state of a queued or completed job. */
  getJob(jobId: string, signal?: AbortSignal): Promise<DataTransferJobDto>;

  /** Downloads a rejected rows workbook or export artifact for a job. */
  downloadArtifact(
    jobId: string,
    artifactKind: DataExchangeArtifactKind,
    signal?: AbortSignal
  ): Promise<Blob>;
}
