/**
 * DSR Request/Command Types
 * Used by service and repository for write operations.
 */

export interface SubmitDsrRequest {
  requestType: string;
  regulationCode: string;
  requesterNotes?: string;
  subjectId?: string;
  subjectEmail?: string;
  subjectType?: string;
}

/**
 * Domain model representing a Review Dsr Request structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface ReviewDsrRequest {
  isApproved: boolean;
  resolution?: string;
}

/**
 * Domain model representing a Dsr List Params structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface DsrListParams {
  page?: number;
  pageSize?: number;
  status?: string;
  requestType?: string;
  search?: string;
}
