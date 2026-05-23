/**
 * AppListingsService
 *
 * HTTP service implementation for the App Listings sub-module.
 * Responsible ONLY for making API calls and returning raw DTOs.
 * All domain mapping happens in AppListingsRepository.
 *
 * Architecture:
 *   ViewModel → AppListingsRepository → AppListingsService (this) → IApiService → HTTP
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { MARKETPLACE_ENDPOINTS } from "@core/config/api-endpoints";
import type {
  IAppListingsService,
  GetAppListingsParams,
  CreateAppListingPayload,
  UpdateAppListingPayload,
  SetPricingPayload,
} from "../../domain/interfaces/IAppListingsService";
import type { AppListingDto, AppListingListDto } from "../models/AppListingModel";

export class AppListingsService implements IAppListingsService {
  constructor(private readonly api: IApiService) {}

  /** Fetch paginated listing catalog from the backend. */
  async getAll(params: GetAppListingsParams): Promise<AppListingListDto> {
    const query = new URLSearchParams({
      page: String(params.page),
      pageSize: String(params.pageSize),
      ...(params.search && { search: params.search }),
      ...(params.categoryId && { categoryId: params.categoryId }),
      ...(params.isPublished !== undefined && { isPublished: String(params.isPublished) }),
      ...(params.isFeatured !== undefined && { isFeatured: String(params.isFeatured) }),
      ...(params.sortBy && { sortBy: params.sortBy }),
      ...(params.pricingModel && { pricingModel: params.pricingModel }),
    });
    return this.api.get<AppListingListDto>(
      `${MARKETPLACE_ENDPOINTS.MARKETPLACE.CATALOG}?${query}`
    );
  }

  /** Fetch a single app listing by ID. */
  async getById(id: string): Promise<AppListingDto> {
    return this.api.get<AppListingDto>(MARKETPLACE_ENDPOINTS.MARKETPLACE.CATALOG_BY_ID(id));
  }

  /** Fetch featured listings for storefront hero section. */
  async getFeatured(): Promise<AppListingDto[]> {
    return this.api.get<AppListingDto[]>(MARKETPLACE_ENDPOINTS.MARKETPLACE.CATALOG_FEATURED);
  }

  /** Create a new app listing. */
  async create(payload: CreateAppListingPayload): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(MARKETPLACE_ENDPOINTS.MARKETPLACE.CATALOG, payload);
  }

  /** Update an existing app listing. */
  async update(id: string, payload: UpdateAppListingPayload): Promise<void> {
    await this.api.put(MARKETPLACE_ENDPOINTS.MARKETPLACE.CATALOG_BY_ID(id), payload);
  }

  /** Soft-delete an app listing. */
  async delete(id: string): Promise<void> {
    await this.api.delete(MARKETPLACE_ENDPOINTS.MARKETPLACE.CATALOG_BY_ID(id));
  }

  /** Publish an app listing (make visible in storefront). */
  async publish(id: string): Promise<void> {
    await this.api.post(MARKETPLACE_ENDPOINTS.MARKETPLACE.CATALOG_PUBLISH(id), {});
  }

  /** Unpublish an app listing (hide from storefront). */
  async unpublish(id: string): Promise<void> {
    await this.api.post(MARKETPLACE_ENDPOINTS.MARKETPLACE.CATALOG_UNPUBLISH(id), {});
  }

  /** Toggle featured status for an app listing. */
  async toggleFeatured(id: string): Promise<void> {
    await this.api.post(MARKETPLACE_ENDPOINTS.MARKETPLACE.CATALOG_FEATURE(id), {});
  }

  /** Set or update pricing configuration for an app listing. */
  async setPricing(id: string, payload: SetPricingPayload): Promise<void> {
    await this.api.put(MARKETPLACE_ENDPOINTS.MARKETPLACE.CATALOG_PRICING(id), payload);
  }
}
