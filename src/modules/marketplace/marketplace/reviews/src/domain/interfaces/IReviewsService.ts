/**
 * IReviewsService
 *
 * Contract for the App Reviews HTTP service layer.
 * Returns raw API DTOs — conversion to domain entities happens in the Repository.
 */

/**
 * API response shape for an app review.
 *
 * Matches Marketplace.Application.DTOs.AppReviewListResponse, the shape
 * actually returned by GET /marketplace/reviews (the only review endpoint
 * this module calls):
 *   Id, AppListingId, AppName, Rating, Title, Content, HasReply, CreatedAt.
 *
 * There is no tenantId, tenant/reviewer name, or `body` field on the wire —
 * the review text is sent as `content`. `tenantId` is kept optional here
 * only in case a future detail endpoint adds it; it is never populated by
 * the list endpoint today.
 */
export interface ReviewDto {
  id: string;
  appListingId: string;
  appName?: string;
  tenantId?: string;
  rating?: number;
  title?: string;
  /** Real backend field is `content` (AppReviewListResponse.Content), not `body`. */
  content?: string;
  createdAt?: string;
  isModerated?: boolean;
}

/** Paginated API response wrapper matching Core.Application.Common.PagedResult<T>. */
export interface PaginatedReviewsResponse {
  items: ReviewDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Http API network service for i reviews.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export interface IReviewsService {
  /** Fetch paginated list of reviews. */
  getAll(params: {
    page: number;
    pageSize: number;
    appListingId?: string;
  }): Promise<PaginatedReviewsResponse>;
  /** Delete (moderate) a review. */
  delete(id: string): Promise<void>;
}
