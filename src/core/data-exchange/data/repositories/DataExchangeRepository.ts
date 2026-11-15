import type { PagedResult } from "@core/interfaces/common.interface";
import { useAppStore } from "@core/store/useAppStore";
import {
  clearEntityDisplayNameCache,
  registerEntityDisplayName,
  registerEntityDisplayNames,
} from "../../presentation/utils/entity-display-names";
import type { IDataExchangeRepository } from "../../domain/interfaces/IDataExchangeRepository";
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

function triggerBrowserDownload(blob: Blob, fileName: string): void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = fileName;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

export type ContextKeyProvider = () => string;

/**
 * Repository implementation of {@link IDataExchangeRepository} coordinating DataExchangeService calls
 * and browser file downloads.
 */
export class DataExchangeRepository implements IDataExchangeRepository {
  private readonly descriptorCache = new Map<
    string,
    { data: DataExchangeDescriptorResponseDto; expiresAt: number }
  >();
  private readonly entitiesCache = new Map<
    string,
    { data: DataExchangeEntitySummaryDto[]; expiresAt: number }
  >();

  constructor(
    private readonly service: IDataExchangeService,
    private readonly contextKeyProvider?: ContextKeyProvider
  ) {}

  private getContextKey(): string {
    if (this.contextKeyProvider) {
      try {
        const key = this.contextKeyProvider();
        if (key) return key;
      } catch {
        // Fall back cleanly
      }
    }
    try {
      const state = useAppStore?.getState?.();
      const tenant = state?.user?.tenantId ?? state?.tenantCode ?? "platform";
      const user = state?.user?.id ?? "anon";
      return `${tenant}:${user}`;
    } catch {
      return "default";
    }
  }

  clearCache(entityKey?: string): void {
    if (entityKey) {
      const cacheKey = `${this.getContextKey()}:${entityKey.toLowerCase()}`;
      this.descriptorCache.delete(cacheKey);
    } else {
      this.descriptorCache.clear();
      this.entitiesCache.clear();
      clearEntityDisplayNameCache();
    }
  }

  async listEntities(signal?: AbortSignal): Promise<DataExchangeEntitySummaryDto[]> {
    const contextKey = this.getContextKey();
    const now = Date.now();
    const cached = this.entitiesCache.get(contextKey);
    if (cached && cached.expiresAt > now) {
      return cached.data;
    }

    const data = await this.service.listEntities(signal);
    this.entitiesCache.set(contextKey, { data, expiresAt: now + 30_000 });
    registerEntityDisplayNames(data);
    return data;
  }

  async getEntityDescriptor(
    entityKey: string,
    signal?: AbortSignal
  ): Promise<DataExchangeDescriptorResponseDto> {
    const contextKey = this.getContextKey();
    const cacheKey = `${contextKey}:${entityKey.toLowerCase()}`;
    const now = Date.now();
    const cached = this.descriptorCache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      return cached.data;
    }

    const data = await this.service.getEntityDescriptor(entityKey, signal);
    this.descriptorCache.set(cacheKey, { data, expiresAt: now + 30_000 });
    registerEntityDisplayName(data);
    return data;
  }

  async downloadTemplateFile(params: DownloadTemplateParams, signal?: AbortSignal): Promise<void> {
    const blob = await this.service.downloadTemplate(params, signal);
    const ext = params.format ?? "xlsx";
    const safeKey = (params.entityKey || "template").replace(/[^a-zA-Z0-9._-]+/g, "_");
    const prefix = params.multiSheet ? `${safeKey}-migration-template` : `${safeKey}-template`;
    triggerBrowserDownload(blob, `${prefix}.${ext}`);
  }

  async inspectUpload(
    entityKey: string,
    file: File,
    multiSheet: boolean,
    signal?: AbortSignal
  ): Promise<DataExchangeInspectResponseDto> {
    return this.service.inspectUpload(entityKey, file, multiSheet, signal);
  }

  async dryRun(
    request: DataExchangeDryRunRequestDto,
    signal?: AbortSignal
  ): Promise<DataExchangeDryRunResponseDto> {
    return this.service.dryRun(request, signal);
  }

  async executeImport(
    request: DataExchangeExecuteImportRequestDto,
    signal?: AbortSignal
  ): Promise<DataExchangeExecuteImportResponseDto> {
    const res = await this.service.executeImport(request, signal);
    // Invalidate descriptor cache so that updated quota and remaining slots are immediately refreshed
    this.clearCache(request.entityKey);
    if (request.sheetMappings && request.sheetMappings.length > 0) {
      for (const sm of request.sheetMappings) {
        if (sm.entityKey) {
          this.clearCache(sm.entityKey);
        }
      }
    }
    return res;
  }

  async exportToFile(request: DataExchangeExportRequestDto, signal?: AbortSignal): Promise<void> {
    const blob = await this.service.executeExport(request, signal);
    const safeKey = request.entityKey.replace(/[^a-zA-Z0-9._-]+/g, "_");
    const stamp = new Date().toISOString().slice(0, 10);
    triggerBrowserDownload(blob, `${safeKey}-export-${stamp}.${request.format}`);
  }

  async enqueueExport(
    request: DataExchangeExportRequestDto,
    signal?: AbortSignal
  ): Promise<DataTransferJobDto> {
    return this.service.enqueueExport(request, signal);
  }

  async cancelJob(jobId: string, signal?: AbortSignal): Promise<DataTransferJobDto> {
    return this.service.cancelJob(jobId, signal);
  }

  async listPresets(
    entityKey?: string,
    signal?: AbortSignal
  ): Promise<DataExchangeSavedPresetDto[]> {
    return this.service.listPresets(entityKey, signal);
  }

  async savePreset(
    request: SaveMappingPresetRequestDto,
    signal?: AbortSignal
  ): Promise<DataExchangeSavedPresetDto> {
    return this.service.savePreset(request, signal);
  }

  async deletePreset(id: string, signal?: AbortSignal): Promise<void> {
    return this.service.deletePreset(id, signal);
  }

  async listJobs(
    page: number,
    pageSize: number,
    entityKey?: string,
    signal?: AbortSignal
  ): Promise<PagedResult<DataTransferJobDto>> {
    return this.service.listJobs(page, pageSize, entityKey, signal);
  }

  async getJob(jobId: string, signal?: AbortSignal): Promise<DataTransferJobDto> {
    return this.service.getJob(jobId, signal);
  }

  async downloadArtifactFile(
    jobId: string,
    artifactKind: DataExchangeArtifactKind,
    suggestedName?: string,
    signal?: AbortSignal
  ): Promise<void> {
    const blob = await this.service.downloadArtifact(jobId, artifactKind, signal);
    const fallbackName =
      suggestedName ?? `data-exchange-${artifactKind}-${jobId.slice(0, 8)}.xlsx`;
    triggerBrowserDownload(blob, fallbackName);
  }
}
