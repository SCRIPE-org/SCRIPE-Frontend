/**
 * ReviewsRepository
 *
 * Bridges the service and domain layers:
 * 1. Delegates HTTP calls to ReviewsService (injected via IReviewsService)
 * 2. Maps DTOs → AppReview domain entities
 * 3. Returns typed domain entities to the presentation layer
 *
 * Architecture (H-02 refactor):
 *   ViewModel → ReviewsRepository (this) → IReviewsService → IApiService → HTTP
 */
import type { IReviewsService } from "../../domain/interfaces/IReviewsService";
import { AppReview } from "../../domain/entities/AppReview";
import type { IReviewsRepository } from "../../domain/interfaces/IReviewsRepository";
import type { ReviewDto } from "../../domain/interfaces/IReviewsService";

export class ReviewsRepository implements IReviewsRepository {
  constructor(private readonly service: IReviewsService) {}

  async getAll(params: { page: number; pageSize: number; appListingId?: string }) {
    const data = await this.service.getAll(params);
    return { ...data, items: (data.items ?? []).map(this.map) };
  }

  async delete(id: string): Promise<void> {
    await this.service.delete(id);
  }

  private map(d: ReviewDto): AppReview {
    return new AppReview({
      id: d.id,
      appListingId: d.appListingId,
      appName: d.appName ?? "",
      tenantId: d.tenantId,
      tenantName: d.tenantName ?? "",
      rating: d.rating ?? 0,
      title: d.title ?? "",
      body: d.body ?? "",
      createdAt: d.createdAt ?? new Date().toISOString(),
      isModerated: d.isModerated ?? false,
    });
  }
}
