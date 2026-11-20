import type { PagedResult } from "@core/interfaces/common.interface";
import {
  DataTransferJob,
  type DataTransferArtifactKind,
} from "../../domain/entities/DataTransferJob";
import type {
  IJobsRepository,
  JobsQueryParams,
} from "../../domain/interfaces/IJobsRepository";
import type { IJobsService } from "../../domain/interfaces/IJobsService";
import { DataTransferJobMapper } from "../mappers/DataTransferJobMapper";
import type { DataTransferJobModel } from "../models/DataTransferJobModel";

/**
 * Concrete repository implementing IJobsRepository.
 */
export class JobsRepository implements IJobsRepository {
  constructor(private readonly service: IJobsService) {}

  /**
   * Retrieves and maps paginated data transfer jobs.
   */
  async getJobs(
    params?: JobsQueryParams,
    signal?: AbortSignal
  ): Promise<PagedResult<DataTransferJob>> {
    const rawResponse = await this.service.fetchJobs(params, signal);
    const pagedModels =
      rawResponse &&
      typeof rawResponse === "object" &&
      "data" in rawResponse &&
      !("items" in rawResponse)
        ? (rawResponse as unknown as { data?: PagedResult<DataTransferJobModel> }).data
        : rawResponse;

    const rawItems = Array.isArray(pagedModels?.items) ? pagedModels.items : [];
    const safePageSize =
      typeof pagedModels?.pageSize === "number" &&
      Number.isFinite(pagedModels.pageSize) &&
      pagedModels.pageSize > 0
        ? Math.floor(pagedModels.pageSize)
        : Math.max(1, params?.pageSize ?? 20);
    const safeTotalCount =
      typeof pagedModels?.totalCount === "number" &&
      Number.isFinite(pagedModels.totalCount) &&
      pagedModels.totalCount >= 0
        ? Math.floor(pagedModels.totalCount)
        : rawItems.length;
    const safeTotalPages =
      typeof pagedModels?.totalPages === "number" &&
      Number.isFinite(pagedModels.totalPages) &&
      pagedModels.totalPages >= 1
        ? Math.floor(pagedModels.totalPages)
        : Math.max(1, Math.ceil(safeTotalCount / safePageSize));
    const safePageNumber =
      typeof pagedModels?.pageNumber === "number" &&
      Number.isFinite(pagedModels.pageNumber) &&
      pagedModels.pageNumber >= 1
        ? Math.floor(pagedModels.pageNumber)
        : Math.max(1, params?.page ?? 1);

    return {
      items: rawItems.map((m) => DataTransferJobMapper.toDomain(m)),
      totalCount: safeTotalCount,
      pageNumber: safePageNumber,
      pageSize: safePageSize,
      totalPages: safeTotalPages,
      hasNextPage: Boolean(pagedModels?.hasNextPage ?? safePageNumber < safeTotalPages),
      hasPreviousPage: Boolean(pagedModels?.hasPreviousPage ?? safePageNumber > 1),
      mayHaveMoreResults: pagedModels?.mayHaveMoreResults,
    };
  }

  /**
   * Retrieves a single job by identifier.
   */
  async getJobById(jobId: string, signal?: AbortSignal): Promise<DataTransferJob> {
    const model = await this.service.fetchJob(jobId, signal);
    return DataTransferJobMapper.toDomain(model);
  }

  /**
   * Requests cancellation of a queued or running job.
   */
  async cancelJob(jobId: string, signal?: AbortSignal): Promise<DataTransferJob> {
    const model = await this.service.cancelJob(jobId, signal);
    return DataTransferJobMapper.toDomain(model);
  }

  /**
   * Downloads a rejected rows workbook or export artifact.
   */
  async downloadArtifact(
    jobId: string,
    artifactKind: DataTransferArtifactKind,
    signal?: AbortSignal
  ): Promise<Blob> {
    return this.service.fetchArtifactBlob(jobId, artifactKind, signal);
  }
}
