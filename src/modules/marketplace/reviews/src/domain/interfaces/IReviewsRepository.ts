import type { AppReview } from "../entities/AppReview";

/**
 * Reviews Repository Interface
 *
 * Contract for marketplace app review moderation operations.
 * Paginated responses align with Core.Application.Common.PagedResult<T>.
 */
export interface IReviewsRepository {
  /** Paginated list of app reviews with optional appListingId filter. */
  getAll(params: { page: number; pageSize: number; appListingId?: string }): Promise<{
    items: AppReview[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }>;

  /** Soft-delete a review by encrypted ID (admin moderation action). */
  delete(id: string): Promise<void>;
}
