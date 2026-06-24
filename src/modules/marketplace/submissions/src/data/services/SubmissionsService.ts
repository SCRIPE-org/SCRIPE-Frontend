/**
 * SubmissionsService
 *
 * HTTP service implementation for the App Submissions sub-module.
 * Responsible ONLY for making API calls and returning raw DTOs.
 * All domain mapping happens in SubmissionsRepository.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { MARKETPLACE_ENDPOINTS } from "@core/config/api-endpoints";
import type {
  ISubmissionsService,
  SubmissionDto,
  PaginatedSubmissionsResponse,
  CreateSubmissionPayload,
} from "../../domain/interfaces/ISubmissionsService";

/**
 * API service for executing HTTP calls related to Submissions endpoints.
 */
export class SubmissionsService implements ISubmissionsService {
  constructor(private readonly api: IApiService) {}

  /** Fetch paginated list of submissions. */
  async getAll(params: {
    page: number;
    pageSize: number;
    status?: string;
  }): Promise<PaginatedSubmissionsResponse> {
    const q = new URLSearchParams({
      page: String(params.page),
      pageSize: String(params.pageSize),
      ...(params.status && { status: params.status }),
    });
    return this.api.get<PaginatedSubmissionsResponse>(
      `${MARKETPLACE_ENDPOINTS.MARKETPLACE.SUBMISSIONS}?${q}`
    );
  }

  /** Fetch a single submission by ID. */
  async getById(id: string): Promise<SubmissionDto> {
    return this.api.get<SubmissionDto>(MARKETPLACE_ENDPOINTS.MARKETPLACE.SUBMISSION_BY_ID(id));
  }

  /** Create a new app submission. */
  async create(payload: CreateSubmissionPayload): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(MARKETPLACE_ENDPOINTS.MARKETPLACE.SUBMISSIONS, payload);
  }

  /** Approve a pending submission. */
  async approve(id: string, feedback: string): Promise<void> {
    await this.api.post(MARKETPLACE_ENDPOINTS.MARKETPLACE.SUBMISSION_APPROVE(id), { feedback });
  }

  /** Reject a submission with reviewer feedback. */
  async reject(id: string, feedback: string): Promise<void> {
    await this.api.post(MARKETPLACE_ENDPOINTS.MARKETPLACE.SUBMISSION_REJECT(id), { feedback });
  }

  /** Request revisions on a submission. */
  async requestRevisions(id: string, feedback: string): Promise<void> {
    await this.api.post(MARKETPLACE_ENDPOINTS.MARKETPLACE.SUBMISSION_REQUEST_REVISIONS(id), {
      feedback,
    });
  }
}
