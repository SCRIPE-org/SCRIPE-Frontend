import { buildUrl } from "@core/config/api-endpoints/_shared";
import type { PagedResult } from "@core/interfaces/common.interface";
import type { IApiService } from "@core/interfaces/api.interface";
import type { IDataExchangeService } from "../../domain/interfaces/IDataExchangeService";
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
} from "../../domain/types";
import { DATA_EXCHANGE_ENDPOINTS } from "./data-exchange.endpoints";

/**
 * HTTP client implementation of {@link IDataExchangeService} backed strictly by {@link IApiService}.
 */
export class DataExchangeService implements IDataExchangeService {
  constructor(private readonly apiService: IApiService) {}

  async listEntities(signal?: AbortSignal): Promise<DataExchangeEntitySummaryDto[]> {
    return this.apiService.get<DataExchangeEntitySummaryDto[]>(
      DATA_EXCHANGE_ENDPOINTS.ENTITIES,
      undefined,
      signal
    );
  }

  async getEntityDescriptor(
    entityKey: string,
    signal?: AbortSignal
  ): Promise<DataExchangeDescriptorResponseDto> {
    return this.apiService.get<DataExchangeDescriptorResponseDto>(
      DATA_EXCHANGE_ENDPOINTS.DESCRIPTOR(entityKey),
      undefined,
      signal
    );
  }

  async downloadTemplate(params: DownloadTemplateParams, signal?: AbortSignal): Promise<Blob> {
    const url = buildUrl(DATA_EXCHANGE_ENDPOINTS.TEMPLATE, {
      entityKey: params.entityKey,
      format: params.format ?? "xlsx",
      locale: params.locale ?? "en",
      multiSheet: params.multiSheet ?? false,
      entityKeys:
        params.entityKeys && params.entityKeys.length > 0
          ? params.entityKeys.join(",")
          : undefined,
    });
    return this.apiService.getBlob(url, signal);
  }

  async inspectUpload(
    entityKey: string,
    file: File,
    multiSheet: boolean,
    signal?: AbortSignal
  ): Promise<DataExchangeInspectResponseDto> {
    const formData = new FormData();
    formData.append("entityKey", entityKey);
    formData.append("multiSheet", String(multiSheet));
    formData.append("file", file);

    return this.apiService.post<DataExchangeInspectResponseDto>(
      DATA_EXCHANGE_ENDPOINTS.INSPECT,
      formData,
      signal
    );
  }

  async dryRun(
    request: DataExchangeDryRunRequestDto,
    signal?: AbortSignal
  ): Promise<DataExchangeDryRunResponseDto> {
    return this.apiService.post<DataExchangeDryRunResponseDto>(
      DATA_EXCHANGE_ENDPOINTS.DRY_RUN,
      request,
      signal
    );
  }

  async executeImport(
    request: DataExchangeExecuteImportRequestDto,
    signal?: AbortSignal
  ): Promise<DataExchangeExecuteImportResponseDto> {
    return this.apiService.post<DataExchangeExecuteImportResponseDto>(
      DATA_EXCHANGE_ENDPOINTS.IMPORT,
      request,
      signal
    );
  }

  async executeExport(request: DataExchangeExportRequestDto, signal?: AbortSignal): Promise<Blob> {
    return this.apiService.postBlob(DATA_EXCHANGE_ENDPOINTS.EXPORT, request, signal);
  }

  async enqueueExport(
    request: DataExchangeExportRequestDto,
    signal?: AbortSignal
  ): Promise<DataTransferJobDto> {
    return this.apiService.post<DataTransferJobDto>(
      DATA_EXCHANGE_ENDPOINTS.EXPORT_JOBS,
      request,
      signal
    );
  }

  async cancelJob(jobId: string, signal?: AbortSignal): Promise<DataTransferJobDto> {
    return this.apiService.post<DataTransferJobDto>(
      DATA_EXCHANGE_ENDPOINTS.CANCEL_JOB(jobId),
      {},
      signal
    );
  }

  async listPresets(
    entityKey?: string,
    signal?: AbortSignal
  ): Promise<DataExchangeSavedPresetDto[]> {
    return this.apiService.get<DataExchangeSavedPresetDto[]>(
      DATA_EXCHANGE_ENDPOINTS.PRESETS,
      entityKey ? { entityKey } : undefined,
      signal
    );
  }

  async savePreset(
    request: SaveMappingPresetRequestDto,
    signal?: AbortSignal
  ): Promise<DataExchangeSavedPresetDto> {
    return this.apiService.post<DataExchangeSavedPresetDto>(
      DATA_EXCHANGE_ENDPOINTS.PRESETS,
      request,
      signal
    );
  }

  async deletePreset(id: string, signal?: AbortSignal): Promise<void> {
    await this.apiService.delete<void>(DATA_EXCHANGE_ENDPOINTS.PRESET_BY_ID(id), signal);
  }

  async listJobs(
    page: number,
    pageSize: number,
    entityKey?: string,
    signal?: AbortSignal
  ): Promise<PagedResult<DataTransferJobDto>> {
    return this.apiService.get<PagedResult<DataTransferJobDto>>(
      DATA_EXCHANGE_ENDPOINTS.JOBS,
      entityKey ? { page, pageSize, entityKey } : { page, pageSize },
      signal
    );
  }

  async getJob(jobId: string, signal?: AbortSignal): Promise<DataTransferJobDto> {
    return this.apiService.get<DataTransferJobDto>(
      DATA_EXCHANGE_ENDPOINTS.JOB_BY_ID(jobId),
      undefined,
      signal
    );
  }

  async downloadArtifact(
    jobId: string,
    artifactKind: DataExchangeArtifactKind,
    signal?: AbortSignal
  ): Promise<Blob> {
    return this.apiService.getBlob(
      DATA_EXCHANGE_ENDPOINTS.DOWNLOAD_ARTIFACT(jobId, artifactKind),
      signal
    );
  }
}
