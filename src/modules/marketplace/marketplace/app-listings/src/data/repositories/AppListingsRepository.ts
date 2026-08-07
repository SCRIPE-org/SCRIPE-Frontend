/**
 * AppListingsRepository
 *
 * Bridges the service and domain layers:
 * 1. Delegates HTTP calls to AppListingsService (injected via IAppListingsService)
 * 2. Uses AppListingMapper to convert DTOs → Domain Entities
 * 3. Returns typed domain entities to the presentation layer
 *
 * Architecture (H-02 refactor):
 *   ViewModel → AppListingsRepository (this) → IAppListingsService → IApiService → HTTP
 */
import type { IAppListingsService } from "../../domain/interfaces/IAppListingsService";
import type {
  IAppListingsRepository,
  PagedResult,
} from "../../domain/interfaces/IAppListingsRepository";
import type { AppListing } from "../../domain/entities/AppListing";
import { AppListingMapper } from "../mappers/AppListingMapper";

/**
 * Repository layer implementing client request queries for app listings.
 * Calls base API service routines and resolves DTO objects mapping to domain entities.
 */
export class AppListingsRepository implements IAppListingsRepository {
  constructor(private readonly service: IAppListingsService) {}

  async getAll(params: {
    page: number;
    pageSize: number;
    search?: string;
    categoryId?: string;
    isPublished?: boolean;
    isFeatured?: boolean;
    sortBy?: "popular" | "rating" | "newest" | "price";
    pricingModel?: "Free" | "PaidOnce" | "Subscription" | "Freemium" | "PerSeat" | "UsageBased";
  }): Promise<PagedResult<AppListing>> {
    const data = await this.service.getAll(params);
    return {
      items: data.items.map(AppListingMapper.toEntity),
      totalCount: data.totalCount,
      page: data.pageNumber,
      pageSize: data.pageSize,
      totalPages: data.totalPages,
      hasNextPage: data.hasNextPage,
      hasPreviousPage: data.hasPreviousPage,
    };
  }

  async getById(id: string): Promise<AppListing> {
    const data = await this.service.getById(id);
    return AppListingMapper.toEntity(data);
  }

  async getFeatured(): Promise<AppListing[]> {
    const data = await this.service.getFeatured();
    return data.map(AppListingMapper.toEntity);
  }

  async create(payload: Parameters<IAppListingsRepository["create"]>[0]): Promise<string> {
    const result = await this.service.create(payload);
    return result.id;
  }

  async update(
    id: string,
    payload: Parameters<IAppListingsRepository["update"]>[1]
  ): Promise<void> {
    await this.service.update(id, payload);
  }

  async delete(id: string): Promise<void> {
    await this.service.delete(id);
  }

  async publish(id: string): Promise<void> {
    await this.service.publish(id);
  }

  async unpublish(id: string): Promise<void> {
    await this.service.unpublish(id);
  }

  async toggleFeatured(id: string): Promise<void> {
    await this.service.toggleFeatured(id);
  }

  async setPricing(
    id: string,
    payload: Parameters<IAppListingsRepository["setPricing"]>[1]
  ): Promise<void> {
    await this.service.setPricing(id, payload);
  }
}
