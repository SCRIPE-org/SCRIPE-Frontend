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
 * Interface structure detailing the properties and attributes of Review Dsr Request.
 */
export interface ReviewDsrRequest {
  isApproved: boolean;
  resolution?: string;
}

/**
 * Interface structure detailing the properties and attributes of Dsr List Params.
 */
export interface DsrListParams {
  page?: number;
  pageSize?: number;
  status?: string;
  requestType?: string;
  search?: string;
}
