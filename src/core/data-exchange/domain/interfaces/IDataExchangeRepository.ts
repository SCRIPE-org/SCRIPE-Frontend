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
 * Repository contract mediating ViewModels and DataExchangeService.
 */
export interface IDataExchangeRepository {
  /** Clears cached entity summaries and descriptors (e.g., on tenant switch, logout, or import commit). */
  clearCache?(entityKey?: string): void;

  /** Lists all entities permitted for data exchange in the current tenant. */
  listEntities(signal?: AbortSignal): Promise<DataExchangeEntitySummaryDto[]>;

  /** Retrieves dynamic columns, quota telemetry, permissions, and FLS restrictions for an entity. */
  getEntityDescriptor(
    entityKey: string,
    signal?: AbortSignal
  ): Promise<DataExchangeDescriptorResponseDto>;

  /** Downloads a smart bilingual template workbook and saves it to the user's browser. */
  downloadTemplateFile(params: DownloadTemplateParams, signal?: AbortSignal): Promise<void>;

  /** Uploads a spreadsheet file for OWASP validation and column inspection. */
  inspectUpload(
    entityKey: string,
    file: File,
    multiSheet: boolean,
    signal?: AbortSignal
  ): Promise<DataExchangeInspectResponseDto>;

  /** Runs non-mutating validation and quota pre-flight checks. */
  dryRun(
    request: DataExchangeDryRunRequestDto,
    signal?: AbortSignal
  ): Promise<DataExchangeDryRunResponseDto>;

  /** Executes or enqueues a partial-commit import batch. */
  executeImport(
    request: DataExchangeExecuteImportRequestDto,
    signal?: AbortSignal
  ): Promise<DataExchangeExecuteImportResponseDto>;

  /** Exports data and triggers a browser download. */
  exportToFile(request: DataExchangeExportRequestDto, signal?: AbortSignal): Promise<void>;

  /** Enqueues an export job to execute asynchronously in the background. */
  enqueueExport(
    request: DataExchangeExportRequestDto,
    signal?: AbortSignal
  ): Promise<DataTransferJobDto>;

  /** Requests cancellation of a queued or running job. */
  cancelJob(jobId: string, signal?: AbortSignal): Promise<DataTransferJobDto>;

  /** Lists saved column mapping presets. */
  listPresets(entityKey?: string, signal?: AbortSignal): Promise<DataExchangeSavedPresetDto[]>;

  /** Saves or updates a column mapping preset. */
  savePreset(
    request: SaveMappingPresetRequestDto,
    signal?: AbortSignal
  ): Promise<DataExchangeSavedPresetDto>;

  /** Deletes a saved mapping preset. */
  deletePreset(id: string, signal?: AbortSignal): Promise<void>;

  /** Lists paginated job history entries. */
  listJobs(
    page: number,
    pageSize: number,
    entityKey?: string,
    signal?: AbortSignal
  ): Promise<PagedResult<DataTransferJobDto>>;

  /** Fetches the latest state of a single job. */
  getJob(jobId: string, signal?: AbortSignal): Promise<DataTransferJobDto>;

  /** Downloads a rejected-rows or exported artifact workbook to the browser. */
  downloadArtifactFile(
    jobId: string,
    artifactKind: DataExchangeArtifactKind,
    suggestedName?: string,
    signal?: AbortSignal
  ): Promise<void>;
}
