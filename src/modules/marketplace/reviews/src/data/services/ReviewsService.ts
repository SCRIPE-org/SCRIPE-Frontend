/**
 * ReviewsService
 *
 * HTTP service implementation for the App Reviews sub-module.
 * Responsible ONLY for making API calls and returning raw DTOs.
 * All domain mapping happens in ReviewsRepository.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { MARKETPLACE_ENDPOINTS } from "@core/config/api-endpoints";
import type {
  IReviewsService,
  PaginatedReviewsResponse,
} from "../../domain/interfaces/IReviewsService";

/**
 * API service for executing HTTP calls related to Reviews endpoints.
 */
export class ReviewsService implements IReviewsService {
  constructor(private readonly api: IApiService) {}

  /** Fetch paginated list of app reviews. */
  async getAll(params: {
    page: number;
    pageSize: number;
    appListingId?: string;
  }): Promise<PaginatedReviewsResponse> {
    const q = new URLSearchParams({
      page: String(params.page),
      pageSize: String(params.pageSize),
      ...(params.appListingId && { appListingId: params.appListingId }),
    });
    return this.api.get<PaginatedReviewsResponse>(
      `${MARKETPLACE_ENDPOINTS.MARKETPLACE.REVIEWS}?${q}`
    );
  }

  /** Moderate (delete) a review. */
  async delete(id: string): Promise<void> {
    await this.api.delete(MARKETPLACE_ENDPOINTS.MARKETPLACE.REVIEW_BY_ID(id));
  }
}
