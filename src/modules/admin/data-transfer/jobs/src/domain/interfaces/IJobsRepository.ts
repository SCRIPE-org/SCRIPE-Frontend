import type { PagedResult } from "@core/interfaces/common.interface";
import type {
  DataTransferArtifactKind,
  DataTransferJob,
} from "../entities/DataTransferJob";

/**
 * Filter parameters for querying data transfer jobs.
 */
export interface JobsQueryParams {
  page?: number;
  pageSize?: number;
  entityKey?: string;
  status?: string;
  search?: string;
}

/**
 * Repository interface for managing data transfer jobs.
 */
export interface IJobsRepository {
  /**
   * Retrieves a paginated list of data transfer jobs.
   */
  getJobs(
    params?: JobsQueryParams,
    signal?: AbortSignal
  ): Promise<PagedResult<DataTransferJob>>;

  /**
   * Retrieves a single job by its identifier.
   */
  getJobById(jobId: string, signal?: AbortSignal): Promise<DataTransferJob>;

  /**
   * Requests cancellation of an in-flight or queued job.
   */
  cancelJob(jobId: string, signal?: AbortSignal): Promise<DataTransferJob>;

  /**
   * Downloads an artifact workbook (rejected rows or export output).
   */
  downloadArtifact(
    jobId: string,
    artifactKind: DataTransferArtifactKind,
    signal?: AbortSignal
  ): Promise<Blob>;
}
