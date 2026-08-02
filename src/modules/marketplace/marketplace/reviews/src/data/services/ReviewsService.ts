/**
 * ReviewsService
 *
 * HTTP service implementation for the App Reviews sub-module.
 * Responsible ONLY for making API calls and returning raw DTOs.
 * All domain mapping happens in ReviewsRepository.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import type {
  IReviewsService,
  PaginatedReviewsResponse,
} from "../../domain/interfaces/IReviewsService";
import { REVIEWS_ENDPOINTS } from "./reviews.endpoints";

/**
 * Http API network service for reviews.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class ReviewsService implements IReviewsService {
  constructor(private readonly api: IApiService) {}

  /** Fetch paginated list of app reviews. */
  async getAll(params: {
    page: number;
    pageSize: number;
    appListingId?: string;
  }): Promise<PaginatedReviewsResponse> {
    const url = buildUrl(REVIEWS_ENDPOINTS.REVIEWS, {
      page: params.page,
      pageSize: params.pageSize,
      appListingId: params.appListingId || undefined,
    });
    return this.api.get<PaginatedReviewsResponse>(url);
  }

  /** Moderate (delete) a review. */
  async delete(id: string): Promise<void> {
    await this.api.delete(REVIEWS_ENDPOINTS.REVIEW_BY_ID(id));
  }
}
