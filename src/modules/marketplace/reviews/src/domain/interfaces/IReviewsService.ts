/**
 * IReviewsService
 *
 * Contract for the App Reviews HTTP service layer.
 * Returns raw API DTOs — conversion to domain entities happens in the Repository.
 */

/** API response shape for an app review. */
export interface ReviewDto {
  id: string;
  appListingId: string;
  appName?: string;
  tenantId: string;
  tenantName?: string;
  rating?: number;
  title?: string;
  body?: string;
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

export interface IReviewsService {
  /** Fetch paginated list of reviews. */
  getAll(params: { page: number; pageSize: number; appListingId?: string }): Promise<PaginatedReviewsResponse>;
  /** Delete (moderate) a review. */
  delete(id: string): Promise<void>;
}
