import type { PagedResult } from "@core/interfaces/common.interface";
import type { DataTransferArtifactKind } from "../entities/DataTransferJob";
import type { DataTransferJobModel } from "../../data/models/DataTransferJobModel";
import type { JobsQueryParams } from "./IJobsRepository";

/**
 * Low-level HTTP service contract for data transfer jobs API endpoints.
 */
export interface IJobsService {
  /**
   * Fetches paginated jobs from the backend API.
   */
  fetchJobs(
    params?: JobsQueryParams,
    signal?: AbortSignal
  ): Promise<PagedResult<DataTransferJobModel>>;

  /**
   * Fetches a specific job by its identifier.
   */
  fetchJob(jobId: string, signal?: AbortSignal): Promise<DataTransferJobModel>;

  /**
   * Sends a cancellation request for a job.
   */
  cancelJob(jobId: string, signal?: AbortSignal): Promise<DataTransferJobModel>;

  /**
   * Fetches an artifact workbook blob for a job.
   */
  fetchArtifactBlob(
    jobId: string,
    artifactKind: DataTransferArtifactKind,
    signal?: AbortSignal
  ): Promise<Blob>;
}
