import type { IApiService } from "@core/interfaces/api.interface";
import { DATA_EXCHANGE_ENDPOINTS } from "@core/data-exchange/data/services/data-exchange.endpoints";
import type { PagedResult } from "@core/interfaces/common.interface";
import type { DataExchangeArtifactKind } from "@core/data-exchange/domain/types";
import type { DataTransferJobModel } from "../models/DataTransferJobModel";
import type {
  IJobsService,
} from "../../domain/interfaces/IJobsService";
import type { JobsQueryParams } from "../../domain/interfaces/IJobsRepository";

/**
 * Service handling HTTP calls to DataTransfer jobs endpoints.
 */
export class JobsService implements IJobsService {
  constructor(private readonly apiService: IApiService) {}

  /**
   * Fetches paginated jobs with optional filtering.
   */
  async fetchJobs(
    params?: JobsQueryParams,
    signal?: AbortSignal
  ): Promise<PagedResult<DataTransferJobModel>> {
    const query: Record<string, unknown> = {};
    if (params?.page) query.page = params.page;
    if (params?.pageSize) query.pageSize = params.pageSize;
    if (params?.entityKey) query.entityKey = params.entityKey;
    if (params?.status) query.status = params.status;
    if (params?.search) query.search = params.search;

    return this.apiService.get<PagedResult<DataTransferJobModel>>(
      DATA_EXCHANGE_ENDPOINTS.JOBS,
      Object.keys(query).length > 0 ? query : undefined,
      signal
    );
  }

  /**
   * Fetches a specific job by identifier.
   */
  async fetchJob(jobId: string, signal?: AbortSignal): Promise<DataTransferJobModel> {
    return this.apiService.get<DataTransferJobModel>(
      DATA_EXCHANGE_ENDPOINTS.JOB_BY_ID(jobId),
      undefined,
      signal
    );
  }

  /**
   * Requests cancellation of a queued or active job.
   */
  async cancelJob(jobId: string, signal?: AbortSignal): Promise<DataTransferJobModel> {
    return this.apiService.post<DataTransferJobModel>(
      DATA_EXCHANGE_ENDPOINTS.CANCEL_JOB(jobId),
      {},
      signal
    );
  }

  /**
   * Downloads a job artifact (rejected rows or export workbook).
   */
  async fetchArtifactBlob(
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
