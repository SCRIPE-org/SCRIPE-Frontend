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
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import type {
  IAppListingsService,
  GetAppListingsParams,
  CreateAppListingPayload,
  UpdateAppListingPayload,
  SetPricingPayload,
} from "../../domain/interfaces/IAppListingsService";
import type { AppListingDto, AppListingListDto } from "../models/AppListingModel";
import { APP_LISTINGS_ENDPOINTS } from "./app-listings.endpoints";

/**
 * Http API network service for app listings.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class AppListingsService implements IAppListingsService {
  constructor(private readonly api: IApiService) {}

  /** Fetch paginated listing catalog from the backend. */
  async getAll(params: GetAppListingsParams): Promise<AppListingListDto> {
    const url = buildUrl(APP_LISTINGS_ENDPOINTS.CATALOG, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search || undefined,
      categoryId: params.categoryId || undefined,
      isPublished: params.isPublished !== undefined ? String(params.isPublished) : undefined,
      isFeatured: params.isFeatured !== undefined ? String(params.isFeatured) : undefined,
      sortBy: params.sortBy || undefined,
      pricingModel: params.pricingModel || undefined,
    });
    return this.api.get<AppListingListDto>(url);
  }

  /** Fetch a single app listing by ID. */
  async getById(id: string): Promise<AppListingDto> {
    return this.api.get<AppListingDto>(APP_LISTINGS_ENDPOINTS.CATALOG_BY_ID(id));
  }

  /** Fetch featured listings for storefront hero section. */
  async getFeatured(): Promise<AppListingDto[]> {
    return this.api.get<AppListingDto[]>(APP_LISTINGS_ENDPOINTS.CATALOG_FEATURED);
  }

  /** Create a new app listing. */
  async create(payload: CreateAppListingPayload): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(APP_LISTINGS_ENDPOINTS.CATALOG, payload);
  }

  /** Update an existing app listing. */
  async update(id: string, payload: UpdateAppListingPayload): Promise<void> {
    await this.api.put(APP_LISTINGS_ENDPOINTS.CATALOG_BY_ID(id), payload);
  }

  /** Soft-delete an app listing. */
  async delete(id: string): Promise<void> {
    await this.api.delete(APP_LISTINGS_ENDPOINTS.CATALOG_BY_ID(id));
  }

  /** Publish an app listing (make visible in storefront). */
  async publish(id: string): Promise<void> {
    await this.api.post(APP_LISTINGS_ENDPOINTS.CATALOG_PUBLISH(id), {});
  }

  /** Unpublish an app listing (hide from storefront). */
  async unpublish(id: string): Promise<void> {
    await this.api.post(APP_LISTINGS_ENDPOINTS.CATALOG_UNPUBLISH(id), {});
  }

  /** Toggle featured status for an app listing. */
  async toggleFeatured(id: string): Promise<void> {
    await this.api.post(APP_LISTINGS_ENDPOINTS.CATALOG_FEATURE(id), {});
  }

  /** Set or update pricing configuration for an app listing. */
  async setPricing(id: string, payload: SetPricingPayload): Promise<void> {
    await this.api.put(APP_LISTINGS_ENDPOINTS.CATALOG_PRICING(id), payload);
  }
}
