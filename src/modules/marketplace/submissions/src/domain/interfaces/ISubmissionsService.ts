/**
 * ISubmissionsService
 *
 * Contract for the App Submissions HTTP service layer.
 * Returns raw API DTOs — conversion to domain entities happens in the Repository.
 */

/** API response shape for a submission list item. */
export interface SubmissionDto {
  id: string;
  appListingId: string;
  appName?: string;
  developerName?: string;
  submittedVersion?: string;
  status?: string;
  reviewerNotes?: string | null;
  submittedAt?: string;
  reviewedAt?: string | null;
}

/** Paginated API response wrapper matching Core.Application.Common.PagedResult<T>. */
export interface PaginatedSubmissionsResponse {
  items: SubmissionDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/** Payload for creating a new submission. */
export interface CreateSubmissionPayload {
  appListingId: string;
  pluginVersionId: string;
}

/**
 * Interface defining operations for the Submissions network service.
 */
export interface ISubmissionsService {
  /** Fetch paginated list of submissions. */
  getAll(params: {
    page: number;
    pageSize: number;
    status?: string;
  }): Promise<PaginatedSubmissionsResponse>;
  /** Fetch a single submission by ID. */
  getById(id: string): Promise<SubmissionDto>;
  /** Create a new submission. Returns new submission ID. */
  create(payload: CreateSubmissionPayload): Promise<{ id: string }>;
  /** Approve a pending submission. */
  approve(id: string, feedback: string): Promise<void>;
  /** Reject a submission with feedback. */
  reject(id: string, feedback: string): Promise<void>;
  /** Request revisions on a submission. */
  requestRevisions(id: string, feedback: string): Promise<void>;
}
