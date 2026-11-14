import type { PagedResult } from "@core/interfaces/common.interface";
import type { DataExchangeArtifactKind } from "@core/data-exchange/domain/types";
import { DataTransferJob } from "../../domain/entities/DataTransferJob";
import type {
  IJobsRepository,
  JobsQueryParams,
} from "../../domain/interfaces/IJobsRepository";
import type { IJobsService } from "../../domain/interfaces/IJobsService";
import { DataTransferJobMapper } from "../mappers/DataTransferJobMapper";

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
    const pagedModels = await this.service.fetchJobs(params, signal);
    return {
      ...pagedModels,
      items: (pagedModels.items ?? []).map((m) => DataTransferJobMapper.toDomain(m)),
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
    artifactKind: DataExchangeArtifactKind,
    signal?: AbortSignal
  ): Promise<Blob> {
    return this.service.fetchArtifactBlob(jobId, artifactKind, signal);
  }
}
