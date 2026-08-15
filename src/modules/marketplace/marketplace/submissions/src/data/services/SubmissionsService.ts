/**
 * SubmissionsService
 *
 * HTTP service implementation for the App Submissions sub-module.
 * Responsible ONLY for making API calls and returning raw DTOs.
 * All domain mapping happens in SubmissionsRepository.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import type {
  ISubmissionsService,
  SubmissionDto,
  PaginatedSubmissionsResponse,
  CreateSubmissionPayload,
} from "../../domain/interfaces/ISubmissionsService";
import { SUBMISSIONS_ENDPOINTS } from "./submissions.endpoints";

/**
 * Http API network service for submissions.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class SubmissionsService implements ISubmissionsService {
  constructor(private readonly api: IApiService) {}

  /** Fetch paginated list of submissions. */
  async getAll(params: {
    page: number;
    pageSize: number;
    status?: string;
  }): Promise<PaginatedSubmissionsResponse> {
    const url = buildUrl(SUBMISSIONS_ENDPOINTS.SUBMISSIONS, {
      page: params.page,
      pageSize: params.pageSize,
      status: params.status || undefined,
    });
    return this.api.get<PaginatedSubmissionsResponse>(url);
  }

  /** Fetch a single submission by ID. */
  async getById(id: string): Promise<SubmissionDto> {
    return this.api.get<SubmissionDto>(SUBMISSIONS_ENDPOINTS.SUBMISSION_BY_ID(id));
  }

  /** Create a new app submission. */
  async create(payload: CreateSubmissionPayload): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(SUBMISSIONS_ENDPOINTS.SUBMISSIONS, payload);
  }

  /** Approve a pending submission. */
  async approve(id: string, feedback: string): Promise<void> {
    await this.api.post(SUBMISSIONS_ENDPOINTS.SUBMISSION_APPROVE(id), { feedback });
  }

  /** Reject a submission with reviewer feedback. */
  async reject(id: string, feedback: string): Promise<void> {
    await this.api.post(SUBMISSIONS_ENDPOINTS.SUBMISSION_REJECT(id), { feedback });
  }

  /** Request revisions on a submission. */
  async requestRevisions(id: string, feedback: string): Promise<void> {
    await this.api.post(SUBMISSIONS_ENDPOINTS.SUBMISSION_REQUEST_REVISIONS(id), {
      feedback,
    });
  }
}
