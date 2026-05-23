import type { AppSubmission } from "../entities/AppSubmission";

/**
 * Submissions Repository Interface
 *
 * Contract for marketplace app submission workflow operations.
 * Paginated responses match Core.Application.Common.PagedResult<T>.
 * Payloads match backend CreateAppSubmissionRequest / ReviewSubmissionRequest DTOs.
 */
export interface ISubmissionsRepository {
  /** Paginated list of submissions with optional status filter. */
  getAll(params: {
    page: number;
    pageSize: number;
    status?: string;
  }): Promise<{
    items: AppSubmission[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }>;

  /** Get a single submission by encrypted ID. */
  getById(id: string): Promise<AppSubmission>;

  /**
   * Create a new app submission.
   * Payload matches backend CreateAppSubmissionRequest (uses pluginVersionId, not submittedVersion).
   */
  create(data: { appListingId: string; pluginVersionId: string }): Promise<string>;

  /**
   * Approve a submission.
   * Backend expects ReviewSubmissionRequest with optional feedback field.
   */
  approve(id: string, feedback?: string): Promise<void>;

  /**
   * Reject a submission with feedback.
   * Backend expects ReviewSubmissionRequest with feedback field.
   */
  reject(id: string, feedback: string): Promise<void>;

  /**
   * Request revisions on a submission with feedback.
   * Backend expects ReviewSubmissionRequest with feedback field.
   */
  requestRevisions(id: string, feedback: string): Promise<void>;
}
